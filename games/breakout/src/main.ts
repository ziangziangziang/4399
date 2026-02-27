import { gameConfig } from './config.js';

let paddle: Phaser.GameObjects.Rectangle;
let ball: Phaser.GameObjects.Ellipse;
let bricks: Phaser.GameObjects.Rectangle[][];
let score = 0;
let gameOver = false;

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {}

  create() {
    this.cameras.main.setBackgroundColor('#1a1a2e');
    
    paddle = this.add.rectangle(400, 550, 100, 15, 0x00ff00);
    ball = this.add.ellipse(400, 300, 10, 10, 0xffffff);
    
    bricks = [];
    const colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff];
    for (let row = 0; row < 5; row++) {
      bricks[row] = [];
      for (let col = 0; col < 8; col++) {
        const brick = this.add.rectangle(
          80 + col * 90,
          60 + row * 40,
          70,
          30,
          colors[row]
        );
        bricks[row].push(brick);
      }
    }
    
    let ballVelocity = { x: 3, y: -3 };
    
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        paddle.x = Phaser.Math.Max(50, paddle.x - 50);
      } else if (event.key === 'ArrowRight') {
        paddle.x = Phaser.Math.Min(750, paddle.x + 50);
      }
    });
    
    this.input.on('pointermove', (pointer: any) => {
      paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
    });
    
    this.time.addEvent({
      delay: 16,
      callback: () => {
        if (gameOver) return;
        
        ball.x += ballVelocity.x;
        ball.y += ballVelocity.y;
        
        if (ball.x <= 10 || ball.x >= 790) {
          ballVelocity.x = -ballVelocity.x;
        }
        if (ball.y <= 10) {
          ballVelocity.y = -ballVelocity.y;
        }
        
        if (ball.y >= 540 && ball.x >= paddle.x - 50 && ball.x <= paddle.x + 50) {
          ballVelocity.y = -Math.abs(ballVelocity.y);
        }
        
        if (ball.y > 600) {
          gameOver = true;
          this.add.text(400, 300, '游戏结束', {
            fontSize: '64px',
            color: '#FF0000'
          }).setOrigin(0.5);
        }
        
        for (let row = 0; row < bricks.length; row++) {
          for (let col = 0; col < bricks[row].length; col++) {
            const brick = bricks[row][col];
            if (brick && Phaser.Math.Distance.Between(
              ball.x, ball.y,
              brick.x, brick.y
            ) < 50) {
              brick.destroy();
              bricks[row][col] = null!;
              score += 10;
              ballVelocity.y = -ballVelocity.y;
              
              let remaining = 0;
              for (const r of bricks) {
                for (const b of r) {
                  if (b) remaining++;
                }
              }
              if (remaining === 0) {
                gameOver = true;
                this.add.text(400, 300, '你赢了!', {
                  fontSize: '64px',
                  color: '#00FF00'
                }).setOrigin(0.5);
              }
            }
          }
        }
      },
      loop: true
    });
    
    const scoreText = this.add.text(20, 20, '分数：0', {
      fontSize: '24px',
      color: '#FFFFFF'
    });
    
    this.time.addEvent({
      delay: 100,
      callback: () => {
        scoreText.setText(`分数：${score}`);
      },
      loop: true
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  ...gameConfig,
  scene: [MainScene]
};

const game = new Phaser.Game(config);

export default game;