/**
 * Scene Types
 *
 * A Scene represents a single background photo plus derived analysis
 * and user calibration for 3D placement.
 */

/** Analysis processing status */
export type AnalysisStatus = 'NOT_STARTED' | 'RUNNING' | 'DONE' | 'FAILED';

/** Depth quality derived from confidence */
export type DepthQuality = 'LOW' | 'MED' | 'HIGH';

/** Source of calibration data */
export type CalibrationSource = 'AUTO' | 'USER' | 'AUTO_PLUS_USER';

/** Normalized line coordinates (0-1 range) */
export interface NormalizedLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Scene entity */
export interface Scene {
  id: string;

  // Photo URLs - original is immutable after commit
  photoOriginalUrl: string | null;
  photoWorkingUrl: string | null;

  // Photo dimensions
  photoOriginalWidth: number | null;
  photoOriginalHeight: number | null;
  photoWorkingWidth: number | null;
  photoWorkingHeight: number | null;

  // EXIF data
  photoExifOrientation: number | null;

  // Analysis state
  analysisStatus: AnalysisStatus;
  analysisModelVersion: string | null;

  // Depth map outputs (nullable until analysis complete)
  depthMapUrl: string | null;
  depthConfidence: number | null;
  depthQuality: DepthQuality | null;

  // Auto-derived calibration (from analysis)
  autoHorizonLine: NormalizedLine | null;
  autoCameraFovDeg: number | null;

  // User calibration overrides
  calibrationSource: CalibrationSource;
  userHorizonLine: NormalizedLine | null;
  userCameraFovDeg: number | null;
  userPitchDeg: number | null;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date | null;
}

/** Input for creating a new scene */
export interface CreateSceneInput {
  fileName: string;
  contentType: string;
}

/** Input for committing a scene after photo upload */
export interface CommitSceneInput {
  photoOriginalUrl: string;
  photoWorkingUrl: string;
  width: number;
  height: number;
  exifOrientation?: number;
}

/** Response from scene init */
export interface SceneInitResponse {
  sceneId: string;
  upload: {
    url: string;
    method: 'PUT';
    headers: Record<string, string>;
  };
}
