import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'

// Mock the entire cameras API module so no real HTTP calls are made
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
  fetchCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  testCamera,
  startStream,
  stopStream,
} from '@/api/cameras'

const mockCam = (overrides = {}) => ({
  id: 'cam-001',
  name: 'Gate Cam',
  manufacturer: 'Hikvision',
  model: 'DS-2CD',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE' as const,
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

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
    it('sets cameras from API response', async () => {
      const cam = mockCam()
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [cam], total: 1, page: 1, limit: 24, count: 1 })
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().cameras).toEqual([cam])
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('sets loading to false after completion', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('stores error message when API rejects', async () => {
      vi.mocked(fetchCameras).mockRejectedValue(new Error('Network timeout'))
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().error).toBe('Network timeout')
    })

    it('passes status filter to API', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      await act(() => useCameraStore.getState().loadCameras())
      expect(fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('passes siteId filter to API', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      useCameraStore.setState({ filterSiteId: 'SITE-02' })
      await act(() => useCameraStore.getState().loadCameras())
      expect(fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'SITE-02' }))
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to the list', async () => {
      const existing = mockCam({ id: 'cam-old' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = mockCam({ id: 'cam-new', name: 'New Cam' })
      vi.mocked(createCamera).mockResolvedValue(newCam)
      await act(() =>
        useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' }),
      )
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-new')
    })

    it('increments total by 1', async () => {
      useCameraStore.setState({ total: 5 })
      vi.mocked(createCamera).mockResolvedValue(mockCam())
      await act(() =>
        useCameraStore.getState().addCamera({ name: 'Cam', rtspUrl: 'rtsp://x' }),
      )
      expect(useCameraStore.getState().total).toBe(6)
    })
  })

  describe('editCamera', () => {
    it('replaces matching camera in the list', async () => {
      const original = mockCam({ name: 'Old Name' })
      useCameraStore.setState({ cameras: [original] })
      const updated = mockCam({ name: 'New Name' })
      vi.mocked(updateCamera).mockResolvedValue(updated)
      await act(() =>
        useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }),
      )
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from the list', async () => {
      useCameraStore.setState({ cameras: [mockCam()], total: 1 })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      await act(() => useCameraStore.getState().removeCamera('cam-001'))
      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId when the selected camera is deleted', async () => {
      useCameraStore.setState({ cameras: [mockCam()], selectedId: 'cam-001' })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      await act(() => useCameraStore.getState().removeCamera('cam-001'))
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      const result = { reachable: true, latency_ms: 20, message: 'OK' }
      vi.mocked(testCamera).mockResolvedValue(result)
      await act(() => useCameraStore.getState().testCamera('cam-001'))
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => useCameraStore.getState().selectCamera('cam-001'))
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null is passed', () => {
      useCameraStore.setState({ selectedId: 'cam-001' })
      act(() => useCameraStore.getState().selectCamera(null))
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream / stopStream', () => {
    it('stores HLS URL by camera id', async () => {
      vi.mocked(startStream).mockResolvedValue({
        cameraId: 'cam-001',
        hlsUrl: '/streams/cam-001/index.m3u8',
        message: 'started',
      })
      await act(() => useCameraStore.getState().startStream('cam-001'))
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/streams/cam-001')
    })

    it('removes HLS URL on stopStream', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x' } })
      vi.mocked(stopStream).mockResolvedValue(undefined)
      await act(() => useCameraStore.getState().stopStream('cam-001'))
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filter setters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => useCameraStore.getState().setFilterStatus('OFFLINE'))
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => useCameraStore.getState().setFilterSiteId('SITE-99'))
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-99')
    })
  })
})
