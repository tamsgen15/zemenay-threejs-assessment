import * as THREE from 'three';

/**
 * PCBComponent - Represents a 3D PCB component with proper rotation handling
 * Addresses PR-668: Component Rotation Failure
 */
export class PCBComponent {
  constructor() {
    this.mesh = this.createComponentMesh();
  }

  createComponentMesh() {
    const geometry = new THREE.BoxGeometry(1, 0.5, 0.3);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x2196F3,
      metalness: 0.5,
      roughness: 0.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    geometry.center();
    
    return mesh;
  }

  /**
   * Rotate component around its local axis
   * @param {string} axis - 'x', 'y', or 'z'
   * @param {number} angle - Rotation angle in radians
   * 
   * FIX for PR-668:
   * - Uses quaternion for performance and gimbal lock prevention
   * - Rotates around local axis, not world origin
   * - Properly accumulates rotation transformations
   */
  rotate(axis, angle) {
    const rotationAxis = new THREE.Vector3(
      axis === 'x' ? 1 : 0,
      axis === 'y' ? 1 : 0,
      axis === 'z' ? 1 : 0
    );
    
    const quaternion = new THREE.Quaternion();
    quaternion.setFromAxisAngle(rotationAxis, angle);
    
    this.mesh.quaternion.multiply(quaternion);
  }
}
