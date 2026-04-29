class Bullet extends Phaser.GameObjects.Sprite {

    // x,y - starting sprite location
    // spriteKey - key for the sprite image asset
    // leftKey - key for moving left
    // rightKey - key for moving right
    constructor(scene, x, y, texture, frame, bulletSpeed, key) {
        super(scene, x, y, texture, frame);

        this.bulletSpeed = bulletSpeed;
        this.space = key;
        this.bulletActive = false;
        this.visible = true;
        this.

        scene.add.existing(this);

        return this;
    }

    update(time, delta) {
        let dt = delta / 1000;

        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Only start the bullet if it's not currently active

            if (!this.bulletActive) {
                this.scene.laserSound.play({
                volume: 0.5 // Optional: adjust volume from 0 to 1
            });
                // Set the active flag to true
                this.bulletActive = true;
                // Set the position of the bullet to be the location of the player
                // Offset by the height of the sprite, so the "bullet" comes out of
                // the top of the player avatar, not the middle.
            }
        }

        if (!this.bulletActive) {
                this.x = this.scene.my.sprite.player.x;
                this.y = this.scene.my.sprite.player.y - this.scene.my.sprite.player.displayHeight/2;
        }

        // Now handle bullet movement, only if it is active
        if (this.bulletActive) {
            this.y -= this.bulletSpeed * dt;
            // Is the bullet off the top of the screen?
            if (this.y < -(this.height/2)) {
                // make it inactive and invisible
                this.x = this.scene.my.sprite.player.x;
                this.y = this.scene.my.sprite.player.y - this.scene.my.sprite.player.displayHeight/2;
                this.bulletActive = false;

            }
        }
    }

}
    