/**
 * Game Environment - Bot control interface
 */
import { SeededRNG } from './rng';
import { Squad } from './squad';
import { GateSystem } from './gates';
import { ZombieSystem } from './zombies';
import { BotObservation, BotAction, BotResult, GameState, Operation } from './types';

const TRACK_WIDTH = 10;
const TOTAL_DISTANCE = 500;

export class GameEnvironment {
  private rng: SeededRNG;
  private squad: Squad;
  private gateSystem: GateSystem;
  private zombieSystem: ZombieSystem;
  
  // Game state
  private tick: number = 0;
  private seed: number = 0;
  private distance: number = 0;
  private score: number = 0;
  private squadX: number = 0;
  private speed: number = 20;
  private manualControl: boolean = true;
  private gameOver: boolean = false;
  private win: boolean = false;

  // Callbacks
  private onSoldierCountChange: (count: number) => void;
  private onDistanceChange: (distance: number) => void;
  private onScoreChange: (score: number) => void;
  private onGameOver: (win: boolean) => void;

  constructor(
    rng: SeededRNG,
    squad: Squad,
    gateSystem: GateSystem,
    zombieSystem: ZombieSystem,
    callbacks: {
      onSoldierCountChange: (count: number) => void;
      onDistanceChange: (distance: number) => void;
      onScoreChange: (score: number) => void;
      onGameOver: (win: boolean) => void;
    }
  ) {
    this.rng = rng;
    this.squad = squad;
    this.gateSystem = gateSystem;
    this.zombieSystem = zombieSystem;
    
    this.onSoldierCountChange = callbacks.onSoldierCountChange;
    this.onDistanceChange = callbacks.onDistanceChange;
    this.onScoreChange = callbacks.onScoreChange;
    this.onGameOver = callbacks.onGameOver;
  }

  reset(seed: number = Math.floor(Math.random() * 1000000)): BotObservation {
    this.rng.setSeed(seed);
    this.seed = seed;
    this.tick = 0;
    this.distance = 0;
    this.score = 0;
    this.squadX = 0;
    this.gameOver = false;
    this.win = false;
    this.manualControl = true;
    
    this.squad.setSoldierCount(10);
    this.squad.setXPosition(0, TRACK_WIDTH);
    
    this.gateSystem.reset();
    this.zombieSystem.reset();
    
    // Initial spawn
    for (let i = 0; i < 5; i++) {
      this.gateSystem.spawnGatePair();
      this.zombieSystem.spawnCluster();
    }

    return this.getObservation();
  }

  step(action: BotAction): BotResult {
    if (this.gameOver) {
      return {
        observation: this.getObservation(),
        reward: 0,
        done: true,
        info: { soldiersLost: 0, zombiesDefeated: 0 }
      };
    }

    const prevSoldierCount = this.squad.getSoldierCount();
    const prevDistance = this.distance;
    
    // Apply action
    const xTarget = action.xTarget * (TRACK_WIDTH / 2);
    this.squad.setXPosition(xTarget, TRACK_WIDTH);
    
    // Update simulation
    const delta = 1 / 60;
    this.squad.update(delta, TRACK_WIDTH);
    this.squadX = this.squad.getXPosition();
    
    // Move forward
    const moveDistance = this.speed * delta;
    this.distance += moveDistance;
    
    // Spawn new entities as needed
    const gates = this.gateSystem.getGates();
    if (gates.length > 0 && gates[gates.length - 1].zPosition > -this.distance - 50) {
      this.gateSystem.spawnGatePair();
      this.zombieSystem.spawnCluster();
    }
    
    // Check gate collisions
    const gateCollision = this.gateSystem.checkCollisions(-this.distance, this.squadX);
    if (gateCollision) {
      gateCollision.beforeCount = prevSoldierCount;
      const newCount = this.gateSystem.applyGateOperation(prevSoldierCount, gateCollision.gate);
      const soldiersLost = prevSoldierCount - newCount;
      this.squad.setSoldierCount(newCount);
      
      if (newCount <= 0) {
        this.endGame(false);
      }
    }
    
    // Check zombie collisions
    const zombieCollisions = this.zombieSystem.checkCollisions(-this.distance, this.squadX);
    let zombiesDefeated = 0;
    let totalSoldiersLost = 0;
    
    for (const { cluster } of zombieCollisions) {
      const result = this.zombieSystem.resolveCollision(
        this.squad.getSoldierCount(),
        cluster
      );
      totalSoldiersLost += result.soldiersLost;
      if (result.clusterDefeated) {
        zombiesDefeated++;
      }
      this.squad.setSoldierCount(this.squad.getSoldierCount() - result.soldiersLost);
    }
    
    if (this.squad.getSoldierCount() <= 0) {
      this.endGame(false);
    }
    
    // Check win condition
    if (this.distance >= TOTAL_DISTANCE && this.squad.getSoldierCount() > 0) {
      this.endGame(true);
    }
    
    // Calculate reward
    const deltaDistance = this.distance - prevDistance;
    const reward = (deltaDistance * 0.01) + (zombiesDefeated * 1.0) - (totalSoldiersLost * 0.2);
    
    return {
      observation: this.getObservation(),
      reward,
      done: this.gameOver,
      info: { soldiersLost: totalSoldiersLost, zombiesDefeated }
    };
  }

