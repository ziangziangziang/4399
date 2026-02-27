/**
 * Squad system - manages soldier formation using InstancedMesh
 */
import * as THREE from 'three';

const MAX_SOLDIERS = 500;
const SOLDIER_SPACING = 0.3;

export class Squad {
  private instancedMesh: THREE.InstancedMesh;
  private dummy: THREE.Object3D;
  private matrix: THREE.Matrix4;
  
  private soldierCount: number = 10;
  private targetCount: number = 10;
  private xPosition: number = 0;
  private targetX: number = 0;
  
  // Formation grid
  private rows: number = 2;
  private cols: number = 5;

  constructor(scene: THREE.Scene) {
    const geometry = new THREE.BoxGeometry(0.2, 0.4, 0.2);
    const material = new THREE.MeshLambertMaterial({ color: 0x4CAF50 });
    
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, MAX_SOLDIERS);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = true;
    
    this.dummy = new THREE.Object3D();
    this.matrix = new THREE.Matrix4();
    
    scene.add(this.instancedMesh);
    
    this.updateFormation();
  }

  setSoldierCount(count: number): void {
    this.targetCount = Math.max(0, Math.min(MAX_SOLDIERS, count));
  }

  getSoldierCount(): number {
    return this.soldierCount;
  }

  setXPosition(x: number, trackWidth: number = 10): void {
    this.targetX = Math.max(-trackWidth / 2, Math.min(trackWidth / 2, x));
  }

  getXPosition(): number {
    return this.xPosition;
  }

  update(delta: number, trackWidth: number = 10): void {
    // Smooth movement
    const moveSpeed = 10 * delta;
    this.xPosition += (this.targetX - this.xPosition) * moveSpeed;
    
    // Smooth count transition
    if (this.soldierCount !== this.targetCount) {
      const countDelta = Math.sign(this.targetCount - this.soldierCount) * Math.min(5, Math.abs(this.targetCount - this.soldierCount));
      this.soldierCount += countDelta;
    }
    
    this.updateFormation();
  }

  private updateFormation(): void {
    // Calculate formation dimensions based on soldier count
    this.cols = Math.ceil(Math.sqrt(this.soldierCount));
    this.rows = Math.ceil(this.soldierCount / this.cols);
    
    const colSpacing = Math.min(SOLDIER_SPACING, 0.5);
    const rowSpacing = Math.min(SOLDIER_SPACING, 0.5);
    const formationWidth = (this.cols - 1) * colSpacing;
    const formationHeight = (this.rows - 1) * rowSpacing;
    
    for (let i = 0; i < MAX_SOLDIERS; i++) {
      if (i < this.soldierCount) {
        const col = i % this.cols;
        const row = Math.floor(i / this.cols);
        
        const x = this.xPosition + (col * colSpacing) - formationWidth / 2;
        const z = (row * rowSpacing) - formationHeight / 2;
        
        this.dummy.position.set(x, 0.2, z);
        this.dummy.updateMatrix();
        this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
      }
    }
    
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    this.instancedMesh.dispose();
  }

  getMesh(): THREE.InstancedMesh {
    return this.instancedMesh;
  }
}