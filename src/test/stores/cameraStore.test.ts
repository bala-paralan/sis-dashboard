import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse, TestResult, StreamStartResponse } from '@/api/cameras'

// ── Mock the cameras API module ──────────────────────────────────────────────
vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn(),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

import * as camerasApi from '@/api/cameras'

function mockCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate Camera',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-alpha',
    location:     'North Perimeter',
    status:       'ONLINE',
    lastSeenAt:   '2026-06-30T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-06-30T10:00:00.000Z',
    ...overrides,
  }
}

function mockListResponse(cameras: Camera[] = [], overrides?: Partial<CameraListResponse>): CameraListResponse {
  return {
    total:   cameras.length,
    page:    1,
    limit:   24,
    count:   cameras.length,
    cameras,
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
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
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useCameraStore', () => {
  describe('initial state', () => {
    it('starts with empty cameras array', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })

    it('starts with no loading or error', () => {
      expect(useCameraStore.getState().loading).toBe(false)
      expect(useCameraStore.getState().error).toBeNull()
    })

    it('starts with empty filters', () => {
      expect(useCameraStore.getState().filterStatus).toBe('')
      expect(useCameraStore.getState().filterSiteId).toBe('')
    })
  })

  describe('loadCameras', () => {
    it('sets loading true during fetch and false after', async () => {
      const cameras = [mockCamera()]
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(mockListResponse(cameras))

      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })

      expect(useCameraStore.getState().loading).toBe(false)
      expect(useCameraStore.getState().cameras).toHaveLength(1)
    })

    it('populates cameras, total, and page from response', async () => {
      const cameras = [mockCamera({ id: 'cam-001' }), mockCamera({ id: 'cam-002' })]
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(mockListResponse(cameras, { total: 50, page: 2 }))

      await act(async () => {
        await useCameraStore.getState().loadCameras(2)
      })

      expect(useCameraStore.getState().cameras).toHaveLength(2)
      expect(useCameraStore.getState().total).toBe(50)
      expect(useCameraStore.getState().page).toBe(2)
    })

    it('sets error state on fetch failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValueOnce(new Error('Network error'))

      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })

      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes filterStatus and filterSiteId to API', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(mockListResponse([]))
      useCameraStore.setState({ filterStatus: 'ONLINE', filterSiteId: 'site-alpha' })

      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })

      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ONLINE', siteId: 'site-alpha' })
      )
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to list and increments total', async () => {
      const cam = mockCamera({ id: 'cam-new', name: 'New Camera' })
      vi.mocked(camerasApi.createCamera).mockResolvedValueOnce(cam)
      useCameraStore.setState({ cameras: [mockCamera({ id: 'cam-old' })], total: 1 })

      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'New Camera', rtspUrl: 'rtsp://...' })
      })

      expect(useCameraStore.getState().cameras[0].id).toBe('cam-new')
      expect(useCameraStore.getState().total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('updates camera in list by id', async () => {
      const original = mockCamera({ id: 'cam-001', name: 'Old Name' })
      const updated  = mockCamera({ id: 'cam-001', name: 'New Name' })
      vi.mocked(camerasApi.updateCamera).mockResolvedValueOnce(updated)
      useCameraStore.setState({ cameras: [original] })

      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' })
      })

      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list and decrements total', async () => {
      vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)
      const cam = mockCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1 })

      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })

      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId if removed camera was selected', async () => {
      vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)
      useCameraStore.setState({ cameras: [mockCamera({ id: 'cam-001' })], total: 1, selectedId: 'cam-001' })

      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })

      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result keyed by camera id', async () => {
      const result: TestResult = { reachable: true, latency_ms: 42, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValueOnce(result)

      await act(async () => {
        await useCameraStore.getState().testCamera('cam-001')
      })

      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })

    it('stores unreachable result on failure', async () => {
      const result: TestResult = { reachable: false, latency_ms: null, message: 'Timeout' }
      vi.mocked(camerasApi.testCamera).mockResolvedValueOnce(result)

      await act(async () => {
        await useCameraStore.getState().testCamera('cam-002')
      })

      expect(useCameraStore.getState().testResults['cam-002'].reachable).toBe(false)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null is passed', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-001')
        useCameraStore.getState().selectCamera(null)
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream', () => {
    it('stores HLS URL keyed by camera id and returns the full URL', async () => {
      const resp: StreamStartResponse = { cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'OK' }
      vi.mocked(camerasApi.startStream).mockResolvedValueOnce(resp)
      vi.stubEnv('VITE_API_URL', 'http://localhost:3001')

      let url: string = ''
      await act(async () => {
        url = await useCameraStore.getState().startStream('cam-001')
      })

      expect(url).toContain('/hls/cam-001/index.m3u8')
      expect(useCameraStore.getState().streamUrls['cam-001']).toBe(url)
    })
  })

  describe('stopStream', () => {
    it('removes HLS URL for camera', async () => {
      vi.mocked(camerasApi.stopStream).mockResolvedValueOnce(undefined)
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/hls/cam-001/index.m3u8' } })

      await act(async () => {
        await useCameraStore.getState().stopStream('cam-001')
      })

      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('OFFLINE')
      })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => {
        useCameraStore.getState().setFilterSiteId('site-bravo')
      })
      expect(useCameraStore.getState().filterSiteId).toBe('site-bravo')
    })

    it('setFilterStatus to empty string clears the filter', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('ONLINE')
        useCameraStore.getState().setFilterStatus('')
      })
      expect(useCameraStore.getState().filterStatus).toBe('')
    })
  })
})
