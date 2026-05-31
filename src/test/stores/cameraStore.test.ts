import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

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

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Camera',
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-01',
    location:     'Main gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
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

describe('useCameraStore', () => {
  describe('initial state', () => {
    it('cameras array is empty', () => {
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

  describe('loadCameras', () => {
    it('sets loading true during fetch and false after', async () => {
      const cam = makeCamera()
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [cam], total: 1, page: 1, limit: 24, count: 1,
      })
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('populates cameras array on success', async () => {
      const cam = makeCamera()
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [cam], total: 1, page: 1, limit: 24, count: 1,
      })
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-001')
    })

    it('stores total and page from response', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [], total: 50, page: 2, limit: 24, count: 0,
      })
      await act(async () => {
        await useCameraStore.getState().loadCameras(2)
      })
      expect(useCameraStore.getState().total).toBe(50)
      expect(useCameraStore.getState().page).toBe(2)
    })

    it('sets error message on failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().error).toBe('Network error')
    })

    it('sets fallback error string for non-Error throws', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue('bad')
      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })
      expect(useCameraStore.getState().error).toBe('Failed to load cameras')
    })
  })

  describe('addCamera', () => {
    it('prepends the new camera to the cameras array', async () => {
      const existing = makeCamera({ id: 'cam-existing' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera({ id: 'cam-new', name: 'New Cam' })
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' })
      })
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-new')
    })

    it('increments total by 1', async () => {
      useCameraStore.setState({ cameras: [], total: 5 })
      vi.mocked(camerasApi.createCamera).mockResolvedValue(makeCamera({ id: 'cam-new' }))
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'X', rtspUrl: 'rtsp://x' })
      })
      expect(useCameraStore.getState().total).toBe(6)
    })

    it('returns the created camera', async () => {
      const newCam = makeCamera({ id: 'cam-returned' })
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      let result: Camera | undefined
      await act(async () => {
        result = await useCameraStore.getState().addCamera({ name: 'X', rtspUrl: 'rtsp://x' })
      })
      expect(result?.id).toBe('cam-returned')
    })
  })

  describe('editCamera', () => {
    it('updates the camera in the array', async () => {
      const cam = makeCamera({ id: 'cam-001', name: 'Old Name' })
      useCameraStore.setState({ cameras: [cam] })
      const updated = { ...cam, name: 'New Name' }
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' })
      })
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes the camera from the array', async () => {
      useCameraStore.setState({ cameras: [makeCamera({ id: 'cam-001' })], total: 1 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().cameras).toHaveLength(0)
    })

    it('decrements total by 1', async () => {
      useCameraStore.setState({ cameras: [makeCamera({ id: 'cam-001' })], total: 3 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('clears selectedId when the selected camera is deleted', async () => {
      useCameraStore.setState({
        cameras: [makeCamera({ id: 'cam-001' })], total: 1, selectedId: 'cam-001',
      })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores the test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 45, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
      await act(async () => {
        await useCameraStore.getState().testCamera('cam-001')
      })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets the selectedId', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-007')
      })
      expect(useCameraStore.getState().selectedId).toBe('cam-007')
    })

    it('clears selectedId when null is passed', () => {
      useCameraStore.setState({ selectedId: 'cam-007' })
      act(() => {
        useCameraStore.getState().selectCamera(null)
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('setFilterStatus / setFilterSiteId', () => {
    it('setFilterStatus stores the status filter', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('ONLINE')
      })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })

    it('setFilterSiteId stores the site filter', () => {
      act(() => {
        useCameraStore.getState().setFilterSiteId('site-42')
      })
      expect(useCameraStore.getState().filterSiteId).toBe('site-42')
    })
  })
})
