import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera, CameraListResponse, TestResult, StreamStartResponse } from '@/api/cameras'

// ── Mocks ─────────────────────────────────────────────────────
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

function makeCamera(id: string, overrides: Partial<Camera> = {}): Camera {
  return {
    id,
    name:         `Camera ${id}`,
    manufacturer: 'Axis',
    model:        'P3245',
    siteId:       'site-a',
    location:     'Zone A',
    status:       'ONLINE',
    lastSeenAt:   null,
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

describe('useCameraStore — initial state', () => {
  it('cameras is empty array', () => {
    expect(useCameraStore.getState().cameras).toEqual([])
  })

  it('total is 0', () => {
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('selectedId is null', () => {
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('loading is false', () => {
    expect(useCameraStore.getState().loading).toBe(false)
  })
})

describe('loadCameras', () => {
  it('sets cameras from API response', async () => {
    const cam = makeCamera('c-001')
    const res: CameraListResponse = { cameras: [cam], total: 1, page: 1, limit: 24, count: 1 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(res)

    await act(async () => { await useCameraStore.getState().loadCameras() })

    expect(useCameraStore.getState().cameras).toEqual([cam])
    expect(useCameraStore.getState().total).toBe(1)
    expect(useCameraStore.getState().page).toBe(1)
  })

  it('sets error on API failure', async () => {
    vi.mocked(camerasApi.fetchCameras).mockRejectedValue(new Error('Network error'))

    await act(async () => { await useCameraStore.getState().loadCameras() })

    expect(useCameraStore.getState().error).toBe('Network error')
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('passes page parameter to fetchCameras', async () => {
    const res: CameraListResponse = { cameras: [], total: 0, page: 2, limit: 24, count: 0 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(res)

    await act(async () => { await useCameraStore.getState().loadCameras(2) })

    expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
  })

  it('passes filterStatus to fetchCameras when set', async () => {
    useCameraStore.setState({ filterStatus: 'ONLINE' })
    const res: CameraListResponse = { cameras: [], total: 0, page: 1, limit: 24, count: 0 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(res)

    await act(async () => { await useCameraStore.getState().loadCameras() })

    expect(camerasApi.fetchCameras).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
  })

  it('does not pass filterStatus when empty', async () => {
    useCameraStore.setState({ filterStatus: '' })
    const res: CameraListResponse = { cameras: [], total: 0, page: 1, limit: 24, count: 0 }
    vi.mocked(camerasApi.fetchCameras).mockResolvedValue(res)

    await act(async () => { await useCameraStore.getState().loadCameras() })

    const call = vi.mocked(camerasApi.fetchCameras).mock.calls[0][0]
    expect(call?.status).toBeUndefined()
  })
})

describe('addCamera', () => {
  it('prepends new camera to the list', async () => {
    const existing = makeCamera('c-old')
    useCameraStore.setState({ cameras: [existing], total: 1 })

    const newCam = makeCamera('c-new')
    vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)

    await act(async () => {
      await useCameraStore.getState().addCamera({ name: 'New', rtspUrl: 'rtsp://x' })
    })

    const { cameras, total } = useCameraStore.getState()
    expect(cameras[0].id).toBe('c-new')
    expect(cameras[1].id).toBe('c-old')
    expect(total).toBe(2)
  })

  it('returns the created camera', async () => {
    const newCam = makeCamera('c-ret')
    vi.mocked(camerasApi.createCamera).mockResolvedValue(newCam)

    let result: Camera | undefined
    await act(async () => {
      result = await useCameraStore.getState().addCamera({ name: 'R', rtspUrl: 'rtsp://r' })
    })

    expect(result).toEqual(newCam)
  })
})

describe('editCamera', () => {
  it('replaces the camera with matching id', async () => {
    const orig = makeCamera('c-001')
    useCameraStore.setState({ cameras: [orig] })

    const updated = { ...orig, name: 'Updated Name' }
    vi.mocked(camerasApi.updateCamera).mockResolvedValue(updated)

    await act(async () => {
      await useCameraStore.getState().editCamera('c-001', { name: 'Updated Name' })
    })

    expect(useCameraStore.getState().cameras[0].name).toBe('Updated Name')
  })

  it('does not affect other cameras', async () => {
    const c1 = makeCamera('c-001')
    const c2 = makeCamera('c-002')
    useCameraStore.setState({ cameras: [c1, c2] })

    vi.mocked(camerasApi.updateCamera).mockResolvedValue({ ...c1, name: 'Updated' })

    await act(async () => {
      await useCameraStore.getState().editCamera('c-001', { name: 'Updated' })
    })

    expect(useCameraStore.getState().cameras[1].name).toBe('Camera c-002')
  })
})

describe('removeCamera', () => {
  it('removes the camera from the list', async () => {
    const c1 = makeCamera('c-001')
    const c2 = makeCamera('c-002')
    useCameraStore.setState({ cameras: [c1, c2], total: 2 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

    await act(async () => {
      await useCameraStore.getState().removeCamera('c-001')
    })

    const { cameras, total } = useCameraStore.getState()
    expect(cameras).toHaveLength(1)
    expect(cameras[0].id).toBe('c-002')
    expect(total).toBe(1)
  })

  it('clears selectedId if it matches the removed camera', async () => {
    const c1 = makeCamera('c-001')
    useCameraStore.setState({ cameras: [c1], selectedId: 'c-001', total: 1 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

    await act(async () => {
      await useCameraStore.getState().removeCamera('c-001')
    })

    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('preserves selectedId if it belongs to a different camera', async () => {
    const c1 = makeCamera('c-001')
    const c2 = makeCamera('c-002')
    useCameraStore.setState({ cameras: [c1, c2], selectedId: 'c-002', total: 2 })
    vi.mocked(camerasApi.deleteCamera).mockResolvedValue(undefined)

    await act(async () => {
      await useCameraStore.getState().removeCamera('c-001')
    })

    expect(useCameraStore.getState().selectedId).toBe('c-002')
  })
})

describe('testCamera', () => {
  it('stores test result keyed by camera id', async () => {
    const result: TestResult = { reachable: true, latency_ms: 24, message: 'OK' }
    vi.mocked(camerasApi.testCamera).mockResolvedValue(result)

    await act(async () => {
      await useCameraStore.getState().testCamera('c-001')
    })

    expect(useCameraStore.getState().testResults['c-001']).toEqual(result)
  })

  it('stores unreachable result correctly', async () => {
    const result: TestResult = { reachable: false, latency_ms: null, message: 'Timeout' }
    vi.mocked(camerasApi.testCamera).mockResolvedValue(result)

    await act(async () => {
      await useCameraStore.getState().testCamera('c-fail')
    })

    expect(useCameraStore.getState().testResults['c-fail'].reachable).toBe(false)
  })
})

describe('selectCamera', () => {
  it('sets selectedId', () => {
    act(() => { useCameraStore.getState().selectCamera('c-001') })
    expect(useCameraStore.getState().selectedId).toBe('c-001')
  })

  it('can clear selectedId with null', () => {
    useCameraStore.setState({ selectedId: 'c-001' })
    act(() => { useCameraStore.getState().selectCamera(null) })
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('setFilterStatus / setFilterSiteId', () => {
  it('setFilterStatus updates filterStatus', () => {
    act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
    expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
  })

  it('setFilterStatus can clear to empty string', () => {
    useCameraStore.setState({ filterStatus: 'ONLINE' })
    act(() => { useCameraStore.getState().setFilterStatus('') })
    expect(useCameraStore.getState().filterStatus).toBe('')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    act(() => { useCameraStore.getState().setFilterSiteId('site-north') })
    expect(useCameraStore.getState().filterSiteId).toBe('site-north')
  })
})

describe('startStream', () => {
  it('stores hls URL in streamUrls', async () => {
    const res: StreamStartResponse = { cameraId: 'c-001', hlsUrl: '/hls/c-001/index.m3u8', message: 'OK' }
    vi.mocked(camerasApi.startStream).mockResolvedValue(res)

    await act(async () => {
      await useCameraStore.getState().startStream('c-001')
    })

    expect(useCameraStore.getState().streamUrls['c-001']).toContain('/hls/c-001/index.m3u8')
  })
})

describe('stopStream', () => {
  it('removes the stream URL from streamUrls', async () => {
    useCameraStore.setState({ streamUrls: { 'c-001': 'http://x/hls/c-001.m3u8' } })
    vi.mocked(camerasApi.stopStream).mockResolvedValue(undefined)

    await act(async () => {
      await useCameraStore.getState().stopStream('c-001')
    })

    expect(useCameraStore.getState().streamUrls['c-001']).toBeUndefined()
  })
})
