import 'phaser';
import tilesetImg from '../../assets/tilesets/city-tileset.png';
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
        this.load.tilemapTiledJSON('map', '../assets/tilemaps/level_1.json');
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        this.map = this.make.tilemap({ key: 'map' });
        tileset = this.map.addTilesetImage('city-tileset');
        layer = this.map.createStaticLayer(0, tileset);
        layer.y = this.game.config.height - layer.height;
        this.map.setCollisionBetween(1, 2, true);
        this.map.setCollisionBetween(5, 18, true);

        this.cameras.main.setBackgroundColor("#87ceeb");

        this.player = this.physics.add.sprite(150, 322, 'char');
        this.player.body.setOffset(7, 10);
        this.player.body.setSize(13, 20, false);

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

        this.player.play('run', true);
        this.player.on('animationcomplete', this.animComplete, this);

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keydown_SPACE", this.handleJump, this);
        this.playerJumping = false;
        this.playerDashing = false;
        this.playerJumpTime = 0;
        this.playerVelocityX = 100;
        this.levelComplete = false;

        this.input.keyboard.on("keyup_R", this.restart, this);

        this.cameras.main.startFollow(this.player, false, 0.08, 0, -80, 0);
        this.cameras.main.setZoom(2.5);

        this.initBananas();
        this.initFinish();
    }

    update(time, delta) {
        if (this.isLevelFailed()) {
            this.restart();
        }
        else if (this.isLevelComplete()) {
            this.player.setVelocityX(0);
            this.player.play('cheers', true);
        }
        else {
            this.updatePlayerVelocity();
        }
    }

    updatePlayerVelocity() {
        let playerVelocityX = this.playerVelocityX;
        if (this.playerJumping) playerVelocityX *= 1.2;
        if (this.playerDashing) playerVelocityX *= 1.6;
        this.player.setVelocityX(playerVelocityX);
    }

    handleJump() {
        let timePastFromJump = this.time.now - this.playerJumpTime;
        if (!this.playerJumping) {
            this.player.setVelocityY(-150);
            this.player.play('jump', false);
            this.playerJumping = true;
            this.playerJumpTime = this.time.now;
        } else {
            if (timePastFromJump < 200) {
                this.player.setVelocityY(-130);
                this.player.play('dash', false);
                this.playerDashing = true;
            } else {
                console.log("Too late for dash:", timePastFromJump, "ms > 200 ms");

            }
        }
    }

    animComplete(animation, frame) {
        if (animation.key === 'jump') {
            if (frame.index == animation.frames.length) {
                console.log("JumpTime: ", this.time.now - this.playerJumpTime);
                this.playerJumping = false;
                this.player.play('run', true, 3);
            }
        }
        if (animation.key === 'dash') {
            console.log("DashTime: ", this.time.now - this.playerJumpTime);
            this.playerJumping = false;
            this.playerDashing = false;
            this.player.play('run', true, 6);
        }
    }

    restart() {
        this.player.setPosition(150, 322);
        this.levelComplete = false;
    }

    isLevelComplete() {
        return this.levelComplete;
    }

    isLevelFailed() {
        return this.player.y > 340;
    }

    initBananas() {
        this.bananas = this.physics.add.staticGroup();
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

        this.physics.add.overlap(this.player, this.bananas, this.onStepOnBanana, null, this);
    }

    onStepOnBanana(player, banana) {
        console.log("Player stepped on banana at (%d, %d)", banana.x, banana.y);
        player.play('stumble', true);
        this.tweens.add({
            targets: this,
            duration: 500,
            playerVelocityX: 0,
            onComplete: function (tween, targets) {
                let target = targets[0];
                target.time.delayedCall(700, target.raisePlayer, null, target);
            }
        });
    }

    raisePlayer() {
        this.playerVelocityX = 100;
        this.player.play('run', true);
    }

    initFinish() {
        var finishTile;
        layer.forEachTile(function (tile) {
            if (tile.properties.isFinish) {
                finishTile = tile;
            }
        }, this);

        this.finish = this.physics.add.staticImage(layer.x + finishTile.pixelX, layer.y + finishTile.pixelY);
        this.physics.add.overlap(this.player, this.finish, this.onEnterFinishTile, null, this);
    }

    onEnterFinishTile(player, finishTile) {
        this.tweens.add({
            targets: this,
            duration: 700,
            playerVelocityX: 0,
            onComplete: function (tween, targets) {
                targets[0].levelComplete = true;
            }
        });
    }
}