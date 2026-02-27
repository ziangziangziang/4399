const CONFIG = {
  boardWidth: 10,
  boardHeight: 20,
  tileSize: 30,
  initialSpeed: 1500
};

type Point = { x: number; y: number };

const SHAPES = {
  I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
  O: [[1,1], [1,1]],
  T: [[0,1,0], [1,1,1], [0,0,0]],
  S: [[0,1,1], [1,1,0], [0,0,0]],
  Z: [[1,1,0], [0,1,1], [0,0,0]],
  J: [[1,0,0], [1,1,1], [0,0,0]],
  L: [[0,0,1], [1,1,1], [0,0,0]]
};

const COLORS = {
  I: '#00f0f0', O: '#f0f000', T: '#a000f0',
  S: '#00f000', Z: '#f00000', J: '#0000f0', L: '#f0a000'
};

class Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;

  constructor(type: keyof typeof SHAPES) {
    this.shape = SHAPES[type];
    this.color = COLORS[type];
    this.x = Math.floor(CONFIG.boardWidth / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
  }

  rotate(): number[][] {
    const n = this.shape.length;
    const rotated: number[][] = [];
    for (let i = 0; i < n; i++) {
      rotated[i] = [];
      for (let j = 0; j < n; j++) {
        rotated[i][j] = this.shape[n - 1 - j][i];
      }
    }
    return rotated;
  }
}

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private board: (string | null)[][];
  private currentPiece: Piece;
  private nextPiece: Piece;
  private score: number;
  private lines: number;
  private level: number;
  private gameOver: boolean;
  private dropTimer: number;
  private dropSpeed: number;
  private animationId: number | null;
  private paused: boolean;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;

    const previewWidth = 4 * CONFIG.tileSize;
    const previewHeight = 4 * CONFIG.tileSize;

    this.canvas.width = CONFIG.boardWidth * CONFIG.tileSize + previewWidth + 20;
    this.canvas.height = CONFIG.boardHeight * CONFIG.tileSize;

    this.board = Array(CONFIG.boardHeight).fill(null).map(() => Array(CONFIG.boardWidth).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.dropTimer = 0;
    this.dropSpeed = CONFIG.initialSpeed;
    this.animationId = null;
    this.paused = false;

    this.nextPiece = new Piece(this.randomType());
    this.spawnPiece();
    this.setupInput();
  }

  private randomType(): keyof typeof SHAPES {
    const types = Object.keys(SHAPES) as (keyof typeof SHAPES)[];
    return types[Math.floor(Math.random() * types.length)];
  }

  private spawnPiece(): void {
    this.currentPiece = this.nextPiece;
    this.nextPiece = new Piece(this.randomType());

    if (!this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
      this.gameOver = true;
    }
  }

  private isValidPosition(shape: number[][], x: number, y: number): boolean {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= CONFIG.boardWidth || newY >= CONFIG.boardHeight) {
            return false;
          }
          if (newY >= 0 && this.board[newY][newX]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private mergePiece(): void {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const y = this.currentPiece.y + row;
          const x = this.currentPiece.x + col;
          if (y >= 0 && y < CONFIG.boardHeight && x >= 0 && x < CONFIG.boardWidth) {
            this.board[y][x] = this.currentPiece.color;
          }
        }
      }
    }
    this.clearLines();
    this.spawnPiece();
  }

  private clearLines(): void {
    let linesCleared = 0;
    for (let row = CONFIG.boardHeight - 1; row >= 0; row--) {
      if (this.board[row].every(cell => cell !== null)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(CONFIG.boardWidth).fill(null));
        linesCleared++;
        row++;
      }
    }
    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800];
      this.score += points[linesCleared] * this.level;
      this.lines += linesCleared;
      this.level = Math.floor(this.lines / 10) + 1;
      this.dropSpeed = Math.max(100, CONFIG.initialSpeed - (this.level - 1) * 100);
    }
  }

  private setupInput(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.gameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          this.restart();
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        this.paused = !this.paused;
        return;
      }

      if (this.paused) return;

      switch (e.key) {
        case 'ArrowLeft':
          if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x - 1, this.currentPiece.y)) {
            this.currentPiece.x--;
          }
          break;
        case 'ArrowRight':
          if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x + 1, this.currentPiece.y)) {
            this.currentPiece.x++;
          }
          break;
        case 'ArrowDown':
          if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            this.score += 1;
          }
          break;
        case 'ArrowUp':
          const rotated = this.currentPiece.rotate();
          if (this.isValidPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
            this.currentPiece.shape = rotated;
          }
          break;
        case ' ':
          while (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
            this.currentPiece.y++;
            this.score += 2;
          }
          this.mergePiece();
          break;
      }
    });
  }

  private drop(): void {
    if (this.isValidPosition(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y + 1)) {
      this.currentPiece.y++;
    } else {
      this.mergePiece();
    }
  }

  private drawBoard(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#2d4a22';
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= CONFIG.boardWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * CONFIG.tileSize, 0);
      this.ctx.lineTo(x * CONFIG.tileSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= CONFIG.boardHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * CONFIG.tileSize);
      this.ctx.lineTo(this.canvas.width, y * CONFIG.tileSize);
      this.ctx.stroke();
    }

    for (let row = 0; row < CONFIG.boardHeight; row++) {
      for (let col = 0; col < CONFIG.boardWidth; col++) {
        if (this.board[row][col]) {
          this.drawBlock(col, row, this.board[row][col]!);
        }
      }
    }
  }

  private drawBlock(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x * CONFIG.tileSize + 1, y * CONFIG.tileSize + 1, CONFIG.tileSize - 2, CONFIG.tileSize - 2);
  }

  private drawPiece(): void {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const x = this.currentPiece.x + col;
          const y = this.currentPiece.y + row;
          if (y >= 0) {
            this.drawBlock(x, y, this.currentPiece.color);
          }
        }
      }
    }
  }

  private drawNextPiece(): void {
    const nextX = CONFIG.boardWidth * CONFIG.tileSize + 10;
    const nextY = 10;

    this.ctx.fillStyle = '#0f0f23';
    this.ctx.fillRect(nextX - 5, nextY - 5, 4 * CONFIG.tileSize + 10, 4 * CONFIG.tileSize + 10);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('Next:', nextX, nextY - 10);

    for (let row = 0; row < this.nextPiece.shape.length; row++) {
      for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
        if (this.nextPiece.shape[row][col]) {
          this.drawBlock(nextX + col * CONFIG.tileSize, nextY + row * CONFIG.tileSize, this.nextPiece.color);
        }
      }
    }
  }

  private drawInfo(): void {
    const infoX = CONFIG.boardWidth * CONFIG.tileSize + 10;
    const infoY = CONFIG.boardHeight * CONFIG.tileSize - 60;

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Score: ${this.score}`, infoX, infoY);
    this.ctx.fillText(`Lines: ${this.lines}`, infoX, infoY + 20);
    this.ctx.fillText(`Level: ${this.level}`, infoX, infoY + 40);
  }

  private drawOverlay(): void {
    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.font = '20px monospace';
      this.ctx.fillText('Press P to resume', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 36px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);

      this.ctx.font = '24px monospace';
      this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
      this.ctx.fillText(`Lines: ${this.lines}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
      this.ctx.fillText('Press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
    }
  }

  private restart(): void {
    this.board = Array(CONFIG.boardHeight).fill(null).map(() => Array(CONFIG.boardWidth).fill(null));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropSpeed = CONFIG.initialSpeed;
    this.gameOver = false;
    this.paused = false;
    this.spawnPiece();
    this.nextPiece = new Piece(this.randomType());
  }

  public getScore(): number {
    return this.score;
  }

  public isGameOver(): boolean {
    return this.gameOver;
  }

  public update(delta: number): void {
    if (this.gameOver || this.paused) return;

    this.dropTimer += delta;
    if (this.dropTimer >= this.dropSpeed) {
      this.dropTimer = 0;
      this.drop();
    }
  }

  public render(): void {
    this.drawBoard();
    this.drawPiece();
    this.drawNextPiece();
    this.drawInfo();
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