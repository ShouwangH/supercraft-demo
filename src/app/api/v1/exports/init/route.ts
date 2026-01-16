/**
 * POST /api/v1/exports/init
 *
 * Initialize an export record before uploading the composite image.
 */

import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

interface InitExportBody {
  placementId: string;
  width: number;
  height: number;
  renderSettingsHash: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as InitExportBody;

    // Validate required fields
    if (!body.placementId) {
      return NextResponse.json(
        { error: 'Missing required field: placementId' },
        { status: 400 }
      );
    }

    if (!body.width || !body.height) {
      return NextResponse.json(
        { error: 'Missing required fields: width, height' },
        { status: 400 }
      );
    }

    if (!body.renderSettingsHash) {
      return NextResponse.json(
        { error: 'Missing required field: renderSettingsHash' },
        { status: 400 }
      );
    }

    // Create export record
    const exp = store.createExport({
      placementId: body.placementId,
      width: body.width,
      height: body.height,
      renderSettingsHash: body.renderSettingsHash,
    });

    // Generate upload URL (for MVP, just a placeholder path)
    const uploadUrl = `/api/v1/exports/${exp.id}/upload`;

    return NextResponse.json({
      exportId: exp.id,
      upload: {
        url: uploadUrl,
        method: 'PUT' as const,
        headers: {
          'Content-Type': 'image/png',
        },
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
