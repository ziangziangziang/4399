const CONFIG = {
  tileSize: 20,
  gridWidth: 30,
  gridHeight: 24,
  speed: 100
};

type Point = { x: number; y: number };
type Direction = { x: number; y: number };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private snake: Point[];
  private direction: Direction;
  private nextDirection: Direction;
  private food: Point;
  private score: number;
  private gameOver: boolean;
  private moveTimer: number;
  private animationId: number | null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.canvas.width = CONFIG.gridWidth * CONFIG.tileSize;
    this.canvas.height = CONFIG.gridHeight * CONFIG.tileSize;

    this.snake = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 },
      { x: 7, y: 12 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.moveTimer = 0;
    this.animationId = null;

    this.spawnFood();
    this.setupInput();
  }

  private spawnFood(): void {
    let valid = false;
    while (!valid) {
      this.food = {
        x: Math.floor(Math.random() * CONFIG.gridWidth),
        y: Math.floor(Math.random() * CONFIG.gridHeight)
      };
      valid = !this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
    }
  }

  private setupInput(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.gameOver && (e.key === ' ' || e.key === 'Enter')) {
        this.restart();
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
          break;
        case 'ArrowUp':
          if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
          break;
      }
    });
  }

  private moveSnake(): void {
    this.direction = { ...this.nextDirection };

    const newHead = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    if (newHead.x < 0 || newHead.x >= CONFIG.gridWidth ||
        newHead.y < 0 || newHead.y >= CONFIG.gridHeight) {
      this.gameOver = true;
      return;
    }

    if (this.snake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
      this.gameOver = true;
      return;
    }

    this.snake.unshift(newHead);

    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  }

  private draw(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#2d4a22';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= CONFIG.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * CONFIG.tileSize, 0);
      this.ctx.lineTo(x * CONFIG.tileSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * CONFIG.tileSize);
      this.ctx.lineTo(this.canvas.width, y * CONFIG.tileSize);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#ef4444';
    this.ctx.beginPath();
    this.ctx.arc(
      this.food.x * CONFIG.tileSize + CONFIG.tileSize / 2,
      this.food.y * CONFIG.tileSize + CONFIG.tileSize / 2,
      CONFIG.tileSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();

    for (let i = 0; i < this.snake.length; i++) {
      const segment = this.snake[i];
      const color = i === 0 ? '#22c55e' : '#4ade80';
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.roundRect(
        segment.x * CONFIG.tileSize + 1,
        segment.y * CONFIG.tileSize + 1,
        CONFIG.tileSize - 2,
        CONFIG.tileSize - 2,
        4
      );
      this.ctx.fill();
    }
  }

  private drawOverlay(): void {
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 40);

      this.ctx.font = '24px monospace';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }
  }

  private restart(): void {
    this.snake = [
      { x: 10, y: 12 },
      { x: 9, y: 12 },
      { x: 8, y: 12 },
      { x: 7, y: 12 }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.gameOver = false;
    this.moveTimer = 0;
    this.spawnFood();
  }

  public getScore(): number {
    return this.score;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public update(delta: number): void {
    if (this.gameOver) return;

    this.moveTimer += delta;
    if (this.moveTimer >= CONFIG.speed) {
      this.moveTimer = 0;
      this.moveSnake();
    }
  }

  public render(): void {
    this.draw();
    this.drawOverlay();
  }

  public start(): void {
    const lastTime = performance.now();
    
    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      this.update(delta);
      this.render();
      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}