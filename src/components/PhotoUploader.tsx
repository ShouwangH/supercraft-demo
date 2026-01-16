'use client';

/**
 * PhotoUploader Component
 *
 * Drag-and-drop photo upload with validation and processing.
 */

import { useState, useCallback, useRef } from 'react';
import { UploadProgress, type UploadStatus } from './UploadProgress';
import { validateImageFile, processImage } from '@/lib/image-utils';
import { apiClient } from '@/lib/api-client';

export interface PhotoUploaderProps {
  // eslint-disable-next-line no-unused-vars
  onComplete: (sceneId: string) => void;
}

async function uploadPhoto(file: File): Promise<string> {
  const { sceneId } = await apiClient.initScene(
    file.name,
    file.type || 'image/jpeg'
  );

  const { blob, width, height } = await processImage(file);
  const photoUrl = URL.createObjectURL(blob);

  await apiClient.commitScene(sceneId, {
    photoOriginalUrl: photoUrl,
    photoWorkingUrl: photoUrl,
    width,
    height,
  });

  return sceneId;
}

export function PhotoUploader({ onComplete }: PhotoUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setStatus('error');
      setError(validation.error);
      return;
    }

    try {
      setStatus('uploading');
      setError(undefined);

      setStatus('processing');
      const sceneId = await uploadPhoto(file);

      setStatus('complete');
      setTimeout(() => onComplete(sceneId), 500);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Upload failed');
    }
  }, [onComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = useCallback(() => fileInputRef.current?.click(), []);
  const handleRetry = useCallback(() => {
    setStatus('idle');
    setError(undefined);
  }, []);

  const isDisabled = status === 'uploading' || status === 'processing';
  const dropzoneClass = `photo-uploader__dropzone${isDragging ? ' photo-uploader__dropzone--dragging' : ''}${isDisabled ? ' photo-uploader__dropzone--disabled' : ''}`;

  return (
    <div className="photo-uploader">
      <div
        className={dropzoneClass}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={isDisabled ? undefined : handleClick}
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-label="Upload photo"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          disabled={isDisabled}
          className="photo-uploader__input"
          aria-hidden="true"
        />
        {status === 'idle' && (
          <p className="photo-uploader__hint">Drop a photo here or click to browse</p>
        )}
        {status !== 'idle' && (
          <UploadProgress status={status} error={error} onRetry={handleRetry} />
        )}
      </div>
    </div>
  );
}
