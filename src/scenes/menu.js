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
const UI_BTN_SELECT_LEVEL_1 = 'btnSelectLevel1';
const UI_BTN_SELECT_LEVEL_2 = 'btnSelectLevel2';
const UI_BTN_SELECT_LEVEL_3 = 'btnSelectLevel3';

const START_LAYOUT = 'start-layout';
const PAUSE_LAYOUT = 'pause-layout';
const FAIL_LAYOUT = 'fail-layout';
const VICTORY_LAYOUT = 'victory-layout';
const SELECT_LEVEL_LAYOUT = 'level-select-layout';

class UiButton {
    constructor(scene, x, y, texture, frame) {
        this.image = scene.add.image(x, y, texture, frame);
        this.image.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.image.width, this.image.height), Phaser.Geom.Rectangle.Contains);

        this.isPressed = false;
        this.setInitialListeners();
    }

    setInitialListeners() {
        this.image.on('pointerover', function (pointer, localX, localY, event) {
            this.image.setFrame(1);
        }, this);
        this.image.on('pointerout', function (pointer, localX, localY, event) {
            this.image.setFrame(0);
            this.isPressed = false;
        }, this);
        this.image.on('pointerdown', function (pointer, localX, localY, event) {
            this.image.setFrame(2);
            this.isPressed = true;
        }, this);
        this.image.on('pointerup', function (pointer, localX, localY, event) {
            if (!this.isPressed) { return; }

            this.press();
            this.image.setFrame(1);
        }, this);
    }

    setCallback(callback, context) {
        this.onPressCallback = callback;
        this.onPressContext = context;
    }

    setPosition(x, y) {
        this.image.setPosition(x, y);
    }

    setVisible(isVisible) {
        this.image.setVisible(isVisible);
    }

    press() {
        this.isPressed = false;
        if (!this.onPressCallback) {
            console.log('[DEBUG]: On press callback not set');
            console.log(this);
            return;
        }

        this.onPressCallback.bind(this.onPressContext)(event);
    }
};

class UiButtonWithText extends UiButton {
    constructor(scene, x, y, texture, frame, text) {
        super(scene, x, y, texture, frame);
        if (text) {
            this.label = scene.add.text(x, y, text, { fontFamily: 'vt323', fontSize: 24 });
            this.updateLabelPos();
        }
    }

    updateLabelPos() {
        if (!this.label) { return; }
        let x = this.image.x - this.label.width / 2;
        let y = this.image.y - this.label.height / 2;
        this.label.setPosition(x, y);
    }

    setPosition(x, y) {
        super.setPosition(x, y);
        this.updateLabelPos();
    }

    setVisible(isVisible) {
        super.setVisible(isVisible);
        if (this.label) {
            this.label.setVisible(isVisible);
        }
    }
}

class UiToggleButton extends UiButton {
    constructor(scene, x, y, texture, frame, states) {
        super(scene, x, y, texture, frame);
        this.states = states;
        this.currentState = frame % states;
    }

    setInitialListeners() {
        this.image.on('pointerover', function (pointer, localX, localY, event) {
            this.image.setFrame(this.currentState + this.states);
        }, this);
        this.image.on('pointerout', function (pointer, localX, localY, event) {
            this.image.setFrame(this.currentState);
            this.isPressed = false;
        }, this);
        this.image.on('pointerdown', function (pointer, localX, localY, event) {
            this.image.setFrame(this.currentState + 2 * this.states);
            this.isPressed = true;
        }, this);
        this.image.on('pointerup', function (pointer, localX, localY, event) {
            if (!this.isPressed) { return; }

            this.press();
            this.image.setFrame(this.currentState + this.states);
        }, this);
    }

