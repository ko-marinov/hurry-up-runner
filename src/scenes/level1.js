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
        this.map.setCollisionBetween(0, 100);

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

        this.player.play('run', true);
        this.player.on('animationcomplete', this.animComplete, this);

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keydown_SPACE", this.handleJump, this);
        this.playerJumping = false;
        this.playerDashing = false;
        this.playerJumpTime = 0;
        this.playerVelocityX = 100;

        this.input.keyboard.on("keyup_R", this.restart, this);

        this.cameras.main.startFollow(this.player, false, 1, 0, -210, 138);
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
            this.player.setVelocityY(-35);
            this.player.play('jump', false);
            this.playerJumping = true;
            this.playerJumpTime = this.time.now;
        } else {
            if (timePastFromJump < 200) {
                this.player.setVelocityY(-35);
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
    }

    isLevelComplete() {
        return this.player.x > 1500;
    }

    isLevelFailed() {
        return this.player.y > 340;
    }
}