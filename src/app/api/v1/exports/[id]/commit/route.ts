/**
 * POST /api/v1/exports/[id]/commit
 *
 * Commit an export after the image has been uploaded.
 */

import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

interface CommitExportBody {
  url: string;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as CommitExportBody;

    // Validate required fields
    if (!body.url) {
      return NextResponse.json(
        { error: 'Missing required field: url' },
        { status: 400 }
      );
    }

    // Check if export exists
    const existing = store.getExport(id);
    if (!existing) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    // Commit the export
    const exp = store.commitExport(id, { url: body.url });

    return NextResponse.json({
      id: exp.id,
      placementId: exp.placementId,
      url: exp.url,
      width: exp.width,
      height: exp.height,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
