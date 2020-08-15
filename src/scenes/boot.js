import 'phaser';

export class Boot extends Phaser.Scene {
    preload() {
        // Load necessary stuff for Preloader scene.
        // For example, loading screen image, animation, etc.
    }

    create() {
        this.scene.start('Preloader');
        this.input.keyboard.addCapture(['SPACE', 'ESC']);
    }
}
