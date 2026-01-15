import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getAssets } from '../v1/assets/route';
import { store } from '@/lib/store';

describe('GET /v1/assets', () => {
  beforeEach(() => {
    store.clear();
  });

  it('returns assets array', async () => {
    const response = await getAssets();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.assets).toBeDefined();
    expect(Array.isArray(data.assets)).toBe(true);
  });

  it('returns seeded demo assets', async () => {
    const response = await getAssets();
    const data = await response.json();

    expect(data.assets.length).toBeGreaterThan(0);
  });

  it('assets have required fields', async () => {
    const response = await getAssets();
    const data = await response.json();

    for (const asset of data.assets) {
      expect(asset.id).toMatch(/^ast_/);
      expect(asset.name).toBeTruthy();
      expect(asset.glbUrl).toBeTruthy();
      expect(asset).toHaveProperty('thumbnailUrl');
    }
  });

  it('does not expose internal fields', async () => {
    const response = await getAssets();
    const data = await response.json();

    for (const asset of data.assets) {
      // These fields should not be in the list response
      expect(asset).not.toHaveProperty('units');
      expect(asset).not.toHaveProperty('importScale');
      expect(asset).not.toHaveProperty('pivotMode');
    }
  });
});
