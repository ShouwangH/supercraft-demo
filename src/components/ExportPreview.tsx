'use client';

/**
 * ExportPreview Component
 *
 * Displays the exported image with download button.
 */

import { useState } from 'react';

export interface ExportPreviewProps {
  exportUrl: string | null;
  width: number;
  height: number;
  onDownload: () => void;
  onBack: () => void;
}

export function ExportPreview({
  exportUrl,
  width,
  height,
  onDownload,
  onBack,
}: ExportPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!exportUrl) {
    return (
      <div className="export-preview export-preview--loading">
        <p>Generating export...</p>
      </div>
    );
  }

  return (
    <div className="export-preview">
      <div className="export-preview__image-container">
        {!imageLoaded && (
          <div className="export-preview__placeholder">Loading image...</div>
        )}
        <img
          src={exportUrl}
          alt="Exported composite"
          className="export-preview__image"
          onLoad={() => setImageLoaded(true)}
          style={{
            display: imageLoaded ? 'block' : 'none',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </div>

      <div className="export-preview__info">
        <span className="export-preview__dimensions">
          {width} × {height}
        </span>
      </div>

      <div className="export-preview__actions">
        <button
          type="button"
          onClick={onBack}
          className="export-preview__button export-preview__button--secondary"
        >
          Back to Editor
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="export-preview__button export-preview__button--primary"
        >
          Download
        </button>
      </div>
    </div>
  );
}
