import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

// Mock the camera API module
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

function mockCamera(id: string, overrides: Partial<Camera> = {}): Camera {
  return {
    id,
    name: `Camera ${id}`,
    manufacturer: 'Test',
    model: 'X100',
    siteId: 'S1',
    location: 'Loc',
    status: 'ONLINE',
    lastSeenAt: null,
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

function mockListResponse(cameras: Camera[]): CameraListResponse {
  return { total: cameras.length, page: 1, limit: 24, count: cameras.length, cameras }
}

beforeEach(() => {
  vi.clearAllMocks()
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
})

describe('cameraStore', () => {
  describe('loadCameras', () => {
    it('sets cameras and total on success', async () => {
      const cams = [mockCamera('c1'), mockCamera('c2')]
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue(mockListResponse(cams))

      await useCameraStore.getState().loadCameras()

      const { cameras, total, loading, error } = useCameraStore.getState()
      expect(cameras).toHaveLength(2)
      expect(total).toBe(2)
      expect(loading).toBe(false)
      expect(error).toBeNull()
    })

    it('sets error on failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))

      await useCameraStore.getState().loadCameras()

      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets loading=true while fetching', async () => {
      let resolveLoad!: (v: CameraListResponse) => void
      vi.mocked(camerasApi.fetchCameras).mockReturnValue(
        new Promise((res) => { resolveLoad = res })
      )

      const promise = useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().loading).toBe(true)
      resolveLoad(mockListResponse([]))
      await promise
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to the list', async () => {
      const newCam = mockCamera('new-1')
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      useCameraStore.setState({ cameras: [mockCamera('existing')], total: 1 })

      await useCameraStore.getState().addCamera({ name: 'New', rtspUrl: 'rtsp://x/s' })

      const { cameras, total } = useCameraStore.getState()
      expect(cameras[0].id).toBe('new-1')
      expect(total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('updates the matching camera in the list', async () => {
      const original = mockCamera('c1')
      const updated = { ...original, name: 'Updated Name' }
      useCameraStore.setState({ cameras: [original], total: 1 })
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)

      await useCameraStore.getState().editCamera('c1', { name: 'Updated Name' })

      expect(useCameraStore.getState().cameras[0].name).toBe('Updated Name')
    })
  })

  describe('removeCamera', () => {
    it('removes the camera from the list', async () => {
      useCameraStore.setState({ cameras: [mockCamera('c1'), mockCamera('c2')], total: 2 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

      await useCameraStore.getState().removeCamera('c1')

      const { cameras, total } = useCameraStore.getState()
      expect(cameras).toHaveLength(1)
      expect(cameras[0].id).toBe('c2')
      expect(total).toBe(1)
    })

    it('clears selectedId if the deleted camera was selected', async () => {
      useCameraStore.setState({ cameras: [mockCamera('c1')], total: 1, selectedId: 'c1' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

      await useCameraStore.getState().removeCamera('c1')

      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      const result = { reachable: true, latency_ms: 12, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValue(result)

      await useCameraStore.getState().testCamera('c1')

      expect(useCameraStore.getState().testResults['c1']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      useCameraStore.getState().selectCamera('c1')
      expect(useCameraStore.getState().selectedId).toBe('c1')
    })

    it('clears selectedId when null passed', () => {
      useCameraStore.setState({ selectedId: 'c1' })
      useCameraStore.getState().selectCamera(null)
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('filter state', () => {
    it('setFilterStatus updates filterStatus', () => {
      useCameraStore.getState().setFilterStatus('OFFLINE')
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      useCameraStore.getState().setFilterSiteId('SITE-99')
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-99')
    })

    it('filterStatus defaults to empty string', () => {
      expect(useCameraStore.getState().filterStatus).toBe('')
    })
  })

  describe('startStream', () => {
    it('stores HLS URL by camera id', async () => {
      vi.mocked(camerasApi.startStream).mockResolvedValue({
        cameraId: 'c1',
        hlsUrl: '/streams/c1/index.m3u8',
        message: 'started',
      })

      const url = await useCameraStore.getState().startStream('c1')

      expect(url).toContain('/streams/c1/index.m3u8')
      expect(useCameraStore.getState().streamUrls['c1']).toBe(url)
    })
  })

  describe('stopStream', () => {
    it('removes the stream URL', async () => {
      useCameraStore.setState({ streamUrls: { 'c1': 'http://localhost/s.m3u8' } })
      vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)

      await useCameraStore.getState().stopStream('c1')

      expect(useCameraStore.getState().streamUrls['c1']).toBeUndefined()
    })
  })
})
