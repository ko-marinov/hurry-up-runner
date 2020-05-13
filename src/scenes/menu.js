import 'phaser';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
    }

    create() {
        this.scene.launch('Level1');
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.3)');
        this.startButton = this.add.text(350, 100, 'START GAME');
        this.scene.bringToTop('MainMenu');

        this.startButton.setInteractive().on('pointerdown', this.startGame, this);
    }

    startGame(pointer, localX, localY, event) {
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').start();
    }
}