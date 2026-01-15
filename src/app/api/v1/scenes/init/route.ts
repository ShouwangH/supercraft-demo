/**
 * POST /v1/scenes/init
 *
 * Initialize a new scene and get a signed upload URL.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { store } from '@/lib/store';
import type { SceneInitResponse } from '@/types/scene';

const RequestSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().regex(/^image\/(jpeg|png)$/),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { fileName, contentType } = parsed.data;
    const scene = store.createScene();

    // Mock signed upload URL (local storage for demo)
    const uploadUrl = `/tmp/uploads/${scene.id}/${fileName}`;

    const response: SceneInitResponse = {
      sceneId: scene.id,
      upload: {
        url: uploadUrl,
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
