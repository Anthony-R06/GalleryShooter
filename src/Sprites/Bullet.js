class Bullet extends Phaser.GameObjects.Sprite {

    constructor(scene, x, y, texture, frame, bulletSpeed, key) {
        super(scene, x, y, texture, frame);

        this.bulletSpeed = bulletSpeed;
        this.space = key;
        this.bulletActive = false;
        this.visible = true;

        scene.add.existing(this);

        return this;
    }

    update(time, delta) {
        let dt = delta / 1000;

        if (Phaser.Input.Keyboard.JustDown(this.space)) {

            if (!this.bulletActive) {
                this.scene.laserSound.play({
                volume: 0.5 
                });

                this.bulletActive = true;
            }
        }

        if (!this.bulletActive) {
                this.x = this.scene.my.sprite.player.x;
                this.y = this.scene.my.sprite.player.y - this.scene.my.sprite.player.displayHeight/2;
        }


        if (this.bulletActive) {
            this.y -= this.bulletSpeed * dt;

            if (this.y < -(this.height/2)) {

                this.x = this.scene.my.sprite.player.x;
                this.y = this.scene.my.sprite.player.y - this.scene.my.sprite.player.displayHeight/2;
                this.bulletActive = false;

            }
        }
    }

}
    