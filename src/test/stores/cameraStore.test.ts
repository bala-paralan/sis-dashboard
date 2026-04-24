import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import * as camerasApi from '@/api/cameras'

vi.mock('@/api/cameras')

const makeCamera = (overrides?: Partial<camerasApi.Camera>): camerasApi.Camera => ({
  id:           'cam-1',
  name:         'Gate A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2',
  siteId:       'site-1',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-04-24T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-24T10:00:00.000Z',
  ...overrides,
})

const makeListResponse = (cameras: camerasApi.Camera[]): camerasApi.CameraListResponse => ({
  total:   cameras.length,
  page:    1,
  limit:   24,
  count:   cameras.length,
  cameras,
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

  describe('loadCameras()', () => {
    it('populates cameras on success', async () => {
      const cam = makeCamera()
      ;(camerasApi.fetchCameras as Mock).mockResolvedValue(makeListResponse([cam]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().cameras).toEqual([cam])
      expect(useCameraStore.getState().total).toBe(1)
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('sets error on failure', async () => {
      ;(camerasApi.fetchCameras as Mock).mockRejectedValue(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes filter params when set', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE', filterSiteId: 'site-1' })
      ;(camerasApi.fetchCameras as Mock).mockResolvedValue(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(camerasApi.fetchCameras as Mock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'ONLINE', siteId: 'site-1' })
      )
    })
  })

  describe('addCamera()', () => {
    it('prepends new camera to list', async () => {
      const cam = makeCamera({ id: 'cam-new' })
      ;(camerasApi.createCamera as Mock).mockResolvedValue(cam)
      await act(async () => { await useCameraStore.getState().addCamera({ name: 'Gate A', rtspUrl: 'rtsp://x' }) })
      expect(useCameraStore.getState().cameras[0]).toEqual(cam)
      expect(useCameraStore.getState().total).toBe(1)
    })
  })

  describe('editCamera()', () => {
    it('updates camera in list', async () => {
      const cam = makeCamera()
      useCameraStore.setState({ cameras: [cam] })
      const updated = { ...cam, name: 'Gate B' }
      ;(camerasApi.updateCamera as Mock).mockResolvedValue(updated)
      await act(async () => { await useCameraStore.getState().editCamera('cam-1', { name: 'Gate B' }) })
      expect(useCameraStore.getState().cameras[0].name).toBe('Gate B')
    })
  })

  describe('removeCamera()', () => {
    it('removes camera from list', async () => {
      const cam1 = makeCamera({ id: 'cam-1' })
      const cam2 = makeCamera({ id: 'cam-2', name: 'Gate B' })
      useCameraStore.setState({ cameras: [cam1, cam2], total: 2 })
      ;(camerasApi.deleteCamera as Mock).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-1') })
      expect(useCameraStore.getState().cameras).toHaveLength(1)
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-2')
      expect(useCameraStore.getState().total).toBe(1)
    })

    it('clears selectedId when the selected camera is deleted', async () => {
      const cam = makeCamera()
      useCameraStore.setState({ cameras: [cam], total: 1, selectedId: 'cam-1' })
      ;(camerasApi.deleteCamera as Mock).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().removeCamera('cam-1') })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera()', () => {
    it('stores test result', async () => {
      const result = { reachable: true, latency_ms: 12, message: 'OK' }
      ;(camerasApi.testCamera as Mock).mockResolvedValue(result)
      await act(async () => { await useCameraStore.getState().testCamera('cam-1') })
      expect(useCameraStore.getState().testResults['cam-1']).toEqual(result)
    })
  })

  describe('selectCamera()', () => {
    it('sets selectedId', () => {
      act(() => { useCameraStore.getState().selectCamera('cam-1') })
      expect(useCameraStore.getState().selectedId).toBe('cam-1')
    })

    it('clears selectedId when null passed', () => {
      useCameraStore.setState({ selectedId: 'cam-1' })
      act(() => { useCameraStore.getState().selectCamera(null) })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('site-42') })
      expect(useCameraStore.getState().filterSiteId).toBe('site-42')
    })
  })

  describe('startStream() / stopStream()', () => {
    it('startStream stores HLS url', async () => {
      ;(camerasApi.startStream as Mock).mockResolvedValue({ cameraId: 'cam-1', hlsUrl: '/hls/cam-1.m3u8', message: '' })
      await act(async () => { await useCameraStore.getState().startStream('cam-1') })
      expect(useCameraStore.getState().streamUrls['cam-1']).toMatch(/cam-1\.m3u8/)
    })

    it('stopStream removes HLS url', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-1': 'http://host/hls/cam-1.m3u8' } })
      ;(camerasApi.stopStream as Mock).mockResolvedValue(undefined)
      await act(async () => { await useCameraStore.getState().stopStream('cam-1') })
      expect(useCameraStore.getState().streamUrls['cam-1']).toBeUndefined()
    })
  })
})
