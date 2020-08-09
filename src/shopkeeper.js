import 'phaser';

export class Shopkeeper extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, config) {
        super(scene, config.x, config.y, 'shopkeepers');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.allowGravity = false;
        this.setDisplayOrigin(8, 14);
        this.type = config.type;
        this.player = config.player;
    }

    update() {
        if (this.player.x < this.x) {
            this.setFrame(this.type * 2);
        } else {
            this.setFrame(this.type * 2 + 1);
        }
    }
}
