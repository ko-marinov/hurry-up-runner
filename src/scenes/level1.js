import 'phaser';
import { Player } from '../player.ts';
import { Walker } from '../walker';

import tilesetImg from '../../assets/tilesets/city-tileset.png';
import bgTilesetImg from '../../assets/tilesets/city-bg-tileset.png';
import mainCharSpritesheet from '../../assets/sprites/main_char.png';
import npcSpritesheet1 from '../../assets/sprites/npc_1.png';

var layer;
var graphics;
var tileset;

function GetObjectByName(objectLayer, name) {
    return objectLayer.objects.find(function(elem, index, arr) {
        return elem['name'] == name;
    }); 
}

export class Level1 extends Phaser.Scene {
    constructor() {
        super("Level1");
    }

    preload() {
        this.load.image('city-tileset', tilesetImg);
        this.load.image('city-bg-tileset', bgTilesetImg);
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/level_1.json');
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('npc1', npcSpritesheet1, { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.make.tilemap({ key: 'map' });

        let bg_tileset = this.map.addTilesetImage('bg', 'city-bg-tileset');
        this.map.createStaticLayer(0, bg_tileset);
        this.map.createStaticLayer(1, bg_tileset);

        tileset = this.map.addTilesetImage('city-tileset');
        layer = this.map.createStaticLayer(2, tileset);
        this.map.setCollision([1, 2, 6, 7, 8, 10], true, true, layer);

        this.positionsLayer = this.map.getObjectLayer('Positions');

        this.cameras.main.setBackgroundColor("#87ceeb");

        this.playerStartPos = GetObjectByName(this.positionsLayer, 'PlayerStartPos');
        
        this.player = new Player(this, this.playerStartPos.x, this.playerStartPos.y).setOrigin(0.5, 1);

        this.registerAnimations();

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keyup_R", this.restart, this);

        this.cameras.main.startFollow(this.player, false, 0.08, 0, -80, 65);
        this.cameras.main.setZoom(2);
        this.cameras.main.setBounds(layer.x, layer.y, layer.width, layer.height);

        let uicamera = this.cameras.add(0, 0, 720, 400, false, "uicamera");
        uicamera.scrollY = 1000;

        this.isLevelStarted = false;

        this.levelData = new Map();
        this.map.properties.forEach(function (prop) {
            this.levelData.set(prop.name, prop.value);
        }, this);

        this.timeRemaining = this.levelData.get('Time Limit');
        this.textTime = this.add.text(590, 1010, '');

        this.bananas = this.physics.add.staticGroup();
        this.physics.add.overlap(this.player, this.bananas, this.onStepOnBanana, null, this);

        this.walkers = [];

        let walker = new Walker(this, {
            fromX: 300,
            fromY: 434,
            toX: 200
        });
        this.physics.add.collider(walker, layer);
        this.physics.add.overlap(this.player, walker, this.onRunIntoWalker, this.isRunIntoWalker, this);

        this.walkers.push(walker);
    }

    getWalkers() {
        return this.walkers;
    }

    isRunIntoWalker(player, walker) {
        if (player.isDodging()) {
            return false;
        }
        if (player.isStumbled() || walker.isBumped) {
            return false;
        }
        if (player.x > walker.x) {
            return false;
        }
        return true;
    }

    onRunIntoWalker(player, walker) {
        console.log("Run into walker");
        player.onRunIntoWalker();
        walker.onBumped();
    }

    start() {
        this.input.keyboard.on("keyup_ESC", this.pause, this);
        this.initBananas();
        this.initFinish();

        this.levelComplete = false;
        this.timeRemaining = this.levelData.get('Time Limit');
        this.isLevelStarted = true;
        this.player.run();
    }

    update(time, delta) {
        if (this.isLevelFailed()) {
            this.scene.setActive(false, 'Level1');
            this.scene.get('MainMenu').showFailScreen();
        }
        else if (this.isLevelComplete()) {
        }
        else {
            this.player.updateVelocity();
            this.updateTimeFromStart(delta);
        }
    }

    updateTimeFromStart(delta) {
        if (this.isLevelStarted) {
            this.timeRemaining = this.timeRemaining > delta ? this.timeRemaining - delta : 0;
        }
        let timeString = (Math.round(this.timeRemaining) / 1000).toFixed(2);
        this.textTime.setText("TIME: " + timeString + " s");
    }

    restart() {
        this.scene.setActive(true, 'Level1');
        this.bananas.clear(true, true);
        this.physics.world.removeCollider(this.finishOverlapCollider);

        this.player.setPosition(this.playerStartPos.x, this.playerStartPos.y);
        this.start();

        this.walkers.forEach(walker => {
            walker.isBumped = false;
            walker.walk();
        });
    }

    isLevelComplete() {
        return this.levelComplete;
    }

    isLevelFailed() {
        return this.player.y > 500 || this.timeRemaining === 0;
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
        this.scene.get('MainMenu').showVictoryScreen();
    }

    pause(event) {
        event.stopPropagation();
        this.scene.setActive(false, 'Level1');
        this.scene.get('MainMenu').showPauseScreen();
    }

    resume() {
        this.scene.setActive(true, 'Level1');
    }

    registerAnimations() {
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers("char", { start: 14, end: 28 }),
            frameRate: 28,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('char', { start: 28, end: 34 }),
            frameRate: 12,
        });
        this.anims.create({
            key: 'dash',
            frames: [{ key: 'char', frame: 30 }],
            frameRate: 2.5,
        });
        this.anims.create({
            key: 'cheers',
            frames: this.anims.generateFrameNumbers('char', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'stumble',
            frames: this.anims.generateFrameNumbers('char', { start: 42, end: 46 }),
            frameRate: 20,
        });
        this.anims.create({
            key: 'bump',
            frames: this.anims.generateFrameNumbers('char', { start: 56, end: 60 }),
            frameRate: 20,
        });
        this.anims.create({
            key: 'fall',
            frames: this.anims.generateFrameNumbers('char', { start: 70, end: 74 }),
            frameRate: 10,
        });
        this.anims.create({
            key: 'dodge',
            frames: this.anims.generateFrameNumbers('char', { start: 84, end: 93 }),
            frameRate: 30,
        });
        this.anims.create({
            key: 'npc1Walk',
            frames: this.anims.generateFrameNumbers('npc1', { start: 5, end: 8 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'npc1Stumble',
            frames: this.anims.generateFrameNumbers('npc1', { start: 10, end: 14 }),
            frameRate: 12,
        });
        this.anims.create({
            key: 'npc1Bump',
            frames: this.anims.generateFrameNumbers('npc1', { start: 15, end: 19 }),
            frameRate: 12,
        });
    }
}