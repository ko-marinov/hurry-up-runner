import 'phaser';

enum PlayerState {
    IDLE = 'IDLE',
    RUN = 'RUN',
    JUMP = 'JUMP',
    DASH = 'DASH',
    STUMBLED = 'STUNBLED',
    DODGE = 'DODGE',
    CHEER = 'CHEER'
}

const VELOCITY_RUN = 100;
const VELOCITY_JUMP = VELOCITY_RUN * 1.8;
const VELOCITY_DASH = VELOCITY_RUN * 2.4;
const VELOCITY_DODGE = VELOCITY_RUN * 1.8;

export class Player extends Phaser.Physics.Arcade.Sprite {
    velocityX: number;
    jumpTime: number;
    impulseTween: Phaser.Tweens.Tween;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'char');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(10, 10);
        this.body.setSize(10, 20, false);
        this.jumpTime = 0;

        this.on('animationcomplete', this.animComplete, this);

        scene.input.keyboard.on("keydown_SPACE", this.handleInput, this);

        this.idle();
    }

    idle() {
        this.velocityX = 0;
        this.play('idle', true);
        this.setState(PlayerState.IDLE);
    }

    run(frame: number = 0) {
        this.velocityX = VELOCITY_RUN;
        this.play('run', true, frame);
        this.updateState(PlayerState.RUN);
    }

    tryRun() {
        if (this.state != PlayerState.JUMP && this.state != PlayerState.DASH) { return; }
        if (!this.body.blocked.down) { return; }
        this.run();
    }

    tryJump() {
        if (this.state != PlayerState.RUN && this.state != PlayerState.DODGE) {
            return;
        }
        if (this.isCloseToWalker()) {
            return;
        }
        if (!this.body.blocked.down) {
            return;
        }
        this.setVelocityY(-150);
        this.applyVelocityImpulse(VELOCITY_JUMP, 500);
        this.play('jump', false);
        this.jumpTime = this.scene.time.now;
        this.updateState(PlayerState.JUMP);
    }

    tryDash() {
        if (this.state != PlayerState.JUMP) { return; }
        let timePastFromJump = this.scene.time.now - this.jumpTime;
        if (timePastFromJump > 200) { return; }
        this.setVelocityY(-100);
        this.applyVelocityImpulse(VELOCITY_DASH, 800);
        this.play('dash', false);
        this.updateState(PlayerState.DASH);
    }

    tryDodge() {
        if (this.state != PlayerState.RUN && this.state != PlayerState.DODGE) {
            return;
        }
        if (!this.isCloseToWalker()) {
            return;
        }
        this.applyVelocityImpulse(VELOCITY_DODGE, 300);
        this.play('dodge', false);
        this.updateState(PlayerState.DODGE);
    }

    stumble() {
        if (this.impulseTween) { this.impulseTween.stop(); }
        this.play('stumble', true);
        this.updateState(PlayerState.STUMBLED);
        this.scene.tweens.add({
            targets: this,
            duration: 500,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.scene.time.delayedCall(700, player.run, null, player);
            }
        });
    }

    bump() {
        if (this.impulseTween) { this.impulseTween.stop(); }
        this.play('bump', true);
        this.updateState(PlayerState.STUMBLED);
        this.velocityX = -50;
        this.scene.tweens.add({
            targets: this,
            duration: 300,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.scene.time.delayedCall(700, player.run, null, player);
            }
        });
    }

    cheer() {
        this.setVelocityX(0);
        this.play('cheers', true);
        this.updateState(PlayerState.CHEER);
    }

    updateState(state: PlayerState) {
        if (this.state === state) { return; }
        console.log("Enter state:", state);
        this.state = state;
    }

    updateVelocity() {
        this.setVelocityX(this.velocityX);
    }

    handleInput() {
        this.tryRun();
        this.tryDash();
        this.tryDodge();
        this.tryJump();
    }

    animComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === 'jump') {
            if (frame.index == animation.frames.length) {
                console.log("JumpTime: ", this.scene.time.now - this.jumpTime);
                this.run(3);
            }
        }
        if (animation.key === 'dodge') {
            this.run(3);
        }
        if (animation.key === 'dash') {
            console.log("DashTime: ", this.scene.time.now - this.jumpTime);
            this.run(6);
        }
    }

    onStepOnBanana() {
        if (this.state === PlayerState.STUMBLED) { return; }
        this.stumble();
    }

    onEnterFinishTile() {
        this.scene.tweens.add({
            targets: this,
            duration: 700,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.cheer();
                player.scene.levelComplete = true;
            }
        });
    }

    isCloseToWalker() {
        let walkers = this.scene.getWalkers();
        for (let index = 0; index < walkers.length; index++) {
            const walker = walkers[index];
            if (walker.isBumped || this.x > walker.x) {
                continue;
            }
            if (walker.x - this.x < 30) {
                return true;
            }
        }
        return false;
    }

    onRunIntoWalker() {
        if (this.state === PlayerState.STUMBLED) { return; }
        this.bump();
    }

    onRunIntoBird() {
        if (this.state === PlayerState.STUMBLED) { return; }
        this.bump();
    }

    isDodging() {
        return this.state === PlayerState.DODGE;
    }

    isStumbled() {
        return this.state === PlayerState.STUMBLED;
    }

    applyVelocityImpulse(newVelocity, recovery) {
        this.velocityX = newVelocity;
        if (this.impulseTween) { this.impulseTween.stop(); }
        this.impulseTween = this.scene.tweens.add({
            targets: this,
            duration: recovery,
            velocityX: VELOCITY_RUN,
            ease: "Quad.easeOut"
        });
    }
}