class GalleryShooter extends Phaser.Scene {
    constructor() {
        super("galleryShooter");
        this.my = { sprite: {} };
    }

    preload() {

        this.load.setPath("./assets/");

        // Load sprite atlas
        this.load.atlasXML("AlienShips", "sheet.png", "sheet.xml");

        this.load.audio("laserSound", "laserSmall_002.ogg");
    }

    create() {

        //AUDIO==========================================================

        this.laserSound = this.sound.add("laserSound");


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
        my.sprite.player = new Player(this, game.config.width/2, game.config.height - 40, "AlienShips", "playerShip2_green.png", this.left, this.right, this.playerSpeed);
        my.sprite.bulletP = new Bullet(this, game.config.width/2, game.config.height - 30, "AlienShips", "laserGreen10.png", this.bulletSpeed, this.space);

        my.sprite.player.setScale(0.5);
        my.sprite.bulletP.setScale(0.5);

        //Enemy Sprite===================================================

        this.enemies = this.add.group();
        this.enemyGroupSpeed = 20;  
        this.enemyGroupDirection = 1; //1 = right, -1 = left

        this.createEnemyGrid(); //couldnt figure out a way to not have this method in the GalleryShooter file (wanted it in Enemy.js)
    
    }

    createEnemyGrid() {
        let startX = 120;
        let startY = 80;

        let cols = 7;
        let rows = 3;

        let xSpacing = 70;
        let ySpacing = 60;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
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

    update(time, delta) {
        let my = this.my;

        my.sprite.player.update(time, delta);

        my.sprite.bulletP.update(time, delta);

        this.updateEnemyGroup(delta);

        this.enemies.children.each((enemy) => {
            enemy.update(time, delta);
        });


    }
}
