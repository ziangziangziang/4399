/**
 * Zombie system - manages zombie clusters that attack the squad
 */
import * as THREE from 'three';
import { ZombieCluster } from './types';
import { SeededRNG } from './rng';

const MAX_ZOMBIES = 200;

export class ZombieSystem {
  private zombies: ZombieCluster[] = [];
  private instancedMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D;
  private matrix: THREE.Matrix4;
  private scene: THREE.Scene;
  private rng: SeededRNG;
  private nextZombieZ: number = -40;

  constructor(scene: THREE.Scene, rng: SeededRNG) {
    this.scene = scene;
    this.rng = rng;
    
    const geometry = new THREE.CapsuleGeometry(0.15, 0.3, 4, 8);
    const material = new THREE.MeshLambertMaterial({ color: 0xFF4444 });
    
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, MAX_ZOMBIES);
    this.instancedMesh.castShadow = true;
    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();
    
    scene.add(this.instancedMesh);
  }

  spawnCluster(): ZombieCluster {
    const count = this.rng.range(3, 10);
    const strength = count;
    const x = this.rng.float(-4, 4);

    const cluster: ZombieCluster = {
      id: `zombie-${this.zombies.length}`,
      zPosition: this.nextZombieZ,
      xPosition: x,
      count,
      strength,
      defeated: false
    };

    this.zombies.push(cluster);
    this.nextZombieZ -= this.rng.range(15, 25);
    
    this.updateVisuals();
    
    return cluster;
  }

  checkCollisions(squadX: number, squadZ: number): { 
    cluster: ZombieCluster; 
    overlap: boolean 
  }[] {
    const collisions: { cluster: ZombieCluster; overlap: boolean }[] = [];

    for (const cluster of this.zombies) {
      if (cluster.defeated) continue;

      const zOverlap = Math.abs(squadZ - cluster.zPosition) < 0.5;
      const xOverlap = Math.abs(squadX - cluster.xPosition) < 0.5;

      if (zOverlap && xOverlap) {
        collisions.push({ cluster, overlap: true });
      }
    }

    return collisions;
  }

  resolveCollision(soldierCount: number, cluster: ZombieCluster): {
    soldiersLost: number;
    clusterDefeated: boolean;
  } {
    const soldiersLost = Math.min(soldierCount, cluster.strength);
    cluster.strength -= soldiersLost;
    
    if (cluster.strength <= 0) {
      cluster.defeated = true;
    }

    this.updateVisuals();

    return {
      soldiersLost,
      clusterDefeated: cluster.defeated
    };
  }

  private updateVisuals(): void {
    let index = 0;
    
    for (const cluster of this.zombies) {
      if (cluster.defeated) continue;
      
      const numZombies = cluster.count;
      const spacing = 0.4;
      const formationWidth = Math.ceil(Math.sqrt(numZombies));
      
      for (let i = 0; i < numZombies && index < MAX_ZOMBIES; i++) {
        const col = i % formationWidth;
        const row = Math.floor(i / formationWidth);
        
        const x = cluster.xPosition + (col - formationWidth / 2) * spacing;
        const zOffset = row * spacing;

        this.dummy.position.set(x, 0.2, cluster.zPosition + zOffset);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(index, this.dummy.matrix);
        index++;
      }
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  getNearbyZombies(squadZ: number, count: number = 3): ZombieCluster[] {
    return this.zombies
      .filter(z => z.zPosition < squadZ && !z.defeated)
      .sort((a, b) => b.zPosition - squadZ)
      .slice(0, count);
  }

  getZombies(): ZombieCluster[] {
    return this.zombies;
  }

  getTotalDefeated(): number {
    return this.zombies.filter(z => z.defeated).length;
  }

  dispose(): void {
    this.instancedMesh.dispose();
  }

  reset(): void {
    this.zombies = [];
    this.nextZombieZ = -40;
  }
}