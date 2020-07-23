import 'phaser'

export class Bird extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, config) {
        super(scene, config.x, config.y, 'bird');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(0, 5);
        this.body.setSize(8, 6, false);
        this.isBumped = false;

        this.startX = config.x;
        this.startY = config.y;
        this.body.allowGravity = false;
    }

    reset() {
        this.isBumped = false;
        this.angle = 0;
        this.setPosition(this.startX, this.startY);
        if (this.tween != undefined) {
            this.tween.stop();
        }
    }

    startFly() {
        this.play('birdFly');
        if (this.tween != undefined) {
            this.tween.stop();
        }

        let newX = this.startX - 600;
        this.tween = this.scene.tweens.add({
            targets: this,
            duration: 6000,
            x: newX
        });
    }

    onBumped() {
        if (this.isBumped) { return; }
        this.isBumped = true;
        this.tween.stop();
        this.play('birdFall');
        let newX = this.x + 70;
        let newY = this.y + 100;
        this.tween = this.scene.tweens.add({
            targets: this,
            props: {
                x: {
                    value: newX,
                    duration: 1500,
                    ease: 'Power1'
                },
                y: {
                    value: newY,
                    duration: 1000,
                    ease: 'Quad.easeIn'
                },
                angle: {
                    value: 360,
                    duration: 250,
                    repeat: 8
                }
            }
        });
    }
}
