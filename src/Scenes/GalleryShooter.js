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



    }

    update(time, delta) {
        let my = this.my;

        my.sprite.player.update(time, delta);

        my.sprite.bulletP.update(time, delta);

 

    }
}
