import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PhotoUploader } from '../PhotoUploader';

// Mock modules
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    initScene: vi.fn(),
    commitScene: vi.fn(),
  },
}));

vi.mock('@/lib/image-utils', () => ({
  validateImageFile: vi.fn(),
  processImage: vi.fn(),
}));

import { apiClient } from '@/lib/api-client';
import { validateImageFile, processImage } from '@/lib/image-utils';

describe('PhotoUploader', () => {
  const onComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();

    // Default mock implementations
    vi.mocked(validateImageFile).mockReturnValue({ valid: true });
    vi.mocked(processImage).mockResolvedValue({
      blob: new Blob(['test'], { type: 'image/jpeg' }),
      width: 1000,
      height: 800,
    });
    vi.mocked(apiClient.initScene).mockResolvedValue({
      sceneId: 'scn_test123',
      upload: { url: '/test', method: 'PUT' as const, headers: {} },
    });
    vi.mocked(apiClient.commitScene).mockResolvedValue({
      id: 'scn_test123',
      photoOriginalUrl: '/original.jpg',
      photoWorkingUrl: '/working.jpg',
    });
  });

  it('shows drop hint in idle state', () => {
    render(<PhotoUploader onComplete={onComplete} />);
    expect(screen.getByText(/drop a photo here/i)).toBeInTheDocument();
  });

  it('has file input accepting jpeg and png', () => {
    render(<PhotoUploader onComplete={onComplete} />);
    const input = document.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('accept', 'image/jpeg,image/png');
  });

  it('has accessible dropzone', () => {
    render(<PhotoUploader onComplete={onComplete} />);
    const dropzone = screen.getByRole('button', { name: /upload photo/i });
    expect(dropzone).toBeInTheDocument();
  });

  it('validates file on input change', async () => {
    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    // Trigger change event
    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file);
    });
  });

  it('shows error message when validation fails', async () => {
    vi.mocked(validateImageFile).mockReturnValue({
      valid: false,
      error: 'HEIC files are not supported',
    });

    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.heic', { type: 'image/heic' });

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/HEIC files are not supported/i)).toBeInTheDocument();
    });
  });

  it('calls initScene on valid file', async () => {
    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(apiClient.initScene).toHaveBeenCalledWith('photo.jpg', 'image/jpeg');
    });
  });

  it('processes image and commits scene', async () => {
    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(processImage).toHaveBeenCalledWith(file);
    });

    await waitFor(() => {
      expect(apiClient.commitScene).toHaveBeenCalledWith(
        'scn_test123',
        expect.objectContaining({
          width: 1000,
          height: 800,
        })
      );
    });
  });

  it('calls onComplete after successful upload', async () => {
    vi.useFakeTimers();

    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    // Wait for async operations
    await vi.waitFor(() => {
      expect(apiClient.commitScene).toHaveBeenCalled();
    });

    // Advance past the setTimeout
    await vi.advanceTimersByTimeAsync(600);

    expect(onComplete).toHaveBeenCalledWith('scn_test123');

    vi.useRealTimers();
  });

  it('shows error on API failure', async () => {
    vi.mocked(apiClient.initScene).mockRejectedValue(new Error('Network error'));

    render(<PhotoUploader onComplete={onComplete} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });

    Object.defineProperty(input, 'files', { value: [file] });
    fireEvent.change(input);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });
});
