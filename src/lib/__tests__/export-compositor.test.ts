import { describe, it, expect } from 'vitest';
import { calculateExportDimensions, type ExportDimensionsInput } from '../export-compositor';

describe('calculateExportDimensions', () => {
  it('preserves aspect ratio when width exceeds max', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 4000,
      sourceHeight: 3000,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(2048);
    expect(result.height).toBe(1536); // 2048 * (3000/4000)
    expect(result.width / result.height).toBeCloseTo(4000 / 3000);
  });

  it('preserves dimensions when width is under max', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 1920,
      sourceHeight: 1080,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(1920);
    expect(result.height).toBe(1080);
  });

  it('handles portrait orientation', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 3000,
      sourceHeight: 4000,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(2048);
    expect(result.height).toBe(Math.round(2048 * (4000 / 3000)));
    expect(result.width / result.height).toBeCloseTo(3000 / 4000);
  });

  it('handles square images', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 3000,
      sourceHeight: 3000,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(2048);
    expect(result.height).toBe(2048);
  });

  it('uses exact width when source is exactly at max', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 2048,
      sourceHeight: 1536,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(2048);
    expect(result.height).toBe(1536);
  });

  it('handles very wide images', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 8000,
      sourceHeight: 1000,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(result.width).toBe(2048);
    expect(result.height).toBe(256); // 2048 * (1000/8000)
  });

  it('returns integer dimensions', () => {
    const input: ExportDimensionsInput = {
      sourceWidth: 4001,
      sourceHeight: 3001,
      maxWidth: 2048,
    };

    const result = calculateExportDimensions(input);

    expect(Number.isInteger(result.width)).toBe(true);
    expect(Number.isInteger(result.height)).toBe(true);
  });
});
