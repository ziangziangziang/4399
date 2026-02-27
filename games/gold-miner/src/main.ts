import Phaser from 'phaser';

const CONFIG = {
  gameWidth: 800,
  gameHeight: 600,
  hookSpeed: 300,
  hookRetractSpeed: 400,
  gameTime: 60
};

interface GameItem {
  type: 'gold' | 'diamond' | 'rock' | 'bag';
  value: number;
  weight: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
}

class MainScene extends Phaser.Scene {
  private hookPivot: Phaser.GameObjects.Rectangle;
  private hookGraphics: Phaser.GameObjects.Graphics;
  private hookState: 'idle' | 'shooting' | 'retracting' | 'collecting' = 'idle';
  private hookPos: Phaser.Math.Vector2;
  private hookAngle: number = -Math.PI / 2;
  private targetItem: GameItem | null = null;
  private items: GameItem[] = [];
  private score: number = 0;
  private timeLeft: number = CONFIG.gameTime;
  private gameTimeObj: Phaser.GameObjects.Text;
  private scoreText: Phaser.GameObjects.Text;
  private gameOver: boolean = false;
  private canShoot: boolean = true;

  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.setBaseURL('https://labs.phaser.io/assets/');
  }

  create() {
    this.createBackground();
    this.createHook();
    this.createItems();
    this.createUI();
    this.setupInput();
    this.time.addEvent({
      delay: 1000,
      callback: this.onTick,
      callbackScope: this,
      loop: true
    });
  }

  private createBackground() {
    this.add.rectangle(400, 300, 800, 600, 0x8b4513);
    const ground = this.add.rectangle(400, 550, 800, 100, 0x654321);
    this.add.rectangle(400, 550, 800, 20, 0x8b4513);
  }

  private createHook() {
    this.hookPivot = this.add.rectangle(400, 80, 20, 40, 0x666666);
    this.hookGraphics = this.add.graphics();
  }

  private createItems() {
    const itemConfigs = [
      { type: 'gold' as const, value: 100, weight: 10, x: 200, y: 200, radius: 25 },
      { type: 'gold' as const, value: 150, weight: 15, x: 400, y: 250, radius: 30 },
      { type: 'gold' as const, value: 200, weight: 20, x: 600, y: 200, radius: 35 },
      { type: 'diamond' as const, value: 500, weight: 5, x: 300, y: 150, radius: 20 },
      { type: 'diamond' as const, value: 800, weight: 8, x: 500, y: 350, radius: 25 },
      { type: 'rock' as const, value: 20, weight: 30, x: 150, y: 350, radius: 30 },
      { type: 'rock' as const, value: 30, weight: 40, x: 650, y: 400, radius: 35 },
      { type: 'bag' as const, value: 300, weight: 25, x: 450, y: 400, radius: 28 },
    ];

    itemConfigs.forEach(config => {
      const item: GameItem = {
        type: config.type,
        value: config.value,
        weight: config.weight,
        x: config.x,
        y: config.y,
        radius: config.radius,
        collected: false
      };
      this.items.push(item);
    });
  }

  private createUI() {
    this.scoreText = this.add.text(20, 20, '💰 分数：0', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    });

    this.gameTimeObj = this.add.text(20, 50, '⏰ 时间：60', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    });

    this.add.text(20, 90, '🎯 点击鼠标发射钩子', {
      fontSize: '16px',
      color: '#ffff00'
    });

    const exitBtn = this.add.rectangle(720, 30, 120, 40, 0xcc0000)
      .setInteractive()
      .on('pointerdown', () => {
        window.parent.postMessage({ type: 'exit' }, '*');
      });
    
    this.add.text(720, 30, '退出', {
      fontSize: '16px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  private setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.hookState === 'idle' && this.canShoot && !this.gameOver) {
        this.shootHook(pointer);
      }
    });
  }

  private shootHook(pointer: Phaser.Input.Pointer) {
    this.hookState = 'shooting';
    this.canShoot = false;

    const angle = Math.atan2(
      pointer.y - this.hookPos.y,
      pointer.x - this.hookPos.x
    );

    this.hookAngle = angle;
    this.checkCollisions();
  }

  private checkCollisions() {
    const tipX = this.hookPos.x + Math.cos(this.hookAngle) * 1000;
    const tipY = this.hookPos.y + Math.sin(this.hookAngle) * 1000;

    this.items.forEach(item => {
      if (item.collected) return;

      const dx = tipX - item.x;
      const dy = tipY - item.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < item.radius) {
        this.targetItem = item;
        this.hookState = 'collecting';
      }
    });
  }

  private onTick() {
    if (this.gameOver) return;

    this.timeLeft--;
    this.gameTimeObj.setText(`⏰ 时间：${this.timeLeft}`);

    if (this.timeLeft <= 0) {
      this.endGame();
    }
  }

  public update() {
    if (this.gameOver) return;

    switch (this.hookState) {
      case 'shooting':
        this.updateShooting();
        break;
      case 'collecting':
        this.updateCollecting();
        break;
      case 'retracting':
        this.updateRetracting();
        break;
    }

    this.drawHook();
  }

  private updateShooting() {
    const speed = CONFIG.hookSpeed;
    const newX = this.hookPos.x + Math.cos(this.hookAngle) * speed;
    const newY = this.hookPos.y + Math.sin(this.hookAngle) * speed;

    if (newX < 0 || newX > CONFIG.gameWidth || newY < 0 || newY > CONFIG.gameHeight) {
      this.hookState = 'retracting';
      return;
    }

    this.hookPos.x = newX;
    this.hookPos.y = newY;

    if (this.targetItem) {
      this.hookState = 'retracting';
    }
  }

  private updateCollecting() {
    if (!this.targetItem) return;

    const speed = CONFIG.hookRetractSpeed * (1 + this.targetItem.weight / 50);
    const dx = this.targetItem.x - this.hookPos.x;
    const dy = this.targetItem.y - this.hookPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      this.collectItem(this.targetItem);
    } else {
      const angle = Math.atan2(dy, dx);
      this.hookPos.x += Math.cos(angle) * speed;
      this.hookPos.y += Math.sin(angle) * speed;
    }
  }

  private updateRetracting() {
    const speed = CONFIG.hookRetractSpeed;
    const dx = 400 - this.hookPos.x;
    const dy = 80 - this.hookPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < speed) {
      this.hookPos.x = 400;
      this.hookPos.y = 80;
      this.hookState = 'idle';
      this.canShoot = true;
      this.targetItem = null;
    } else {
      const angle = Math.atan2(dy, dx);
      this.hookPos.x += Math.cos(angle) * speed;
      this.hookPos.y += Math.sin(angle) * speed;
    }
  }

  private drawHook() {
    this.hookGraphics.clear();
    this.hookGraphics.lineStyle(4, 0xffd700, 1);
    this.hookGraphics.beginPath();
    this.hookGraphics.moveTo(400, 80);
    this.hookGraphics.lineTo(this.hookPos.x, this.hookPos.y);
    this.hookGraphics.strokePath();
    this.hookGraphics.fillStyle(0xffd700, 1);
    this.hookGraphics.fillCircle(this.hookPos.x, this.hookPos.y, 8);
  }

  private collectItem(item: GameItem) {
    item.collected = true;
    this.score += item.value;
    this.scoreText.setText(`💰 分数：${this.score}`);
  }

  private endGame() {
    this.gameOver = true;
    
    const gameOverBg = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    const title = this.add.text(400, 250, '游戏结束', {
      fontSize: '48px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const finalScore = this.add.text(400, 330, `最终分数：${this.score}`, {
      fontSize: '32px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const restartBtn = this.add.rectangle(400, 420, 200, 60, 0x4CAF50)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.restart();
      });
    
    this.add.text(400, 420, '重新开始', {
      fontSize: '24px',
      color: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CONFIG.gameWidth,
  height: CONFIG.gameHeight,
  parent: 'game-container',
  backgroundColor: '#000000',
  scene: MainScene,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

const game = new Phaser.Game(config);