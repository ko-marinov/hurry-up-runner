import 'phaser';

const STAMINA_MAX_LENGTH = 300;

export class StaminaBar {
    constructor(scene, x, y, player) {
        this.frameRect = new Phaser.GameObjects.Rectangle(scene, x, y, STAMINA_MAX_LENGTH + 2, 10);
        this.frameRect.setStrokeStyle(2, 0xffffff, 1);
        this.fillRect = new Phaser.GameObjects.Rectangle(scene, x + 1, y + 1, STAMINA_MAX_LENGTH, 8, 0xffc98d);

        this.frameRect.setOrigin(0, 0);
        this.fillRect.setOrigin(0, 0);

        scene.add.existing(this.frameRect);
        scene.add.existing(this.fillRect);

        this.player = player;
    }

    update() {
        let stamina = this.player.getStamina();
        this.fillRect.setDisplaySize(STAMINA_MAX_LENGTH * stamina, 8);
    }
}
