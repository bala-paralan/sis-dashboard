import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// Mock cameras API
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
  fetchCameras as mockFetchCameras,
  createCamera as mockCreateCamera,
  updateCamera as mockUpdateCamera,
  deleteCamera as mockDeleteCamera,
  testCamera   as mockTestCamera,
  startStream  as mockStartStream,
  stopStream   as mockStopStream,
} from '@/api/cameras'

function makeCamera(id = 'cam-1', name = 'Test Camera'): Camera {
  return {
    id,
    name,
    manufacturer: 'Axis',
    model:        'P3',
    siteId:       'ALPHA',
    location:     'Gate',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2024-01-01T00:00:00Z',
    updatedAt:    '2024-01-01T00:00:00Z',
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  useCameraStore.setState({
    cameras:     [],
    total:       0,
    page:        1,
    loading:     false,
    error:       null,
    selectedId:  null,
    streamUrls:  {},
    testResults: {},
    filterStatus: '',
    filterSiteId: '',
  })
})

describe('cameraStore — loadCameras', () => {
  it('sets cameras and total from API response', async () => {
    const cameras = [makeCamera()]
    vi.mocked(mockFetchCameras).mockResolvedValue({ cameras, total: 1, page: 1, limit: 24, count: 1 })
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().cameras).toEqual(cameras)
    expect(useCameraStore.getState().total).toBe(1)
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('sets error when API throws', async () => {
    vi.mocked(mockFetchCameras).mockRejectedValue(new Error('Network failure'))
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().error).toBe('Network failure')
    expect(useCameraStore.getState().loading).toBe(false)
  })
})

describe('cameraStore — addCamera', () => {
  it('prepends new camera to the list', async () => {
    const newCam = makeCamera('cam-2', 'New Cam')
    vi.mocked(mockCreateCamera).mockResolvedValue(newCam)
    await useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' })
    const { cameras, total } = useCameraStore.getState()
    expect(cameras[0]).toEqual(newCam)
    expect(total).toBe(1)
  })
})

describe('cameraStore — editCamera', () => {
  it('updates the camera in the list', async () => {
    const original = makeCamera('cam-1')
    useCameraStore.setState({ cameras: [original], total: 1 })
    const updated = { ...original, name: 'Updated Cam' }
    vi.mocked(mockUpdateCamera).mockResolvedValue(updated)
    await useCameraStore.getState().editCamera('cam-1', { name: 'Updated Cam' })
    expect(useCameraStore.getState().cameras[0].name).toBe('Updated Cam')
  })
})

describe('cameraStore — removeCamera', () => {
  it('removes camera from list', async () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-1'), makeCamera('cam-2', 'Cam 2')], total: 2 })
    vi.mocked(mockDeleteCamera).mockResolvedValue(undefined)
    await useCameraStore.getState().removeCamera('cam-1')
    const { cameras, total } = useCameraStore.getState()
    expect(cameras).toHaveLength(1)
    expect(cameras[0].id).toBe('cam-2')
    expect(total).toBe(1)
  })

  it('clears selectedId if deleted camera was selected', async () => {
    useCameraStore.setState({ cameras: [makeCamera('cam-1')], total: 1, selectedId: 'cam-1' })
    vi.mocked(mockDeleteCamera).mockResolvedValue(undefined)
    await useCameraStore.getState().removeCamera('cam-1')
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('cameraStore — testCamera', () => {
  it('stores test result keyed by camera id', async () => {
    const result = { reachable: true, latency_ms: 10, message: 'OK' }
    vi.mocked(mockTestCamera).mockResolvedValue(result)
    await useCameraStore.getState().testCamera('cam-1')
    expect(useCameraStore.getState().testResults['cam-1']).toEqual(result)
  })
})

describe('cameraStore — filter setters', () => {
  it('setFilterStatus updates filterStatus', () => {
    useCameraStore.getState().setFilterStatus('OFFLINE')
    expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    useCameraStore.getState().setFilterSiteId('BETA-02')
    expect(useCameraStore.getState().filterSiteId).toBe('BETA-02')
  })
})

describe('cameraStore — startStream / stopStream', () => {
  it('startStream stores the HLS URL', async () => {
    vi.mocked(mockStartStream).mockResolvedValue({ cameraId: 'cam-1', hlsUrl: '/hls/cam-1.m3u8', message: 'ok' })
    const url = await useCameraStore.getState().startStream('cam-1')
    expect(url).toContain('cam-1.m3u8')
    expect(useCameraStore.getState().streamUrls['cam-1']).toBe(url)
  })

  it('stopStream removes the URL', async () => {
    useCameraStore.setState({ streamUrls: { 'cam-1': 'http://x/stream.m3u8' } })
    vi.mocked(mockStopStream).mockResolvedValue(undefined)
    await useCameraStore.getState().stopStream('cam-1')
    expect(useCameraStore.getState().streamUrls['cam-1']).toBeUndefined()
  })
})
