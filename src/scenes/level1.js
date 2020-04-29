import 'phaser';

export class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor("#87ceeb");
    }
}