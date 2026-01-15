/**
 * GET /v1/assets
 *
 * List all available 3D assets.
 */

import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import type { AssetListResponse } from '@/types/asset';

export async function GET(): Promise<NextResponse> {
  try {
    const assets = store.getAssets();

    const response: AssetListResponse = {
      assets: assets.map((asset) => ({
        id: asset.id,
        name: asset.name,
        glbUrl: asset.glbUrl,
        thumbnailUrl: asset.thumbnailUrl,
      })),
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
