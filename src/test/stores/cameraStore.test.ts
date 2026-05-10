import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

// ── Mock the entire cameras API module ────────────────────────────────────────
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
  testCamera as apiTest,
  startStream,
  stopStream,
} from '@/api/cameras'

const mockFetch    = fetchCameras  as ReturnType<typeof vi.fn>
const mockCreate   = createCamera  as ReturnType<typeof vi.fn>
const mockUpdate   = updateCamera  as ReturnType<typeof vi.fn>
const mockDelete   = deleteCamera  as ReturnType<typeof vi.fn>
const mockTest     = apiTest       as ReturnType<typeof vi.fn>
const mockStart    = startStream   as ReturnType<typeof vi.fn>
const mockStop     = stopStream    as ReturnType<typeof vi.fn>

// ── Test fixtures ─────────────────────────────────────────────────────────────
function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'North Gate Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1 North',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-10T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-05-10T10:00:00.000Z',
    ...overrides,
  }
}

function makeListResponse(cameras: Camera[], overrides?: Partial<CameraListResponse>): CameraListResponse {
  return {
    total:   cameras.length,
    page:    1,
    limit:   24,
    count:   cameras.length,
    cameras,
    ...overrides,
  }
}

function resetStore() {
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
}

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
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

    it('filterStatus and filterSiteId are empty strings', () => {
      expect(useCameraStore.getState().filterStatus).toBe('')
      expect(useCameraStore.getState().filterSiteId).toBe('')
    })
  })

  describe('loadCameras', () => {
    it('sets cameras from API response', async () => {
      const cams = [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })]
      mockFetch.mockResolvedValueOnce(makeListResponse(cams))

      await act(async () => { await useCameraStore.getState().loadCameras() })

      expect(useCameraStore.getState().cameras).toEqual(cams)
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('sets loading to false after success', async () => {
      mockFetch.mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets error message on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes status filter to fetchCameras when filterStatus is set', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      mockFetch.mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('passes siteId filter to fetchCameras when filterSiteId is set', async () => {
      useCameraStore.setState({ filterSiteId: 'BOP-ALPHA-01' })
      mockFetch.mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'BOP-ALPHA-01' }))
    })

    it('passes the requested page number', async () => {
      mockFetch.mockResolvedValueOnce(makeListResponse([], { page: 3, total: 50 }))
      await act(async () => { await useCameraStore.getState().loadCameras(3) })
      expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    })
  })

  describe('addCamera', () => {
    it('prepends the new camera to the list', async () => {
      const existing = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera({ id: 'cam-002', name: 'South Gate' })
      mockCreate.mockResolvedValueOnce(newCam)

      await act(async () => { await useCameraStore.getState().addCamera({ name: 'South Gate', rtspUrl: 'rtsp://192.168.1.2' }) })

      const { cameras } = useCameraStore.getState()
      expect(cameras[0]).toEqual(newCam)
      expect(cameras).toHaveLength(2)
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('returns the created camera object', async () => {
      const cam = makeCamera()
      mockCreate.mockResolvedValueOnce(cam)
      let result!: Camera
      await act(async () => {
        result = await useCameraStore.getState().addCamera({ name: 'Gate', rtspUrl: 'rtsp://x' })
      })
      expect(result).toEqual(cam)
    })
  })

  describe('editCamera', () => {
    it('updates the matching camera in the list', async () => {
      const original = makeCamera({ id: 'cam-001', name: 'Old Name' })
      const updated  = makeCamera({ id: 'cam-001', name: 'New Name' })
      useCameraStore.setState({ cameras: [original] })
      mockUpdate.mockResolvedValueOnce(updated)

      await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }) })

      const cam = useCameraStore.getState().cameras.find((c) => c.id === 'cam-001')
      expect(cam?.name).toBe('New Name')
    })

    it('does not affect other cameras', async () => {
      const cam1 = makeCamera({ id: 'cam-001' })
      const cam2 = makeCamera({ id: 'cam-002', name: 'Untouched' })
      useCameraStore.setState({ cameras: [cam1, cam2] })
      mockUpdate.mockResolvedValueOnce({ ...cam1, name: 'Updated' })

      await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'Updated' }) })

      const other = useCameraStore.getState().cameras.find((c) => c.id === 'cam-002')
      expect(other?.name).toBe('Untouched')
    })
  })

  describe('removeCamera', () => {
    it('removes the camera from the list', async () => {
      const cams = [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })]
      useCameraStore.setState({ cameras: cams, total: 2 })
      mockDelete.mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      expect(useCameraStore.getState().cameras.find((c) => c.id === 'cam-001')).toBeUndefined()
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('clears selectedId when the selected camera is removed', async () => {
      useCameraStore.setState({ cameras: [makeCamera({ id: 'cam-001' })], selectedId: 'cam-001', total: 1 })
      mockDelete.mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('preserves selectedId when a different camera is removed', async () => {
      const cams = [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })]
      useCameraStore.setState({ cameras: cams, selectedId: 'cam-002', total: 2 })
      mockDelete.mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      expect(useCameraStore.getState().selectedId).toBe('cam-002')
    })
  })

  describe('testCamera', () => {
    it('stores the test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 42, message: 'OK' }
      mockTest.mockResolvedValueOnce(result)

      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })

      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })

    it('stores a failure result correctly', async () => {
      const result = { reachable: false, latency_ms: null, message: 'Connection refused' }
      mockTest.mockResolvedValueOnce(result)

      await act(async () => { await useCameraStore.getState().testCamera('cam-002') })

      expect(useCameraStore.getState().testResults['cam-002'].reachable).toBe(false)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId to the given id', () => {
      act(() => { useCameraStore.getState().selectCamera('cam-001') })
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

  describe('startStream / stopStream', () => {
    it('stores the HLS URL after startStream', async () => {
      mockStart.mockResolvedValueOnce({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'Started' })

      let url!: string
      await act(async () => {
        url = await useCameraStore.getState().startStream('cam-001')
      })

      expect(url).toContain('/hls/cam-001/index.m3u8')
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/hls/cam-001/index.m3u8')
    })

    it('removes the URL after stopStream', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/hls/cam-001/index.m3u8' } })
      mockStop.mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })

      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filter actions', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterStatus can clear the filter', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('ONLINE')
        useCameraStore.getState().setFilterStatus('')
      })
      expect(useCameraStore.getState().filterStatus).toBe('')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('BOP-BETA-01') })
      expect(useCameraStore.getState().filterSiteId).toBe('BOP-BETA-01')
    })

    it('setFilterSiteId can clear the filter', () => {
      act(() => {
        useCameraStore.getState().setFilterSiteId('BOP-BETA-01')
        useCameraStore.getState().setFilterSiteId('')
      })
      expect(useCameraStore.getState().filterSiteId).toBe('')
    })
  })
})
