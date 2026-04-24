/**
 * Camera Zustand store — TASK-003.
 * Manages camera list, selection, CRUD ops, and stream URLs.
 */
import { create } from 'zustand';
import type { Camera, CameraStatus, CreateCameraInput, UpdateCameraInput } from '@/api/cameras';
import {
  fetchCameras,
  createCamera as apiCreate,
  updateCamera as apiUpdate,
  deleteCamera as apiDelete,
  testCamera   as apiTest,
  startStream  as apiStart,
  stopStream   as apiStop,
} from '@/api/cameras';

interface CameraState {
  cameras:      Camera[];
  total:        number;
  page:         number;
  loading:      boolean;
  error:        string | null;
  selectedId:   string | null;
  streamUrls:   Record<string, string>;   // cameraId → HLS URL
  testResults:  Record<string, { reachable: boolean; latency_ms: number | null; message: string }>;

  // Filters
  filterStatus: CameraStatus | '';
  filterSiteId: string;

  // Actions
  loadCameras:  (page?: number) => Promise<void>;
  addCamera:    (input: CreateCameraInput) => Promise<Camera>;
  editCamera:   (id: string, input: UpdateCameraInput) => Promise<Camera>;
  removeCamera: (id: string) => Promise<void>;
  testCamera:   (id: string) => Promise<void>;
  selectCamera: (id: string | null) => void;
  startStream:  (id: string) => Promise<string>;
  stopStream:   (id: string) => Promise<void>;
  setFilterStatus: (s: CameraStatus | '') => void;
  setFilterSiteId: (s: string) => void;
}

export const useCameraStore = create<CameraState>()((set, get) => ({
  cameras:      [],
  total:        0,
  page:         1,
  loading:      false,
  error:        null,
  selectedId:   null,
  streamUrls:   {},
  testResults:  {},
  filterStatus: '',
  filterSiteId: '',

  loadCameras: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const { filterStatus, filterSiteId } = get();
      const res = await fetchCameras({
        page,
        limit:   24,
        ...(filterStatus ? { status: filterStatus } : {}),
        ...(filterSiteId ? { siteId: filterSiteId } : {}),
      });
      set({ cameras: res.cameras, total: res.total, page: res.page });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Failed to load cameras' });
    } finally {
      set({ loading: false });
    }
  },

  addCamera: async (input) => {
    const camera = await apiCreate(input);
    set((s) => ({ cameras: [camera, ...s.cameras], total: s.total + 1 }));
    return camera;
  },

  editCamera: async (id, input) => {
    const updated = await apiUpdate(id, input);
    set((s) => ({ cameras: s.cameras.map((c) => c.id === id ? updated : c) }));
    return updated;
  },

  removeCamera: async (id) => {
    await apiDelete(id);
    set((s) => ({
      cameras:    s.cameras.filter((c) => c.id !== id),
      total:      s.total - 1,
      selectedId: s.selectedId === id ? null : s.selectedId,
    }));
  },

  testCamera: async (id) => {
    const result = await apiTest(id);
    set((s) => ({ testResults: { ...s.testResults, [id]: result } }));
  },

  selectCamera: (id) => set({ selectedId: id }),

  startStream: async (id) => {
    const res = await apiStart(id);
    const BASE = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001';
    const url  = `${BASE}${res.hlsUrl}`;
    set((s) => ({ streamUrls: { ...s.streamUrls, [id]: url } }));
    return url;
  },

  stopStream: async (id) => {
    await apiStop(id);
    set((s) => {
      const next = { ...s.streamUrls };
      delete next[id];
      return { streamUrls: next };
    });
  },

  setFilterStatus: (s) => set({ filterStatus: s }),
  setFilterSiteId: (s) => set({ filterSiteId: s }),
}));
