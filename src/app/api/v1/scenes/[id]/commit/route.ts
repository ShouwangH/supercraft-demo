/**
 * POST /v1/scenes/:id/commit
 *
 * Commit a scene after photo upload.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { store } from '@/lib/store';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const RequestSchema = z.object({
  photoOriginalUrl: z.string().min(1),
  photoWorkingUrl: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  exifOrientation: z.number().int().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const scene = store.getScene(id);
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    try {
      const updated = store.commitScene(id, parsed.data);
      return NextResponse.json({
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        expiresAt: updated.expiresAt?.toISOString() ?? null,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Commit failed';
      return NextResponse.json(
        { error: message },
        { status: 409 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
