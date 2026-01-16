import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as initScene } from '../v1/scenes/init/route';
import { GET as getScene } from '../v1/scenes/[id]/route';
import { POST as commitScene } from '../v1/scenes/[id]/commit/route';
import { store } from '@/lib/store';

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /v1/scenes/init', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns sceneId with correct prefix', async () => {
    const request = createRequest({
      fileName: 'test.jpg',
      contentType: 'image/jpeg',
    });

    const response = await initScene(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.sceneId).toMatch(/^scn_/);
  });

  it('returns upload object with url and method', async () => {
    const request = createRequest({
      fileName: 'photo.jpg',
      contentType: 'image/jpeg',
    });

    const response = await initScene(request);
    const data = await response.json();

    expect(data.upload).toBeDefined();
    expect(data.upload.url).toBeTruthy();
    expect(data.upload.method).toBe('PUT');
    expect(data.upload.headers['Content-Type']).toBe('image/jpeg');
  });

  it('rejects invalid content type', async () => {
    const request = createRequest({
      fileName: 'test.gif',
      contentType: 'image/gif',
    });

    const response = await initScene(request);
    expect(response.status).toBe(400);
  });

  it('rejects empty fileName', async () => {
    const request = createRequest({
      fileName: '',
      contentType: 'image/jpeg',
    });

    const response = await initScene(request);
    expect(response.status).toBe(400);
  });
});

describe('GET /v1/scenes/:id', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns scene for valid ID', async () => {
    const scene = store.createScene();
    const request = new NextRequest(`http://localhost:3000/api/v1/scenes/${scene.id}`);

    const response = await getScene(request, { params: Promise.resolve({ id: scene.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(scene.id);
  });

  it('returns 404 for non-existent scene', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/scenes/scn_nonexistent');

    const response = await getScene(request, { params: Promise.resolve({ id: 'scn_nonexistent' }) });

    expect(response.status).toBe(404);
  });

  it('includes all scene fields', async () => {
    const scene = store.createScene();
    const request = new NextRequest(`http://localhost:3000/api/v1/scenes/${scene.id}`);

    const response = await getScene(request, { params: Promise.resolve({ id: scene.id }) });
    const data = await response.json();

    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('photoOriginalUrl');
    expect(data).toHaveProperty('photoWorkingUrl');
    expect(data).toHaveProperty('analysisStatus');
    expect(data).toHaveProperty('createdAt');
    expect(data).toHaveProperty('updatedAt');
  });
});

describe('POST /v1/scenes/:id/commit', () => {
  beforeEach(() => {
    store.clear();
  });

  it('commits scene with photo URLs', async () => {
    const scene = store.createScene();
    const request = createRequest({
      photoOriginalUrl: '/uploads/original.jpg',
      photoWorkingUrl: '/uploads/working.jpg',
      width: 3024,
      height: 4032,
    });

    const response = await commitScene(request, { params: Promise.resolve({ id: scene.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.photoOriginalUrl).toBe('/uploads/original.jpg');
    expect(data.photoWorkingUrl).toBe('/uploads/working.jpg');
  });

  it('returns 404 for non-existent scene', async () => {
    const request = createRequest({
      photoOriginalUrl: '/original.jpg',
      photoWorkingUrl: '/working.jpg',
      width: 100,
      height: 100,
    });

    const response = await commitScene(request, { params: Promise.resolve({ id: 'scn_nonexistent' }) });

    expect(response.status).toBe(404);
  });

  it('returns 409 when committing already committed scene', async () => {
    const scene = store.createScene();

    // First commit
    const request1 = createRequest({
      photoOriginalUrl: '/original.jpg',
      photoWorkingUrl: '/working.jpg',
      width: 100,
      height: 100,
    });
    await commitScene(request1, { params: Promise.resolve({ id: scene.id }) });

    // Second commit should fail
    const request2 = createRequest({
      photoOriginalUrl: '/different.jpg',
      photoWorkingUrl: '/working2.jpg',
      width: 200,
      height: 200,
    });
    const response = await commitScene(request2, { params: Promise.resolve({ id: scene.id }) });

    expect(response.status).toBe(409);
  });
});
