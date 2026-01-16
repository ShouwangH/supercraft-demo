'use client';

/**
 * Placement Page
 *
 * Main editor page for placing a 3D product in a photo.
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PlacementEditor } from '@/components/PlacementEditor';
import { apiClient } from '@/lib/api-client';

interface SceneData {
  photoWorkingUrl: string;
}

export default function PlacementPage() {
  const router = useRouter();
  const params = useParams();
  const sceneId = params.sceneId as string;

  const [scene, setScene] = useState<SceneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadScene() {
      try {
        const data = await apiClient.getScene(sceneId);
        if (!data) {
          setError('Scene not found');
          return;
        }
        setScene({
          photoWorkingUrl: data.photoWorkingUrl as string,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scene');
      } finally {
        setLoading(false);
      }
    }

    loadScene();
  }, [sceneId]);

  const handleExport = () => {
    // TODO: Implement export in PR6
    router.push(`/export/${sceneId}`);
  };

  if (loading) {
    return (
      <main className="place-page place-page--loading">
        <p>Loading scene...</p>
      </main>
    );
  }

  if (error || !scene) {
    return (
      <main className="place-page place-page--error">
        <p>{error || 'Failed to load scene'}</p>
        <button onClick={() => router.push('/upload')}>
          Upload New Photo
        </button>
      </main>
    );
  }

  // Use demo asset for now - will be selectable in future
  const demoAssetUrl = '/assets/chair.glb';

  return (
    <main className="place-page">
      <PlacementEditor
        sceneId={sceneId}
        photoUrl={scene.photoWorkingUrl}
        assetUrl={demoAssetUrl}
        onExport={handleExport}
      />
    </main>
  );
}
