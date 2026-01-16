import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadProgress } from '../UploadProgress';

describe('UploadProgress', () => {
  it('shows idle message', () => {
    render(<UploadProgress status="idle" />);
    expect(screen.getByText('Ready to upload')).toBeInTheDocument();
  });

  it('shows uploading message', () => {
    render(<UploadProgress status="uploading" />);
    expect(screen.getByText('Uploading photo...')).toBeInTheDocument();
  });

  it('shows processing message', () => {
    render(<UploadProgress status="processing" />);
    expect(screen.getByText('Processing image...')).toBeInTheDocument();
  });

  it('shows complete message', () => {
    render(<UploadProgress status="complete" />);
    expect(screen.getByText('Upload complete!')).toBeInTheDocument();
  });

  it('shows error message with custom error', () => {
    render(<UploadProgress status="error" error="Custom error message" />);
    expect(screen.getByText('Upload failed')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows retry button on error with onRetry handler', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(<UploadProgress status="error" error="Failed" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button without onRetry handler', () => {
    render(<UploadProgress status="error" error="Failed" />);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('shows spinner during uploading', () => {
    render(<UploadProgress status="uploading" />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('shows spinner during processing', () => {
    render(<UploadProgress status="processing" />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
  });

  it('sets data-status attribute', () => {
    const { container } = render(<UploadProgress status="uploading" />);
    expect(container.querySelector('[data-status="uploading"]')).toBeInTheDocument();
  });
});
