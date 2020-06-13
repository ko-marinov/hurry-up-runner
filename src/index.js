import 'phaser';
import { MainMenu } from './scenes/menu';
import { Level1, Level2, Level3 } from './scenes/level1';

var config = {
    type: Phaser.AUTO,
    width: 720,
    height: 400,
    render: {
        pixelArt: true
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [
        MainMenu
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);