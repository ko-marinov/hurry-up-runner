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

        this.player = this.physics.add.sprite(150, 336, 'char');

        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers("char", { start: 13, end: 20 }),
            frameRate: 16,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('char', { start: 65, end: 70 }),
            frameRate: 10,
        });
        this.anims.create({
            key: 'dash',
            frames: [{ key: 'char', frame: 18 }],
            frameRate: 2.5,
        });

        this.player.play('run', true);
        this.player.on('animationcomplete', this.animComplete, this);

        this.physics.add.collider(this.player, layer);

        this.input.keyboard.on("keydown_SPACE", this.handleJump, this);
        this.playerJumping = false;
        this.playerDashing = false;
        this.playerJumpTime = 0;
    }

    update(time, delta) {
        let speed = 0.1;
        if (this.playerJumping) speed *= 1.2;
        if (this.playerDashing) speed *= 1.6;
        layer.x -= speed * delta;

    }

    handleJump() {
        let timePastFromJump = this.time.now - this.playerJumpTime;
        if (!this.playerJumping) {
            this.player.setVelocityY(-80);
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
                this.player.play('run', true);
            }
        }
        if (animation.key === 'dash') {
            console.log("DashTime: ", this.time.now - this.playerJumpTime);
            this.playerJumping = false;
            this.playerDashing = false;
            this.player.play('run', true);
        }
    }
}