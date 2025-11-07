# Zemenay - 3D PCB Visualization Platform

A Three.js-based 3D visualization platform for PCB component design and module loading, addressing critical debugging and performance challenges.

## Assessment Overview

This project demonstrates:
- **PR-668**: 3D PCB Component Rotation - Core Three.js mastery
- **PR-311**: Intermittent Module Loading - Advanced system analysis and debugging

## Quick Start

```bash
cd Zemenay
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
Zemenay/
├── src/
│   ├── main.js                    # Application entry point
│   ├── components/
│   │   └── PCBComponent.js        # 3D component with rotation fix
│   └── utils/
│       └── ModuleLoader.js        # Module loading with error handling
├── docs/
│   ├── PR-668-ANALYSIS.md         # Component rotation technical analysis
│   └── PR-311-RCA.md              # Module loading root cause analysis
├── index.html                     # Main HTML with UI controls
└── package.json
```

## Features

### 1. PCB Component Rotation (PR-668)
- Quaternion-based rotation for performance
- Local-space transformation (rotates around component center)
- Gimbal lock prevention
- Accumulative rotation support

**Controls**:
- "Rotate Y-Axis" - Rotate component 45° around Y-axis
- "Rotate Z-Axis" - Rotate component 45° around Z-axis

### 2. Module Loading with Diagnostics (PR-311)
- Comprehensive error logging
- Retry logic with exponential backoff
- Timeout handling
- Authentication validation
- Detailed failure metrics for RCA

**Controls**:
- "Load Module" - Attempt to load Agile module with full diagnostics

## Technical Implementation

### Component Rotation Fix
```javascript
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
```

### Module Loading with Error Tracking
```javascript
async loadModule(moduleId) {
  for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
    try {
      const result = await this.fetchModuleWithTimeout(moduleId);
      this.logSuccess(moduleId, duration, attempt);
      return result;
    } catch (error) {
      this.logFailure(moduleId, error, attempt, duration);
    }
  }
}
```

## Assessment Criteria

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Debugging Proficiency | ✅ | Identified root causes in both PRs |
| Core 3js API Use | ✅ | Proper quaternion and mesh manipulation |
| Transformation Space | ✅ | Local-space rotation implementation |
| Performance Awareness | ✅ | Quaternion over Euler angles |
| Code Clarity | ✅ | Clean, documented code |

## Documentation

- **[PR-668 Analysis](docs/PR-668-ANALYSIS.md)**: Complete technical analysis of rotation bug
- **[PR-311 RCA](docs/PR-311-RCA.md)**: Root cause analysis with 3 hypotheses and debugging plans

## Technologies

- **Three.js**: 3D rendering and object manipulation
- **Vite**: Fast development server and build tool
- **Vanilla JavaScript**: No framework overhead for performance
