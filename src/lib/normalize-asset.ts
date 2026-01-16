/**
 * Asset Normalization Utilities
 *
 * Functions for normalizing 3D assets to a consistent pivot and scale.
 * All assets should have bottom-center pivot for ground placement.
 */

import type { Position3D } from '@/types/placement';

/** Axis-aligned bounding box */
export interface BoundingBox {
  min: Position3D;
  max: Position3D;
}

/** Normalized asset bounds (dimensions) */
export interface NormalizedBounds {
  width: number;   // X extent
  height: number;  // Y extent
  depth: number;   // Z extent
}

/**
 * Compute the offset needed to move the pivot to bottom-center.
 *
 * Bottom-center means:
 * - X: center of bounding box
 * - Y: bottom of bounding box (min Y)
 * - Z: center of bounding box
 *
 * Returns the offset to subtract from all vertices.
 */
export function computePivotOffset(bbox: BoundingBox): Position3D {
  const centerX = (bbox.min[0] + bbox.max[0]) / 2;
  const bottomY = bbox.min[1];
  const centerZ = (bbox.min[2] + bbox.max[2]) / 2;

  // Return negative of the current bottom-center position
  // to move it to origin
  return [-centerX, -bottomY, -centerZ];
}

/**
 * Compute the normalized bounds (dimensions) from a bounding box.
 */
export function computeNormalizedBounds(bbox: BoundingBox): NormalizedBounds {
  return {
    width: bbox.max[0] - bbox.min[0],
    height: bbox.max[1] - bbox.min[1],
    depth: bbox.max[2] - bbox.min[2],
  };
}

/**
 * Apply import scale to normalized bounds.
 */
export function applyImportScale(
  bounds: NormalizedBounds,
  scale: number
): NormalizedBounds {
  return {
    width: bounds.width * scale,
    height: bounds.height * scale,
    depth: bounds.depth * scale,
  };
}

/**
 * Metadata returned from asset normalization.
 * Used to store per-asset normalization values.
 */
export interface AssetNormalizationResult {
  pivotOffset: Position3D;
  originalBounds: NormalizedBounds;
  normalizedBounds: NormalizedBounds;
  importScale: number;
}

/**
 * Compute full normalization for an asset.
 * Does not mutate geometry - returns metadata for runtime application.
 */
export function computeAssetNormalization(
  bbox: BoundingBox,
  importScale: number = 1
): AssetNormalizationResult {
  const pivotOffset = computePivotOffset(bbox);
  const originalBounds = computeNormalizedBounds(bbox);
  const normalizedBounds = applyImportScale(originalBounds, importScale);

  return {
    pivotOffset,
    originalBounds,
    normalizedBounds,
    importScale,
  };
}
