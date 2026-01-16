'use client';

/**
 * PlacementEditor Component
 *
 * Main editor combining 3D viewer with controls for product placement.
 */

import { useState, useCallback, useEffect } from 'react';
import { SceneCanvas } from './three/SceneCanvas';
import { ProductModel } from './three/ProductModel';
import { ContactShadow } from './three/ContactShadow';
import { PlacementControls } from './PlacementControls';
import { createRenderPlan } from '@/lib/render-plan';
import type { Position3D, Scale3D, Quaternion } from '@/types/placement';

export interface PlacementEditorProps {
  sceneId: string;
  photoUrl: string;
  assetUrl: string;
  onExport: () => void;
  initialPosition?: Position3D;
  initialRotationY?: number;
  initialScale?: number;
}

function yRotationToQuaternion(degrees: number): Quaternion {
  const radians = (degrees * Math.PI) / 180;
  const halfAngle = radians / 2;
  return [0, Math.sin(halfAngle), 0, Math.cos(halfAngle)];
}

export function PlacementEditor({
  photoUrl,
  assetUrl,
  onExport,
  initialPosition = [0, 0, -3],
  initialRotationY = 0,
  initialScale = 1,
}: PlacementEditorProps) {
  const [position, setPosition] = useState<Position3D>(initialPosition);
  const [rotationY, setRotationY] = useState(initialRotationY);
  const [scale, setScale] = useState(initialScale);
  const [shadowEnabled, setShadowEnabled] = useState(true);
  const [perspectivePitch, setPerspectivePitch] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Generate render plan for camera setup
  const renderPlan = createRenderPlan({
    fov: 50,
    pitch: perspectivePitch,
    cameraZ: 5,
    shadowEnabled,
    occlusionEnabled: false,
  });

  // Handle mouse drag for XZ positioning
  const handleCanvasMouseDown = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging) return;

      // Convert mouse movement to world position change
      const sensitivity = 0.01;
      setPosition((prev) => [
        prev[0] + e.movementX * sensitivity,
        prev[1],
        prev[2] + e.movementY * sensitivity,
      ]);
    },
    [isDragging]
  );

  // Cleanup drag state on mouse leave
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const rotation = yRotationToQuaternion(rotationY);
  const scaleArray: Scale3D = [scale, scale, scale];

  return (
    <div className="placement-editor">
      <div
        className="placement-editor__canvas"
        style={{ backgroundImage: `url(${photoUrl})` }}
        onMouseDown={handleCanvasMouseDown}
        onMouseUp={handleCanvasMouseUp}
        onMouseMove={handleCanvasMouseMove}
      >
        <SceneCanvas
          fov={renderPlan.cameraConfig.fov}
          cameraZ={renderPlan.cameraConfig.cameraZ}
          className="placement-editor__three"
        >
          <ProductModel
            url={assetUrl}
            position={position}
            rotation={rotation}
            scale={scaleArray}
            castShadow={shadowEnabled}
          />
          <ContactShadow
            enabled={renderPlan.compositingSettings.shadowEnabled}
            position={[0, 0, 0]}
          />
        </SceneCanvas>
      </div>

      <PlacementControls
        rotationY={rotationY}
        scale={scale}
        shadowEnabled={shadowEnabled}
        perspectivePitch={perspectivePitch}
        onRotationChange={setRotationY}
        onScaleChange={setScale}
        onShadowToggle={setShadowEnabled}
        onPerspectiveChange={setPerspectivePitch}
        onExport={onExport}
      />
    </div>
  );
}
