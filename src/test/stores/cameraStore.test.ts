import { describe, it, expect, vi, beforeEach } from 'vitest'
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

import {
  fetchCameras as mockFetchCameras,
  createCamera as mockCreateCamera,
  updateCamera as mockUpdateCamera,
  deleteCamera as mockDeleteCamera,
  testCamera   as mockTestCamera,
  startStream  as mockStartStream,
  stopStream   as mockStopStream,
} from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-1',
    name:         'Test Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD',
    siteId:       'SITE-01',
    location:     'Sector A',
    status:       'ONLINE',
    lastSeenAt:   null,
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
  describe('loadCameras', () => {
    it('sets cameras from API response', async () => {
      const camera = makeCamera()
      vi.mocked(mockFetchCameras).mockResolvedValueOnce({
        cameras: [camera], total: 1, page: 1, limit: 24, count: 1,
      })

      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })

      expect(useCameraStore.getState().cameras).toEqual([camera])
      expect(useCameraStore.getState().total).toBe(1)
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets error on API failure', async () => {
      vi.mocked(mockFetchCameras).mockRejectedValueOnce(new Error('Server error'))

      await act(async () => {
        await useCameraStore.getState().loadCameras()
      })

      expect(useCameraStore.getState().error).toBe('Server error')
      expect(useCameraStore.getState().loading).toBe(false)
    })
  })

  describe('addCamera', () => {
    it('prepends the new camera to the list', async () => {
      const camera = makeCamera({ id: 'cam-new' })
      vi.mocked(mockCreateCamera).mockResolvedValueOnce(camera)

      await act(async () => {
        await useCameraStore.getState().addCamera({
          name: 'Test Camera', rtspUrl: 'rtsp://x',
        })
      })

      expect(useCameraStore.getState().cameras[0]).toEqual(camera)
      expect(useCameraStore.getState().total).toBe(1)
    })
  })

  describe('editCamera', () => {
    it('updates an existing camera in place', async () => {
      const original = makeCamera()
      useCameraStore.setState({ cameras: [original] })

      const updated = makeCamera({ name: 'Updated Cam' })
      vi.mocked(mockUpdateCamera).mockResolvedValueOnce(updated)

      await act(async () => {
        await useCameraStore.getState().editCamera('cam-1', { name: 'Updated Cam' })
      })

      expect(useCameraStore.getState().cameras[0].name).toBe('Updated Cam')
    })
  })

  describe('removeCamera', () => {
    it('removes the camera from the list', async () => {
      useCameraStore.setState({ cameras: [makeCamera()], total: 1 })
      vi.mocked(mockDeleteCamera).mockResolvedValueOnce(undefined)

      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-1')
      })

      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId when the selected camera is deleted', async () => {
      useCameraStore.setState({ cameras: [makeCamera()], total: 1, selectedId: 'cam-1' })
      vi.mocked(mockDeleteCamera).mockResolvedValueOnce(undefined)

      await act(async () => {
        await useCameraStore.getState().removeCamera('cam-1')
      })

      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores the test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 15, message: 'OK' }
      vi.mocked(mockTestCamera).mockResolvedValueOnce(result)

      await act(async () => {
        await useCameraStore.getState().testCamera('cam-1')
      })

      expect(useCameraStore.getState().testResults['cam-1']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-2')
      })
      expect(useCameraStore.getState().selectedId).toBe('cam-2')
    })

    it('clears selectedId when null is passed', () => {
      useCameraStore.setState({ selectedId: 'cam-1' })
      act(() => {
        useCameraStore.getState().selectCamera(null)
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream / stopStream', () => {
    it('stores the HLS URL on startStream', async () => {
      vi.mocked(mockStartStream).mockResolvedValueOnce({
        cameraId: 'cam-1',
        hlsUrl: '/streams/cam-1/index.m3u8',
        message: 'started',
      })

      await act(async () => {
        await useCameraStore.getState().startStream('cam-1')
      })

      expect(useCameraStore.getState().streamUrls['cam-1']).toContain('/streams/cam-1/index.m3u8')
    })

    it('removes the HLS URL on stopStream', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-1': 'http://x/hls.m3u8' } })
      vi.mocked(mockStopStream).mockResolvedValueOnce(undefined)

      await act(async () => {
        await useCameraStore.getState().stopStream('cam-1')
      })

      expect(useCameraStore.getState().streamUrls['cam-1']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('ONLINE')
      })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => {
        useCameraStore.getState().setFilterSiteId('SITE-02')
      })
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-02')
    })
  })
})
