/**
 * GET /api/v1/exports/[id]
 *
 * Get an export by ID.
 */

import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const exp = store.getExport(id);
    if (!exp) {
      return NextResponse.json({ error: 'Export not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: exp.id,
      placementId: exp.placementId,
      type: exp.type,
      url: exp.url,
      width: exp.width,
      height: exp.height,
      renderSettingsHash: exp.renderSettingsHash,
      createdAt: exp.createdAt.toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
