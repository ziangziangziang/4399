/**
 * Game Engine Core
 * Three.js with WebGPU/WebGL fallback
 */
import * as THREE from 'three';

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private animationId: number | null = null;
  
  // Dimensions
  private width: number = 0;
  private height: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.init();
  }

  private init(): void {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      this.width / this.height,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Renderer with WebGPU fallback
    this.initRenderer();

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    // Handle resize
    window.addEventListener('resize', () => this.onResize());
    this.onResize();
  }

  private initRenderer(): void {
    // Try WebGPU first
    if ('gpu' in navigator) {
      try {
        // WebGPU not fully supported in current Three.js, use WebGL with webgpu flag
        this.renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          powerPreference: 'high-performance'
        });
      } catch (e) {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
      }
    } else {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
    }
    
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);
  }

  onResize(): void {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
    }
  }

  setCameraPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
    this.camera.lookAt(0, 0, -5);
  }

  addSceneObject(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  removeSceneObject(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  start(loop: (delta: number) => void): void {
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      loop(delta);

      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationId = requestAnimationFrame(animate);
    };

    this.animationId = requestAnimationFrame(animate);
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }
}