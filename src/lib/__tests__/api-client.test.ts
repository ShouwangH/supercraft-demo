import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('initScene', () => {
    it('returns sceneId on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sceneId: 'scn_test123',
          upload: {
            url: '/tmp/uploads/scn_test123/photo.jpg',
            method: 'PUT',
            headers: { 'Content-Type': 'image/jpeg' },
          },
        }),
      });

      const result = await apiClient.initScene('photo.jpg', 'image/jpeg');

      expect(result.sceneId).toMatch(/^scn_/);
      expect(result.upload.url).toBeTruthy();
      expect(result.upload.method).toBe('PUT');
    });

    it('calls correct endpoint with correct body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sceneId: 'scn_test',
          upload: { url: '/test', method: 'PUT', headers: {} },
        }),
      });

      await apiClient.initScene('test.jpg', 'image/jpeg');

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/scenes/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: 'test.jpg',
          contentType: 'image/jpeg',
        }),
      });
    });

    it('throws on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'Invalid request' }),
      });

      await expect(apiClient.initScene('test.gif', 'image/gif'))
        .rejects.toThrow();
    });
  });

  describe('commitScene', () => {
    it('returns scene on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'scn_test',
          photoOriginalUrl: '/original.jpg',
          photoWorkingUrl: '/working.jpg',
        }),
      });

      const result = await apiClient.commitScene('scn_test', {
        photoOriginalUrl: '/original.jpg',
        photoWorkingUrl: '/working.jpg',
        width: 1000,
        height: 800,
      });

      expect(result.id).toBe('scn_test');
      expect(result.photoOriginalUrl).toBe('/original.jpg');
    });

    it('calls correct endpoint', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'scn_abc' }),
      });

      await apiClient.commitScene('scn_abc', {
        photoOriginalUrl: '/orig.jpg',
        photoWorkingUrl: '/work.jpg',
        width: 100,
        height: 100,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/scenes/scn_abc/commit',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('getScene', () => {
    it('returns scene by ID', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 'scn_test',
          analysisStatus: 'NOT_STARTED',
        }),
      });

      const result = await apiClient.getScene('scn_test');

      expect(result).not.toBeNull();
      expect(result!.id).toBe('scn_test');
    });

    it('returns null for 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await apiClient.getScene('scn_nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAssets', () => {
    it('returns assets array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          assets: [
            { id: 'ast_1', name: 'Chair', glbUrl: '/chair.glb' },
            { id: 'ast_2', name: 'Lamp', glbUrl: '/lamp.glb' },
          ],
        }),
      });

      const result = await apiClient.getAssets();

      expect(result.assets).toHaveLength(2);
      expect(result.assets[0].id).toBe('ast_1');
    });
  });
});
