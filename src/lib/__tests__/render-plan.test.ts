import { describe, it, expect } from 'vitest';
import { createRenderPlan } from '../render-plan';
import type { RenderPlanInput } from '@/types/render-plan';

describe('createRenderPlan', () => {
  it('returns identical output for identical inputs', () => {
    const input: RenderPlanInput = { fov: 50, pitch: 0, cameraZ: 5 };

    const plan1 = createRenderPlan(input);
    const plan2 = createRenderPlan(input);

    // Deep equality check
    expect(plan1).toEqual(plan2);

    // Also verify JSON serialization is identical (byte-identical)
    expect(JSON.stringify(plan1)).toBe(JSON.stringify(plan2));
  });

  it('uses default FOV of 50 when not specified', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan.cameraConfig.fov).toBe(50);
  });

  it('uses provided FOV when specified', () => {
    const input: RenderPlanInput = { fov: 60, pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan.cameraConfig.fov).toBe(60);
  });

  it('includes required fields: cameraConfig, planeConfig, compositingSettings', () => {
    const input: RenderPlanInput = { fov: 50, pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan).toHaveProperty('cameraConfig');
    expect(plan).toHaveProperty('planeConfig');
    expect(plan).toHaveProperty('compositingSettings');
  });

  it('cameraConfig includes fov, pitch, and cameraZ', () => {
    const input: RenderPlanInput = { fov: 55, pitch: -10, cameraZ: 8 };

    const plan = createRenderPlan(input);

    expect(plan.cameraConfig.fov).toBe(55);
    expect(plan.cameraConfig.pitch).toBe(-10);
    expect(plan.cameraConfig.cameraZ).toBe(8);
  });

  it('planeConfig has y=0 and visible=false', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan.planeConfig.y).toBe(0);
    expect(plan.planeConfig.visible).toBe(false);
  });

  it('shadowEnabled defaults to true', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan.compositingSettings.shadowEnabled).toBe(true);
  });

  it('shadowEnabled can be set to false', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5, shadowEnabled: false };

    const plan = createRenderPlan(input);

    expect(plan.compositingSettings.shadowEnabled).toBe(false);
  });

  it('occlusionEnabled defaults to false', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5 };

    const plan = createRenderPlan(input);

    expect(plan.compositingSettings.occlusionEnabled).toBe(false);
  });

  it('occlusionEnabled can be set to true', () => {
    const input: RenderPlanInput = { pitch: 0, cameraZ: 5, occlusionEnabled: true };

    const plan = createRenderPlan(input);

    expect(plan.compositingSettings.occlusionEnabled).toBe(true);
  });

  it('produces different output for different inputs', () => {
    const input1: RenderPlanInput = { fov: 50, pitch: 0, cameraZ: 5 };
    const input2: RenderPlanInput = { fov: 50, pitch: 5, cameraZ: 5 };

    const plan1 = createRenderPlan(input1);
    const plan2 = createRenderPlan(input2);

    expect(plan1).not.toEqual(plan2);
  });

  it('is deterministic across multiple calls with complex inputs', () => {
    const input: RenderPlanInput = {
      fov: 47.5,
      pitch: -7.3,
      cameraZ: 12.456,
      shadowEnabled: true,
      occlusionEnabled: false,
    };

    const results = Array.from({ length: 10 }, () => createRenderPlan(input));

    // All results should be identical
    const firstResult = JSON.stringify(results[0]);
    results.forEach((result) => {
      expect(JSON.stringify(result)).toBe(firstResult);
    });
  });
});
