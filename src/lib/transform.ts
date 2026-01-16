/**
 * Transform Utilities
 *
 * Pure functions for working with 3D transforms.
 * Coordinate system: right-handed, +Y up, +X right, -Z forward.
 */

import type { PlacementTransform, Quaternion } from '@/types/placement';

/** Epsilon for floating point comparisons */
const EPSILON = 0.001;

/**
 * Serialize a transform to JSON string.
 */
export function serializeTransform(transform: PlacementTransform): string {
  return JSON.stringify(transform);
}

/**
 * Parse a transform from JSON string.
 */
export function parseTransform(json: string): PlacementTransform {
  return JSON.parse(json) as PlacementTransform;
}

/**
 * Check if a quaternion represents identity rotation (no rotation).
 * Uses epsilon tolerance for floating point comparison.
 */
export function isIdentityRotation(rotation: Quaternion): boolean {
  const [x, y, z, w] = rotation;
  return (
    Math.abs(x) < EPSILON &&
    Math.abs(y) < EPSILON &&
    Math.abs(z) < EPSILON &&
    Math.abs(w - 1) < EPSILON
  );
}

/**
 * Create an identity transform (origin, no rotation, unit scale).
 */
export function createIdentityTransform(): PlacementTransform {
  return {
    position: [0, 0, 0],
    rotation: [0, 0, 0, 1],
    scale: [1, 1, 1],
  };
}

/**
 * Apply uniform scale to a transform.
 * Multiplies existing scale by the factor.
 */
export function applyUniformScale(
  transform: PlacementTransform,
  factor: number
): PlacementTransform {
  return {
    ...transform,
    scale: [
      transform.scale[0] * factor,
      transform.scale[1] * factor,
      transform.scale[2] * factor,
    ],
  };
}

/**
 * Create a transform with a specific position on the ground plane.
 * Y is set to 0 (ground), rotation is identity, scale is uniform.
 */
export function createGroundPlacement(
  x: number,
  z: number,
  scale: number = 1
): PlacementTransform {
  return {
    position: [x, 0, z],
    rotation: [0, 0, 0, 1],
    scale: [scale, scale, scale],
  };
}
