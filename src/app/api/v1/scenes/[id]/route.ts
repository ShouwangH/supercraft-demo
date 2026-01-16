/**
 * GET /v1/scenes/:id
 *
 * Get a scene by ID.
 */

import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const scene = store.getScene(id);

    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // Convert dates to ISO strings for JSON response
    return NextResponse.json({
      ...scene,
      createdAt: scene.createdAt.toISOString(),
      updatedAt: scene.updatedAt.toISOString(),
      expiresAt: scene.expiresAt?.toISOString() ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