    press() {
        this.currentState = (this.currentState + 1) % this.states;
        this.image.setFrame(this.currentState);

        this.isPressed = false;
        if (!this.onPressCallback) {
            console.log('[DEBUG]: On press callback not set');
            console.log(this);
            return;
        }

        this.onPressCallback.bind(this.onPressContext)(this.currentState, event);
    }
};

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
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.3)');

        let center_x = this.game.config.width / 2;

        // Init UI elements
        this.uiElements = new Map();
        this.uiElements.set(UI_TITLE_IMG, this.add.image(center_x, 100, 'game-title'));
        this.uiElements.set(UI_SCORE_IMG, this.add.sprite(center_x, 90, 'ui-score-image'));
        this.uiElements.set(UI_BTN_START, new UiButtonWithText(this, 0, 0, 'btn-start', 0, 'Start'));
        this.uiElements.set(UI_BTN_RESUME, new UiButtonWithText(this, 0, 0, 'btn-resume', 0, 'Resume'));
        this.uiElements.set(UI_BTN_RESTART, new UiButtonWithText(this, 0, 0, 'btn-restart', 0, 'Restart'));
        this.uiElements.set(UI_BTN_EXIT, new UiButtonWithText(this, 0, 0, 'btn-exit', 0, 'Exit'));
        this.uiElements.set(UI_BTN_NEXT_LEVEL, new UiButtonWithText(this, 0, 0, 'btn-next-level', 0, 'Next Level'));
        this.uiElements.set(UI_BTN_REPEAT, new UiButtonWithText(this, 0, 0, 'btn-repeat', 0, 'Repeat'));
        this.uiElements.set(UI_BTN_TOGGLE_MUSIC, new UiToggleButton(this, 0, 0, 'btn-volume', 0, 2));
        this.uiElements.set(UI_BTN_SELECT_LEVEL_1, new UiButtonWithText(this, 0, 0, 'btn-start', 0, 'Level 1'));
        this.uiElements.set(UI_BTN_SELECT_LEVEL_2, new UiButtonWithText(this, 0, 0, 'btn-start', 0, 'Level 2'));
        this.uiElements.set(UI_BTN_SELECT_LEVEL_3, new UiButtonWithText(this, 0, 0, 'btn-start', 0, 'Level 3'));

        this.get(UI_BTN_START).setCallback(this.showSelectLevelScreen, this);
        this.get(UI_BTN_RESUME).setCallback(this.resumeGame, this);
        this.get(UI_BTN_RESTART).setCallback(this.restartLevel, this);
        this.get(UI_BTN_NEXT_LEVEL).setCallback(this.startNextLevel, this);
        this.get(UI_BTN_REPEAT).setCallback(this.restartLevel, this);
        this.get(UI_BTN_TOGGLE_MUSIC).setCallback(this.toggleMusic, this);
        this.get(UI_BTN_SELECT_LEVEL_1).setCallback(function (event) {
            this.currentLevel = 'Level1';
            this.startGame(event);
        }, this);
        this.get(UI_BTN_SELECT_LEVEL_2).setCallback(function (event) {
            this.currentLevel = 'Level2';
            this.startGame(event);
        }, this);
        this.get(UI_BTN_SELECT_LEVEL_3).setCallback(function (event) {
            this.currentLevel = 'Level3';
            this.startGame(event);
        }, this);

        this.input.keyboard.on("keyup_M", function () {
            this.get(UI_BTN_TOGGLE_MUSIC).press();
        }, this);

        // Init screen layouts
        this.layouts = new Map();
        this.layouts.set(START_LAYOUT, { title: true, score: false, buttons: [UI_BTN_START, UI_BTN_TOGGLE_MUSIC], startY: 195 });
        this.layouts.set(PAUSE_LAYOUT, { title: false, score: false, buttons: [UI_BTN_RESUME, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 125 });
        this.layouts.set(FAIL_LAYOUT, { title: false, score: false, buttons: [UI_BTN_RESTART, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 125 });
        this.layouts.set(VICTORY_LAYOUT, { title: false, score: true, buttons: [UI_BTN_NEXT_LEVEL, UI_BTN_REPEAT, UI_BTN_EXIT, UI_BTN_TOGGLE_MUSIC], startY: 160 });
        this.layouts.set(SELECT_LEVEL_LAYOUT, { title: false, score: false, buttons: [UI_BTN_SELECT_LEVEL_1, UI_BTN_SELECT_LEVEL_2, UI_BTN_SELECT_LEVEL_3], startY: 125 });

        this.scene.bringToTop('MainMenu');

        this.hideAll();
        this.showStartScreen();

        this.sound.play('music-loop', { loop: true });
    }

    get(uiElementName) {
        return this.uiElements.get(uiElementName);
    }

    setLayout(layoutName) {
        this.hideAll();
        let layout = this.layouts.get(layoutName);
        if (layout.title) {
            this.get(UI_TITLE_IMG).setVisible(true);
        }
        if (layout.score) {
            this.get(UI_SCORE_IMG).setVisible(true);
        }
        let localX = this.game.config.width / 2;
        let localY = layout.startY;
        layout.buttons.forEach(btn => {
            let uiBtn = this.get(btn);
            uiBtn.setPosition(localX, localY);
            uiBtn.setVisible(true);
            localY += 45;
        }, this);
    }

    showSelectLevelScreen() {
        this.setLayout(SELECT_LEVEL_LAYOUT);
        this.input.keyboard.off("keyup_ENTER", this.showSelectLevelScreen, this, false);
        this.input.keyboard.on("keyup_ESC", this.showStartScreen, this);
    }

    showStartScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.setLayout(START_LAYOUT);
        this.input.keyboard.off("keyup_ESC", this.showStartScreen, this, false);
        this.input.keyboard.on("keyup_ENTER", this.showSelectLevelScreen, this);
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

    showVictoryScreen() {
        this.scene.setVisible(true, 'MainMenu');
        this.setLayout(VICTORY_LAYOUT);
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
        this.scene.setVisible(false, 'MainMenu');
        this.scene.launch(this.currentLevel);
    }

    resumeGame(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ESC", this.resumeGame, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get(this.currentLevel).resume();
    }

    restartLevel(event) {
        this.hideAll();
        event.stopPropagation();
        this.input.keyboard.off("keyup_ENTER", this.restartLevel, this, false);
        this.scene.setVisible(false, 'MainMenu');
        this.scene.get(this.currentLevel).restart();
    }

    startNextLevel(event) {
        this.restartLevel(event);
    }

    toggleMusic(isOff, event) {
        event.stopPropagation();
        this.sound.setMute(isOff);
    }
}