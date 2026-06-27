import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock the cameras API module
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

function makeCamera(id: string, name = `Cam ${id}`, status: Camera['status'] = 'ONLINE'): Camera {
  return {
    id,
    name,
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2',
    siteId:       'SITE-01',
    location:     'Gate A',
    status,
    lastSeenAt:   new Date().toISOString(),
    createdBy:    'admin',
    createdAt:    new Date().toISOString(),
    updatedAt:    new Date().toISOString(),
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

describe('cameraStore', () => {
  describe('loadCameras', () => {
    it('sets loading=true while fetching and loading=false on completion', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
        cameras: [],
        total: 0,
        page: 1,
        limit: 24,
        count: 0,
      })
      const promise = useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().loading).toBe(true)
      await promise
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('populates cameras from API response', async () => {
      const cam = makeCamera('c1')
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: [cam], total: 1, page: 1, limit: 24, count: 1 })
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().cameras[0].id).toBe('c1')
    })

    it('sets error on fetch failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
      await useCameraStore.getState().loadCameras()
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes filterStatus query param', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await useCameraStore.getState().loadCameras()
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ONLINE' })
      )
    })
  })

  describe('addCamera', () => {
    it('prepends new camera and increments total', async () => {
      const existing = makeCamera('c1')
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera('c2', 'New Cam')
      vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)
      await useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://...' })
      expect(useCameraStore.getState().cameras[0].id).toBe('c2')
      expect(useCameraStore.getState().total).toBe(2)
    })
  })

  describe('editCamera', () => {
    it('updates the camera in place', async () => {
      const original = makeCamera('c1')
      useCameraStore.setState({ cameras: [original] })
      const updated = { ...original, name: 'Updated Name' }
      vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
      await useCameraStore.getState().editCamera('c1', { name: 'Updated Name' })
      expect(useCameraStore.getState().cameras[0].name).toBe('Updated Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list and decrements total', async () => {
      const cams = [makeCamera('c1'), makeCamera('c2')]
      useCameraStore.setState({ cameras: cams, total: 2 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await useCameraStore.getState().removeCamera('c1')
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().cameras[0].id).toBe('c2')
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('clears selectedId if removed camera was selected', async () => {
      useCameraStore.setState({ cameras: [makeCamera('c1')], total: 1, selectedId: 'c1' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
      await useCameraStore.getState().removeCamera('c1')
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      vi.mocked(camerasApi.testCamera).mockResolvedValue({ reachable: true, latency_ms: 12, message: 'OK' })
      await useCameraStore.getState().testCamera('c1')
      expect(useCameraStore.getState().testResults['c1']).toEqual({ reachable: true, latency_ms: 12, message: 'OK' })
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      useCameraStore.getState().selectCamera('c1')
      expect(useCameraStore.getState().selectedId).toBe('c1')
    })

    it('clears selectedId when null is passed', () => {
      useCameraStore.setState({ selectedId: 'c1' })
      useCameraStore.getState().selectCamera(null)
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('startStream', () => {
    it('stores HLS URL keyed by camera id', async () => {
      vi.mocked(camerasApi.startStream).mockResolvedValue({ cameraId: 'c1', hlsUrl: '/hls/c1.m3u8', message: 'started' })
      await useCameraStore.getState().startStream('c1')
      const url = useCameraStore.getState().streamUrls['c1']
      expect(url).toContain('/hls/c1.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes the HLS URL from store', async () => {
      useCameraStore.setState({ streamUrls: { c1: 'http://localhost/hls/c1.m3u8' } })
      vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)
      await useCameraStore.getState().stopStream('c1')
      expect(useCameraStore.getState().streamUrls['c1']).toBeUndefined()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      useCameraStore.getState().setFilterStatus('OFFLINE')
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      useCameraStore.getState().setFilterSiteId('SITE-02')
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-02')
    })
  })
})
