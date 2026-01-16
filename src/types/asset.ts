/**
 * Asset3D Types
 *
 * A curated 3D product model (GLB format).
 */

/** Units for the 3D model */
export type AssetUnits = 'METERS' | 'CENTIMETERS' | 'UNKNOWN';

/** Pivot mode for asset placement */
export type PivotMode = 'BOTTOM_CENTER';

/** Material variant for an asset */
export interface AssetVariant {
  id: string;
  label: string;
  materialParams: Record<string, unknown>;
}

/** Asset3D entity */
export interface Asset3D {
  id: string;
  name: string;
  glbUrl: string;
  units: AssetUnits;
  importScale: number;
  pivotMode: PivotMode;
  defaultVariants: AssetVariant[];
  thumbnailUrl: string | null;
  createdAt: Date;
}

/** Asset list response */
export interface AssetListResponse {
  assets: Array<{
    id: string;
    name: string;
    glbUrl: string;
    thumbnailUrl: string | null;
  }>;
}
