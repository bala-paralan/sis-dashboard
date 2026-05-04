import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras:  vi.fn(),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

import * as camerasApi from '@/api/cameras'

function mockCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate Cam',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2347G2-LU',
    siteId:       'site-alpha',
    location:     'Gate A',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T12:00:00.000Z',
    createdBy:    'user-001',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-05-01T12:00:00.000Z',
    ...overrides,
  }
}

function mockListResponse(cameras: Camera[], overrides?: Partial<CameraListResponse>): CameraListResponse {
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
  describe('initial state', () => {
    it('cameras is empty array', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })

    it('selectedId is null', () => {
      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('filters are empty strings', () => {
      expect(useCameraStore.getState().filterStatus).toBe('')
      expect(useCameraStore.getState().filterSiteId).toBe('')
    })
  })

  describe('loadCameras()', () => {
    it('populates cameras on success', async () => {
      const cam = mockCamera()
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue(mockListResponse([cam]))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().cameras).toEqual([cam])
      expect(useCameraStore.getState().total).toBe(1)
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets error on failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes page argument to fetchCameras', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue(mockListResponse([]))
      await act(async () => {
        await useCameraStore.getState().loadCameras(3)
      })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    })

    it('includes status filter when set', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue(mockListResponse([]))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('includes siteId filter when set', async () => {
      useCameraStore.setState({ filterSiteId: 'site-alpha' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue(mockListResponse([]))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'site-alpha' }))
    })
  })

  describe('addCamera()', () => {
    it('prepends new camera to list', async () => {
      const cam = mockCamera()
      vi.mocked(camerasApi.createCamera).mockResolvedValue(cam)
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'Front Gate Cam', rtspUrl: 'rtsp://192.168.1.1/stream' })
      })
      expect(useCameraStore.getState().cameras[0]).toEqual(cam)
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('returns the created camera', async () => {
      const cam = mockCamera()
      vi.mocked(camerasApi.createCamera).mockResolvedValue(cam)
      let result!: Camera
      await act(async () => {
        result = await useCameraStore.getState().addCamera({ name: 'Front Gate Cam', rtspUrl: 'rtsp://...' })
      })
      expect(result).toEqual(cam)
    })
  })

  describe('editCamera()', () => {
    it('replaces the updated camera in the list', async () => {
      const original = mockCamera({ name: 'Old Name' })
      const updated  = mockCamera({ name: 'New Name' })
      useCameraStore.setState({ cameras: [original] })
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' })
      })
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera()', () => {
    it('removes camera from list', async () => {
      useCameraStore.setState({ cameras: [mockCamera()], total: 1 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId when the selected camera is deleted', async () => {
      useCameraStore.setState({ cameras: [mockCamera()], selectedId: 'cam-001' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('preserves selectedId when a different camera is deleted', async () => {
      const cam1 = mockCamera({ id: 'cam-001' })
      const cam2 = mockCamera({ id: 'cam-002' })
      useCameraStore.setState({ cameras: [cam1, cam2], selectedId: 'cam-002' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBe('cam-002')
    })
  })

  describe('testCamera()', () => {
    it('stores test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 12, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
      await act(async () => {
        await useCameraStore.getState().testCamera('cam-001')
      })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera()', () => {
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

  describe('startStream()', () => {
    it('stores stream URL and returns it', async () => {
      vi.mocked(camerasApi.startStream).mockResolvedValue({
        cameraId: 'cam-001',
        hlsUrl:   '/hls/cam-001/index.m3u8',
        message:  'started',
      })
      let url!: string
      await act(async () => {
        url = await useCameraStore.getState().startStream('cam-001')
      })
      expect(url).toContain('/hls/cam-001/index.m3u8')
      expect(useCameraStore.getState().streamUrls['cam-001']).toBe(url)
    })
  })

  describe('stopStream()', () => {
    it('removes stream URL from map', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/hls/cam-001/index.m3u8' } })
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
      act(() => { useCameraStore.getState().setFilterSiteId('site-beta') })
      expect(useCameraStore.getState().filterSiteId).toBe('site-beta')
    })
  })
})
