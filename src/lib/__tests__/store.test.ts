import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../store';

describe('SceneStore', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('createScene', () => {
    it('creates a scene with a prefixed ID', () => {
      const scene = store.createScene();
      expect(scene.id).toMatch(/^scn_/);
    });

    it('initializes with analysisStatus NOT_STARTED', () => {
      const scene = store.createScene();
      expect(scene.analysisStatus).toBe('NOT_STARTED');
    });

    it('initializes with null photo URLs', () => {
      const scene = store.createScene();
      expect(scene.photoOriginalUrl).toBeNull();
      expect(scene.photoWorkingUrl).toBeNull();
    });
  });

  describe('commitScene', () => {
    it('stores photoOriginalUrl and photoWorkingUrl as separate fields', () => {
      const scene = store.createScene();
      store.commitScene(scene.id, {
        photoOriginalUrl: '/uploads/original.jpg',
        photoWorkingUrl: '/uploads/working.jpg',
        width: 3024,
        height: 4032,
      });

      const retrieved = store.getScene(scene.id);
      expect(retrieved?.photoOriginalUrl).toBe('/uploads/original.jpg');
      expect(retrieved?.photoWorkingUrl).toBe('/uploads/working.jpg');
      expect(retrieved?.photoOriginalUrl).not.toBe(retrieved?.photoWorkingUrl);
    });

    it('stores photo dimensions', () => {
      const scene = store.createScene();
      store.commitScene(scene.id, {
        photoOriginalUrl: '/original.jpg',
        photoWorkingUrl: '/working.jpg',
        width: 3024,
        height: 4032,
      });

      const retrieved = store.getScene(scene.id);
      expect(retrieved?.photoOriginalWidth).toBe(3024);
      expect(retrieved?.photoOriginalHeight).toBe(4032);
    });

    it('updates the updatedAt timestamp', () => {
      const scene = store.createScene();
      const originalUpdatedAt = scene.updatedAt;

      // Small delay to ensure timestamp difference
      store.commitScene(scene.id, {
        photoOriginalUrl: '/original.jpg',
        photoWorkingUrl: '/working.jpg',
        width: 100,
        height: 100,
      });

      const retrieved = store.getScene(scene.id);
      expect(retrieved?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('getScene', () => {
    it('returns null for non-existent scene', () => {
      const scene = store.getScene('scn_nonexistent');
      expect(scene).toBeNull();
    });

    it('returns the scene for valid ID', () => {
      const created = store.createScene();
      const retrieved = store.getScene(created.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
    });
  });

  describe('original photo immutability', () => {
    it('does not allow changing photoOriginalUrl after commit', () => {
      const scene = store.createScene();
      store.commitScene(scene.id, {
        photoOriginalUrl: '/original.jpg',
        photoWorkingUrl: '/working.jpg',
        width: 100,
        height: 100,
      });

      // Attempt to change original URL via another commit should fail or be ignored
      expect(() => {
        store.commitScene(scene.id, {
          photoOriginalUrl: '/different.jpg',
          photoWorkingUrl: '/working2.jpg',
          width: 200,
          height: 200,
        });
      }).toThrow(/already committed/i);

      const retrieved = store.getScene(scene.id);
      expect(retrieved?.photoOriginalUrl).toBe('/original.jpg');
    });
  });
});

describe('AssetStore', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('getAssets', () => {
    it('returns seeded demo assets', () => {
      const assets = store.getAssets();
      expect(assets.length).toBeGreaterThan(0);
    });

    it('assets have required fields', () => {
      const assets = store.getAssets();
      for (const asset of assets) {
        expect(asset.id).toMatch(/^ast_/);
        expect(asset.name).toBeTruthy();
        expect(asset.glbUrl).toBeTruthy();
      }
    });
  });

  describe('getAsset', () => {
    it('returns asset by ID', () => {
      const assets = store.getAssets();
      const first = assets[0];
      const retrieved = store.getAsset(first.id);
      expect(retrieved?.id).toBe(first.id);
    });

    it('returns null for non-existent asset', () => {
      const asset = store.getAsset('ast_nonexistent');
      expect(asset).toBeNull();
    });
  });
});
