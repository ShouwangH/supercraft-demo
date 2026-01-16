'use client';

/**
 * ContactShadow Component
 *
 * Renders a soft contact shadow on the ground plane.
 * Uses drei's ContactShadows for a blob-style shadow effect.
 */

import { ContactShadows } from '@react-three/drei';

export interface ContactShadowProps {
  enabled?: boolean;
  opacity?: number;
  blur?: number;
  position?: [number, number, number];
}

export function ContactShadow({
  enabled = true,
  opacity = 0.5,
  blur = 2,
  position = [0, 0, 0],
}: ContactShadowProps) {
  if (!enabled) return null;

  return (
    <ContactShadows
      position={position}
      opacity={opacity}
      scale={10}
      blur={blur}
      far={4}
      resolution={256}
      color="#000000"
    />
  );
}
