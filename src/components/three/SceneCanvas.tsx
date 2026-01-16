'use client';

/**
 * SceneCanvas Component
 *
 * React Three Fiber canvas wrapper for 3D scene rendering.
 */

import { Canvas } from '@react-three/fiber';
import { type ReactNode } from 'react';

export interface SceneCanvasProps {
  children: ReactNode;
  fov?: number;
  cameraZ?: number;
  className?: string;
}

export function SceneCanvas({
  children,
  fov = 50,
  cameraZ = 5,
  className,
}: SceneCanvasProps) {
  return (
    <Canvas
      className={className}
      camera={{
        fov,
        near: 0.1,
        far: 1000,
        position: [0, 1, cameraZ],
      }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      shadows
    >
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      {children}
    </Canvas>
  );
}
