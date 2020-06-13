import 'phaser';
import { Preloader } from './scenes/preloader';
import { MainMenu } from './scenes/menu';

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
        Preloader,
        MainMenu
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

var game = new Phaser.Game(config);