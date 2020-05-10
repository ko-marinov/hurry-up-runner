import 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'char');

        scene.sys.displayList.add(this);
        scene.sys.updateList.add(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.body.setOffset(7, 10);
        this.body.setSize(13, 20, false);

        this.on('animationcomplete', this.animComplete, this);

        this.isJumping = false;
        this.isDashing = false;
        this.jumpTime = 0;
        this.velocityX = 100;

        scene.input.keyboard.on("keydown_SPACE", this.handleInput, this);
    }

    run(frame) {
        this.isJumping = false;
        this.isDashing = false;
        this.jumpTime = 0;
        this.velocityX = 100;
        this.play('run', true, frame);
    }

    updateVelocity() {
        let velocityX = this.velocityX;
        if (this.isJumping) velocityX *= 1.2;
        if (this.isDashing) velocityX *= 1.6;
        this.setVelocityX(velocityX);
    }

    handleInput() {
        let timePastFromJump = this.scene.time.now - this.jumpTime;
        if (!this.isJumping) {
            this.setVelocityY(-150);
            this.play('jump', false);
            this.isJumping = true;
            this.jumpTime = this.scene.time.now;
        } else if (!this.isDashing && timePastFromJump < 200) {
            this.setVelocityY(-130);
            this.play('dash', false);
            this.isDashing = true;
        }
    }

    animComplete(animation, frame) {
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
        this.play('stumble', true);
        this.scene.tweens.add({
            targets: this,
            duration: 500,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.scene.time.delayedCall(700, player.raise, null, player);
            }
        });
    }

    raise() {
        this.run();
    }

    onEnterFinishTile() {
        this.scene.tweens.add({
            targets: this,
            duration: 700,
            velocityX: 0,
            onComplete: function (tween, targets) {
                let player = targets[0];
                player.scene.levelComplete = true;
                player.setVelocityX(0);
                player.play('cheers', true);
            }
        });
    }
}