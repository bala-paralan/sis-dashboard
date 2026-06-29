import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

// Mock all API calls
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
  fetchCameras, createCamera, updateCamera,
  deleteCamera, testCamera, startStream, stopStream,
} from '@/api/cameras'

const mockCam = (id = 'cam-001', name = 'Gate Alpha'): Camera => ({
  id,
  name,
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})

const resetState = () => {
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
}

beforeEach(() => {
  vi.clearAllMocks()
  resetState()
})

describe('useCameraStore', () => {

  describe('initial state', () => {
    it('cameras array is empty', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })
    it('total is 0', () => {
      expect(useCameraStore.getState().total).toBe(0)
    })
    it('page is 1', () => {
      expect(useCameraStore.getState().page).toBe(1)
    })
    it('loading is false', () => {
      expect(useCameraStore.getState().loading).toBe(false)
    })
    it('selectedId is null', () => {
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
    it('filterStatus is empty string', () => {
      expect(useCameraStore.getState().filterStatus).toBe('')
    })
  })

  describe('loadCameras', () => {
    it('populates cameras on success', async () => {
      const res: CameraListResponse = {
        cameras: [mockCam()], total: 1, page: 1, limit: 24, count: 1,
      }
      vi.mocked(fetchCameras).mockResolvedValueOnce(res)
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('sets error on failure', async () => {
      vi.mocked(fetchCameras).mockRejectedValueOnce(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
    })

    it('resets loading to false after success', async () => {
      vi.mocked(fetchCameras).mockResolvedValueOnce({
        cameras: [], total: 0, page: 1, limit: 24, count: 0,
      })
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().loading).toBe(false)
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to the list', async () => {
      const cam = mockCam('cam-new', 'New Cam')
      vi.mocked(createCamera).mockResolvedValueOnce(cam)
      await act(async () => {
        await useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' })
      })
      expect(useCameraStore.getState().cameras[0]).toEqual(cam)
      expect(useCameraStore.getState().total).toBe(1)
    })
  })

  describe('editCamera', () => {
    it('updates the matching camera in-place', async () => {
      useCameraStore.setState({ cameras: [mockCam()], total: 1 })
      const updated = mockCam('cam-001', 'Updated Name')
      vi.mocked(updateCamera).mockResolvedValueOnce(updated)
      await act(async () => {
        await useCameraStore.getState().editCamera('cam-001', { name: 'Updated Name' })
      })
      expect(useCameraStore.getState().cameras[0].name).toBe('Updated Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera by id', async () => {
      useCameraStore.setState({ cameras: [mockCam()], total: 1 })
      vi.mocked(deleteCamera).mockResolvedValueOnce(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId when selected camera is deleted', async () => {
      useCameraStore.setState({ cameras: [mockCam()], total: 1, selectedId: 'cam-001' })
      vi.mocked(deleteCamera).mockResolvedValueOnce(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      vi.mocked(testCamera).mockResolvedValueOnce({ reachable: true, latency_ms: 8, message: 'ok' })
      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })
      expect(useCameraStore.getState().testResults['cam-001']).toEqual({
        reachable: true, latency_ms: 8, message: 'ok',
      })
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

  describe('setFilterStatus / setFilterSiteId', () => {
    it('sets filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('ONLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })
    it('sets filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('SITE-42') })
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-42')
    })
  })

  describe('startStream', () => {
    it('stores HLS URL and returns it', async () => {
      vi.mocked(startStream).mockResolvedValueOnce({
        cameraId: 'cam-001', hlsUrl: '/hls/cam-001.m3u8', message: 'started',
      })
      let url: string
      await act(async () => {
        url = await useCameraStore.getState().startStream('cam-001')
      })
      expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/hls/cam-001.m3u8')
      expect(url!).toContain('/hls/cam-001.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes HLS URL for the camera', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/hls.m3u8' } })
      vi.mocked(stopStream).mockResolvedValueOnce(undefined)
      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })
      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })
  })
})
