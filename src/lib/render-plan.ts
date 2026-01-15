/**
 * Render Plan Factory
 *
 * Creates deterministic render plans from input parameters.
 * Used to ensure preview and export render identically.
 */

import type {
  RenderPlan,
  RenderPlanInput,
  CameraConfig,
  PlaneConfig,
  CompositingSettings,
} from '@/types/render-plan';

/** Default field of view in degrees */
const DEFAULT_FOV = 50;

/** Default shadow enabled state */
const DEFAULT_SHADOW_ENABLED = true;

/** Default occlusion enabled state */
const DEFAULT_OCCLUSION_ENABLED = false;

/**
 * Creates a render plan from input parameters.
 * Deterministic: identical inputs always produce identical outputs.
 */
export function createRenderPlan(input: RenderPlanInput): RenderPlan {
  const cameraConfig: CameraConfig = {
    fov: input.fov ?? DEFAULT_FOV,
    pitch: input.pitch,
    cameraZ: input.cameraZ,
  };

  const planeConfig: PlaneConfig = {
    y: 0,
    visible: false,
  };

  const compositingSettings: CompositingSettings = {
    shadowEnabled: input.shadowEnabled ?? DEFAULT_SHADOW_ENABLED,
    occlusionEnabled: input.occlusionEnabled ?? DEFAULT_OCCLUSION_ENABLED,
  };

  return {
    cameraConfig,
    planeConfig,
    compositingSettings,
  };
}
