import 'phaser';

import btnStartImg from '../../assets/images/button_start.png';
import btnExitImg from '../../assets/images/button_exit.png';
import btnRestartImg from '../../assets/images/button_restart.png';
import btnNextLevelImg from '../../assets/images/button_next_level.png';
import btnRepeatImg from '../../assets/images/button_repeat.png';
import btnResumeImg from '../../assets/images/button_resume.png';
import btnVolumeImg from '../../assets/images/button-volume.png';
import titleImg from '../../assets/images/game_name.png';
import scoreImg from '../../assets/images/total_score.png';

const UI_TITLE_IMG = 'title';
const UI_SCORE_IMG = 'score';
const UI_BTN_START = 'btnStart';
const UI_BTN_RESUME = 'btnResume';
const UI_BTN_RESTART = 'btnRestart';
const UI_BTN_NEXT_LEVEL = 'btnNextLevel';
const UI_BTN_REPEAT = 'btnRepeat';
const UI_BTN_EXIT = 'btnExit';
const UI_BTN_TOGGLE_MUSIC = 'btnToggleMusic';

const START_LAYOUT = 'start-layout';
const PAUSE_LAYOUT = 'pause-layout';
const FAIL_LAYOUT = 'fail-layout';
const VICTORY_LAYOUT = 'victory-layout';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super("MainMenu");
    }

    preload() {
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
        this.scene.launch('Level1');
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.3)');

        let center_x = this.game.config.width / 2;

        // Init UI elements
        this.uiElements = new Map();
        this.uiElements.set(UI_TITLE_IMG, this.add.image(center_x, 100, 'game-title'));
        this.uiElements.set(UI_SCORE_IMG, this.add.sprite(center_x, 90, 'ui-score-image'));
        this.uiElements.set(UI_BTN_START, this.add.sprite(center_x, 200, 'btn-start').setInteractive());
        this.uiElements.set(UI_BTN_RESUME, this.add.sprite(center_x, 200, 'btn-resume').setInteractive());
        this.uiElements.set(UI_BTN_RESTART, this.add.sprite(center_x, 200, 'btn-restart').setInteractive());
        this.uiElements.set(UI_BTN_EXIT, this.add.sprite(center_x, 200, 'btn-exit').setInteractive());
        this.uiElements.set(UI_BTN_TOGGLE_MUSIC, this.add.sprite(center_x, 250, 'btn-volume').setInteractive());

        this.input.on('gameobjectover', this.onGameObjectOver, this);
        this.input.on('gameobjectout', this.onGameObjectOut, this);
        this.input.on('gameobjectdown', this.onGameObjectDown, this);
        this.input.on('gameobjectup', this.onGameObjectUp, this);

        this.input.keyboard.on("keyup_M", this.toggleMusic, this);
        this.isMuted = false;

        // Init screen layouts
        this.layouts = new Map();
        this.layouts.set(START_LAYOUT, { title: true, score: false, buttons: [UI_BTN_START, UI_BTN_TOGGLE_MUSIC], startY: 195 });
        this.layouts.set(PAUSE_LAYOUT, { title: false, score: false, buttons: [UI_BTN_RESUME, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 125 });
        this.layouts.set(FAIL_LAYOUT, { title: false, score: true, buttons: [UI_BTN_RESTART, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 160 });
        this.layouts.set(VICTORY_LAYOUT, { title: false, score: true, buttons: [UI_BTN_NEXT_LEVEL, UI_BTN_REPEAT, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 160 });

        this.scene.bringToTop('MainMenu');

        this.hideAll();
        this.showStartScreen();

        this.sound.play('music-loop', { loop: true });
    }

    get(uiElementName) {
        return this.uiElements.get(uiElementName);
    }

    setLayout(layoutName) {
        let layout = this.layouts.get(layoutName);
        if (layout.title) {
            this.get(UI_TITLE_IMG).setVisible(true);
        }
        if (layout.score) {
            this.get(UI_SCORE_IMG).setVisible(true);
        }
        let localY = layout.startY;
        layout.buttons.forEach(btn => {
            let uiBtn = this.get(btn);
            uiBtn.y = localY;
            uiBtn.setVisible(true);
            localY += 45;
        }, this);
    }

    onGameObjectOver(pointer, gameObject, event) {
        if (gameObject === this.get(UI_BTN_TOGGLE_MUSIC)) {
            gameObject.setFrame(this.isMuted ? 3 : 2);
        } else {
            gameObject.setFrame(1);
        }
    }

    onGameObjectOut(pointer, gameObject, event) {
        if (gameObject === this.get(UI_BTN_TOGGLE_MUSIC)) {
            gameObject.setFrame(this.isMuted ? 1 : 0);
        } else {
            gameObject.setFrame(0);
        }
    }

    onGameObjectDown(pointer, gameObject, event) {
        if (gameObject === this.get(UI_BTN_TOGGLE_MUSIC)) {
            gameObject.setFrame(this.isMuted ? 5 : 4);
        } else {
            gameObject.setFrame(2);
        }
    }

    onGameObjectUp(pointer, gameObject, event) {
        if (gameObject === this.get(UI_BTN_TOGGLE_MUSIC)) {
            gameObject.setFrame(this.isMuted ? 3 : 2);
        } else {
            gameObject.setFrame(1);
        }

        if (gameObject === this.get(UI_BTN_START)) {
            this.startGame(event);
        } else if (gameObject === this.get(UI_BTN_RESUME)) {
            this.resumeGame(event);
        } else if (gameObject === this.get(UI_BTN_RESTART)) {
            this.restartLevel(event);
        } else if (gameObject === this.get(UI_BTN_TOGGLE_MUSIC)) {
            this.toggleMusic(event);
        }
    }

    showStartScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.setLayout(START_LAYOUT);
        this.input.keyboard.on("keyup_ENTER", this.startGame, this);
    }

    showPauseScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.setLayout(PAUSE_LAYOUT);
        this.input.keyboard.on("keyup_ESC", this.resumeGame, this);
    }

    showFailScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.setLayout(FAIL_LAYOUT);
        this.input.keyboard.on("keyup_ENTER", this.restartLevel, this);
    }

    hideAll() {
        this.uiElements.forEach(function (uiElem) {
            uiElem.setVisible(false);
        });
    }

    startGame(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ENTER", this.startGame, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').start();
    }

    resumeGame(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ESC", this.resumeGame, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').resume();
    }

    restartLevel(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ENTER", this.restartLevel, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get('Level1').restart();
    }

    toggleMusic(event) {
        event.stopPropagation();
        if (this.isMuted) {
            this.get(UI_BTN_TOGGLE_MUSIC).setFrame(2);
        } else {
            this.get(UI_BTN_TOGGLE_MUSIC).setFrame(3);
        }
        this.isMuted = !this.isMuted;
        this.sound.setMute(this.isMuted);
    }
}