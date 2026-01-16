import { describe, it, expect } from 'vitest';
import { createExportHash } from '../export-hash';
import type { RenderPlanInput } from '@/types/render-plan';

describe('createExportHash', () => {
  it('returns same hash for identical inputs', () => {
    const input: RenderPlanInput = {
      fov: 50,
      pitch: 5,
      cameraZ: 5,
      shadowEnabled: true,
      occlusionEnabled: false,
    };

    const hash1 = createExportHash(input);
    const hash2 = createExportHash(input);

    expect(hash1).toBe(hash2);
  });

  it('returns different hash for different inputs', () => {
    const input1: RenderPlanInput = { fov: 50, pitch: 5, cameraZ: 5 };
    const input2: RenderPlanInput = { fov: 50, pitch: 10, cameraZ: 5 };

    const hash1 = createExportHash(input1);
    const hash2 = createExportHash(input2);

    expect(hash1).not.toBe(hash2);
  });

  it('returns different hash for different fov', () => {
    const input1: RenderPlanInput = { fov: 50, pitch: 0, cameraZ: 5 };
    const input2: RenderPlanInput = { fov: 60, pitch: 0, cameraZ: 5 };

    expect(createExportHash(input1)).not.toBe(createExportHash(input2));
  });

  it('returns different hash for different shadowEnabled', () => {
    const input1: RenderPlanInput = {
      pitch: 0,
      cameraZ: 5,
      shadowEnabled: true,
    };
    const input2: RenderPlanInput = {
      pitch: 0,
      cameraZ: 5,
      shadowEnabled: false,
    };

    expect(createExportHash(input1)).not.toBe(createExportHash(input2));
  });

  it('returns different hash for different occlusionEnabled', () => {
    const input1: RenderPlanInput = {
      pitch: 0,
      cameraZ: 5,
      occlusionEnabled: true,
    };
    const input2: RenderPlanInput = {
      pitch: 0,
      cameraZ: 5,
      occlusionEnabled: false,
    };

    expect(createExportHash(input1)).not.toBe(createExportHash(input2));
  });

  it('hash is a non-empty string', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5 };
    const hash = createExportHash(input);

    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('hash is consistent with undefined optional fields', () => {
    const input1: RenderPlanInput = { pitch: 0, cameraZ: 5 };
    const input2: RenderPlanInput = { pitch: 0, cameraZ: 5, fov: undefined };

    expect(createExportHash(input1)).toBe(createExportHash(input2));
  });
});
