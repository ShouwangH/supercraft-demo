import { describe, it, expect } from 'vitest';
import {
  computePivotOffset,
  computeNormalizedBounds,
  applyImportScale,
  type BoundingBox,
} from '../normalize-asset';

describe('asset normalization', () => {
  describe('computePivotOffset', () => {
    it('computes offset to move pivot to bottom-center', () => {
      // Bounding box: x from -1 to 1, y from 0 to 2, z from -1 to 1
      const bbox: BoundingBox = {
        min: [-1, 0, -1],
        max: [1, 2, 1],
      };

      const offset = computePivotOffset(bbox);

      // Bottom-center means:
      // X: center of bbox = 0
      // Y: bottom of bbox = 0
      // Z: center of bbox = 0
      // So offset should move model so that bottom-center is at origin
      // Use toBeCloseTo for floating point comparison (-0 vs 0)
      expect(offset[0]).toBeCloseTo(0);
      expect(offset[1]).toBeCloseTo(0);
      expect(offset[2]).toBeCloseTo(0);
    });

    it('computes offset for model not at origin', () => {
      // Model is offset: x from 2 to 4, y from 1 to 3, z from -2 to 0
      const bbox: BoundingBox = {
        min: [2, 1, -2],
        max: [4, 3, 0],
      };

      const offset = computePivotOffset(bbox);

      // Center X = (2 + 4) / 2 = 3, so offset X = -3
      // Bottom Y = 1, so offset Y = -1
      // Center Z = (-2 + 0) / 2 = -1, so offset Z = 1
      expect(offset).toEqual([-3, -1, 1]);
    });

    it('handles asymmetric bounding boxes', () => {
      const bbox: BoundingBox = {
        min: [-0.5, 0, -0.25],
        max: [1.5, 2, 0.75],
      };

      const offset = computePivotOffset(bbox);

      // Center X = (-0.5 + 1.5) / 2 = 0.5, so offset X = -0.5
      // Bottom Y = 0, so offset Y = 0
      // Center Z = (-0.25 + 0.75) / 2 = 0.25, so offset Z = -0.25
      expect(offset[0]).toBeCloseTo(-0.5);
      expect(offset[1]).toBeCloseTo(0);
      expect(offset[2]).toBeCloseTo(-0.25);
    });
  });

  describe('computeNormalizedBounds', () => {
    it('returns dimensions of bounding box', () => {
      const bbox: BoundingBox = {
        min: [-1, 0, -0.5],
        max: [1, 2, 0.5],
      };

      const bounds = computeNormalizedBounds(bbox);

      expect(bounds.width).toBe(2);  // X extent
      expect(bounds.height).toBe(2); // Y extent
      expect(bounds.depth).toBe(1);  // Z extent
    });
  });

  describe('applyImportScale', () => {
    it('scales all dimensions uniformly', () => {
      const bounds = { width: 2, height: 1, depth: 1 };

      const scaled = applyImportScale(bounds, 0.5);

      expect(scaled.width).toBe(1);
      expect(scaled.height).toBe(0.5);
      expect(scaled.depth).toBe(0.5);
    });

    it('scale of 1 returns same dimensions', () => {
      const bounds = { width: 3, height: 2, depth: 1.5 };

      const scaled = applyImportScale(bounds, 1);

      expect(scaled).toEqual(bounds);
    });

    it('handles very small scales', () => {
      const bounds = { width: 100, height: 100, depth: 100 };

      const scaled = applyImportScale(bounds, 0.01);

      expect(scaled.width).toBe(1);
      expect(scaled.height).toBe(1);
      expect(scaled.depth).toBe(1);
    });
  });
});
