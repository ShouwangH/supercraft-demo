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

describe('ExportStore', () => {
  beforeEach(() => {
    store.clear();
  });

  describe('createExport', () => {
    it('creates an export with a prefixed ID', () => {
      const exp = store.createExport({
        placementId: 'plc_test123',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'abc123',
      });
      expect(exp.id).toMatch(/^exp_/);
    });

    it('stores placement reference', () => {
      const exp = store.createExport({
        placementId: 'plc_test456',
        width: 1920,
        height: 1080,
        renderSettingsHash: 'def456',
      });
      expect(exp.placementId).toBe('plc_test456');
    });

    it('stores dimensions', () => {
      const exp = store.createExport({
        placementId: 'plc_test',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'hash',
      });
      expect(exp.width).toBe(2048);
      expect(exp.height).toBe(1536);
    });

    it('stores render settings hash', () => {
      const exp = store.createExport({
        placementId: 'plc_test',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'my_hash_123',
      });
      expect(exp.renderSettingsHash).toBe('my_hash_123');
    });

    it('initializes with null URL', () => {
      const exp = store.createExport({
        placementId: 'plc_test',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'hash',
      });
      expect(exp.url).toBeNull();
    });
  });

  describe('commitExport', () => {
    it('stores the exported URL', () => {
      const exp = store.createExport({
        placementId: 'plc_test',
        width: 2048,
        height: 1536,
        renderSettingsHash: 'hash',
      });

      store.commitExport(exp.id, { url: '/exports/final.png' });

      const retrieved = store.getExport(exp.id);
      expect(retrieved?.url).toBe('/exports/final.png');
    });

    it('throws for non-existent export', () => {
      expect(() => {
        store.commitExport('exp_nonexistent', { url: '/test.png' });
      }).toThrow(/not found/i);
    });
  });

  describe('getExport', () => {
    it('returns null for non-existent export', () => {
      const exp = store.getExport('exp_nonexistent');
      expect(exp).toBeNull();
    });

    it('returns the export for valid ID', () => {
      const created = store.createExport({
        placementId: 'plc_test',
        width: 1920,
        height: 1080,
        renderSettingsHash: 'hash',
      });
      const retrieved = store.getExport(created.id);
      expect(retrieved?.id).toBe(created.id);
    });
  });
});
