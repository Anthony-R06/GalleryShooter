class GalleryShooter extends Phaser.Scene {
    constructor() {
        super("galleryShooter");
        this.my = { sprite: {}, text: {} };
    }

    preload() {

        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.atlasXML("AlienShips", "sheet.png", "sheet.xml");

        this.load.audio("laserSound", "laserSmall_002.ogg");
        this.load.audio("hitSound", "laserLarge_000.ogg");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {


        this.gameOver = false;

        //AUDIO==========================================================

        this.laserSound = this.sound.add("laserSound");
        this.hitSound = this.sound.add("hitSound");


        //BACKROUND======================================================
        this.cameras.main.setBackgroundColor("#000000");

        let my = this.my;

        //pixel stars
        let stars = this.add.graphics();

        //spawn 119 stars randomly across the canvas
        for (let i = 0; i < 120; i++) {
            let x = Phaser.Math.Between(0, 600);
            let y = Phaser.Math.Between(0, 700);

            //make some stars white and some grey
            let color = Phaser.Math.Between(0, 1) === 0 ? 0xffffff : 0x777777;

            stars.fillStyle(color, 1);

            //some stars are 1x1 and some are 2x2
            let size = Phaser.Math.Between(1, 2);
            stars.fillRect(x, y, size, size);
        }

        //Controls=======================================================

        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        //Player Sprite==================================================
        this.playerSpeed = 300;
        this.bulletSpeed = 600;
        my.sprite.player = new Player(this, game.config.width/2, game.config.height - 60, "AlienShips", "playerShip2_green.png", this.left, this.right, this.playerSpeed);
        my.sprite.bulletP = new Bullet(this, game.config.width/2, game.config.height - 50, "AlienShips", "laserGreen10.png", this.bulletSpeed, this.space);

        my.sprite.player.setScale(0.5);
        my.sprite.bulletP.setScale(0.5);

        //Enemy Sprite===================================================

        this.enemies = this.add.group();
        this.enemyGroupSpeed = 20;  
        this.enemyGroupDirection = 1; //1 = right, -1 = left

        this.createEnemyGrid(); //couldnt figure out a way to not have this method in the GalleryShooter file (wanted it in Enemy.js)

        this.enemyDiveTimer = this.time.addEvent({
            delay: 4000,
            callback: this.sendRandomEnemyDiving,
            callbackScope: this,
            loop: true
        });

        this.enemyBullets = this.add.group();

        for (let i = 0; i < 10; i++) {
            let bullet = new BulletE(
                this,
                -100,
                -100,
                "AlienShips",
                "laserRed16.png",
                250
            );
            this.enemyBullets.add(bullet);
        }

        this.enemyShootTimer = this.time.addEvent({
            delay: 1500,
            callback: this.randomEnemyShoot,
            callbackScope: this,
            loop: true
        });


        //this.gKey = this.input.keyboard.addKey("G"); //for testing dive

        //UI=============================================================

        this.myScore = 0;

        my.text.score = this.add.bitmapText(370, 660, "rocketSquare", "Score " + this.myScore);
        my.text.health = this.add.bitmapText(5, 660, "rocketSquare", "Health: ");

        // Health system
        this.maxHealth = 3;
        this.playerHealth = 3;

        //health bar outline
        this.healthBarBack = this.add.rectangle(175, 669, 120, 18, 0x333333);
        this.healthBarBack.setOrigin(0, 0);

        //health bar fill
        this.healthBarFill = this.add.rectangle(175, 669, 120, 18, 0xff0000);
        this.healthBarFill.setOrigin(0, 0);

        //full width of bar
        this.healthBarWidth = 120;

        this.hKey = this.input.keyboard.addKey("H");

    
    }

    createEnemyGrid() {
        let startX = 120;
        let startY = 80;

        let colMax = 7;
        let rowMax = 3;

        let xSpacing = 70;
        let ySpacing = 60;

        for (let row = 0; row < rowMax; row++) {
            for (let col = 0; col < colMax; col++) {
                let x = startX + col * xSpacing;
                let y = startY + row * ySpacing;

                let enemyType;
                let frame;

                //back row has stronger enemies
                if (row === 0) {
                    enemyType = "back";
                    frame = "playerShip3_red.png";
                } 
                //front rows have weaker enemies
                else{
                    enemyType = "front";
                    frame = "playerShip1_red.png";
                }
                let enemy = new Enemy(
                    this,
                    x,
                    y,
                    "AlienShips",
                    frame,
                    enemyType
                );

                this.enemies.add(enemy);
            }
        }
    }

    updateEnemyGroup(delta) {
        let enemies = this.enemies.getChildren();

        if(enemies.length === 0){
            return;
        }

        let leftMost = enemies[0];
        let rightMost = enemies[0];

        let isRun = false;

    //find the left-most and right-most active enemy
        for(let enemy of enemies){
            if(isRun == false){
                if(!enemy.active || enemy.isDiving){
                    continue;
                }

                if(enemy.x < leftMost.x){
                    leftMost = enemy;
                }

                if(enemy.x > rightMost.x){
                rightMost = enemy;
                }
            }
        }
        isRun = true;

        let moveAmount = this.enemyGroupSpeed * (delta / 1000);

        //check if the group is about to hit the screen edge
        if(rightMost.x >= this.game.config.width - 40){
            this.enemyGroupDirection = -1;
        }

        if(leftMost.x <= 40){
            this.enemyGroupDirection = 1;
        }

        //move only enemies that are still in the group
        for(let enemy of enemies){
            if(!enemy.active || enemy.isDiving){
                continue;
            }

            enemy.x += moveAmount * this.enemyGroupDirection;

            //update their home position
            enemy.homeX = enemy.x;
            enemy.homeY = enemy.y;
        }
    }
    updateHealthBar() {
        let healthPercent = this.playerHealth / this.maxHealth;

        if (healthPercent < 0) {
            healthPercent = 0;
        }

        this.healthBarFill.width = this.healthBarWidth * healthPercent;
    }

    update(time, delta) {
        let my = this.my;

        if (this.gameOver) {
            return;
        }

        my.sprite.player.update(time, delta);

        my.sprite.bulletP.update(time, delta);

        this.updateEnemyGroup(delta);

        this.enemies.children.each((enemy) => {
            enemy.update(time, delta);
        });

        this.enemyBullets.children.each((bullet) => {
            if (bullet.bulletActive) {
                bullet.update(time, delta);
            }
        });

        for (let enemy of this.enemies.getChildren()) { // || my.sprite.player != active
            if (enemy.active && my.sprite.bulletP.bulletActive && this.collides(enemy, my.sprite.bulletP)) {
                enemy.takeDamage(1);

                my.sprite.bulletP.x = this.my.sprite.player.x;
                my.sprite.bulletP.y = this.my.sprite.player.y - this.my.sprite.player.displayHeight/2;
                my.sprite.bulletP.bulletActive = false;
            }
            if (enemy.active && this.collides(enemy, my.sprite.player)){
                this.hitSound.play({
                volume: 0.5 // Optional: adjust volume from 0 to 1
                });
                this.playerHealth -= 1;
                enemy.takeDamage(2);
                this.updateHealthBar();
            }
        }

        for (let bullet of this.enemyBullets.getChildren()) {
            if (bullet.bulletActive && my.sprite.player.active && this.collides(bullet, my.sprite.player)) {
                bullet.resetBullet();
                this.hitSound.play({
                volume: 0.5 // Optional: adjust volume from 0 to 1
                });
                this.playerHealth -= 1;
                this.updateHealthBar();

            }
        }

        if ((this.allEnemiesDestroyed() || this.playerHealth <= 0) && !this.gameOver) {
            this.gameOver = true;

            this.enemyShootTimer.remove(false);
            this.enemyDiveTimer.remove(false);

            this.add.text(300, 350, "Game Over, Restarting...", {
                fontSize: "32px",
                color: "#ffffff"
            }).setOrigin(0.5);

            this.time.delayedCall(1500, () => {
                this.scene.restart();
            });
        }
        /*
        if (Phaser.Input.Keyboard.JustDown(this.hKey)) {
            this.playerHealth -= 1;
            this.updateHealthBar();
        }
        */

        /*
        if (Phaser.Input.Keyboard.JustDown(this.gKey)) {
            this.sendRandomEnemyDiving();
        }
        */  
    }
        
    randomEnemyShoot() {

        if (this.gameOver) {
                return;
        }

        let livingEnemies = this.enemies.getChildren().filter(enemy => {
            return enemy.active;
        });
        if (livingEnemies.length === 0) {
            return;
        }
        let randomEnemy = Phaser.Utils.Array.GetRandom(livingEnemies);
        this.shootEnemyBullet(randomEnemy);
    }

    shootEnemyBullet(enemy) {
        for (let bullet of this.enemyBullets.getChildren()) {
            if (!bullet.bulletActive) {

                bullet.shoot(enemy.x, enemy.y + enemy.displayHeight / 2);
                return;
            }
        }
    }

    sendRandomEnemyDiving() {

        if (this.gameOver) {
            return;
        }

        let livingEnemies = this.enemies.getChildren().filter(enemy => {
            return enemy.active && !enemy.isDiving;
        });

        if (livingEnemies.length === 0) {
            return;
        }

        let randomEnemy = Phaser.Utils.Array.GetRandom(livingEnemies);
        randomEnemy.startDive();
    }

    allEnemiesDestroyed() {
        for(let enemy of this.enemies.getChildren()){
            if(enemy.active){
            return false;
            }
        }

        return true;
    }

    collides(a, b){
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

}
