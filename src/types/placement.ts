/**
 * Placement Types
 *
 * One instance of an asset placed in a scene.
 */

/** 3D position as [x, y, z] */
export type Position3D = [number, number, number];

/** Quaternion rotation as [x, y, z, w] */
export type Quaternion = [number, number, number, number];

/** 3D scale as [x, y, z] */
export type Scale3D = [number, number, number];

/** Transform for placement */
export interface PlacementTransform {
  position: Position3D;
  rotation: Quaternion;
  scale: Scale3D;
}

/** Render settings for placement */
export interface PlacementRenderSettings {
  shadowEnabled: boolean;
  occlusionEnabled: boolean;
  occlusionDilatePx: number;
  occlusionFeatherPx: number;
}

/** Placement entity */
export interface Placement {
  id: string;
  sceneId: string;
  assetId: string;
  transform: PlacementTransform;
  render: PlacementRenderSettings;
  variantId: string | null;
  rendererVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Input for creating a placement */
export interface CreatePlacementInput {
  sceneId: string;
  assetId: string;
  transform: PlacementTransform;
  render: PlacementRenderSettings;
  variantId?: string;
}

/** Response from placement creation */
export interface PlacementResponse {
  placementId: string;
}
