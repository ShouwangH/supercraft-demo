import { describe, it, expect } from 'vitest';
import {
  serializeTransform,
  parseTransform,
  isIdentityRotation,
  createIdentityTransform,
  applyUniformScale,
} from '../transform';
import type { PlacementTransform } from '@/types/placement';

describe('transform utilities', () => {
  describe('serializeTransform / parseTransform', () => {
    it('round-trips a transform identically', () => {
      const original: PlacementTransform = {
        position: [1.5, 0, -3.2],
        rotation: [0, 0.707, 0, 0.707],
        scale: [1, 1, 1],
      };

      const serialized = serializeTransform(original);
      const parsed = parseTransform(serialized);

      expect(parsed).toEqual(original);
    });

    it('preserves floating point precision', () => {
      const original: PlacementTransform = {
        position: [0.123456789, 0, -0.987654321],
        rotation: [0.1, 0.2, 0.3, 0.9486833],
        scale: [1.5, 1.5, 1.5],
      };

      const serialized = serializeTransform(original);
      const parsed = parseTransform(serialized);

      expect(parsed.position[0]).toBeCloseTo(0.123456789, 6);
      expect(parsed.position[2]).toBeCloseTo(-0.987654321, 6);
    });

    it('produces valid JSON string', () => {
      const transform: PlacementTransform = {
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      };

      const serialized = serializeTransform(transform);
      expect(() => JSON.parse(serialized)).not.toThrow();
    });
  });

  describe('coordinate system', () => {
    it('position [0, 0, -5] represents 5 units in front of camera (-Z forward)', () => {
      // In our right-handed coordinate system:
      // +Y is up, +X is right, -Z is forward (into the screen)
      const transform: PlacementTransform = {
        position: [0, 0, -5],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      };

      // Z should be negative for objects in front of camera
      expect(transform.position[2]).toBeLessThan(0);
      expect(Math.abs(transform.position[2])).toBe(5);
    });

    it('position [0, 1, 0] represents 1 unit above ground (+Y up)', () => {
      const transform: PlacementTransform = {
        position: [0, 1, 0],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      };

      expect(transform.position[1]).toBe(1);
    });
  });

  describe('isIdentityRotation', () => {
    it('returns true for identity quaternion [0, 0, 0, 1]', () => {
      expect(isIdentityRotation([0, 0, 0, 1])).toBe(true);
    });

    it('returns false for non-identity rotation', () => {
      // 90 degree rotation around Y axis
      expect(isIdentityRotation([0, 0.707, 0, 0.707])).toBe(false);
    });

    it('handles near-identity with epsilon tolerance', () => {
      // Very small deviation from identity
      expect(isIdentityRotation([0.0001, 0, 0, 0.99999])).toBe(true);
    });
  });

  describe('createIdentityTransform', () => {
    it('creates transform at origin with no rotation and unit scale', () => {
      const transform = createIdentityTransform();

      expect(transform.position).toEqual([0, 0, 0]);
      expect(transform.rotation).toEqual([0, 0, 0, 1]);
      expect(transform.scale).toEqual([1, 1, 1]);
    });
  });

  describe('applyUniformScale', () => {
    it('applies uniform scale to all axes', () => {
      const transform: PlacementTransform = {
        position: [1, 2, 3],
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      };

      const scaled = applyUniformScale(transform, 2);

      expect(scaled.scale).toEqual([2, 2, 2]);
      expect(scaled.position).toEqual(transform.position); // Position unchanged
    });

    it('multiplies existing scale', () => {
      const transform: PlacementTransform = {
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1],
        scale: [0.5, 0.5, 0.5],
      };

      const scaled = applyUniformScale(transform, 2);

      expect(scaled.scale).toEqual([1, 1, 1]);
    });
  });
});
