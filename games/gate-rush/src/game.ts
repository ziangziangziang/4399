/**
 * Main Game class
 */
import { GameEngine } from './engine';
import { SeededRNG, hashString } from './rng';
import { Squad } from './squad';
import { GateSystem } from './gates';
import { ZombieSystem } from './zombies';
import { GameEnvironment } from './environment';
import { createBot, RandomBot, GreedyGateBot } from './bots';

const TRACK_WIDTH = 10;
const TOTAL_DISTANCE = 500;

export class Game {
  private engine: GameEngine;
  private rng: SeededRNG;
  private squad: Squad;
  private gateSystem: GateSystem;
  private zombieSystem: ZombieSystem;
  private environment: GameEnvironment;
  
  // Game state
  private seed: number = 0;
  private distance: number = 0;
  private score: number = 0;
  private gameOver: boolean = false;
  private win: boolean = false;
  private manualControl: boolean = true;
  private bot: RandomBot | GreedyGateBot | null = null;
  private botName: string = 'manual';

  // Input state
  private inputX: number = 0;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container ${containerId} not found`);
    }

    this.engine = new GameEngine(container);
    this.rng = new SeededRNG();
    
    this.squad = new Squad(this.engine.getScene());
    this.gateSystem = new GateSystem(this.engine.getScene(), this.rng);
    this.zombieSystem = new ZombieSystem(this.engine.getScene(), this.rng);
    
    this.environment = new GameEnvironment(
      this.rng,
      this.squad,
      this.gateSystem,
      this.zombieSystem,
      {
        onSoldierCountChange: (count) => this.updateHUD(),
        onDistanceChange: (dist) => this.updateHUD(),
        onScoreChange: (score) => this.updateHUD(),
        onGameOver: (win) => this.showGameOver(win)
      }
    );

    this.setupInput();
    this.setupUI();
  }

  private setupInput(): void {
    const targetX = { current: 0 };
    const container = document.getElementById('game-container');
    if (!container) return;
    
    document.addEventListener('keydown', (e) => {
      if (this.gameOver) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          targetX.current = -1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetX.current = 1;
          break;
        case 'r':
        case 'R':
          this.restart();
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'ArrowRight':
        case 'd':
        case 'D':
          targetX.current = 0;
          break;
      }
    });

    // Mouse/touch drag
    let isDragging = false;
    let startX = 0;

    container.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDragging || this.gameOver) return;
      const delta = e.clientX - startX;
      targetX.current = Math.max(-1, Math.min(1, delta / 100));
    });

    container.addEventListener('mouseup', () => {
      isDragging = false;
      targetX.current = 0;
    });

    container.addEventListener('touchstart', (e) => {
      isDragging = true;
      startX = e.touches[0].clientX;
    });

    container.addEventListener('touchmove', (e) => {
      if (!isDragging || this.gameOver) return;
      const delta = e.touches[0].clientX - startX;
      targetX.current = Math.max(-1, Math.min(1, delta / 100));
    });

    container.addEventListener('touchend', () => {
      isDragging = false;
      targetX.current = 0;
    });

    // Store for use in update
    (this as any).targetX = targetX;
  }

  private setupUI(): void {
    const restartBtn = document.getElementById('btn-restart');
    const restartBtnOver = document.getElementById('btn-restart-over');
    const botBtn = document.getElementById('btn-bot');

    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restart());
    }

    if (restartBtnOver) {
      restartBtnOver.addEventListener('click', () => this.restart());
    }

    if (botBtn) {
      botBtn.addEventListener('click', () => this.toggleBot());
    }
  }

  private toggleBot(): void {
    if (this.botName === 'manual') {
      this.botName = 'random';
      this.bot = createBot('random', this.seed);
      this.manualControl = false;
    } else if (this.botName === 'random') {
      this.botName = 'greedy';
      this.bot = createBot('greedy');
      this.manualControl = false;
    } else {
      this.botName = 'manual';
      this.bot = null;
      this.manualControl = true;
    }

    const botNameEl = document.getElementById('bot-name');
    if (botNameEl) {
      botNameEl.textContent = this.botName === 'manual' ? '手动' : this.botName === 'random' ? '随机' : '贪婪';
    }
  }

  restart(): void {
    this.seed = Math.floor(Math.random() * 1000000);
    this.rng.setSeed(this.seed);
    this.distance = 0;
    this.score = 0;
    this.gameOver = false;
    this.win = false;
    this.inputX = 0;
    
    this.squad.setSoldierCount(10);
    this.squad.setXPosition(0, TRACK_WIDTH);
    
    this.gateSystem = new GateSystem(this.engine.getScene(), this.rng);
    this.zombieSystem = new ZombieSystem(this.engine.getScene(), this.rng);
    
    this.environment = new GameEnvironment(
      this.rng,
      this.squad,
      this.gateSystem,
      this.zombieSystem,
      {
        onSoldierCountChange: (count) => this.updateHUD(),
        onDistanceChange: (dist) => this.updateHUD(),
        onScoreChange: (score) => this.updateHUD(),
        onGameOver: (win) => this.showGameOver(win)
      }
    );

    // Initial spawn
    for (let i = 0; i < 5; i++) {
      this.gateSystem.spawnGatePair();
      this.zombieSystem.spawnCluster();
    }

    this.updateHUD();
    this.hideGameOver();
  }

  private updateHUD(): void {
    const soldierCountEl = document.getElementById('soldier-count');
    const distanceEl = document.getElementById('distance');
    const scoreEl = document.getElementById('score');
    const seedEl = document.getElementById('seed');

    if (soldierCountEl) soldierCountEl.textContent = this.squad.getSoldierCount().toString();
    if (distanceEl) distanceEl.textContent = Math.floor(this.distance).toString();
    if (scoreEl) scoreEl.textContent = this.score.toString();
    if (seedEl) seedEl.textContent = this.seed.toString();
  }

  private showGameOver(win: boolean): void {
    this.gameOver = true;
    this.win = win;

    const gameOverEl = document.getElementById('game-over');
    const titleEl = document.getElementById('game-over-title');
    const scoreEl = document.getElementById('game-over-score');

    if (gameOverEl) gameOverEl.style.display = 'block';
    if (titleEl) titleEl.textContent = win ? '🎉 胜利!' : '💀 失败';
    if (scoreEl) scoreEl.textContent = `最终分数：${this.score}`;
  }

  private hideGameOver(): void {
    const gameOverEl = document.getElementById('game-over');
    if (gameOverEl) gameOverEl.style.display = 'none';
  }

  start(): void {
    this.restart();

    this.engine.start((delta) => {
      if (this.gameOver) {
        return;
      }

      // Update squad position
      this.squad.update(delta, TRACK_WIDTH);
      
      // Apply input or bot control
      let xTarget = 0;
      if (this.manualControl && (this as any).targetX) {
        xTarget = (this as any).targetX.current * (TRACK_WIDTH / 2);
      } else if (this.bot) {
        const observation = this.environment.getObservation();
        const action = this.bot.act(observation);
        xTarget = action.xTarget * (TRACK_WIDTH / 2);
      }
      
      this.squad.setXPosition(xTarget, TRACK_WIDTH);
      const squadX = this.squad.getXPosition();

      // Move forward
      const moveDistance = 30 * delta;
      this.distance += moveDistance;

      // Spawn new entities as needed
      const gates = this.gateSystem.getGates();
      if (gates.length === 0 || gates[gates.length - 1].zPosition > -this.distance - 50) {
        this.gateSystem.spawnGatePair();
        this.zombieSystem.spawnCluster();
      }

      // Check gate collisions
      const gateCollision = this.gateSystem.checkCollisions(-this.distance, squadX);
      if (gateCollision) {
        const beforeCount = this.squad.getSoldierCount();
        const newCount = this.gateSystem.applyGateOperation(beforeCount, gateCollision.gate);
        const soldiersLost = beforeCount - newCount;
        this.squad.setSoldierCount(newCount);
        
        this.score += gateCollision.gate.op === '+' || gateCollision.gate.op === '*' 
          ? gateCollision.gate.value 
          : -gateCollision.gate.value;

        if (newCount <= 0) {
          this.environment.endGame(false);
          this.showGameOver(false);
        }
      }

      // Check zombie collisions
      const zombieCollisions = this.zombieSystem.checkCollisions(-this.distance, squadX);
      for (const { cluster } of zombieCollisions) {
        const result = this.zombieSystem.resolveCollision(
          this.squad.getSoldierCount(),
          cluster
        );
        this.squad.setSoldierCount(this.squad.getSoldierCount() - result.soldiersLost);
        
        if (result.clusterDefeated) {
          this.score += 10;
        }

        if (this.squad.getSoldierCount() <= 0) {
          this.environment.endGame(false);
          this.showGameOver(false);
        }
      }

      // Check win condition
      if (this.distance >= TOTAL_DISTANCE && this.squad.getSoldierCount() > 0) {
        this.environment.endGame(true);
        this.showGameOver(true);
      }

      // Update camera
      const cameraZ = 10 + Math.min(this.distance, 50);
      this.engine.setCameraPosition(
        squadX * 0.3,
        5,
        cameraZ
      );

      this.updateHUD();
    });
  }

  stop(): void {
    this.engine.stop();
  }
}