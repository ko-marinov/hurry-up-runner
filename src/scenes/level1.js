import 'phaser';
import { Player } from '../player.ts';

import tilesetImg from '../../assets/tilesets/city-tileset.png';
import bgTilesetImg from '../../assets/tilesets/city-bg-tileset.png';
import mainCharSpritesheet from '../../assets/sprites/main_char.png';

var layer;
var graphics;
var tileset;

export class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    preload() {
        this.load.image('city-tileset', tilesetImg);
        this.load.image('city-bg-tileset', bgTilesetImg);
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/level_1.json');
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.make.tilemap({ key: 'map' });

        let bg_tileset = this.map.addTilesetImage('bg', 'city-bg-tileset');
        this.map.createStaticLayer(0, bg_tileset);
        this.map.createStaticLayer(1, bg_tileset);

        tileset = this.map.addTilesetImage('city-tileset');
        layer = this.map.createStaticLayer(2, tileset);
        this.map.setCollisionBetween(1, 2, true);
        this.map.setCollisionBetween(5, 18, true);

        this.cameras.main.setBackgroundColor("#87ceeb");

        this.player = new Player(this, 150, 434);

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers("char", { start: 13, end: 20 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('char', { start: 67, end: 70 }),
            frameRate: 12,
        });
        this.anims.create({
            key: 'dash',
            frames: [{ key: 'char', frame: 18 }],
            frameRate: 2.5,
        });
        this.anims.create({
            key: 'cheers',
            frames: this.anims.generateFrameNumbers('char', { start: 67, end: 70 }),
            frameRate: 9,
            repeat: -1
        });
        this.anims.create({
            key: 'stumble',
            frames: this.anims.generateFrameNumbers('char', { start: 91, end: 96 }),
            frameRate: 16,
        })

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keyup_R", this.restart, this);

        this.cameras.main.startFollow(this.player, false, 0.08, 0, -80, 50);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height);

        let uicamera = this.cameras.add(0, 0, 720, 400, false, "uicamera");
        uicamera.scrollY = 1000;

        this.textTime = this.add.text(590, 1010, "TIME: 0 s");

        this.bananas = this.physics.add.staticGroup();
        this.physics.add.overlap(this.player, this.bananas, this.onStepOnBanana, null, this);
    }

    start() {
        this.initBananas();
        this.initFinish();

        this.levelComplete = false;
        this.timeFromStart = 0;
        this.player.run();
    }

    update(time, delta) {
        if (this.isLevelFailed()) {
            this.restart();
        }
        else if (this.isLevelComplete()) {
        }
        else {
            this.player.updateVelocity();
            this.updateTimeFromStart(delta);
        }
    }

    updateTimeFromStart(delta) {
        this.timeFromStart += delta;
        let timeString = (Math.round(this.timeFromStart) / 1000).toFixed(2);
        this.textTime.setText("TIME: " + timeString + " s");
    }

    restart() {
        this.bananas.clear(true, true);
        this.physics.world.removeCollider(this.finishOverlapCollider);

        this.player.setPosition(150, 322);
        this.start();
    }

    isLevelComplete() {
        return this.levelComplete;
    }

    isLevelFailed() {
        return this.player.y > 434;
    }

    initBananas() {
        layer.forEachTile(function (tile) {
            if (tile.properties.isBanana) {
                let collisionRect = tile.getCollisionGroup().objects[0];
                let banana = this.bananas.create(
                    layer.x + tile.pixelX + collisionRect.x,
                    layer.y + tile.pixelY + collisionRect.y,
                    null, null, false, true);
                banana.body.setSize(collisionRect.width, collisionRect.height);
            }
        }, this);
    }

    onStepOnBanana(player, banana) {
        console.log("Player stepped on banana at (%d, %d)", banana.x, banana.y);
        player.onStepOnBanana();
        this.bananas.remove(banana);
    }

    initFinish() {
        var finishTile;
        layer.forEachTile(function (tile) {
            if (tile.properties.isFinish) {
                finishTile = tile;
            }
        }, this);

        let finishImage = this.physics.add.staticImage(layer.x + finishTile.pixelX, layer.y + finishTile.pixelY);
        this.finishOverlapCollider = this.physics.add.overlap(this.player, finishImage, this.onEnterFinish, null, this);
    }

    onEnterFinish(player, finish) {
        player.onEnterFinishTile();
        this.physics.world.removeCollider(this.finishOverlapCollider);
    }
}