import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2T47G2',
  siteId:       'site-01',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-04-26T10:00:00.000Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-26T10:00:00.000Z',
}

// Mock the API module
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

describe('useCameraStore — initial state', () => {
  it('cameras starts empty', () => {
    expect(useCameraStore.getState().cameras).toEqual([])
  })

  it('total starts 0', () => {
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('loading starts false', () => {
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('error starts null', () => {
    expect(useCameraStore.getState().error).toBeNull()
  })

  it('selectedId starts null', () => {
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('useCameraStore — loadCameras', () => {
  it('sets loading to true then false on success', async () => {
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
      cameras: [mockCamera], total: 1, page: 1, limit: 24, count: 1,
    })
    const promise = useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().loading).toBe(true)
    await promise
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('populates cameras on success', async () => {
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue({
      cameras: [mockCamera], total: 1, page: 1, limit: 24, count: 1,
    })
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().cameras).toEqual([mockCamera])
    expect(useCameraStore.getState().total).toBe(1)
  })

  it('sets error on API failure', async () => {
    vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('API down'))
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().error).toBe('API down')
    expect(useCameraStore.getState().loading).toBe(false)
  })
})

describe('useCameraStore — addCamera', () => {
  it('prepends new camera to list and increments total', async () => {
    vi.mocked(camerasApi.createCamera).mockResolvedValue(mockCamera)
    useCameraStore.setState({ cameras: [], total: 0 })
    await useCameraStore.getState().addCamera({ name: 'Test', rtspUrl: 'rtsp://x' })
    expect(useCameraStore.getState().cameras[0]).toEqual(mockCamera)
    expect(useCameraStore.getState().total).toBe(1)
  })
})

describe('useCameraStore — editCamera', () => {
  it('updates the matching camera in the list', async () => {
    const updated = { ...mockCamera, name: 'Updated Cam' }
    vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)
    useCameraStore.setState({ cameras: [mockCamera], total: 1 })
    await useCameraStore.getState().editCamera('cam-001', { name: 'Updated Cam' })
    expect(useCameraStore.getState().cameras[0].name).toBe('Updated Cam')
  })
})

describe('useCameraStore — removeCamera', () => {
  it('removes the camera from the list', async () => {
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [mockCamera], total: 1 })
    await useCameraStore.getState().removeCamera('cam-001')
    expect(useCameraStore.getState().cameras).toHaveLength(0)
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('clears selectedId if the removed camera was selected', async () => {
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [mockCamera], total: 1, selectedId: 'cam-001' })
    await useCameraStore.getState().removeCamera('cam-001')
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('preserves selectedId if a different camera was removed', async () => {
    const cam2 = { ...mockCamera, id: 'cam-002' }
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)
    useCameraStore.setState({ cameras: [mockCamera, cam2], total: 2, selectedId: 'cam-001' })
    await useCameraStore.getState().removeCamera('cam-002')
    expect(useCameraStore.getState().selectedId).toBe('cam-001')
  })
})

describe('useCameraStore — selectCamera', () => {
  it('sets selectedId', () => {
    useCameraStore.getState().selectCamera('cam-001')
    expect(useCameraStore.getState().selectedId).toBe('cam-001')
  })

  it('clears selectedId when set to null', () => {
    useCameraStore.getState().selectCamera('cam-001')
    useCameraStore.getState().selectCamera(null)
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('useCameraStore — testCamera', () => {
  it('stores test result by camera id', async () => {
    const result = { reachable: true, latency_ms: 35, message: 'OK' }
    vi.mocked(camerasApi.testCamera).mockResolvedValue(result)
    await useCameraStore.getState().testCamera('cam-001')
    expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
  })
})

describe('useCameraStore — startStream / stopStream', () => {
  it('stores HLS URL after startStream', async () => {
    vi.mocked(camerasApi.startStream).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001.m3u8', message: 'OK' })
    await useCameraStore.getState().startStream('cam-001')
    const url = useCameraStore.getState().streamUrls['cam-001']
    expect(url).toMatch(/cam-001\.m3u8/)
  })

  it('removes HLS URL after stopStream', async () => {
    vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://localhost/stream.m3u8' } })
    await useCameraStore.getState().stopStream('cam-001')
    expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
  })
})

describe('useCameraStore — filters', () => {
  it('setFilterStatus updates filterStatus', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    useCameraStore.getState().setFilterSiteId('site-02')
    expect(useCameraStore.getState().filterSiteId).toBe('site-02')
  })

  it('clears filterStatus with empty string', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    useCameraStore.getState().setFilterStatus('')
    expect(useCameraStore.getState().filterStatus).toBe('')
  })
})
