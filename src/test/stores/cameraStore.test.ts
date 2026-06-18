import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

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
  fetchCameras,
  createCamera as apiCreate,
  updateCamera as apiUpdate,
  deleteCamera as apiDelete,
  testCamera   as apiTest,
  startStream  as apiStart,
  stopStream   as apiStop,
} from '@/api/cameras'

function makeCam(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-1',
    name:         'Test Camera',
    manufacturer: null,
    model:        null,
    siteId:       null,
    location:     null,
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'u-1',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

const resetState = () => useCameraStore.setState({
  cameras: [], total: 0, page: 1,
  loading: false, error: null,
  selectedId: null, streamUrls: {}, testResults: {},
  filterStatus: '', filterSiteId: '',
})

beforeEach(() => {
  vi.clearAllMocks()
  resetState()
})

describe('cameraStore.loadCameras', () => {
  it('loads cameras and sets state', async () => {
    const cameras = [makeCam()]
    vi.mocked(fetchCameras).mockResolvedValue({ cameras, total: 1, page: 1, limit: 24, count: 1 })
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(useCameraStore.getState().cameras).toEqual(cameras)
    expect(useCameraStore.getState().total).toBe(1)
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('sets error on failure', async () => {
    vi.mocked(fetchCameras).mockRejectedValue(new Error('Network error'))
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(useCameraStore.getState().error).toBe('Network error')
    expect(useCameraStore.getState().cameras).toHaveLength(0)
  })
})

describe('cameraStore.addCamera', () => {
  it('prepends the new camera to the list', async () => {
    const newCam = makeCam({ id: 'cam-2', name: 'New Cam' })
    vi.mocked(apiCreate).mockResolvedValue(newCam)
    await act(async () => { await useCameraStore.getState().addCamera({ name: 'New Cam', rtspUrl: 'rtsp://x' }) })
    expect(useCameraStore.getState().cameras[0]).toEqual(newCam)
    expect(useCameraStore.getState().total).toBe(1)
  })
})

describe('cameraStore.editCamera', () => {
  it('replaces the edited camera in the list', async () => {
    const original = makeCam()
    useCameraStore.setState({ cameras: [original], total: 1 })
    const updated = makeCam({ name: 'Updated' })
    vi.mocked(apiUpdate).mockResolvedValue(updated)
    await act(async () => { await useCameraStore.getState().editCamera('cam-1', { name: 'Updated' }) })
    expect(useCameraStore.getState().cameras[0].name).toBe('Updated')
  })
})

describe('cameraStore.removeCamera', () => {
  it('removes the camera and decrements total', async () => {
    useCameraStore.setState({ cameras: [makeCam()], total: 1 })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-1') })
    expect(useCameraStore.getState().cameras).toHaveLength(0)
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('clears selectedId if the removed camera was selected', async () => {
    useCameraStore.setState({ cameras: [makeCam()], total: 1, selectedId: 'cam-1' })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-1') })
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('cameraStore.testCamera', () => {
  it('stores the test result keyed by camera id', async () => {
    const result = { reachable: true, latency_ms: 22, message: 'ok' }
    vi.mocked(apiTest).mockResolvedValue(result)
    await act(async () => { await useCameraStore.getState().testCamera('cam-1') })
    expect(useCameraStore.getState().testResults['cam-1']).toEqual(result)
  })
})

describe('cameraStore.selectCamera', () => {
  it('sets selectedId', () => {
    useCameraStore.getState().selectCamera('cam-1')
    expect(useCameraStore.getState().selectedId).toBe('cam-1')
  })

  it('clears selectedId with null', () => {
    useCameraStore.setState({ selectedId: 'cam-1' })
    useCameraStore.getState().selectCamera(null)
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('cameraStore.startStream / stopStream', () => {
  it('stores the HLS URL on startStream', async () => {
    vi.mocked(apiStart).mockResolvedValue({ cameraId: 'cam-1', hlsUrl: '/streams/cam-1/index.m3u8', message: 'ok' })
    vi.stubEnv('VITE_API_URL', 'http://localhost:3001')
    await act(async () => { await useCameraStore.getState().startStream('cam-1') })
    const url = useCameraStore.getState().streamUrls['cam-1']
    expect(url).toContain('/streams/cam-1/index.m3u8')
  })

  it('removes the HLS URL on stopStream', async () => {
    useCameraStore.setState({ streamUrls: { 'cam-1': 'http://localhost:3001/streams/cam-1/index.m3u8' } })
    vi.mocked(apiStop).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().stopStream('cam-1') })
    expect(useCameraStore.getState().streamUrls['cam-1']).toBeUndefined()
  })
})
