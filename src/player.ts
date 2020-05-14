import 'phaser';

enum PlayerState {
    RUN = 'RUN',
    JUMP = 'JUMP',
    DASH = 'DASH',
    STUMBLED = 'STUNBLED',
    CHEER = 'CHEER'
}

export class Player extends Phaser.Physics.Arcade.Sprite {
    velocityX: number;
    jumpTime: number;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'char');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(10, 10);
        this.body.setSize(10, 20, false);

        this.on('animationcomplete', this.animComplete, this);

        this.jumpTime = 0;
        this.velocityX = 100;

        scene.input.keyboard.on("keydown_SPACE", this.handleInput, this);
    }

    run(frame: number = 0) {
        this.jumpTime = 0;
        this.velocityX = 100;
        this.play('run', true, frame);
        this.updateState(PlayerState.RUN);
    }

    tryJump() {
        if (!this.body.blocked.down) { return; }
        this.setVelocityY(-150);
        this.play('jump', false);
        this.jumpTime = this.scene.time.now;
        this.updateState(PlayerState.JUMP);
    }

    tryDash() {
        let timePastFromJump = this.scene.time.now - this.jumpTime;
        if (timePastFromJump > 200) { return; }
        this.setVelocityY(-130);
        this.play('dash', false);
        this.updateState(PlayerState.DASH);
    }

    stumble() {
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
        let velocityX = this.velocityX;
        if (this.state === PlayerState.JUMP) velocityX *= 1.2;
        if (this.state === PlayerState.DASH) velocityX *= 1.6;
        this.setVelocityX(velocityX);
    }

    handleInput() {
        if (this.state === PlayerState.RUN) {
            this.tryJump();
        } else if (this.state === PlayerState.JUMP) {
            this.tryDash();
        }
    }

    animComplete(animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) {
        if (animation.key === 'jump') {
            if (frame.index == animation.frames.length) {
                console.log("JumpTime: ", this.scene.time.now - this.jumpTime);
                this.run(3);
            }
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
}