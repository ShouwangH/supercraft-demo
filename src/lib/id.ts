/**
 * ID Generator Utilities
 *
 * Generates prefixed nanoid identifiers for entities.
 * Format: {prefix}_{nanoid} e.g., scn_a1b2c3d4
 */

import { nanoid } from 'nanoid';

/** Entity type prefixes */
export const ID_PREFIX = {
  scene: 'scn',
  asset: 'ast',
  placement: 'plc',
  export: 'exp',
  job: 'job',
} as const;

export type EntityType = keyof typeof ID_PREFIX;

/**
 * Generate a prefixed ID for an entity type.
 * Uses nanoid with default length (21 chars) for uniqueness.
 */
export function generateId(type: EntityType): string {
  const prefix = ID_PREFIX[type];
  const id = nanoid(12); // 12 chars is enough for demo, shorter URLs
  return `${prefix}_${id}`;
}

/**
 * Extract the entity type from a prefixed ID.
 * Returns null if ID format is invalid.
 */
export function getEntityType(id: string): EntityType | null {
  const [prefix] = id.split('_');
  const entry = Object.entries(ID_PREFIX).find(([, p]) => p === prefix);
  return entry ? (entry[0] as EntityType) : null;
}

/**
 * Validate that an ID matches the expected entity type.
 */
export function isValidId(id: string, type: EntityType): boolean {
  const prefix = ID_PREFIX[type];
  return id.startsWith(`${prefix}_`) && id.length > prefix.length + 1;
}
