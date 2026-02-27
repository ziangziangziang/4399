import * as THREE from 'three';

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let cube: THREE.Mesh;

let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let rotationSpeed = { x: 0.01, y: 0.01 };

function init(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a1a2e);
  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;
  
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshNormalMaterial({ wireframe: false });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  const wireGeometry = new THREE.BoxGeometry(2.1, 2.1, 2.1);
  const wireMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x00ff88, 
    wireframe: true,
    transparent: true,
    opacity: 0.3
  });
  const wireCube = new THREE.Mesh(wireGeometry, wireMaterial);
  scene.add(wireCube);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);
  
  setupEventListeners();
}

function setupEventListeners(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaMove = {
      x: e.clientX - previousMousePosition.x,
      y: e.clientY - previousMousePosition.y
    };
    
    rotationSpeed.x = deltaMove.y * 0.005;
    rotationSpeed.y = deltaMove.x * 0.005;
    
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.01;
    camera.position.z = Math.max(3, Math.min(10, camera.position.z));
  });
  
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

function animate(): void {
  requestAnimationFrame(animate);
  
  cube.rotation.x += rotationSpeed.x;
  cube.rotation.y += rotationSpeed.y;
  
  renderer.render(scene, camera);
}

function start(): void {
  init();
  animate();
}

function stop(): void {
  if (scene) {
    scene.clear();
  }
  if (renderer) {
    renderer.dispose();
  }
}

start();
(window as any).__GAME_INSTANCE__ = { start, stop };