/**
 * Game type definitions
 */

export type Operation = '+' | '-' | '*' | '/';

export interface Gate {
  id: string;
  side: 'left' | 'right';
  op: Operation;
  value: number;
  zPosition: number;
  passed: boolean;
}

export interface GatePair {
  left: Gate;
  right: Gate;
  zPosition: number;
  passed: boolean;
}

export interface ZombieCluster {
  id: string;
  zPosition: number;
  xPosition: number;
  count: number;
  strength: number;
  defeated: boolean;
}

export interface BotObservation {
  tick: number;
  seed: number;
  soldierCount: number;
  squadX: number;
  speed: number;
  distanceTraveled: number;
  remainingDistance: number;
  nextGates: {
    left: { op: Operation; value: number; zPosition: number } | null;
    right: { op: Operation; value: number; zPosition: number } | null;
  };
  nearbyZombies: Array<{
    zPosition: number;
    xPosition: number;
    strength: number;
  }>;
}

export interface BotAction {
  xTarget: number; // Normalized [-1, +1]
}

export interface BotResult {
  observation: BotObservation;
  reward: number;
  done: boolean;
  info: {
    soldiersLost: number;
    zombiesDefeated: number;
  };
}

export interface GameState {
  tick: number;
  seed: number;
  soldierCount: number;
  squadX: number;
  distance: number;
  score: number;
  rngState: number;
  gates: Gate[];
  zombies: ZombieCluster[];
  gameOver: boolean;
  win: boolean;
}