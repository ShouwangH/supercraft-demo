/**
 * GET /v1/placements/:id
 *
 * Get a placement by ID.
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
    const placement = store.getPlacement(id);

    if (!placement) {
      return NextResponse.json(
        { error: 'Placement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...placement,
      createdAt: placement.createdAt.toISOString(),
      updatedAt: placement.updatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
