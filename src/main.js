import * as THREE from 'three';
import { PCBComponent } from './components/PCBComponent.js';
import { ModuleLoader } from './utils/ModuleLoader.js';

class PCBViewer {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.selectedComponent = null;
    this.moduleLoader = new ModuleLoader();
    
    this.init();
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    
    this.camera.position.z = 5;
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);
    
    this.selectedComponent = new PCBComponent();
    this.scene.add(this.selectedComponent.mesh);
    
    document.getElementById('rotateY').addEventListener('click', () => this.rotateComponent('y'));
    document.getElementById('rotateZ').addEventListener('click', () => this.rotateComponent('z'));
    document.getElementById('loadModule').addEventListener('click', () => this.loadAgileModule());
    
    window.addEventListener('resize', () => this.onWindowResize());
    
    this.animate();
  }

  rotateComponent(axis) {
    if (!this.selectedComponent) return;
    this.selectedComponent.rotate(axis, Math.PI / 4);
  }

  async loadAgileModule() {
    const statusEl = document.getElementById('status');
    statusEl.className = '';
    statusEl.textContent = '⏳ Loading module...';
    
    try {
      await this.moduleLoader.loadModule('module-001');
      statusEl.className = 'success';
      statusEl.textContent = '✅ Module loaded successfully';
    } catch (error) {
      statusEl.className = 'error';
      statusEl.textContent = `❌ ${error.message}`;
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }
}

new PCBViewer();
