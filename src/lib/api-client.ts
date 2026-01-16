/**
 * API Client
 *
 * Frontend client for communicating with the backend API.
 */

import type { SceneInitResponse, CommitSceneInput } from '@/types/scene';
import type { AssetListResponse } from '@/types/asset';

const API_BASE = '/api/v1';

/**
 * API error with status code.
 */
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Make an API request with JSON body.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(
      `API request failed: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

/**
 * Initialize a new scene and get upload URL.
 */
async function initScene(
  fileName: string,
  contentType: string
): Promise<SceneInitResponse> {
  return request<SceneInitResponse>('/scenes/init', {
    method: 'POST',
    body: JSON.stringify({ fileName, contentType }),
  });
}

/**
 * Commit a scene after photo upload.
 */
async function commitScene(
  sceneId: string,
  input: CommitSceneInput
): Promise<{ id: string; photoOriginalUrl: string; photoWorkingUrl: string }> {
  return request(`/scenes/${sceneId}/commit`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/**
 * Get a scene by ID. Returns null if not found.
 */
async function getScene(sceneId: string): Promise<Record<string, unknown> | null> {
  try {
    return await request(`/scenes/${sceneId}`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return null;
    }
    throw err;
  }
}

/**
 * Get all available assets.
 */
async function getAssets(): Promise<AssetListResponse> {
  return request<AssetListResponse>('/assets');
}

export const apiClient = {
  initScene,
  commitScene,
  getScene,
  getAssets,
};
