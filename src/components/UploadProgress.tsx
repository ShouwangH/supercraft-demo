'use client';

/**
 * UploadProgress Component
 *
 * Displays upload progress and status messages.
 */

export type UploadStatus = 'idle' | 'uploading' | 'processing' | 'complete' | 'error';

export interface UploadProgressProps {
  status: UploadStatus;
  error?: string;
  onRetry?: () => void;
}

const STATUS_MESSAGES: Record<UploadStatus, string> = {
  idle: 'Ready to upload',
  uploading: 'Uploading photo...',
  processing: 'Processing image...',
  complete: 'Upload complete!',
  error: 'Upload failed',
};

export function UploadProgress({ status, error, onRetry }: UploadProgressProps) {
  return (
    <div className="upload-progress" data-status={status}>
      <p className="upload-progress__message">
        {STATUS_MESSAGES[status]}
      </p>

      {status === 'error' && error && (
        <p className="upload-progress__error">{error}</p>
      )}

      {status === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="upload-progress__retry"
        >
          Try Again
        </button>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="upload-progress__spinner" aria-label="Loading" />
      )}
    </div>
  );
}
