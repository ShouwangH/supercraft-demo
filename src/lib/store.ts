/**
 * In-Memory Store
 *
 * Simple Map-based storage for scenes, assets, placements, and exports.
 * Can be swapped for SQLite or other persistence later.
 */

import type { Scene, CommitSceneInput } from '@/types/scene';
import type { Asset3D } from '@/types/asset';
import type { Placement, CreatePlacementInput } from '@/types/placement';
import { generateId } from './id';

/** Current renderer version for placements */
const RENDERER_VERSION = '1.0.0';

/** In-memory storage maps */
const scenes = new Map<string, Scene>();
const assets = new Map<string, Asset3D>();
const placements = new Map<string, Placement>();

/** Demo assets seeded on init */
const DEMO_ASSETS: Asset3D[] = [
  {
    id: 'ast_demo_chair',
    name: 'Modern Chair',
    glbUrl: '/assets/chair.glb',
    units: 'METERS',
    importScale: 1.0,
    pivotMode: 'BOTTOM_CENTER',
    defaultVariants: [],
    thumbnailUrl: '/assets/chair-thumb.png',
    createdAt: new Date(),
  },
  {
    id: 'ast_demo_lamp',
    name: 'Desk Lamp',
    glbUrl: '/assets/lamp.glb',
    units: 'METERS',
    importScale: 1.0,
    pivotMode: 'BOTTOM_CENTER',
    defaultVariants: [],
    thumbnailUrl: '/assets/lamp-thumb.png',
    createdAt: new Date(),
  },
];

/** Initialize demo assets */
function seedAssets(): void {
  if (assets.size === 0) {
    for (const asset of DEMO_ASSETS) {
      assets.set(asset.id, asset);
    }
  }
}

// Seed on module load
seedAssets();

/**
 * Create a new scene with default values.
 */
function createScene(): Scene {
  const now = new Date();
  const scene: Scene = {
    id: generateId('scene'),
    photoOriginalUrl: null,
    photoWorkingUrl: null,
    photoOriginalWidth: null,
    photoOriginalHeight: null,
    photoWorkingWidth: null,
    photoWorkingHeight: null,
    photoExifOrientation: null,
    analysisStatus: 'NOT_STARTED',
    analysisModelVersion: null,
    depthMapUrl: null,
    depthConfidence: null,
    depthQuality: null,
    autoHorizonLine: null,
    autoCameraFovDeg: null,
    calibrationSource: 'AUTO',
    userHorizonLine: null,
    userCameraFovDeg: null,
    userPitchDeg: null,
    createdAt: now,
    updatedAt: now,
    expiresAt: null,
  };

  scenes.set(scene.id, scene);
  return scene;
}

/**
 * Commit a scene after photo upload.
 * Sets the original and working photo URLs.
 * Original URL becomes immutable after this.
 */
function commitScene(sceneId: string, input: CommitSceneInput): Scene {
  const scene = scenes.get(sceneId);
  if (!scene) {
    throw new Error(`Scene not found: ${sceneId}`);
  }

  // Original photo is immutable after first commit
  if (scene.photoOriginalUrl !== null) {
    throw new Error(`Scene ${sceneId} already committed. Original photo is immutable.`);
  }

  const updated: Scene = {
    ...scene,
    photoOriginalUrl: input.photoOriginalUrl,
    photoWorkingUrl: input.photoWorkingUrl,
    photoOriginalWidth: input.width,
    photoOriginalHeight: input.height,
    photoWorkingWidth: input.width,
    photoWorkingHeight: input.height,
    photoExifOrientation: input.exifOrientation ?? null,
    updatedAt: new Date(),
  };

  scenes.set(sceneId, updated);
  return updated;
}

/**
 * Get a scene by ID.
 */
function getScene(sceneId: string): Scene | null {
  return scenes.get(sceneId) ?? null;
}

/**
 * Get all assets.
 */
function getAssets(): Asset3D[] {
  return Array.from(assets.values());
}

/**
 * Get an asset by ID.
 */
function getAsset(assetId: string): Asset3D | null {
  return assets.get(assetId) ?? null;
}

/**
 * Create a new placement.
 */
function createPlacement(input: CreatePlacementInput): Placement {
  const now = new Date();
  const placement: Placement = {
    id: generateId('placement'),
    sceneId: input.sceneId,
    assetId: input.assetId,
    transform: input.transform,
    render: input.render,
    variantId: input.variantId ?? null,
    rendererVersion: RENDERER_VERSION,
    createdAt: now,
    updatedAt: now,
  };

  placements.set(placement.id, placement);
  return placement;
}

/**
 * Get a placement by ID.
 */
function getPlacement(placementId: string): Placement | null {
  return placements.get(placementId) ?? null;
}

/**
 * Update an existing placement.
 */
function updatePlacement(
  placementId: string,
  updates: Partial<CreatePlacementInput>
): Placement {
  const existing = placements.get(placementId);
  if (!existing) {
    throw new Error(`Placement not found: ${placementId}`);
  }

  const updated: Placement = {
    ...existing,
    transform: updates.transform ?? existing.transform,
    render: updates.render ?? existing.render,
    variantId: updates.variantId !== undefined ? updates.variantId ?? null : existing.variantId,
    updatedAt: new Date(),
  };

  placements.set(placementId, updated);
  return updated;
}

/**
 * Clear all data (for testing).
 */
function clear(): void {
  scenes.clear();
  assets.clear();
  placements.clear();
  seedAssets(); // Re-seed demo assets
}

export const store = {
  createScene,
  commitScene,
  getScene,
  getAssets,
  getAsset,
  createPlacement,
  getPlacement,
  updatePlacement,
  clear,
};
