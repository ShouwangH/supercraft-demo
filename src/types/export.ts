/**
 * Export Types
 *
 * A single exported artifact (composite image).
 */

/** Export type (image format) */
export type ExportType = 'image/png' | 'image/jpeg';

/** Export entity */
export interface Export {
  id: string;
  placementId: string;
  type: ExportType;
  url: string | null;
  width: number;
  height: number;
  renderSettingsHash: string;
  createdAt: Date;
}

/** Input for initializing an export */
export interface ExportInitInput {
  placementId: string;
  width: number;
  height: number;
  renderSettingsHash: string;
}

/** Response from export init */
export interface ExportInitResponse {
  exportId: string;
  upload: {
    url: string;
    method: 'PUT';
    headers: Record<string, string>;
  };
}

/** Input for committing an export */
export interface ExportCommitInput {
  url: string;
}
