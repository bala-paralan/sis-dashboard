import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

// ── API mocks ──────────────────────────────────────────────────────────────────
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
  testCamera as apiTestCamera,
  startStream as apiStartStream,
  stopStream  as apiStopStream,
} from '@/api/cameras'

const mockedFetchCameras  = vi.mocked(fetchCameras)
const mockedCreateCamera  = vi.mocked(createCamera)
const mockedUpdateCamera  = vi.mocked(updateCamera)
const mockedDeleteCamera  = vi.mocked(deleteCamera)
const mockedTestCamera    = vi.mocked(apiTestCamera)
const mockedStartStream   = vi.mocked(apiStartStream)
const mockedStopStream    = vi.mocked(apiStopStream)

function makeCamera(id = 'cam-001', overrides: Partial<Camera> = {}): Camera {
  return {
    id,
    name:         'Test Camera',
    manufacturer: 'Hikvision',
    model:        'DS-2CD',
    siteId:       'SITE-A',
    location:     'Gate',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeListResponse(cameras: Camera[], total?: number): CameraListResponse {
  return { total: total ?? cameras.length, page: 1, limit: 24, count: cameras.length, cameras }
}

beforeEach(() => {
  vi.clearAllMocks()
  // Reset store to initial state
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
  vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
})

describe('useCameraStore', () => {

  describe('initial state', () => {
    it('cameras is empty array', () => {
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
    it('sets loading true then false after fetch', async () => {
      mockedFetchCameras.mockResolvedValue(makeListResponse([]))
      const promise = act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().loading).toBe(true)
      await promise
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('populates cameras and total from response', async () => {
      const cams = [makeCamera('c1'), makeCamera('c2')]
      mockedFetchCameras.mockResolvedValue(makeListResponse(cams, 2))
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().cameras).toEqual(cams)
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('passes page parameter to fetchCameras', async () => {
      mockedFetchCameras.mockResolvedValue(makeListResponse([]))
      await act(() => useCameraStore.getState().loadCameras(3))
      expect(mockedFetchCameras).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    })

    it('passes filterStatus when set', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      mockedFetchCameras.mockResolvedValue(makeListResponse([]))
      await act(() => useCameraStore.getState().loadCameras())
      expect(mockedFetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('passes filterSiteId when set', async () => {
      useCameraStore.setState({ filterSiteId: 'SITE-B' })
      mockedFetchCameras.mockResolvedValue(makeListResponse([]))
      await act(() => useCameraStore.getState().loadCameras())
      expect(mockedFetchCameras).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'SITE-B' }))
    })

    it('sets error on failure', async () => {
      mockedFetchCameras.mockRejectedValue(new Error('Network failure'))
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().error).toBe('Network failure')
      expect(useCameraStore.getState().loading).toBe(false)
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to list and increments total', async () => {
      const cam = makeCamera('new-1', { name: 'New Cam' })
      mockedCreateCamera.mockResolvedValue(cam)
      useCameraStore.setState({ cameras: [makeCamera('c1')], total: 1 })

      await act(() => useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' }))

      const state = useCameraStore.getState()
      expect(state.cameras[0]).toEqual(cam)
      expect(state.total).toBe(2)
    })

    it('returns the created camera', async () => {
      const cam = makeCamera('new-2')
      mockedCreateCamera.mockResolvedValue(cam)
      let result!: Camera
      await act(async () => {
        result = await useCameraStore.getState().addCamera({ name: 'X', rtspUrl: 'rtsp://x' })
      })
      expect(result).toEqual(cam)
    })
  })

  describe('editCamera', () => {
    it('replaces the edited camera in the list', async () => {
      const original = makeCamera('c1', { name: 'Old Name' })
      const updated  = makeCamera('c1', { name: 'New Name' })
      useCameraStore.setState({ cameras: [original], total: 1 })
      mockedUpdateCamera.mockResolvedValue(updated)

      await act(() => useCameraStore.getState().editCamera('c1', { name: 'New Name' }))

      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })

    it('does not change other cameras', async () => {
      const c1 = makeCamera('c1', { name: 'Cam 1' })
      const c2 = makeCamera('c2', { name: 'Cam 2' })
      useCameraStore.setState({ cameras: [c1, c2], total: 2 })
      mockedUpdateCamera.mockResolvedValue(makeCamera('c1', { name: 'Updated' }))

      await act(() => useCameraStore.getState().editCamera('c1', { name: 'Updated' }))

      expect(useCameraStore.getState().cameras[1].name).toBe('Cam 2')
    })
  })

  describe('removeCamera', () => {
    it('removes the camera from the list', async () => {
      useCameraStore.setState({ cameras: [makeCamera('c1'), makeCamera('c2')], total: 2 })
      mockedDeleteCamera.mockResolvedValue(undefined)

      await act(() => useCameraStore.getState().removeCamera('c1'))

      expect(useCameraStore.getState().cameras.find((c) => c.id === 'c1')).toBeUndefined()
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('clears selectedId when the selected camera is removed', async () => {
      useCameraStore.setState({ cameras: [makeCamera('c1')], total: 1, selectedId: 'c1' })
      mockedDeleteCamera.mockResolvedValue(undefined)

      await act(() => useCameraStore.getState().removeCamera('c1'))

      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('preserves selectedId when a different camera is removed', async () => {
      useCameraStore.setState({
        cameras: [makeCamera('c1'), makeCamera('c2')],
        total: 2,
        selectedId: 'c2',
      })
      mockedDeleteCamera.mockResolvedValue(undefined)

      await act(() => useCameraStore.getState().removeCamera('c1'))

      expect(useCameraStore.getState().selectedId).toBe('c2')
    })
  })

  describe('testCamera', () => {
    it('stores test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 12, message: 'OK' }
      mockedTestCamera.mockResolvedValue(result)

      await act(() => useCameraStore.getState().testCamera('c1'))

      expect(useCameraStore.getState().testResults['c1']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => useCameraStore.getState().selectCamera('c1'))
      expect(useCameraStore.getState().selectedId).toBe('c1')
    })

    it('clears selectedId when passed null', () => {
      useCameraStore.setState({ selectedId: 'c1' })
      act(() => useCameraStore.getState().selectCamera(null))
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream / stopStream', () => {
    it('startStream stores full HLS URL keyed by camera id', async () => {
      mockedStartStream.mockResolvedValue({ cameraId: 'c1', hlsUrl: '/hls/c1.m3u8', message: 'started' })
      await act(() => useCameraStore.getState().startStream('c1'))
      expect(useCameraStore.getState().streamUrls['c1']).toContain('/hls/c1.m3u8')
    })

    it('stopStream removes the stream URL', async () => {
      useCameraStore.setState({ streamUrls: { 'c1': 'http://localhost/hls/c1.m3u8' } })
      mockedStopStream.mockResolvedValue(undefined)

      await act(() => useCameraStore.getState().stopStream('c1'))

      expect(useCameraStore.getState().streamUrls['c1']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => useCameraStore.getState().setFilterStatus('OFFLINE'))
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterStatus can clear to empty string', () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      act(() => useCameraStore.getState().setFilterStatus(''))
      expect(useCameraStore.getState().filterStatus).toBe('')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => useCameraStore.getState().setFilterSiteId('SITE-X'))
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-X')
    })
  })
})
