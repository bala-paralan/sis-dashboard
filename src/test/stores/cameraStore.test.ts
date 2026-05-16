import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import * as camerasApi from '@/api/cameras'
import type { Camera, CameraListResponse } from '@/api/cameras'

vi.mock('@/api/cameras')

function makeCamera(id: string): Camera {
  return {
    id, name: `Cam ${id}`,
    manufacturer: null, model: null, siteId: null, location: null,
    status: 'ONLINE', lastSeenAt: null,
    createdBy: 'admin', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }
}

function listResponse(cameras: Camera[]): CameraListResponse {
  return { total: cameras.length, page: 1, limit: 24, count: cameras.length, cameras }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [], total: 0, page: 1, loading: false, error: null,
    selectedId: null, streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('cameraStore — loadCameras', () => {
  it('populates cameras on success', async () => {
    const cams = [makeCamera('c1'), makeCamera('c2')]
    vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce(listResponse(cams))

    await useCameraStore.getState().loadCameras()
    const state = useCameraStore.getState()
    expect(state.cameras).toHaveLength(2)
    expect(state.cameras[0].id).toBe('c1')
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('sets error on failure', async () => {
    vi.mocked(camerasApi.fetchCameras).mockRejectedValueOnce(new Error('Network error'))

    await useCameraStore.getState().loadCameras()
    const state = useCameraStore.getState()
    expect(state.error).toBe('Network error')
    expect(state.loading).toBe(false)
  })

  it('loads specified page', async () => {
    vi.mocked(camerasApi.fetchCameras).mockResolvedValueOnce({ ...listResponse([]), page: 3 })
    await useCameraStore.getState().loadCameras(3)
    expect(useCameraStore.getState().page).toBe(3)
  })
})

describe('cameraStore — addCamera', () => {
  it('prepends new camera to list and increments total', async () => {
    useCameraStore.setState({ cameras: [makeCamera('existing')], total: 1 })
    const newCam = makeCamera('new-1')
    vi.mocked(camerasApi.createCamera).mockResolvedValueOnce(newCam)

    await useCameraStore.getState().addCamera({ name: 'new', rtspUrl: 'rtsp://x' })
    const state = useCameraStore.getState()
    expect(state.cameras[0].id).toBe('new-1')
    expect(state.total).toBe(2)
  })
})

describe('cameraStore — editCamera', () => {
  it('replaces camera in list with updated version', async () => {
    const cam = makeCamera('c1')
    useCameraStore.setState({ cameras: [cam], total: 1 })
    const updated = { ...cam, name: 'Updated Name' }
    vi.mocked(camerasApi.updateCamera).mockResolvedValueOnce(updated)

    await useCameraStore.getState().editCamera('c1', { name: 'Updated Name' })
    expect(useCameraStore.getState().cameras[0].name).toBe('Updated Name')
  })
})

describe('cameraStore — removeCamera', () => {
  it('removes camera from list and decrements total', async () => {
    useCameraStore.setState({ cameras: [makeCamera('c1'), makeCamera('c2')], total: 2 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

    await useCameraStore.getState().removeCamera('c1')
    const state = useCameraStore.getState()
    expect(state.cameras).toHaveLength(1)
    expect(state.cameras[0].id).toBe('c2')
    expect(state.total).toBe(1)
  })

  it('clears selectedId when the selected camera is removed', async () => {
    useCameraStore.setState({ cameras: [makeCamera('c1')], total: 1, selectedId: 'c1' })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

    await useCameraStore.getState().removeCamera('c1')
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('does not clear selectedId when a different camera is removed', async () => {
    useCameraStore.setState({ cameras: [makeCamera('c1'), makeCamera('c2')], total: 2, selectedId: 'c1' })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValueOnce(undefined)

    await useCameraStore.getState().removeCamera('c2')
    expect(useCameraStore.getState().selectedId).toBe('c1')
  })
})

describe('cameraStore — testCamera', () => {
  it('stores test result keyed by camera id', async () => {
    const result = { reachable: true, latency_ms: 30, message: 'OK' }
    vi.mocked(camerasApi.testCamera).mockResolvedValueOnce(result)

    await useCameraStore.getState().testCamera('c1')
    expect(useCameraStore.getState().testResults['c1']).toEqual(result)
  })
})

describe('cameraStore — selectCamera', () => {
  it('sets selectedId', () => {
    useCameraStore.getState().selectCamera('cam-xyz')
    expect(useCameraStore.getState().selectedId).toBe('cam-xyz')
  })

  it('clears selectedId with null', () => {
    useCameraStore.setState({ selectedId: 'cam-xyz' })
    useCameraStore.getState().selectCamera(null)
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('cameraStore — filters', () => {
  it('setFilterStatus updates filterStatus', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    useCameraStore.getState().setFilterSiteId('site-a')
    expect(useCameraStore.getState().filterSiteId).toBe('site-a')
  })
})
