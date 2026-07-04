import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse, TestResult, StreamStartResponse } from '@/api/cameras'

// ── Mock the API module ──────────────────────────────────────────────────────
vi.mock('@/api/cameras', () => ({
  fetchCameras:  vi.fn(),
  createCamera:  vi.fn(),
  updateCamera:  vi.fn(),
  deleteCamera:  vi.fn(),
  testCamera:    vi.fn(),
  startStream:   vi.fn(),
  stopStream:    vi.fn(),
}))

import * as camerasApi from '@/api/cameras'

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Gate A PTZ',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'SITE-01',
    location:     'Main Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-04-11T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-04-01T00:00:00.000Z',
    updatedAt:    '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

function makeListResponse(cameras: Camera[], total?: number): CameraListResponse {
  return { total: total ?? cameras.length, page: 1, limit: 24, count: cameras.length, cameras }
}

const RESET_STATE = {
  cameras:      [],
  total:        0,
  page:         1,
  loading:      false,
  error:        null,
  selectedId:   null,
  streamUrls:   {},
  testResults:  {},
  filterStatus: '' as const,
  filterSiteId: '',
}

beforeEach(() => {
  useCameraStore.setState(RESET_STATE)
  vi.clearAllMocks()
})

// ── Tests ────────────────────────────────────────────────────────────────────
describe('useCameraStore', () => {
  describe('initial state', () => {
    it('cameras is empty', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })
    it('total is 0', () => {
      expect(useCameraStore.getState().total).toBe(0)
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
    it('filters are empty', () => {
      const { filterStatus, filterSiteId } = useCameraStore.getState()
      expect(filterStatus).toBe('')
      expect(filterSiteId).toBe('')
    })
  })

  describe('loadCameras', () => {
    it('populates cameras on success', async () => {
      const cams = [makeCamera(), makeCamera({ id: 'cam-002', name: 'Perimeter NW' })]
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(makeListResponse(cams, 42))

      await act(async () => { await useCameraStore.getState().loadCameras() })

      const state = useCameraStore.getState()
      expect(state.cameras).toHaveLength(2)
      expect(state.total).toBe(42)
      expect(state.page).toBe(1)
      expect(state.loading).toBe(false)
      expect(state.error).toBeNull()
    })

    it('sets page when provided', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce({ ...makeListResponse([]), page: 3 })
      await act(async () => { await useCameraStore.getState().loadCameras(3) })
      expect(useCameraStore.getState().page).toBe(3)
    })

    it('sets error on failure', async () => {
      vi.mocked(camerasApi.fetchCameras).mockRejectedValueOnce(new Error('Network error'))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(useCameraStore.getState().error).toBe('Network error')
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('passes status filter to API', async () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
    })

    it('passes siteId filter to API', async () => {
      useCameraStore.setState({ filterSiteId: 'SITE-01' })
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ siteId: 'SITE-01' }))
    })

    it('omits status filter when empty', async () => {
      vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(makeListResponse([]))
      await act(async () => { await useCameraStore.getState().loadCameras() })
      const call = vi.mocked(camerasApi.fetchCameras).mock.calls[0][0] ?? {}
      expect(call).not.toHaveProperty('status')
    })
  })

  describe('addCamera', () => {
    it('prepends new camera and increments total', async () => {
      const existing = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [existing], total: 1 })
      const newCam = makeCamera({ id: 'cam-002', name: 'New Camera' })
      vi.mocked(camerasApi.createCamera).mockResolvedValueOnce(newCam)

      await act(async () => { await useCameraStore.getState().addCamera({ name: 'New Camera', rtspUrl: 'rtsp://x' }) })

      const state = useCameraStore.getState()
      expect(state.cameras[0]).toEqual(newCam)
      expect(state.cameras).toHaveLength(2)
      expect(state.total).toBe(2)
    })

    it('returns the created camera', async () => {
      const newCam = makeCamera()
      vi.mocked(camerasApi.createCamera).mockResolvedValueOnce(newCam)
      let result: Camera | undefined
      await act(async () => { result = await useCameraStore.getState().addCamera({ name: 'x', rtspUrl: 'rtsp://x' }) })
      expect(result).toEqual(newCam)
    })
  })

  describe('editCamera', () => {
    it('replaces updated camera in list', async () => {
      const original = makeCamera({ id: 'cam-001', name: 'Old Name' })
      useCameraStore.setState({ cameras: [original], total: 1 })
      const updated = { ...original, name: 'New Name' }
      vi.mocked(camerasApi.updateCamera).mockResolvedValueOnce(updated)

      await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }) })

      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })

    it('returns the updated camera', async () => {
      useCameraStore.setState({ cameras: [makeCamera()], total: 1 })
      const updated = makeCamera({ name: 'Updated' })
      vi.mocked(camerasApi.updateCamera).mockResolvedValueOnce(updated)
      let result: Camera | undefined
      await act(async () => { result = await useCameraStore.getState().editCamera('cam-001', { name: 'Updated' }) })
      expect(result?.name).toBe('Updated')
    })
  })

  describe('removeCamera', () => {
    it('removes camera from list and decrements total', async () => {
      const cam1 = makeCamera({ id: 'cam-001' })
      const cam2 = makeCamera({ id: 'cam-002' })
      useCameraStore.setState({ cameras: [cam1, cam2], total: 2 })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      const state = useCameraStore.getState()
      expect(state.cameras).toHaveLength(1)
      expect(state.cameras[0].id).toBe('cam-002')
      expect(state.total).toBe(1)
    })

    it('clears selectedId if the deleted camera was selected', async () => {
      useCameraStore.setState({ cameras: [makeCamera()], total: 1, selectedId: 'cam-001' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      expect(useCameraStore.getState().selectedId).toBeNull()
    })

    it('preserves selectedId when a different camera is deleted', async () => {
      const cam1 = makeCamera({ id: 'cam-001' })
      const cam2 = makeCamera({ id: 'cam-002' })
      useCameraStore.setState({ cameras: [cam1, cam2], total: 2, selectedId: 'cam-002' })
      vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })

      expect(useCameraStore.getState().selectedId).toBe('cam-002')
    })
  })

  describe('testCamera', () => {
    it('stores test result by camera id', async () => {
      const result: TestResult = { reachable: true, latency_ms: 12, message: 'OK' }
      vi.mocked(camerasApi.testCamera).mockResolvedValueOnce(result)

      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })

      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })

    it('stores unreachable result', async () => {
      const result: TestResult = { reachable: false, latency_ms: null, message: 'Connection refused' }
      vi.mocked(camerasApi.testCamera).mockResolvedValueOnce(result)

      await act(async () => { await useCameraStore.getState().testCamera('cam-001') })

      expect(useCameraStore.getState().testResults['cam-001']?.reachable).toBe(false)
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
    it('stores HLS URL for the camera', async () => {
      const resp: StreamStartResponse = { cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'started' }
      vi.mocked(camerasApi.startStream).mockResolvedValueOnce(resp)

      await act(async () => { await useCameraStore.getState().startStream('cam-001') })

      const url = useCameraStore.getState().streamUrls['cam-001']
      expect(url).toContain('/hls/cam-001/index.m3u8')
    })
  })

  describe('stopStream', () => {
    it('removes URL from streamUrls', async () => {
      useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/hls/cam-001.m3u8' } })
      vi.mocked(camerasApi.stopStream).mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })

      expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
    })

    it('does not affect other stream URLs', async () => {
      useCameraStore.setState({
        streamUrls: { 'cam-001': 'http://x/1.m3u8', 'cam-002': 'http://x/2.m3u8' },
      })
      vi.mocked(camerasApi.stopStream).mockResolvedValueOnce(undefined)

      await act(async () => { await useCameraStore.getState().stopStream('cam-001') })

      expect(useCameraStore.getState().streamUrls['cam-002']).toBe('http://x/2.m3u8')
    })
  })

  describe('setFilterStatus', () => {
    it('updates filterStatus', () => {
      act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
      expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
    })

    it('clears filterStatus with empty string', () => {
      useCameraStore.setState({ filterStatus: 'ONLINE' })
      act(() => { useCameraStore.getState().setFilterStatus('') })
      expect(useCameraStore.getState().filterStatus).toBe('')
    })
  })

  describe('setFilterSiteId', () => {
    it('updates filterSiteId', () => {
      act(() => { useCameraStore.getState().setFilterSiteId('SITE-02') })
      expect(useCameraStore.getState().filterSiteId).toBe('SITE-02')
    })
  })
})
