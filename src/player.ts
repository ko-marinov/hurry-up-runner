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

const MAX_STAMINA = 1;
const STAMINA_RESTORATION_RATE = 0.25 * MAX_STAMINA;
const STAMINA_COST_JUMP = 0.2 * MAX_STAMINA;
const STAMINA_COST_DODGE = 0.2 * MAX_STAMINA;
const STAMINA_COST_DASH = 0.3 * MAX_STAMINA;

export class Player extends Phaser.Physics.Arcade.Sprite {
    velocityX: number;
    fallThreshold: number;
    isFalling: boolean;
    jumpTime: number;
    stepOnBananaTime: number;
    stamina: number;
    impulseTween: Phaser.Tweens.Tween;
    stumbleTween: Phaser.Tweens.Tween;
    delayedTask: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'char');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.depth = 1;
        this.body.setOffset(10, 10);
        this.body.setSize(10, 20, false);
        this.fallThreshold = y + 1;
        this.isFalling = false;
        this.jumpTime = 0;
        this.stepOnBananaTime = 0;
        this.stamina = MAX_STAMINA;

        this.on('animationcomplete', this.animComplete, this);

        scene.input.keyboard.on("keydown_SPACE", this.handleInput, this);

        this.idle();
    }

    update(deltaMs: number) {
        super.update(deltaMs);

        this.updateVelocity();
        this.updateStamina(deltaMs);
        this.updateFalling();
    }

    idle() {
        this.velocityX = 0;
        this.play('idle', true);
        this.setState(PlayerState.IDLE);
        if (this.impulseTween) {
            this.impulseTween.stop();
        }
        if (this.stumbleTween) {
            this.stumbleTween.stop();
        }
        if (this.delayedTask) {
            this.delayedTask.remove(false);
        }
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
        if (!this.hasEnoughStamina(STAMINA_COST_JUMP)) {
            return;
        }
        this.stamina -= STAMINA_COST_JUMP;
        this.setVelocityY(-150);
        this.applyVelocityImpulse(VELOCITY_JUMP, 500);
        this.play('jump', false);
        this.jumpTime = this.scene.time.now;
        this.updateState(PlayerState.JUMP);
        this.scene.sound.play('snd-jump');
    }

    tryDash() {
        if (!this.isRegularDash() && !this.isBananaDash()) {
            return;
        }
        if (!this.hasEnoughStamina(STAMINA_COST_DASH)) {
            return;
        }
        this.stamina -= STAMINA_COST_DASH;
        if (this.stumbleTween != undefined) {
            this.stumbleTween.stop();
        }
        if (this.isBananaDash()) {
            this.setVelocityY(-150);
        } else {
            this.setVelocityY(-100);
        }
        this.applyVelocityImpulse(VELOCITY_DASH, 800);
        this.play('dash', false);
        this.updateState(PlayerState.DASH);
        this.scene.sound.stopByKey('snd-stumble');
        this.scene.sound.play('snd-jump');
    }

    isRegularDash() {
        if (this.state != PlayerState.JUMP) {
            return false;
        }
        let timePastFromJump = this.scene.time.now - this.jumpTime;
        return timePastFromJump <= 200;
    }

    isBananaDash() {
        if (this.state != PlayerState.STUMBLED) {
            return false;
        }
        let timePastFromStemOnBanana = this.scene.time.now - this.stepOnBananaTime;
        return timePastFromStemOnBanana <= 40;
    }

    tryDodge() {
        if (this.state != PlayerState.RUN && this.state != PlayerState.DODGE) {
            return;
        }
        if (!this.isCloseToWalker()) {
            return;
        }
        if (!this.hasEnoughStamina(STAMINA_COST_DODGE)) {
            return;
        }
        this.stamina -= STAMINA_COST_DODGE;
        this.applyVelocityImpulse(VELOCITY_DODGE, 300);
        this.play('dodge', false);
        this.updateState(PlayerState.DODGE);
        this.scene.sound.play('snd-dodge');
    }

    stumble() {
        if (this.impulseTween) { this.impulseTween.stop(); }
        this.play('stumble', true);
        this.scene.sound.play('snd-stumble');
        this.updateState(PlayerState.STUMBLED);
        this.stumbleTween = this.scene.tweens.add({
            targets: this,
            duration: 500,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.delayedTask = player.scene.time.delayedCall(700, player.run, null, player);
            }
        });
    }

    bump() {
        if (this.impulseTween) { this.impulseTween.stop(); }
        this.play('bump', true);
        this.scene.sound.play('snd-bump');
        this.updateState(PlayerState.STUMBLED);
        this.velocityX = -50;
        this.scene.tweens.add({
            targets: this,
            duration: 300,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.delayedTask = player.scene.time.delayedCall(700, player.run, null, player);
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

    updateFalling() {
        if (this.body.y > this.fallThreshold) {
            if (!this.isFalling) {
                this.isFalling = true;
                this.scene.sound.play('snd-fall');
                this.play('fall', true, 2);
                this.velocityX = 0;
            }
        } else {
            this.isFalling = false;
        }
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
        this.stepOnBananaTime = this.scene.time.now;
        this.stumble();
    }

    onEnterFinishTile() {
        // deltaX = vt + (1/2)at^2 = const
        // v0 = v, v1 = 0 => a = v/t
        // => t = (2/3)deltaX/v
        let deltaX = 60;
        let duration = ((2 * deltaX / 3) * 1000) / this.velocityX;
        this.scene.tweens.add({
            targets: this.body.velocity,
            duration: duration,
            x: 0,
            onComplete: function (tween, targets, player) {
                player.cheer();
            },
            onCompleteParams: [this]
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

    getStamina() {
        return this.stamina;
    }

    updateStamina(deltaMs) {
        let restoredStamina = STAMINA_RESTORATION_RATE * deltaMs / 1000;
        this.stamina = this.stamina + restoredStamina < MAX_STAMINA ? this.stamina + restoredStamina : MAX_STAMINA;
    }

    hasEnoughStamina(stamina) {
        return this.stamina > stamina;
    }

    restoreFullStamina() {
        this.stamina = MAX_STAMINA;
    }
}
