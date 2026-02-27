/**
 * Gate system - manages math gates that modify soldier count
 */
import * as THREE from 'three';
import { Gate, GatePair, Operation } from './types';
import { SeededRNG } from './rng';

const GATE_SPACING = 20;
const GATE_WIDTH = 3;
const GATE_HEIGHT = 4;

export class GateSystem {
  private gates: GatePair[] = [];
  private scene: THREE.Scene;
  private rng: SeededRNG;
  private nextGateZ: number = -30;

  constructor(scene: THREE.Scene, rng: SeededRNG) {
    this.scene = scene;
    this.rng = rng;
  }

  spawnGatePair(): GatePair {
    const ops: Operation[] = ['+', '-', '*', '/'];
    
    const leftOp = this.rng.choice(ops);
    const leftValue = this.getGateValue(leftOp);
    
    const rightOp = this.rng.choice(ops);
    const rightValue = this.getGateValue(rightOp);

    const leftGate: Gate = {
      id: `gate-left-${this.gates.length}`,
      side: 'left',
      op: leftOp,
      value: leftValue,
      zPosition: this.nextGateZ,
      passed: false
    };

    const rightGate: Gate = {
      id: `gate-right-${this.gates.length}`,
      side: 'right',
      op: rightOp,
      value: rightValue,
      zPosition: this.nextGateZ,
      passed: false
    };

    const pair: GatePair = {
      left: leftGate,
      right: rightGate,
      zPosition: this.nextGateZ,
      passed: false
    };

    this.gates.push(pair);
    this.nextGateZ -= GATE_SPACING;
    
    this.createGateVisuals(pair);
    
    return pair;
  }

  private getGateValue(op: Operation): number {
    switch (op) {
      case '+':
        return this.rng.range(5, 20);
      case '-':
        return this.rng.range(5, 15);
      case '*':
        return this.rng.range(1, 3);
      case '/':
        return this.rng.range(2, 4);
      default:
        return 10;
    }
  }

  private createGateVisuals(pair: GatePair): void {
    const materials = {
      left: new THREE.MeshLambertMaterial({ color: 0x2196F3, transparent: true, opacity: 0.8 }),
      right: new THREE.MeshLambertMaterial({ color: 0xFF9800, transparent: true, opacity: 0.8 })
    };

    const geometry = new THREE.BoxGeometry(GATE_WIDTH, GATE_HEIGHT, 0.2);

    [pair.left, pair.right].forEach((gate, index) => {
      const mesh = new THREE.Mesh(geometry, index === 0 ? materials.left : materials.right);
      const x = gate.side === 'left' ? -GATE_WIDTH : GATE_WIDTH;
      mesh.position.set(x, GATE_HEIGHT / 2, gate.zPosition);
      mesh.userData = { gate };
      this.scene.add(mesh);

      // Create gate label
      this.createGateLabel(gate, x, gate.zPosition);
    });
  }

  private createGateLabel(gate: Gate, x: number, z: number): void {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.fillStyle = gate.side === 'left' ? '#2196F3' : '#FF9800';
      ctx.fillRect(0, 0, 128, 128);
      
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${gate.op}${gate.value}`, 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.MeshBasicMaterial({ 
      map: texture, 
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const labelGeometry = new THREE.PlaneGeometry(2, 1);
    const label = new THREE.Mesh(labelGeometry, material);
    label.position.set(x, GATE_HEIGHT + 0.5, z);
    this.scene.add(label);
  }

  checkCollisions(squadZ: number, squadX: number): { gate: Gate; beforeCount: number } | null {
    for (const pair of this.gates) {
      if (pair.passed) continue;
      
      const collisionZ = pair.zPosition + GATE_WIDTH;
      
      if (Math.abs(squadZ - collisionZ) < 0.5) {
        const chosenGate = squadX < 0 ? pair.left : pair.right;
        chosenGate.passed = true;
        pair.passed = true;
        
        return {
          gate: chosenGate,
          beforeCount: 0 // Will be set by game
        };
      }
    }
    return null;
  }

  applyGateOperation(count: number, gate: Gate): number {
    let result = count;
    
    switch (gate.op) {
      case '+':
        result += gate.value;
        break;
      case '-':
        result -= gate.value;
        break;
      case '*':
        result *= gate.value;
        break;
      case '/':
        result = Math.floor(result / gate.value);
        break;
    }
    
    return Math.max(0, Math.min(500, result));
  }

  getNearbyGates(squadZ: number, count: number = 2): GatePair[] {
    return this.gates
      .filter(gate => gate.zPosition < squadZ && !gate.passed)
      .sort((a, b) => b.zPosition - a.zPosition)
      .slice(0, count);
  }

  getGates(): GatePair[] {
    return this.gates;
  }

  reset(): void {
    this.gates.forEach(pair => {
      [pair.left, pair.right].forEach(gate => gate.passed = false);
    });
    this.nextGateZ = -30;
  }
}