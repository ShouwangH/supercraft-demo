'use client';

/**
 * Export Page
 *
 * Displays the exported composite image with download option.
 * For MVP, this page receives a sceneId and shows a placeholder.
 * Full export compositing will be implemented in PlacementEditor.
 */

import { useRouter, useParams } from 'next/navigation';
import { ExportPreview } from '@/components/ExportPreview';

export default function ExportPage() {
  const router = useRouter();
  const params = useParams();
  const exportId = params.exportId as string;

  // For MVP, show placeholder export preview
  // In full implementation, this would load the export data via API
  const handleDownload = () => {
    // TODO: Implement actual download
    alert('Download functionality coming soon!');
  };

  const handleBack = () => {
    // Navigate back (exportId might be sceneId in current implementation)
    router.push(`/place/${exportId}`);
  };

  return (
    <main className="export-page">
      <h1 className="export-page__title">Export Preview</h1>
      <ExportPreview
        exportUrl={null}
        width={2048}
        height={1536}
        onDownload={handleDownload}
        onBack={handleBack}
      />
      <p className="export-page__note">
        Export compositing will be available in the full implementation.
        Click &quot;Back to Editor&quot; to return.
      </p>
    </main>
  );
}
