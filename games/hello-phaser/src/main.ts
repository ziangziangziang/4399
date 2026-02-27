import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  private balls: any[] = [];

  constructor() {
    super({ key: 'MainScene' });
  }

  create(): void {
    this.add.text(400, 50, 'Click to add balls', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 80, 'Space to reset', {
      fontSize: '18px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.addBall(pointer.x, pointer.y);
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.resetBalls();
    });
  }

  private addBall(x: number, y: number): void {
    const ball = this.add.circle(x, y, 20, Phaser.Math.Between(0, 0xffffff));
    ball.setInteractive({ draggable: true });
    
    const velocity = {
      x: Phaser.Math.Between(-200, 200),
      y: Phaser.Math.Between(-200, 200)
    };

    this.tweens.add({
      targets: ball,
      x: x + velocity.x,
      y: y + velocity.y,
      duration: 1000,
      repeat: -1,
      yoyo: true,
      ease: 'Linear'
    });

    this.balls.push(ball);
  }

  private resetBalls(): void {
    this.balls.forEach(ball => ball.destroy());
    this.balls = [];
  }

  update(): void {
    this.balls.forEach(ball => {
      if (ball.x < 0 || ball.x > 800) {
        ball.setX(ball.x < 0 ? 0 : 800);
      }
      if (ball.y < 0 || ball.y > 600) {
        ball.setY(ball.y < 0 ? 0 : 600);
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game-canvas',
  backgroundColor: '#1a1a2e',
  scene: [MainScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

const game = new Phaser.Game(config);

(window as any).__GAME_INSTANCE__ = {
  start: () => {},
  stop: () => {
    game.destroy(true);
  }
};