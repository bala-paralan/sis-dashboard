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
  fetchCameras, createCamera, updateCamera,
  deleteCamera, testCamera, startStream, stopStream,
} from '@/api/cameras'

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'SITE-01',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-01T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
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
    it('populates cameras on success', async () => {
      const cam = mockCamera()
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [cam], total: 1, page: 1, limit: 24, count: 1 })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().cameras).toEqual([cam])
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('sets loading to false after success', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('stores error message on failure', async () => {
      vi.mocked(fetchCameras).mockRejectedValue(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes filterStatus to fetchCameras when set', async () => {
      vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to cameras array', async () => {
      const cam = mockCamera({ id: 'cam-002', name: 'Fence South' })
      vi.mocked(createCamera).mockResolvedValue(cam)
      useCameraStore.setState({ cameras: [mockCamera()], total: 1 })
      await act(async () => { await useCameraStore.getState().addCamera({ name: 'Fence South', rtspUrl: 'rtsp://x' }) })
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-002')
      expect(useCameraStore.getState().total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('replaces camera in list with updated version', async () => {
      const original = mockCamera({ id: 'cam-001', name: 'Old Name' })
      const updated  = mockCamera({ id: 'cam-001', name: 'New Name' })
      vi.mocked(updateCamera).mockResolvedValue(updated)
      useCameraStore.setState({ cameras: [original] })
      await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }) })
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list by id', async () => {
      const cam1 = mockCamera({ id: 'cam-001' })
      const cam2 = mockCamera({ id: 'cam-002' })
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      useCameraStore.setState({ cameras: [cam1, cam2], total: 2 })
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-002')
    })

    it('clears selectedId when deleted camera was selected', async () => {
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      useCameraStore.setState({ cameras: [mockCamera()], total: 1, selectedId: 'cam-001' })
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('decrements total by 1', async () => {
      vi.mocked(deleteCamera).mockResolvedValue(undefined)
      useCameraStore.setState({ cameras: [mockCamera()], total: 5 })
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().total).toBe(4)
    })
  })

  describe('testCamera', () => {
    it('stores test result in testResults map', async () => {
      const result = { reachable: true, latency_ms: 42, message: 'OK' }
      vi.mocked(testCamera).mockResolvedValue(result)
      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => { useCameraStore.getState().selectCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })
    it('clears selectedId when null passed', () => {
      useCameraStore.setState({ selectedId: 'cam-001' })
      act(() => { useCameraStore.getState().selectCamera(null) })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream', () => {
    it('stores HLS URL in streamUrls and returns it', async () => {
      vi.mocked(startStream).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001.m3u8', message: 'started' })
      let url = ''
      await act(async () => { url = await useCameraStore.getState().startStream('cam-001') })
      expect(url).toContain('/hls/cam-001.m3u8')
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/hls/cam-001.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes HLS URL from streamUrls', async () => {
      vi.mocked(stopStream).mockResolvedValue(undefined)
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/stream.m3u8' } })
      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })

  describe('filter actions', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })
    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('SITE-02') })
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-02')
    })
  })
})
