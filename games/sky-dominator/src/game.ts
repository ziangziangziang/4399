import * as THREE from 'three';
import type { Vector3 } from 'three';

export class SkyDominatorGame {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: THREE.Group;
  private bullets: THREE.Group;
  private enemies: THREE.Group;
  private particles: THREE.Group;
  private stars: THREE.Points;
  
  private score: number = 0;
  private health: number = 100;
  private wave: number = 1;
  private isPaused: boolean = false;
  private isGameOver: boolean = false;
  private lastShot: number = 0;
  private fireRate: number = 150;
  
  private keys: { [key: string]: boolean } = {};
  private mouse: THREE.Vector2 = new THREE.Vector2();
  
  private enemyTypes: any[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 2000;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }
  
  private init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a20);
    this.scene.fog = new THREE.Fog(0x0a0a20, 100, 900);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    (this.camera as any).position.set(0, 50, 100);
    this.camera.lookAt(0, 0, 0);
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    (directionalLight as any).position.set(50, 100, 50);
    this.scene.add(directionalLight);
    
    // Initialize groups
    this.player = new THREE.Group();
    this.scene.add(this.player);
    
    this.bullets = new THREE.Group();
    this.scene.add(this.bullets);
    
    this.enemies = new THREE.Group();
    this.scene.add(this.enemies);
    
    this.particles = new THREE.Group();
    this.scene.add(this.particles);
    
    // Create stars
    this.createStars();
    
    // Create player ship
    this.createPlayer();
    
    // Event listeners
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    
    // Animation loop
    this.animate();
  }
  
  private createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    
    for (let i = 0; i < 5000; i++) {
      vertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    
    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      transparent: true,
      opacity: 0.8
    });
    
    this.stars = new THREE.Points(geometry, material);
    this.scene.add(this.stars);
  }
  
  private createPlayer() {
    // Main body
    const bodyGeometry = new THREE.ConeGeometry(3, 12, 8);
    bodyGeometry.rotateX(Math.PI / 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db, flatShading: true });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.player.add(body);
    
    // Wings
    const wingGeometry = new THREE.BufferGeometry();
    const wingVertices = new Float32Array([
      -8, 0, 2,   8, 0, 2,   0, 0, -5,
      -8, 0, -2,   8, 0, -2,   0, 0, 5
    ]);
    wingGeometry.setAttribute('position', new THREE.BufferAttribute(wingVertices, 3));
    wingGeometry.setIndex([0, 1, 2, 3, 4, 5]);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x2980b9, flatShading: true });
    const wings = new THREE.Mesh(wingGeometry, wingMaterial);
    this.player.add(wings);
    
    // Engine glow
    const engineGeometry = new THREE.SphereGeometry(1.5, 8, 8);
    const engineMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    (engine as any).position.z = 5;
    this.player.add(engine);
  }
  
  private createEnemy(type: string, position: THREE.Vector3) {
    let geometry: THREE.BufferGeometry;
    let material: THREE.Material;
    let speed: number;
    
    switch (type) {
      case 'Interceptor':
        geometry = new THREE.ConeGeometry(2, 8, 8);
        geometry.rotateX(Math.PI / 2);
        material = new THREE.MeshPhongMaterial({ color: 0xe74c3c, flatShading: true });
        speed = 0.8;
        break;
      case 'Bomber':
        geometry = new THREE.BoxGeometry(5, 5, 12);
        material = new THREE.MeshPhongMaterial({ color: 0x8e44ad, flatShading: true });
        speed = 0.4;
        break;
      case 'Dart':
        geometry = new THREE.ConeGeometry(1, 6, 6);
        geometry.rotateX(Math.PI / 2);
        material = new THREE.MeshPhongMaterial({ color: 0xf39c12, flatShading: true });
        speed = 1.2;
        break;
      default:
        geometry = new THREE.SphereGeometry(3, 8, 8);
        material = new THREE.MeshPhongMaterial({ color: 0x16a085, flatShading: true });
        speed = 0.6;
    }
    
    const enemy = new THREE.Mesh(geometry, material as any);
    (enemy as any).position.copy(position);
    (enemy as any).userData = { type, speed, health: 1 };
    this.enemies.add(enemy);
  }
  
  private createBullet(position: THREE.Vector3, direction: THREE.Vector3) {
    const geometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
    geometry.rotateX(Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const bullet = new THREE.Mesh(geometry, material);
    bullet.position.copy(position);
    bullet.userData = { direction, speed: 3 };
    this.bullets.add(bullet);
  }
  
  private createExplosion(position: THREE.Vector3, color: number = 0xffaa00) {
    const particleCount = 10;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true });
    
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(geometry, material.clone());
      particle.position.copy(position);
      particle.userData = {
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        ),
        life: 1.0
      };
      this.particles.add(particle);
    }
  }
  
  private onKeyDown(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = true;
    
    if (e.key === 'Escape') {
      this.togglePause();
    }
    
    if (e.key === ' ' && !this.isGameOver) {
      this.shoot();
    }
  }
  
  private onKeyUp(e: KeyboardEvent) {
    this.keys[e.key.toLowerCase()] = false;
  }
  
  private onMouseMove(e: MouseEvent) {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }
  
  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  private shoot() {
    const now = Date.now();
    if (now - this.lastShot < this.fireRate) return;
    
    this.lastShot = now;
    
    const bulletPos = new THREE.Vector3(0, 0, -8);
    bulletPos.applyMatrix4(this.player.matrixWorld);
    
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(this.player.quaternion);
    
    this.createBullet(bulletPos, direction);
  }
  
  private updatePlayer() {
    const speed = this.keys['shift'] ? 1.2 : 0.8;
    const moveSpeed = 1.5 * speed;
    
    if (this.keys['w'] || this.keys['arrowup']) {
      this.player.translateZ(-moveSpeed);
    }
    if (this.keys['s'] || this.keys['arrowdown']) {
      this.player.translateZ(moveSpeed);
    }
    if (this.keys['a'] || this.keys['arrowleft']) {
      this.player.translateX(-moveSpeed);
    }
    if (this.keys['d'] || this.keys['arrowright']) {
      this.player.translateX(moveSpeed);
    }
    
    // Mouse aiming
    const targetX = this.mouse.x * 40;
    const targetY = this.mouse.y * 30;
    (this.player as any).position.x += (targetX - (this.player as any).position.x) * 0.1;
    (this.player as any).position.y += (targetY - (this.player as any).position.y) * 0.1;
    
    // Rotate towards mouse
    (this.player as any).rotation.z = -this.mouse.x * 0.5;
    (this.player as any).rotation.x = this.mouse.y * 0.3;
    
    // Clamp position
    (this.player as any).position.x = Math.max(-50, Math.min(50, (this.player as any).position.x));
    (this.player as any).position.y = Math.max(-40, Math.min(40, (this.player as any).position.y));
  }
  
  private updateBullets() {
    for (let i = this.bullets.children.length - 1; i >= 0; i--) {
      const bullet = this.bullets.children[i] as THREE.Mesh;
      const dir = bullet.userData.direction.clone();
      const speed = bullet.userData.speed;
      
      bullet.position.add(dir.multiplyScalar(speed));
      
      // Remove if out of bounds
      if (bullet.position.z < -500 || bullet.position.z > 500) {
        this.bullets.remove(bullet);
      }
    }
  }
  
  private updateEnemies() {
    const now = Date.now();
    
    // Spawn enemies
    if (now - this.spawnTimer > this.spawnInterval) {
      const type = this.getRandomEnemyType();
      const spawnPos = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 60,
        -300
      );
      this.createEnemy(type, spawnPos);
      this.spawnTimer = now;
    }
    
    // Update enemy positions
    for (let i = this.enemies.children.length - 1; i >= 0; i--) {
      const enemy = this.enemies.children[i] as THREE.Mesh;
      const dir = new THREE.Vector3(0, 0, 1).applyQuaternion(this.player.quaternion);
      dir.multiplyScalar(enemy.userData.speed);
      enemy.position.add(dir);
      
      // Check collision with player
      if (enemy.position.distanceTo(this.player.position) < 5) {
        this.takeDamage(20);
        this.createExplosion(enemy.position, 0xff0000);
        this.enemies.remove(enemy);
        continue;
      }
      
      // Remove if behind player
      if (enemy.position.z > 50) {
        this.enemies.remove(enemy);
      }
    }
    
    // Check bullet-enemy collisions
    for (let i = this.bullets.children.length - 1; i >= 0; i--) {
      for (let j = this.enemies.children.length - 1; j >= 0; j--) {
        const bullet = this.bullets.children[i] as THREE.Mesh;
        const enemy = this.enemies.children[j] as THREE.Mesh;
        
        if (bullet.position.distanceTo(enemy.position) < 4) {
          this.createExplosion(enemy.position, 0xffaa00);
          this.bullets.remove(bullet);
          this.enemies.remove(enemy);
          this.addScore(100);
          break;
        }
      }
    }
  }
  
  private getRandomEnemyType(): string {
    const types = ['Interceptor', 'Bomber', 'Dart'];
    return types[Math.floor(Math.random() * types.length)];
  }
  
  private updateParticles() {
    for (let i = this.particles.children.length - 1; i >= 0; i--) {
      const particle = this.particles.children[i] as THREE.Mesh;
      particle.position.add(particle.userData.velocity);
      particle.userData.life -= 0.02;
      particle.material.opacity = particle.userData.life;
      particle.scale.setScalar(particle.userData.life);
      
      if (particle.userData.life <= 0) {
        this.particles.remove(particle);
      }
    }
  }
  
  private updateStars() {
    this.stars.rotation.z += 0.0005;
  }
  
  private takeDamage(amount: number) {
    this.health -= amount;
    this.updateHealthUI();
    
    if (this.health <= 0) {
      this.gameOver();
    }
  }
  
  private addScore(points: number) {
    this.score += points;
    this.updateScoreUI();
  }
  
  private updateScoreUI() {
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = this.score.toString();
  }
  
  private updateHealthUI() {
    const fill = document.getElementById('health-fill');
    if (fill) {
      fill.style.width = Math.max(0, this.health) + '%';
    }
  }
  
  private togglePause() {
    if (this.isGameOver) return;
    
    this.isPaused = !this.isPaused;
    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) {
      pauseScreen.classList.toggle('visible', this.isPaused);
    }
  }
  
  private gameOver() {
    this.isGameOver = true;
    this.createExplosion(this.player.position, 0xff0000);
    
    const gameOverScreen = document.getElementById('game-over');
    const finalScore = document.getElementById('final-score');
    if (gameOverScreen && finalScore) {
      finalScore.textContent = this.score.toString();
      gameOverScreen.classList.add('visible');
    }
  }
  
  public start() {
    document.getElementById('start-screen')?.classList.remove('visible');
    this.reset();
  }
  
  public resume() {
    this.isPaused = false;
    const pauseScreen = document.getElementById('pause-screen');
    if (pauseScreen) pauseScreen.classList.remove('visible');
  }
  
  public restart() {
    document.getElementById('game-over')?.classList.remove('visible');
    this.reset();
  }
  
  private reset() {
    this.score = 0;
    this.health = 100;
    this.wave = 1;
    this.isPaused = false;
    this.isGameOver = false;
    
    this.player.position.set(0, 0, 0);
    this.player.rotation.set(0, 0, 0);
    
    // Clear enemies and bullets
    while (this.enemies.children.length > 0) {
      this.enemies.remove(this.enemies.children[0]);
    }
    while (this.bullets.children.length > 0) {
      this.bullets.remove(this.bullets.children[0]);
    }
    while (this.particles.children.length > 0) {
      this.particles.remove(this.particles.children[0]);
    }
    
    this.updateScoreUI();
    this.updateHealthUI();
  }
  
  private animate() {
    requestAnimationFrame(() => this.animate());
    
    if (!this.isPaused && !this.isGameOver) {
      this.updatePlayer();
      this.updateBullets();
      this.updateEnemies();
      this.updateParticles();
      this.updateStars();
    }
    
    this.renderer.render(this.scene, this.camera);
  }
}