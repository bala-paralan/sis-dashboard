import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn(),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera: vi.fn(),
  startStream: vi.fn(),
  stopStream: vi.fn(),
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

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Test Cam',
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'site-1',
  location: 'Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [],
    total: 0,
    page: 1,
    loading: false,
    error: null,
    selectedId: null,
    streamUrls: {},
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
  })
  vi.clearAllMocks()
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
})

describe('useCameraStore', () => {
  describe('loadCameras', () => {
    it('sets cameras and total from response', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({
        cameras: [mockCamera],
        total: 1,
        page: 1,
        limit: 24,
        count: 1,
      })
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('sets error on failure', async () => {
      vi.mocked(fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().error).toBe('Network error')
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to list', async () => {
      vi.mocked(createCamera).mockResolvedValue(mockCamera)
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'Test Cam', rtspUrl: 'rtsp://x' })
      })
      expect(useCameraStore.getState().cameras[0]).toEqual(mockCamera)
      expect(useCameraStore.getState().total).toBe(1)
    })
  })

  describe('editCamera', () => {
    it('updates the camera in list', async () => {
      useCameraStore.setState({ cameras: [mockCamera], total: 1 })
      const updated = { ...mockCamera, name: 'Updated Cam' }
      vi.mocked(updateCamera).mockResolvedValue(updated)
      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'Updated Cam' })
      })
      expect(useCameraStore.getState().cameras[0].name).toBe('Updated Cam')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list', async () => {
      useCameraStore.setState({ cameras: [mockCamera], total: 1 })
      vi.mocked(deleteCamera).mockResolvedValue()
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId if deleted camera was selected', async () => {
      useCameraStore.setState({ cameras: [mockCamera], total: 1, selectedId: 'cam-001' })
      vi.mocked(deleteCamera).mockResolvedValue()
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result keyed by camera id', async () => {
      vi.mocked(testCamera).mockResolvedValue({ reachable: true, latency_ms: 20, message: 'OK' })
      await act(async () => {
        await useCameraStore.getState().testCamera('cam-001')
      })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual({
        reachable: true,
        latency_ms: 20,
        message: 'OK',
      })
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => { useCameraStore.getState().selectCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null passed', () => {
      useCameraStore.setState({ selectedId: 'cam-001' })
      act(() => { useCameraStore.getState().selectCamera(null) })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream', () => {
    it('stores HLS URL in streamUrls', async () => {
      vi.mocked(startStream).mockResolvedValue({
        cameraId: 'cam-001',
        hlsUrl: '/hls/cam-001.m3u8',
        message: 'started',
      })
      await act(async () => {
        await useCameraStore.getState().startStream('cam-001')
      })
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('cam-001.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes HLS URL from streamUrls', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/stream.m3u8' } })
      vi.mocked(stopStream).mockResolvedValue()
      await act(async () => {
        await useCameraStore.getState().stopStream('cam-001')
      })
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('ONLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('site-A') })
      expect(useCameraStore.getState().filterSiteId).toBe('site-A')
    })
  })
})
