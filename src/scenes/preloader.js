import 'phaser';

// Game Assets
import tilesetImg from '../../assets/tilesets/city-tileset.png';
import bgTilesetImg from '../../assets/tilesets/city-bg-tileset.png';
import mainCharSpritesheet from '../../assets/sprites/main_char.png';
import npcSpritesheet1 from '../../assets/sprites/npc_1.png';
import birdSpritesheet from '../../assets/sprites/bird.png';

const LevelMaps = [
    { key: 'Level1', file: '../assets/tilemaps/level_1.json' },
    { key: 'Level2', file: '../assets/tilemaps/level_1.json' },
    { key: 'Level3', file: '../assets/tilemaps/level_1.json' },
    { key: 'menu-map', file: '../assets/tilemaps/menu.json' }
];

// UI Assets
import btnStartImg from '../../assets/images/button_start.png';
import btnExitImg from '../../assets/images/button_exit.png';
import btnRestartImg from '../../assets/images/button_restart.png';
import btnNextLevelImg from '../../assets/images/button_next_level.png';
import btnRepeatImg from '../../assets/images/button_repeat.png';
import btnResumeImg from '../../assets/images/button_resume.png';
import btnVolumeImg from '../../assets/images/button-volume.png';
import titleImg from '../../assets/images/game_name.png';
import scoreImg from '../../assets/images/total_score.png';

export class Preloader extends Phaser.Scene {
    constructor() {
        super('Preloader');
    }

    preload() {
        let loadingText = this.add.text(0, 0, 'LOADING...', { fontFamily: 'vt323', fontSize: 32 });
        loadingText.setPosition(
            this.game.config.width / 2 - loadingText.width / 2,
            this.game.config.height / 2 - loadingText.height / 2
        );

        this.load.image('city-tileset', tilesetImg);
        this.load.image('city-bg-tileset', bgTilesetImg);
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('npc1', npcSpritesheet1, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('bird', birdSpritesheet, { frameWidth: 16, frameHeight: 16 });

        LevelMaps.forEach(function (mapData) {
            this.load.tilemapTiledJSON(mapData.key, mapData.file);
        }, this);

        this.load.image('game-title', titleImg);
        this.load.spritesheet('btn-start', btnStartImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-exit', btnExitImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-restart', btnRestartImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-next-level', btnNextLevelImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-repeat', btnRepeatImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-resume', btnResumeImg, { frameWidth: 186, frameHeight: 40 });
        this.load.spritesheet('btn-volume', btnVolumeImg, { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet('ui-score-image', scoreImg, { frameWidth: 252, frameHeight: 83 });
        this.load.audio('music-loop', '../../assets/sounds/music_loop.mp3');
    }

    create() {
        this.registerAnimations();
        this.scene.start('MainMenu');
    }

    registerAnimations() {
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('char', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
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
        this.anims.create({
            key: 'birdFly',
            frames: this.anims.generateFrameNumbers('bird', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });
        this.anims.create({
            key: 'birdFall',
            frames: [{ key: 'bird', frame: 2 }],
            frameRate: 1,
            repeat: -1
        });
    }
}
