import 'phaser';
import tilesetImg from '../../assets/tilesets/dev_tileset.png';
import mainCharSpritesheet from '../../assets/sprites/main_char.png';

var layer;
var graphics;
var tileset;

export class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    preload() {
        this.load.image('dev_tileset', tilesetImg);
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/level_1.json');
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.make.tilemap({ key: 'map' });
        tileset = this.map.addTilesetImage('dev_tileset');
        layer = this.map.createStaticLayer(0, tileset);
        layer.y = this.game.config.height - layer.height;
        this.map.setCollisionBetween(0, 100);

        this.cameras.main.setBackgroundColor("#87ceeb");

        this.player = this.physics.add.sprite(190, 200, 'char');

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers("char", { start: 13, end: 20 }),
            frameRate: 16,
            repeat: -1
        });

        this.player.play('run', true);

        this.physics.add.collider(this.player, layer);
    }
}