  getObservation(): BotObservation {
    const nearbyGates = this.gateSystem.getNearbyGates(-this.distance, 1);
    const nextGates = nearbyGates.length > 0 ? nearbyGates[0] : null;
    
    return {
      tick: this.tick,
      seed: this.seed,
      soldierCount: this.squad.getSoldierCount(),
      squadX: this.squadX,
      speed: this.speed,
      distanceTraveled: this.distance,
      remainingDistance: Math.max(0, TOTAL_DISTANCE - this.distance),
      nextGates: nextGates ? {
        left: { op: nextGates.left.op, value: nextGates.left.value, zPosition: nextGates.left.zPosition },
        right: { op: nextGates.right.op, value: nextGates.right.value, zPosition: nextGates.right.zPosition }
      } : { left: null, right: null },
      nearbyZombies: this.zombieSystem.getNearbyZombies(-this.distance, 3).map(z => ({
        zPosition: z.zPosition,
        xPosition: z.xPosition,
        strength: z.strength
      }))
    };
  }

  serializeState(): string {
    const state: GameState = {
      tick: this.tick,
      seed: this.seed,
      soldierCount: this.squad.getSoldierCount(),
      squadX: this.squadX,
      distance: this.distance,
      score: this.score,
      rngState: this.rng.getState(),
      gates: this.gateSystem.getGates().flatMap(p => [p.left, p.right]),
      zombies: this.zombieSystem.getZombies(),
      gameOver: this.gameOver,
      win: this.win
    };
    return JSON.stringify(state);
  }

  loadState(state: string): void {
    const parsed = JSON.parse(state) as GameState;
    this.tick = parsed.tick;
    this.seed = parsed.seed;
    this.distance = parsed.distance;
    this.score = parsed.score;
    this.squadX = parsed.squadX;
    this.gameOver = parsed.gameOver;
    this.win = parsed.win;
    
    this.rng.setState(parsed.rngState);
    this.squad.setSoldierCount(parsed.soldierCount);
    this.squad.setXPosition(parsed.squadX, TRACK_WIDTH);
  }

  setManualControl(enabled: boolean): void {
    this.manualControl = enabled;
  }

  isManualControl(): boolean {
    return this.manualControl;
  }

  endGame(win: boolean): void {
    this.gameOver = true;
    this.win = win;
    
    if (win) {
      this.score += 20;
    } else {
      this.score -= 20;
    }
    
    this.onGameOver(win);
  }

  isGameOver(): boolean {
    return this.gameOver;
  }

  isWin(): boolean {
    return this.win;
  }

  getScore(): number {
    return this.score;
  }
}