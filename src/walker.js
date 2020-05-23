import 'phaser';

export class Walker extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, config) {
        super(scene, config.fromX, config.fromY, 'char');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(10, 10);
        this.body.setSize(10, 20, false);
        this.isBumped = false;

        this.fromX = config.fromX;
        this.toX = config.toX;

        this.walk();
    }

    walk() {
        if (this.tween) {
            this.tween.stop();
        }
        let velocity = 30;
        let time = 1000 * Math.abs(this.x - this.toX) / velocity;
        this.setFlipX(this.fromX > this.toX);
        this.play('npc1Walk', true);
        this.tween = this.scene.tweens.add({
            targets: this,
            duration: time,
            x: this.toX,
            onComplete: this.onReachDestination,
            onCompleteScope: this
        });
    }

    onReachDestination(event, target) {
        [this.fromX, this.toX] = [this.toX, this.fromX];
        this.walk();
    }

    onBumped() {
        if (this.isBumped) { return; }
        this.isBumped = true;
        this.tween.stop();
        if (this.fromX > this.toX) {
            this.play('npc1Bump');
        } else {
            this.play('npc1Stumble');
        }
        let newX = this.x + 20;
        this.scene.tweens.add({
            targets: this,
            duration: 300,
            x: newX,
            ease: "Power1"
        });
    }
}