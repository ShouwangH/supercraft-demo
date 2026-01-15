/**
 * Render Plan Types
 *
 * A render plan is a pure data structure describing what to render.
 * It's deterministic: same inputs always produce the same plan.
 * Used to ensure preview and export render identically.
 */

/** Camera configuration for the 3D scene */
export interface CameraConfig {
  /** Field of view in degrees (default: 50) */
  fov: number;
  /** Camera pitch in degrees (-15 to +15) */
  pitch: number;
  /** Camera distance along Z axis */
  cameraZ: number;
}

/** Ground plane configuration for shadows */
export interface PlaneConfig {
  /** Y position of the ground plane (always 0) */
  y: number;
  /** Whether the plane is visible (always false, shadow-only) */
  visible: boolean;
}

/** Settings for compositing the final image */
export interface CompositingSettings {
  /** Whether contact shadow is enabled */
  shadowEnabled: boolean;
  /** Whether occlusion masking is enabled */
  occlusionEnabled: boolean;
}

/** Complete render plan for a scene + placement */
export interface RenderPlan {
  cameraConfig: CameraConfig;
  planeConfig: PlaneConfig;
  compositingSettings: CompositingSettings;
}

/** Input parameters for creating a render plan */
export interface RenderPlanInput {
  /** FOV in degrees (optional, defaults to 50) */
  fov?: number;
  /** Camera pitch in degrees */
  pitch: number;
  /** Camera Z distance */
  cameraZ: number;
  /** Shadow enabled (optional, defaults to true) */
  shadowEnabled?: boolean;
  /** Occlusion enabled (optional, defaults to false) */
  occlusionEnabled?: boolean;
}
