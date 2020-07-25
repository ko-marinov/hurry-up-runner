import 'phaser'

export class BananaPeel extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, config) {
        super(scene, config.x, config.y, 'banana-peel');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(6, 14);
        this.body.setSize(8, 2, false);
        this.isUsed = false;

        this.startX = config.x;
        this.startY = config.y;
    }

    reset() {
        if (this.tween != undefined) {
            this.tween.stop();
        }
        this.anims.stop();
        this.setFrame(0);
        this.setPosition(this.startX, this.startY);
        this.isUsed = false;
    }

    flyAway() {
        this.isUsed = true;
        this.play('bananaPeelFlyAway');
        let newX = this.startX - 20;
        this.tween = this.scene.tweens.add({
            targets: this,
            x: newX,
            duration: 300,
            ease: 'Power1'
        })
    }
}
