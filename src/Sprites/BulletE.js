class BulletE extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, speed){
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        this.speed = speed;
        this.bulletActive = false;

        this.visible = false;

        this.setScale(0.5);
    }

    shoot(x, y){
        this.x = x;
        this.y = y;

        this.scene.laserSound.play({
            volume: 0.5 
        });

        this.visible = true;
        this.bulletActive = true;
    }

    resetBullet(){
        this.x = -100;
        this.y = -100;

        this.visible = false;
        this.bulletActive = false;
    }

    update(time, delta){
        if(!this.bulletActive){
            return;
        }

        this.y += this.speed * (delta / 1000);

        if(this.y > this.scene.game.config.height + 20){
            this.resetBullet();
        }
    }
}