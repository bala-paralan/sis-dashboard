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
    siteId:       'site-a',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T12:00:00Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
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
    it('cameras array is empty', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })

    it('loading is false', () => {
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('selectedId is null', () => {
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('loadCameras', () => {
    it('sets loading true while fetching', async () => {
      let resolve!: (v: unknown) => void
      vi.mocked(camerasApi.fetchCameras).mockReturnValue(new Promise((r) => { resolve = r }))
      act(() => { void useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(true)
      resolve({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    })

    it('populates cameras on success', async () => {
      const cam = makeCamera()
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [cam], total: 1, page: 1, limit: 24, count: 1,
      })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().cameras).toEqual([cam])
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('sets error message on failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets loading false after fetch completes', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [], total: 0, page: 1, limit: 24, count: 0,
      })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(false)
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to the list', async () => {
      const existing = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera({ id: 'cam-002', name: 'Side Camera' })
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      await act(async () => { await useCameraStore.getState().addCamera({ name: 'Side Camera', rtspUrl: 'rtsp://...' }) })
      const { cameras, total } = useCameraStore.getState()
      expect(cameras[0]).toEqual(newCam)
      expect(total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('updates the matching camera in the list', async () => {
      const cam = makeCamera({ id: 'cam-001', name: 'Old Name' })
      useCameraStore.setState({ cameras: [cam] })
      const updated = makeCamera({ id: 'cam-001', name: 'New Name' })
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
      await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }) })
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list', async () => {
      const cam = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().cameras).toEqual([])
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId if the deleted camera was selected', async () => {
      const cam = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1, selectedId: 'cam-001' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result keyed by camera id', async () => {
      const result = { reachable: true, latency_ms: 42, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })
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
    it('stores stream URL keyed by camera id', async () => {
      vi.mocked(camerasApi.startStream).mockResolvedValue({
        cameraId: 'cam-001',
        hlsUrl: '/hls/cam-001.m3u8',
        message: 'Started',
      })
      await act(async () => { await useCameraStore.getState().startStream('cam-001') })
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/hls/cam-001.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes stream URL for camera', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/hls.m3u8' } })
      vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('ONLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('site-b') })
      expect(useCameraStore.getState().filterSiteId).toBe('site-b')
    })
  })
})
