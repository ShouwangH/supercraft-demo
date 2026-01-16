/**
 * Export Hash Utility
 *
 * Creates a deterministic hash from render plan inputs.
 * Used to detect if export settings have changed.
 */

import type { RenderPlanInput } from '@/types/render-plan';

/**
 * Create a deterministic hash from render plan input.
 * Same inputs always produce the same hash.
 */
export function createExportHash(input: RenderPlanInput): string {
  // Normalize undefined values to ensure consistency
  const normalized = {
    fov: input.fov ?? 50, // Use default if undefined
    pitch: input.pitch,
    cameraZ: input.cameraZ,
    shadowEnabled: input.shadowEnabled ?? true,
    occlusionEnabled: input.occlusionEnabled ?? false,
  };

  // Create a stable JSON string (keys in fixed order)
  const json = JSON.stringify([
    normalized.fov,
    normalized.pitch,
    normalized.cameraZ,
    normalized.shadowEnabled,
    normalized.occlusionEnabled,
  ]);

  // Simple hash function (djb2 algorithm)
  let hash = 5381;
  for (let i = 0; i < json.length; i++) {
    hash = (hash * 33) ^ json.charCodeAt(i);
  }

  // Convert to hex string
  return (hash >>> 0).toString(16).padStart(8, '0');
}
