/**
 * Bot implementations for automated gameplay
 */
import { BotAction, BotObservation } from './types';

/**
 * RandomBot - Makes random decisions
 */
export class RandomBot {
  private rng: () => number;
  private actionHoldTicks: number = 0;

  constructor(seed: number = 12345) {
    // Simple LCG for bot randomness
    let state = seed;
    this.rng = () => {
      state = (state * 1103515245 + 12345) & 0x7fffffff;
      return state / 0x7fffffff;
    };
  }

  act(observation: BotObservation): BotAction {
    if (this.actionHoldTicks > 0) {
      this.actionHoldTicks--;
      return { xTarget: this.lastXTarget };
    }

    this.lastXTarget = this.rng() * 2 - 1;
    this.actionHoldTicks = Math.floor(this.rng() * 20) + 5;
    
    return { xTarget: this.lastXTarget };
  }

  private lastXTarget: number = 0;
}

/**
 * GreedyGateBot - Steers toward gates that maximize soldier count
 */
export class GreedyGateBot {
  act(observation: BotObservation): BotAction {
    const { nextGates, nearbyZombies, squadX } = observation;

    if (!nextGates || (!nextGates.left && !nextGates.right)) {
      // No gates ahead, stay centered
      return { xTarget: 0 };
    }

    let bestXTarget = 0;
    let bestScore = -Infinity;

    // Evaluate left gate
    if (nextGates.left) {
      const leftScore = this.evaluateGate(nextGates.left, nearbyZombies);
      const leftX = -0.5; // Left side
      if (leftScore > bestScore) {
        bestScore = leftScore;
        bestXTarget = leftX;
      }
    }

    // Evaluate right gate
    if (nextGates.right) {
      const rightScore = this.evaluateGate(nextGates.right, nearbyZombies);
      const rightX = 0.5; // Right side
      if (rightScore > bestScore) {
        bestScore = rightScore;
        bestXTarget = rightX;
      }
    }

    // Blend toward best target based on current position
    const targetX = bestXTarget * (Math.abs(squadX) < 1 ? 1 : 0.5);
    
    return { xTarget: targetX };
  }

  private evaluateGate(
    gate: { op: string; value: number; zPosition: number },
    zombies: Array<{ zPosition: number; xPosition: number; strength: number }>
  ): number {
    let score = 0;

    // Gate operation benefit
    switch (gate.op) {
      case '+':
        score += gate.value;
        break;
      case '-':
        score -= gate.value;
        break;
      case '*':
        score += gate.value * 10;
        break;
      case '/':
        score -= gate.value * 5;
        break;
    }

    // Zombie penalty - if zombies are between us and the gate
    for (const zombie of zombies) {
      if (zombie.zPosition < gate.zPosition) {
        score -= zombie.strength * 0.5;
      }
    }

    return score;
  }
}

/**
 * Bot selector
 */
export function createBot(name: string, seed: number = 12345): RandomBot | GreedyGateBot {
  switch (name.toLowerCase()) {
    case 'random':
      return new RandomBot(seed);
    case 'greedy':
    case 'greedygate':
      return new GreedyGateBot();
    default:
      return new RandomBot(seed);
  }
}