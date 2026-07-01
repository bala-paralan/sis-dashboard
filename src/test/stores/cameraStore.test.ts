import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CreateCameraInput, TestResult } from '@/api/cameras'

// Mock the cameras API module
vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn(),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera: vi.fn(),
  startStream: vi.fn(),
  stopStream: vi.fn(),
}))

import * as camerasApi from '@/api/cameras'

function makeCamera(id: string, name: string = 'Test Camera'): Camera {
  return {
    id, name,
    manufacturer: 'Axis', model: 'P3245',
    siteId: 'SITE-01', location: 'Gate A',
    status: 'ONLINE', lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [], total: 0, page: 1,
    loading: false, error: null,
    selectedId: null, streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('useCameraStore', () => {
  describe('initial state', () => {
    it('starts with empty cameras array', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })
    it('starts with loading false', () => {
      expect(useCameraStore.getState().loading).toBe(false)
    })
    it('starts with null selectedId', () => {
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('loadCameras', () => {
    it('sets cameras from API response', async () => {
      const cams = [makeCamera('cam-001'), makeCamera('cam-002')]
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: cams, total: 2, page: 1, limit: 24, count: 2 })
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().cameras).toEqual(cams)
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('sets loading true during fetch and false after', async () => {
      let resolvePromise!: (v: any) => void
      vi.mocked(camerasApi.fetchCameras).mockReturnValue(new Promise((r) => { resolvePromise = r }))
      const loadPromise = act(async () => { void useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(true)
      resolvePromise({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await loadPromise
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets error on API failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().error).toBe('Network error')
    })

    it('passes filter params to fetchCameras', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE', filterSiteId: 'SITE-02' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE', siteId: 'SITE-02' }))
    })
  })

  describe('addCamera', () => {
    it('prepends new camera and increments total', async () => {
      useCameraStore.setState({ cameras: [makeCamera('cam-001')], total: 1 })
      const newCam = makeCamera('cam-002', 'New Camera')
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'New Camera', rtspUrl: 'rtsp://x' })
      })
      const state = useCameraStore.getState()
      expect(state.cameras[0]).toEqual(newCam)
      expect(state.total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('updates the matching camera in place', async () => {
      const cam = makeCamera('cam-001', 'Original')
      useCameraStore.setState({ cameras: [cam], total: 1 })
      const updated = { ...cam, name: 'Updated' }
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'Updated' })
      })
      expect(useCameraStore.getState().cameras[0].name).toBe('Updated')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list and decrements total', async () => {
      useCameraStore.setState({ cameras: [makeCamera('cam-001'), makeCamera('cam-002')], total: 2 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      const state = useCameraStore.getState()
      expect(state.cameras).toHaveLength(1)
      expect(state.cameras[0].id).toBe('cam-002')
      expect(state.total).toBe(1)
    })

    it('clears selectedId if the deleted camera was selected', async () => {
      useCameraStore.setState({ cameras: [makeCamera('cam-001')], total: 1, selectedId: 'cam-001' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result keyed by camera id', async () => {
      const result: TestResult = { reachable: true, latency_ms: 15, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
      await act(async () => {
        await useCameraStore.getState().testCamera('cam-001')
      })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => { useCameraStore.getState().selectCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null is passed', () => {
      useCameraStore.setState({ selectedId: 'cam-001' })
      act(() => { useCameraStore.getState().selectCamera(null) })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream', () => {
    it('stores hls URL for the camera', async () => {
      vi.mocked(camerasApi.startStream).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/streams/cam-001.m3u8', message: 'OK' })
      vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
      await act(async () => {
        await useCameraStore.getState().startStream('cam-001')
      })
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/streams/cam-001.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes the stream URL for the camera', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://example.com/stream.m3u8' } })
      vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().stopStream('cam-001')
      })
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('SITE-99') })
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-99')
    })
  })
})
