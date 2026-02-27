/**
 * Seeded Random Number Generator
 * Uses mulberry32 algorithm for deterministic randomness
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number = 123456789) {
    this.state = seed || 123456789;
  }

  /**
   * Generate a random number between 0 and 1
   */
  random(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate a random integer between min (inclusive) and max (inclusive)
   */
  range(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Generate a random float between min and max
   */
  float(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  /**
   * Pick a random element from an array
   */
  choice<T>(arr: T[]): T {
    return arr[this.range(0, arr.length - 1)];
  }

  /**
   * Reset RNG with new seed
   */
  setSeed(seed: number): void {
    this.state = seed || 123456789;
  }

  /**
   * Get current state (for serialization)
   */
  getState(): number {
    return this.state;
  }

  /**
   * Load state (for deserialization)
   */
  setState(state: number): void {
    this.state = state;
  }
}

/**
 * Create a hash from a string seed
 */
export function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}