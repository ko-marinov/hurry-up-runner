import 'phaser';

// Game Assets
import tilesetImg from '../../assets/tilesets/city-tileset.png';
import bgTilesetImg from '../../assets/tilesets/city-bg-tileset.png';
import mainCharSpritesheet from '../../assets/sprites/main_char.png';
import npcSpritesheet1 from '../../assets/sprites/npc_1.png';

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
    preload() {
        this.load.image('city-tileset', tilesetImg);
        this.load.image('city-bg-tileset', bgTilesetImg);
        this.load.spritesheet('char', mainCharSpritesheet, { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('npc1', npcSpritesheet1, { frameWidth: 32, frameHeight: 32 });

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
        this.scene.start('MainMenu');
    }
}
