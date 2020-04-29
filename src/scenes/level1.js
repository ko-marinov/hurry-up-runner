import 'phaser';
import tilesetImg from '../../assets/tilesets/dev_tileset.png';

export class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    preload() {
        this.load.image('tileset', tilesetImg);
        this.load.tilemapCSV('map', '../assets/tilemaps/level_1.csv');
    }

    create() {
        this.map = this.make.tilemap({
            key: 'map',
            tileWidth: 16,
            tileHeight: 16
        });
        let tileset = this.map.addTilesetImage('tileset');
        let layer = this.map.createStaticLayer(0, tileset);
        layer.y = this.game.config.height - layer.height;

        this.cameras.main.setBackgroundColor("#87ceeb");
    }
}