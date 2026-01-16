import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '@/lib/store';

describe('POST /api/v1/exports/init', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns exportId with correct prefix', async () => {
    const { POST } = await import('../v1/exports/init/route');

    const request = new Request('http://localhost/api/v1/exports/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placementId: 'plc_test123',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'abc123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.exportId).toMatch(/^exp_/);
  });

  it('returns upload object with PUT method', async () => {
    const { POST } = await import('../v1/exports/init/route');

    const request = new Request('http://localhost/api/v1/exports/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placementId: 'plc_test',
        width: 1920,
        height: 1080,
        renderSettingsHash: 'hash',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(data.upload).toBeDefined();
    expect(data.upload.method).toBe('PUT');
    expect(data.upload.url).toBeTruthy();
  });

  it('returns 400 for missing placementId', async () => {
    const { POST } = await import('../v1/exports/init/route');

    const request = new Request('http://localhost/api/v1/exports/init', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        width: 2048,
        height: 1536,
        renderSettingsHash: 'hash',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});

describe('POST /api/v1/exports/[id]/commit', () => {
  beforeEach(() => {
    store.clear();
  });

  it('stores the export URL', async () => {
    // Create an export first
    const exp = store.createExport({
      placementId: 'plc_test',
      width: 2048,
      height: 1536,
      renderSettingsHash: 'hash',
    });

    const { POST } = await import('../v1/exports/[id]/commit/route');

    const request = new Request(
      `http://localhost/api/v1/exports/${exp.id}/commit`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '/exports/final.png' }),
      }
    );

    const response = await POST(request, { params: Promise.resolve({ id: exp.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.url).toBe('/exports/final.png');
  });

  it('returns 404 for non-existent export', async () => {
    const { POST } = await import('../v1/exports/[id]/commit/route');

    const request = new Request(
      'http://localhost/api/v1/exports/exp_nonexistent/commit',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: '/exports/test.png' }),
      }
    );

    const response = await POST(request, { params: Promise.resolve({ id: 'exp_nonexistent' }) });
    expect(response.status).toBe(404);
  });
});

describe('GET /api/v1/exports/[id]', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns export by ID', async () => {
    const exp = store.createExport({
      placementId: 'plc_test',
      width: 2048,
      height: 1536,
      renderSettingsHash: 'hash',
    });
    store.commitExport(exp.id, { url: '/exports/final.png' });

    const { GET } = await import('../v1/exports/[id]/route');

    const request = new Request(`http://localhost/api/v1/exports/${exp.id}`);
    const response = await GET(request, { params: Promise.resolve({ id: exp.id }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.id).toBe(exp.id);
    expect(data.url).toBe('/exports/final.png');
    expect(data.placementId).toBe('plc_test');
  });

  it('returns 404 for non-existent export', async () => {
    const { GET } = await import('../v1/exports/[id]/route');

    const request = new Request(
      'http://localhost/api/v1/exports/exp_nonexistent'
    );
    const response = await GET(request, { params: Promise.resolve({ id: 'exp_nonexistent' }) });

    expect(response.status).toBe(404);
  });
});
