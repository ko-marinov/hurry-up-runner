import 'phaser';
import { Level1 } from './scenes/level1';

var config = {
    type: Phaser.AUTO,
    width: 720,
    height: 400,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [
        Level1
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);