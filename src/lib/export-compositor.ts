/**
 * Export Compositor
 *
 * Handles Canvas2D compositing for creating the final export image.
 * Combines photo background with Three.js render.
 */

/** Maximum export width in pixels */
export const MAX_EXPORT_WIDTH = 2048;

/** Input for calculating export dimensions */
export interface ExportDimensionsInput {
  sourceWidth: number;
  sourceHeight: number;
  maxWidth?: number;
}

/** Calculated export dimensions */
export interface ExportDimensions {
  width: number;
  height: number;
  scale: number;
}

/**
 * Calculate export dimensions while preserving aspect ratio.
 * Caps width at maxWidth (default 2048px).
 */
export function calculateExportDimensions(
  input: ExportDimensionsInput
): ExportDimensions {
  const maxWidth = input.maxWidth ?? MAX_EXPORT_WIDTH;
  const { sourceWidth, sourceHeight } = input;

  if (sourceWidth <= maxWidth) {
    return {
      width: sourceWidth,
      height: sourceHeight,
      scale: 1,
    };
  }

  const scale = maxWidth / sourceWidth;
  return {
    width: maxWidth,
    height: Math.round(sourceHeight * scale),
    scale,
  };
}

/**
 * Composite photo and 3D render into a single canvas.
 * Returns a data URL or blob for download.
 */
export async function compositeExport(options: {
  photoUrl: string;
  threeCanvas: HTMLCanvasElement;
  width: number;
  height: number;
}): Promise<Blob> {
  const { photoUrl, threeCanvas, width, height } = options;

  // Create output canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Load and draw photo background
  const photo = await loadImage(photoUrl);
  ctx.drawImage(photo, 0, 0, width, height);

  // Draw Three.js render on top (preserving transparency)
  ctx.drawImage(threeCanvas, 0, 0, width, height);

  // Export as PNG blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Load an image from URL.
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}
