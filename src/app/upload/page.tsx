'use client';

/**
 * Upload Page
 *
 * First step in the flow: upload a photo to create a scene.
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { PhotoUploader } from '@/components/PhotoUploader';

export default function UploadPage() {
  const router = useRouter();

  const handleComplete = useCallback((sceneId: string) => {
    router.push(`/place/${sceneId}`);
  }, [router]);

  return (
    <main className="upload-page">
      <div className="upload-page__container">
        <h1 className="upload-page__title">Upload a Photo</h1>
        <p className="upload-page__subtitle">
          Start by uploading a photo of your space
        </p>

        <PhotoUploader onComplete={handleComplete} />

        <p className="upload-page__hint">
          Supported formats: JPEG, PNG (max 25MB)
        </p>
      </div>
    </main>
  );
}
