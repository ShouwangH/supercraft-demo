/**
 * POST /v1/placements
 *
 * Create a new placement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { store } from '@/lib/store';
import type { PlacementResponse } from '@/types/placement';

const TransformSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  scale: z.tuple([z.number(), z.number(), z.number()]),
});

const RenderSchema = z.object({
  shadowEnabled: z.boolean(),
  occlusionEnabled: z.boolean(),
  occlusionDilatePx: z.number().int().min(0).default(4),
  occlusionFeatherPx: z.number().int().min(0).default(3),
});

const RequestSchema = z.object({
  sceneId: z.string().startsWith('scn_'),
  assetId: z.string().startsWith('ast_'),
  transform: TransformSchema,
  render: RenderSchema,
  variantId: z.string().optional(),
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

    const { sceneId, assetId } = parsed.data;

    // Verify scene exists
    const scene = store.getScene(sceneId);
    if (!scene) {
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    // Verify asset exists
    const asset = store.getAsset(assetId);
    if (!asset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    const placement = store.createPlacement(parsed.data);

    const response: PlacementResponse = {
      placementId: placement.id,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
