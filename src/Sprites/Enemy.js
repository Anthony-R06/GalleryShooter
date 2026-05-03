class Enemy extends Phaser.GameObjects.Sprite{
    constructor(scene, x, y, texture, frame, enemyType){
        super(scene, x, y, texture, frame);

        scene.add.existing(this);

        this.enemyType = enemyType;

        this.homeX = x;
        this.homeY = y;

        this.isDiving = false;
        this.pathProgress = 0;
        this.diveDuration = 3000;

        this.currentPoint = new Phaser.Math.Vector2();
        this.nextPoint = new Phaser.Math.Vector2();

        this.angle = 180;

        if(enemyType === "front"){
            this.health = 1;
            this.points = 10;
            this.setScale(0.4);
        } 
        else if(enemyType === "back"){
            this.health = 2;
            this.points = 20;
            this.setScale(0.5);
        }
    }

    startDive(){
        if(this.isDiving){
            return;
        }

        this.isDiving = true;
        this.pathProgress = 0;

        let dir = Phaser.Math.Between(0, 1) === 0 ? -1 : 1;

        let enemyX = this.x;
        let enemyY = this.y;

        let points = [
            enemyX, enemyY,
            enemyX, enemyY + 60,
            enemyX, enemyY + 100,
            enemyX, enemyY + 200,
            enemyX + dir * 150, enemyY + 300,
            enemyX + dir * 120, enemyY + 400,
            enemyX + dir * -150, enemyY + 480,
            enemyX + dir * -218, enemyY + 660
        ];

        this.EnemyPath = new Phaser.Curves.Spline(points);
    }
    
    takeDamage(amount){
        this.health -= amount;

        if(this.health == 1){
            this.scene.impact.play({
                volume: 0.5
            });
        }

        if(this.health <= 0){
            this.scene.myScore += this.points;
            this.scene.my.text.score.setText("Score " + this.scene.myScore);

            this.destroy();
            return true;
        }

        return false;
    }

    update(time, delta){
        if (this.isDiving){
            this.pathProgress += delta / this.diveDuration;

            if(this.pathProgress >= 1){
                this.pathProgress = 1;
                this.isDiving = false;

                this.destroy();
                return;
            }

            this.EnemyPath.getPoint(this.pathProgress, this.currentPoint);

            let nextProgress = this.pathProgress + 0.01;

            if(nextProgress > 1){
                nextProgress = 1;
            }

            this.EnemyPath.getPoint(nextProgress, this.nextPoint);

            this.x = this.currentPoint.x;
            this.y = this.currentPoint.y;

            let angleRadians = Phaser.Math.Angle.Between(
                this.currentPoint.x,
                this.currentPoint.y,
                this.nextPoint.x,
                this.nextPoint.y
            );

            this.rotation = angleRadians + Phaser.Math.DegToRad(90);
        }
    }
}