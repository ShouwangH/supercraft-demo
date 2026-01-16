/**
 * Image Utilities
 *
 * Client-side image processing for upload.
 */

/** Maximum dimension for working image */
const MAX_DIMENSION = 2048;

/** Supported image MIME types */
const SUPPORTED_TYPES = ['image/jpeg', 'image/png'];

/** Result of image validation */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an image file for upload.
 * Rejects HEIC and unsupported formats.
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check MIME type
  if (!SUPPORTED_TYPES.includes(file.type)) {
    // Check for HEIC by extension
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext === 'heic' || ext === 'heif') {
      return {
        valid: false,
        error: 'HEIC/HEIF files are not supported. Please convert to JPEG or PNG.',
      };
    }
    return {
      valid: false,
      error: `Unsupported file type: ${file.type || 'unknown'}. Please use JPEG or PNG.`,
    };
  }

  // Check file size (max 25MB)
  const maxSize = 25 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 25MB.',
    };
  }

  return { valid: true };
}

/**
 * Load an image file into an HTMLImageElement.
 */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Resize an image to fit within max dimensions while preserving aspect ratio.
 * Also converts to JPEG for consistent format.
 * Returns a Blob and the new dimensions.
 */
export async function processImage(
  file: File
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);

  let { width, height } = img;

  // Calculate new dimensions if needed
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width > height) {
      height = Math.round((height / width) * MAX_DIMENSION);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width / height) * MAX_DIMENSION);
      height = MAX_DIMENSION;
    }
  }

  // Create canvas and draw (handles EXIF orientation in modern browsers)
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(img, 0, 0, width, height);

  // Convert to JPEG blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          reject(new Error('Failed to create blob'));
        }
      },
      'image/jpeg',
      0.9
    );
  });

  return { blob, width, height };
}

/**
 * Get content type string for a file.
 */
export function getContentType(file: File): string {
  return file.type || 'image/jpeg';
}
