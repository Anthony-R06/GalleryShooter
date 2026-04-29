class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame, enemyType) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        this.enemyType = enemyType;

        //Remember where this enemy belongs in the grid
        this.homeX = x;
        this.homeY = y;

        //Used later for path following
        this.isDiving = false;
        this.diveSpeed = 120;
        this.diveTime = 0;
        this.angle = 180;

        if (enemyType === "front") {
            this.health = 1;
            this.points = 100;
            this.setScale(0.4);
        } else if (enemyType === "back") {
            this.health = 2;
            this.points = 200;
            this.setScale(0.5);
        }
    }

    takeDamage(amount) {
        this.health -= amount;

        if (this.health <= 0) {
            this.destroy();
            return true;
        }

        return false;
    }

    startDive() {
        this.isDiving = true;
        this.diveTime = 0;
    }

    update(time, delta) {

        if (this.isDiving) {
            this.diveTime += delta / 1000;

            // Simple temporary dive path:
            // moves downward while also waving left and right
            this.y += this.diveSpeed * (delta / 1000);
            this.x += Math.sin(this.diveTime * 6) * 3;

            
        }
    }
}