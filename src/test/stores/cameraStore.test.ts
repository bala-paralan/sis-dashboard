import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse, TestResult, StreamStartResponse } from '@/api/cameras'

// ── API mocks ──────────────────────────────────────────────────────────────
vi.mock('@/api/cameras', () => ({
  fetchCameras:  vi.fn(),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

import {
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  testCamera,
  startStream,
  stopStream,
} from '@/api/cameras'

// ── Helpers ───────────────────────────────────────────────────────────────
function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'site-alpha',
    location:     'Main entrance',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T12:00:00Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function listOf(...cameras: Camera[]): CameraListResponse {
  return { total: cameras.length, page: 1, limit: 24, count: cameras.length, cameras }
}

beforeEach(() => {
  useCameraStore.setState({
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
  })
  vi.clearAllMocks()
})

describe('useCameraStore', () => {
  // ── Initial state ────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('cameras is empty', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })

    it('loading is false', () => {
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('error is null', () => {
      expect(useCameraStore.getState().error).toBeNull()
    })

    it('selectedId is null', () => {
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  // ── loadCameras ───────────────────────────────────────────────────────────
  describe('loadCameras', () => {
    it('populates cameras on success', async () => {
      const cam = makeCamera()
      vi.mocked(fetchCameras).mockResolvedValue(listOf(cam))
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().cameras).toEqual([cam])
    })

    it('sets total and page', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ total: 50, page: 2, limit: 24, count: 24, cameras: [] })
      await useCameraStore.getState().loadCameras(2)
      expect(useCameraStore.getState().total).toBe(50)
      expect(useCameraStore.getState().page).toBe(2)
    })

    it('sets error on failure', async () => {
      vi.mocked(fetchCameras).mockRejectedValue(new Error('Network error'))
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().error).toBe('Network error')
    })

    it('clears loading after success', async () => {
      vi.mocked(fetchCameras).mockResolvedValue(listOf())
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('clears loading after failure', async () => {
      vi.mocked(fetchCameras).mockRejectedValue(new Error('fail'))
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes filterStatus to API', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      vi.mocked(fetchCameras).mockResolvedValue(listOf())
      await useCameraStore.getState().loadCameras()
      expect(fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('passes filterSiteId to API', async () => {
      useCameraStore.setState({ filterSiteId: 'site-alpha' })
      vi.mocked(fetchCameras).mockResolvedValue(listOf())
      await useCameraStore.getState().loadCameras()
      expect(fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'site-alpha' }))
    })
  })

  // ── addCamera ─────────────────────────────────────────────────────────────
  describe('addCamera', () => {
    it('prepends new camera to list', async () => {
      const existing = makeCamera({ id: 'cam-002' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera({ id: 'cam-001' })
      vi.mocked(createCamera).mockResolvedValue(newCam)

      await useCameraStore.getState().addCamera({ name: 'Front Gate', rtspUrl: 'rtsp://x' })

      const { cameras, total } = useCameraStore.getState()
      expect(cameras[0]).toEqual(newCam)
      expect(cameras[1]).toEqual(existing)
      expect(total).toBe(2)
    })

    it('returns the created camera', async () => {
      const cam = makeCamera()
      vi.mocked(createCamera).mockResolvedValue(cam)
      const result = await useCameraStore.getState().addCamera({ name: 'x', rtspUrl: 'rtsp://y' })
      expect(result).toEqual(cam)
    })
  })

  // ── editCamera ────────────────────────────────────────────────────────────
  describe('editCamera', () => {
    it('replaces camera in list', async () => {
      const original = makeCamera({ name: 'Old Name' })
      const updated = makeCamera({ name: 'New Name' })
      useCameraStore.setState({ cameras: [original] })
      vi.mocked(updateCamera).mockResolvedValue(updated)

      await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' })

      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })

    it('returns the updated camera', async () => {
      const updated = makeCamera({ name: 'Updated' })
      useCameraStore.setState({ cameras: [makeCamera()] })
      vi.mocked(updateCamera).mockResolvedValue(updated)
      const result = await useCameraStore.getState().editCamera('cam-001', { name: 'Updated' })
      expect(result).toEqual(updated)
    })
  })

  // ── removeCamera ──────────────────────────────────────────────────────────
  describe('removeCamera', () => {
    it('removes camera from list', async () => {
      const cam = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1 })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)

      await useCameraStore.getState().removeCamera('cam-001')

      expect(useCameraStore.getState().cameras).toEqual([])
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId if it matches deleted camera', async () => {
      useCameraStore.setState({ cameras: [makeCamera()], total: 1, selectedId: 'cam-001' })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      await useCameraStore.getState().removeCamera('cam-001')
      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('keeps selectedId if it does not match deleted camera', async () => {
      useCameraStore.setState({
        cameras: [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })],
        total: 2,
        selectedId: 'cam-002',
      })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      await useCameraStore.getState().removeCamera('cam-001')
      expect(useCameraStore.getState().selectedId).toBe('cam-002')
    })
  })

  // ── testCamera ────────────────────────────────────────────────────────────
  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      const result: TestResult = { reachable: true, latency_ms: 42, message: 'OK' }
      vi.mocked(testCamera).mockResolvedValue(result)
      await useCameraStore.getState().testCamera('cam-001')
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  // ── selectCamera ──────────────────────────────────────────────────────────
  describe('selectCamera', () => {
    it('sets selectedId', () => {
      useCameraStore.getState().selectCamera('cam-001')
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null', () => {
      useCameraStore.setState({ selectedId: 'cam-001' })
      useCameraStore.getState().selectCamera(null)
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  // ── startStream ───────────────────────────────────────────────────────────
  describe('startStream', () => {
    it('stores stream URL', async () => {
      const resp: StreamStartResponse = { cameraId: 'cam-001', hlsUrl: '/streams/cam-001/index.m3u8', message: 'started' }
      vi.mocked(startStream).mockResolvedValue(resp)
      vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
      await useCameraStore.getState().startStream('cam-001')
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/streams/cam-001/index.m3u8')
    })

    it('returns the HLS URL', async () => {
      const resp: StreamStartResponse = { cameraId: 'cam-001', hlsUrl: '/hls', message: 'ok' }
      vi.mocked(startStream).mockResolvedValue(resp)
      const url = await useCameraStore.getState().startStream('cam-001')
      expect(url).toContain('/hls')
    })
  })

  // ── stopStream ────────────────────────────────────────────────────────────
  describe('stopStream', () => {
    it('removes stream URL from map', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x' } })
      vi.mocked(stopStream).mockResolvedValue(undefined)
      await useCameraStore.getState().stopStream('cam-001')
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  // ── filters ───────────────────────────────────────────────────────────────
  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      useCameraStore.getState().setFilterStatus('OFFLINE')
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      useCameraStore.getState().setFilterSiteId('site-bravo')
      expect(useCameraStore.getState().filterSiteId).toBe('site-bravo')
    })
  })
})
