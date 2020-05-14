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

        let center_x = this.game.config.width / 2;
        this.startButton = this.add.text(center_x, 100, 'START GAME');
        this.startButton.setInteractive().on('pointerdown', this.startGame, this);

        this.resumeButton = this.add.text(center_x, 100, 'RESUME GAME');
        this.resumeButton.setInteractive().on('pointerdown', this.resumeGameBtnEvent, this);

        this.restartButton = this.add.text(center_x, 100, 'RESTART LEVEL');
        this.restartButton.setInteractive().on('pointerdown', this.restartLevelBtnEvent, this);

        this.scene.bringToTop('MainMenu');

        this.hideAll();
        this.showStartScreen();
    }

    showStartScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.startButton.setVisible(true);
    }

    showPauseScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.resumeButton.setVisible(true);
        this.input.keyboard.on("keyup_ESC", this.resumeGame, this);
    }

    showFailScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.restartButton.setVisible(true);
        this.input.keyboard.on("keyup_ENTER", this.restartLevel, this);
    }

    hideAll() {
        this.startButton.setVisible(false);
        this.resumeButton.setVisible(false);
        this.restartButton.setVisible(false);
    }

    startGame(pointer, localX, localY, event) {
        this.hideAll();
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').start();
    }

    resumeGameBtnEvent(pointer, localX, localY, event) {
        this.resumeGame(event);
    }

    resumeGame(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ESC", this.resumeGame, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').resume();
    }

    restartLevelBtnEvent(pointer, localX, localY, event) {
        this.restartLevel(event);
    }

    restartLevel(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ENTER", this.restartLevel, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').restart();
    }
}