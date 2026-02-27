import { gameConfig } from './config.js';

let pacman: Phaser.GameObjects.Image;
let mouths: Phaser.GameObjects.Ellipse[];
let ghosts: Phaser.GameObjects.Image[];
let score = 0;
let gameOver = false;

const directions = [
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 1, y: 0 }
];

let currentDirection = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('pacman', 'assets/pacman.png');
    this.load.image('ghost1', 'assets/ghost1.png');
    this.load.image('ghost2', 'assets/ghost2.png');
    this.load.image('ghost3', 'assets/ghost3.png');
    this.load.image('ghost4', 'assets/ghost4.png');
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000');
    
    pacman = this.add.image(400, 300, 'pacman').setScale(0.8);
    
    mouths = [];
    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const mouth = this.add.ellipse(x, y, 8, 8, 0xFFFF00);
      mouths.push(mouth);
    }
    
    ghosts = [
      this.add.image(200, 200, 'ghost1').setScale(0.8),
      this.add.image(600, 200, 'ghost2').setScale(0.8),
      this.add.image(200, 400, 'ghost3').setScale(0.8),
      this.add.image(600, 400, 'ghost4').setScale(0.8)
    ];
    
    ghosts.forEach((ghost, index) => {
      this.time.addEvent({
        delay: 1000 + index * 200,
        callback: () => {
          if (gameOver) return;
          const dir = directions[Phaser.Math.Between(0, 3)];
          ghost.x = Phaser.Math.Clamp(ghost.x + dir.x * 30, 50, 750);
          ghost.y = Phaser.Math.Clamp(ghost.y + dir.y * 30, 50, 550);
        },
        loop: true
      });
    });
    
    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') nextDirection = { x: 0, y: -1 };
      else if (event.key === 'ArrowDown') nextDirection = { x: 0, y: 1 };
      else if (event.key === 'ArrowLeft') nextDirection = { x: -1, y: 0 };
      else if (event.key === 'ArrowRight') nextDirection = { x: 1, y: 0 };
    });
    
    this.time.addEvent({
      delay: 150,
      callback: () => {
        if (gameOver) return;
        currentDirection = nextDirection;
        if (currentDirection.x !== 0 || currentDirection.y !== 0) {
          pacman.x = Phaser.Math.Clamp(pacman.x + currentDirection.x * 10, 50, 750);
          pacman.y = Phaser.Math.Clamp(pacman.y + currentDirection.y * 10, 50, 550);
        }
        
        mouths.forEach((mouth, index) => {
          if (Phaser.Math.Distance.Between(pacman.x, pacman.y, mouth.x, mouth.y) < 20) {
            mouth.setVisible(false);
            mouths.splice(index, 1);
            score += 10;
            
            if (mouths.length === 0) {
              gameOver = true;
              this.add.text(400, 300, '你赢了!', {
                fontSize: '64px',
                color: '#00FF00'
              }).setOrigin(0.5);
            }
          }
        });
        
        ghosts.forEach(ghost => {
          if (Phaser.Math.Distance.Between(pacman.x, pacman.y, ghost.x, ghost.y) < 30) {
            gameOver = true;
            this.add.text(400, 300, '游戏结束', {
              fontSize: '64px',
              color: '#FF0000'
            }).setOrigin(0.5);
          }
        });
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