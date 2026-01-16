'use client';

/**
 * ProductModel Component
 *
 * Loads and displays a GLB model with position/rotation/scale controls.
 */

import { useGLTF } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import type { Position3D, Quaternion, Scale3D } from '@/types/placement';

export interface ProductModelProps {
  url: string;
  position: Position3D;
  rotation: Quaternion;
  scale: Scale3D;
  castShadow?: boolean;
}

export function ProductModel({
  url,
  position,
  rotation,
  scale,
  castShadow = true,
}: ProductModelProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);

  // Clone the scene to avoid shared state issues
  const clonedScene = scene.clone();

  // Apply shadow casting to all meshes
  useEffect(() => {
    if (castShadow) {
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [clonedScene, castShadow]);

  // Convert quaternion array to Three.js Quaternion
  const quaternion = new THREE.Quaternion(
    rotation[0],
    rotation[1],
    rotation[2],
    rotation[3]
  );

  return (
    <group
      ref={groupRef}
      position={position}
      quaternion={quaternion}
      scale={scale}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

// Preload helper for GLB files
ProductModel.preload = (url: string) => useGLTF.preload(url);
