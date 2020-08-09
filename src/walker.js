import 'phaser';

export class Walker extends Phaser.Physics.Arcade.Sprite {
    static get WALKER_TYPE_COUNT() {
        return 3;
    }

    constructor(scene, config) {
        super(scene, config.fromX, config.fromY, 'npc' + config.type);

        this.type = config.type;
        this.animWalk = 'npc' + this.type + 'Walk';
        this.animStumble = 'npc' + this.type + 'Stumble';
        this.animBump = 'npc' + this.type + 'Bump';

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.depth = 1;
        this.body.setOffset(10, 10);
        this.body.setSize(10, 20, false);
        this.isBumped = false;

        this.fromX = config.fromX;
        this.toX = config.toX;
        this.initialFromX = config.fromX;
        this.initialToX = config.toX;
    }

    reset() {
        if (this.tween) {
            this.tween.stop();
        }
        this.anims.stop();
        this.setFrame(0);
        this.isBumped = false;
        this.fromX = this.initialFromX;
        this.toX = this.initialToX;
        this.x = this.fromX;
    }

    walk() {
        if (this.tween) {
            this.tween.stop();
        }
        let velocity = 30;
        let time = 1000 * Math.abs(this.x - this.toX) / velocity;
        this.setFlipX(this.fromX > this.toX);
        this.play(this.animWalk, true);
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
            this.play(this.animBump);
        } else {
            this.play(this.animStumble);
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
