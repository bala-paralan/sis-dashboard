import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse } from '@/api/cameras'

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

function makeCamera(id: string, name = `Camera ${id}`): Camera {
  return {
    id,
    name,
    manufacturer: 'Acme',
    model: 'X100',
    siteId: 'BOP-ALPHA-01',
    location: 'Sector 1',
    status: 'ONLINE',
    lastSeenAt: new Date().toISOString(),
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function makeListResponse(cameras: Camera[]): CameraListResponse {
  return { cameras, total: cameras.length, page: 1, limit: 24, count: cameras.length }
}

beforeEach(() => {
  vi.clearAllMocks()
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
})

describe('cameraStore — initial state', () => {
  it('cameras array is empty', () => {
    expect(useCameraStore.getState().cameras).toEqual([])
  })

  it('loading is false', () => {
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('error is null', () => {
    expect(useCameraStore.getState().error).toBeNull()
  })
})

describe('cameraStore — loadCameras', () => {
  it('sets cameras from API response', async () => {
    const cams = [makeCamera('cam-1'), makeCamera('cam-2')]
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(makeListResponse(cams))

    await useCameraStore.getState().loadCameras()

    expect(useCameraStore.getState().cameras).toHaveLength(2)
    expect(useCameraStore.getState().cameras[0].id).toBe('cam-1')
  })

  it('sets loading to false after completion', async () => {
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(makeListResponse([]))
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('sets error message on API failure', async () => {
    vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().error).toBe('Network error')
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('updates page number from response', async () => {
    const response = { ...makeListResponse([makeCamera('c1')]), page: 2 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(response)
    await useCameraStore.getState().loadCameras(2)
    expect(useCameraStore.getState().page).toBe(2)
  })

  it('sets total from API response', async () => {
    const response = { ...makeListResponse([makeCamera('c1')]), total: 50 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(response)
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().total).toBe(50)
  })
})

describe('cameraStore — addCamera', () => {
  it('prepends new camera to the list', async () => {
    const existing = makeCamera('cam-1')
    useCameraStore.setState({ cameras: [existing], total: 1 })

    const newCam = makeCamera('cam-2', 'New Camera')
    vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)

    await useCameraStore.getState().addCamera({
      name: 'New Camera',
      rtspUrl: 'rtsp://example.com/stream',
    })

    const { cameras } = useCameraStore.getState()
    expect(cameras[0].id).toBe('cam-2')
    expect(cameras).toHaveLength(2)
  })

  it('increments total count', async () => {
    useCameraStore.setState({ cameras: [], total: 0 })
    vi.mocked(camerasApi.createCamera).mockResolvedValue(makeCamera('cam-new'))
    await useCameraStore.getState().addCamera({ name: 'Test', rtspUrl: 'rtsp://x' })
    expect(useCameraStore.getState().total).toBe(1)
  })
})

describe('cameraStore — editCamera', () => {
  it('updates camera in the list', async () => {
    const cam = makeCamera('cam-1', 'Old Name')
    useCameraStore.setState({ cameras: [cam], total: 1 })

    const updated = { ...cam, name: 'New Name' }
    vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)

    await useCameraStore.getState().editCamera('cam-1', { name: 'New Name' })

    const found = useCameraStore.getState().cameras.find((c) => c.id === 'cam-1')
    expect(found?.name).toBe('New Name')
  })
})

describe('cameraStore — removeCamera', () => {
  it('removes camera from the list', async () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-1'), makeCamera('cam-2')], total: 2 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

    await useCameraStore.getState().removeCamera('cam-1')

    expect(useCameraStore.getState().cameras).toHaveLength(1)
    expect(useCameraStore.getState().cameras[0].id).toBe('cam-2')
  })

  it('decrements total', async () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-1')], total: 1 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    await useCameraStore.getState().removeCamera('cam-1')
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('clears selectedId if removed camera was selected', async () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-1')], total: 1, selectedId: 'cam-1' })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    await useCameraStore.getState().removeCamera('cam-1')
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('keeps selectedId if a different camera is removed', async () => {
    useCameraStore.setState({
      cameras: [makeCamera('cam-1'), makeCamera('cam-2')],
      total: 2,
      selectedId: 'cam-2',
    })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    await useCameraStore.getState().removeCamera('cam-1')
    expect(useCameraStore.getState().selectedId).toBe('cam-2')
  })
})

describe('cameraStore — testCamera', () => {
  it('stores test result for a camera', async () => {
    const result = { reachable: true, latency_ms: 12, message: 'OK' }
    vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
    await useCameraStore.getState().testCamera('cam-1')
    expect(useCameraStore.getState().testResults['cam-1']).toEqual(result)
  })
})

describe('cameraStore — selectCamera', () => {
  it('sets selectedId', () => {
    useCameraStore.getState().selectCamera('cam-42')
    expect(useCameraStore.getState().selectedId).toBe('cam-42')
  })

  it('clears selectedId when null is passed', () => {
    useCameraStore.getState().selectCamera('cam-42')
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
    useCameraStore.getState().setFilterSiteId('BOP-ALPHA-01')
    expect(useCameraStore.getState().filterSiteId).toBe('BOP-ALPHA-01')
  })

  it('clearing filterStatus to empty string', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    useCameraStore.getState().setFilterStatus('')
    expect(useCameraStore.getState().filterStatus).toBe('')
  })
})
