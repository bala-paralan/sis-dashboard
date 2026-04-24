/**
 * Camera API methods — typed wrappers around the backend REST API.
 */
import { apiFetch } from './client.js';

export type CameraStatus = 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ERROR' | 'MAINTENANCE';

export interface Camera {
  id:           string;
  name:         string;
  manufacturer: string | null;
  model:        string | null;
  siteId:       string | null;
  location:     string | null;
  status:       CameraStatus;
  lastSeenAt:   string | null;
  createdBy:    string;
  createdAt:    string;
  updatedAt:    string;
}

export interface CameraListResponse {
  total:   number;
  page:    number;
  limit:   number;
  count:   number;
  cameras: Camera[];
}

export interface CreateCameraInput {
  name:         string;
  rtspUrl:      string;
  username?:    string;
  password?:    string;
  manufacturer?: string;
  model?:       string;
  siteId?:      string;
  location?:    string;
}

export type UpdateCameraInput = Partial<CreateCameraInput>;

export interface TestResult {
  reachable:  boolean;
  latency_ms: number | null;
  message:    string;
}

export interface StreamStartResponse {
  cameraId: string;
  hlsUrl:   string;
  message:  string;
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export const fetchCameras = (params?: {
  siteId?: string; status?: CameraStatus; page?: number; limit?: number;
}): Promise<CameraListResponse> => {
  const q = new URLSearchParams();
  if (params?.siteId)  q.set('siteId', params.siteId);
  if (params?.status)  q.set('status', params.status);
  if (params?.page)    q.set('page',   String(params.page));
  if (params?.limit)   q.set('limit',  String(params.limit));
  return apiFetch<CameraListResponse>(`/cameras?${q.toString()}`);
};

export const fetchCamera = (id: string): Promise<Camera> =>
  apiFetch<Camera>(`/cameras/${id}`);

export const createCamera = (input: CreateCameraInput): Promise<Camera> =>
  apiFetch<Camera>('/cameras', { method: 'POST', body: JSON.stringify(input) });

export const updateCamera = (id: string, input: UpdateCameraInput): Promise<Camera> =>
  apiFetch<Camera>(`/cameras/${id}`, { method: 'PUT', body: JSON.stringify(input) });

export const deleteCamera = (id: string): Promise<void> =>
  apiFetch<void>(`/cameras/${id}`, { method: 'DELETE' });

export const testCamera = (id: string): Promise<TestResult> =>
  apiFetch<TestResult>(`/cameras/${id}/test`, { method: 'POST' });

// ── Streams ───────────────────────────────────────────────────────────────────

export const startStream = (id: string): Promise<StreamStartResponse> =>
  apiFetch<StreamStartResponse>(`/streams/${id}/start`, { method: 'POST' });

export const stopStream = (id: string): Promise<void> =>
  apiFetch<void>(`/streams/${id}`, { method: 'DELETE' });
