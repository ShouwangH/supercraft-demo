import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as createPlacement } from '../v1/placements/route';
import { GET as getPlacement } from '../v1/placements/[id]/route';
import { store } from '@/lib/store';

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/placements', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const validTransform = {
  position: [0, 0, -3] as [number, number, number],
  rotation: [0, 0, 0, 1] as [number, number, number, number],
  scale: [1, 1, 1] as [number, number, number],
};

const validRender = {
  shadowEnabled: true,
  occlusionEnabled: false,
  occlusionDilatePx: 4,
  occlusionFeatherPx: 3,
};

describe('POST /v1/placements', () => {
  beforeEach(() => {
    store.clear();
  });

  it('creates placement with correct prefix', async () => {
    const scene = store.createScene();
    store.commitScene(scene.id, {
      photoOriginalUrl: '/original.jpg',
      photoWorkingUrl: '/working.jpg',
      width: 100,
      height: 100,
    });

    const request = createRequest({
      sceneId: scene.id,
      assetId: 'ast_demo_chair',
      transform: validTransform,
      render: validRender,
    });

    const response = await createPlacement(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.placementId).toMatch(/^plc_/);
  });

  it('returns 404 for non-existent scene', async () => {
    const request = createRequest({
      sceneId: 'scn_nonexistent',
      assetId: 'ast_demo_chair',
      transform: validTransform,
      render: validRender,
    });

    const response = await createPlacement(request);
    expect(response.status).toBe(404);
  });

  it('returns 404 for non-existent asset', async () => {
    const scene = store.createScene();

    const request = createRequest({
      sceneId: scene.id,
      assetId: 'ast_nonexistent',
      transform: validTransform,
      render: validRender,
    });

    const response = await createPlacement(request);
    expect(response.status).toBe(404);
  });

  it('validates transform structure', async () => {
    const scene = store.createScene();

    const request = createRequest({
      sceneId: scene.id,
      assetId: 'ast_demo_chair',
      transform: {
        position: [0, 0], // Invalid: only 2 elements
        rotation: [0, 0, 0, 1],
        scale: [1, 1, 1],
      },
      render: validRender,
    });

    const response = await createPlacement(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /v1/placements/:id', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns exact same transform values as POST', async () => {
    const scene = store.createScene();
    store.commitScene(scene.id, {
      photoOriginalUrl: '/original.jpg',
      photoWorkingUrl: '/working.jpg',
      width: 100,
      height: 100,
    });

    // Create placement
    const createReq = createRequest({
      sceneId: scene.id,
      assetId: 'ast_demo_chair',
      transform: {
        position: [1.5, 0, -3.2],
        rotation: [0, 0.707, 0, 0.707],
        scale: [1.2, 1.2, 1.2],
      },
      render: validRender,
    });

    const createRes = await createPlacement(createReq);
    const createData = await createRes.json();

    // Get placement
    const getReq = new NextRequest(
      `http://localhost:3000/api/v1/placements/${createData.placementId}`
    );
    const getRes = await getPlacement(getReq, {
      params: Promise.resolve({ id: createData.placementId }),
    });
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.transform.position).toEqual([1.5, 0, -3.2]);
    expect(getData.transform.rotation).toEqual([0, 0.707, 0, 0.707]);
    expect(getData.transform.scale).toEqual([1.2, 1.2, 1.2]);
  });

  it('returns 404 for non-existent placement', async () => {
    const request = new NextRequest(
      'http://localhost:3000/api/v1/placements/plc_nonexistent'
    );

    const response = await getPlacement(request, {
      params: Promise.resolve({ id: 'plc_nonexistent' }),
    });

    expect(response.status).toBe(404);
  });

  it('includes all placement fields', async () => {
    const scene = store.createScene();
    const placement = store.createPlacement({
      sceneId: scene.id,
      assetId: 'ast_demo_chair',
      transform: validTransform,
      render: validRender,
    });

    const request = new NextRequest(
      `http://localhost:3000/api/v1/placements/${placement.id}`
    );
    const response = await getPlacement(request, {
      params: Promise.resolve({ id: placement.id }),
    });
    const data = await response.json();

    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('sceneId');
    expect(data).toHaveProperty('assetId');
    expect(data).toHaveProperty('transform');
    expect(data).toHaveProperty('render');
    expect(data).toHaveProperty('rendererVersion');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
  });
});
