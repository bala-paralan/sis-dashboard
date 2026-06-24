import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

// ── Mock the API layer ────────────────────────────────────────────────────────
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
  updateCamera  as apiUpdate,
  deleteCamera  as apiDelete,
  testCamera    as apiTest,
  startStream   as apiStart,
  stopStream    as apiStop,
} from '@/api/cameras'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'Test Camera',
    manufacturer: null,
    model:        null,
    siteId:       null,
    location:     null,
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useCameraStore — initial state', () => {
  it('cameras array is empty', () => {
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

  it('streamUrls is empty object', () => {
    expect(useCameraStore.getState().streamUrls).toEqual({})
  })

  it('testResults is empty object', () => {
    expect(useCameraStore.getState().testResults).toEqual({})
  })

  it('filterStatus is empty string', () => {
    expect(useCameraStore.getState().filterStatus).toBe('')
  })

  it('filterSiteId is empty string', () => {
    expect(useCameraStore.getState().filterSiteId).toBe('')
  })
})

describe('useCameraStore — loadCameras', () => {
  it('sets loading true while fetching', async () => {
    let resolvePromise!: () => void
    const pending = new Promise<void>((r) => { resolvePromise = r })
    vi.mocked(fetchCameras).mockReturnValue(
      pending.then(() => ({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }))
    )

    const loadPromise = useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().loading).toBe(true)
    resolvePromise()
    await loadPromise
  })

  it('populates cameras on success', async () => {
    const cam = makeCamera()
    vi.mocked(fetchCameras).mockResolvedValue({ cameras: [cam], total: 1, page: 1, limit: 24, count: 1 })
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(useCameraStore.getState().cameras).toHaveLength(1)
    expect(useCameraStore.getState().cameras[0].id).toBe('cam-001')
    expect(useCameraStore.getState().total).toBe(1)
  })

  it('sets loading false after success', async () => {
    vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('sets error string on failure', async () => {
    vi.mocked(fetchCameras).mockRejectedValue(new Error('Network error'))
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(useCameraStore.getState().error).toBe('Network error')
    expect(useCameraStore.getState().loading).toBe(false)
  })

  it('passes page parameter to fetchCameras', async () => {
    vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 2, limit: 24, count: 0 })
    await act(async () => { await useCameraStore.getState().loadCameras(2) })
    expect(vi.mocked(fetchCameras)).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }))
  })

  it('includes filterStatus in query when set', async () => {
    useCameraStore.setState({ filterStatus: 'ONLINE' })
    vi.mocked(fetchCameras).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await act(async () => { await useCameraStore.getState().loadCameras() })
    expect(vi.mocked(fetchCameras)).toHaveBeenCalledWith(expect.objectContaining({ status: 'ONLINE' }))
  })
})

describe('useCameraStore — addCamera', () => {
  it('prepends new camera to front of list', async () => {
    const existing = makeCamera({ id: 'cam-old' })
    useCameraStore.setState({ cameras: [existing], total: 1 })
    const newCam = makeCamera({ id: 'cam-new', name: 'New Camera' })
    vi.mocked(apiCreate).mockResolvedValue(newCam)
    await act(async () => { await useCameraStore.getState().addCamera({ name: 'New Camera', rtspUrl: 'rtsp://x' }) })
    const { cameras } = useCameraStore.getState()
    expect(cameras[0].id).toBe('cam-new')
    expect(cameras[1].id).toBe('cam-old')
    expect(cameras).toHaveLength(2)
  })

  it('increments total by 1', async () => {
    useCameraStore.setState({ cameras: [], total: 5 })
    vi.mocked(apiCreate).mockResolvedValue(makeCamera())
    await act(async () => { await useCameraStore.getState().addCamera({ name: 'x', rtspUrl: 'rtsp://x' }) })
    expect(useCameraStore.getState().total).toBe(6)
  })

  it('returns the created camera', async () => {
    const cam = makeCamera({ name: 'Returned Cam' })
    vi.mocked(apiCreate).mockResolvedValue(cam)
    let result!: Camera
    await act(async () => { result = await useCameraStore.getState().addCamera({ name: 'Returned Cam', rtspUrl: 'rtsp://x' }) })
    expect(result.name).toBe('Returned Cam')
  })
})

describe('useCameraStore — editCamera', () => {
  it('replaces the matching camera in the list', async () => {
    const original = makeCamera({ id: 'cam-001', name: 'Old Name' })
    const updated  = makeCamera({ id: 'cam-001', name: 'New Name' })
    useCameraStore.setState({ cameras: [original] })
    vi.mocked(apiUpdate).mockResolvedValue(updated)
    await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'New Name' }) })
    expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
  })

  it('does not affect other cameras in the list', async () => {
    const camA = makeCamera({ id: 'cam-001', name: 'A' })
    const camB = makeCamera({ id: 'cam-002', name: 'B' })
    const updatedA = makeCamera({ id: 'cam-001', name: 'A Updated' })
    useCameraStore.setState({ cameras: [camA, camB] })
    vi.mocked(apiUpdate).mockResolvedValue(updatedA)
    await act(async () => { await useCameraStore.getState().editCamera('cam-001', { name: 'A Updated' }) })
    expect(useCameraStore.getState().cameras[1].name).toBe('B')
  })
})

describe('useCameraStore — removeCamera', () => {
  it('removes the camera with matching id', async () => {
    useCameraStore.setState({ cameras: [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })], total: 2 })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
    const { cameras } = useCameraStore.getState()
    expect(cameras).toHaveLength(1)
    expect(cameras[0].id).toBe('cam-002')
  })

  it('decrements total by 1', async () => {
    useCameraStore.setState({ cameras: [makeCamera()], total: 3 })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
    expect(useCameraStore.getState().total).toBe(2)
  })

  it('clears selectedId when removing the selected camera', async () => {
    useCameraStore.setState({ cameras: [makeCamera()], selectedId: 'cam-001', total: 1 })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('preserves selectedId when removing a different camera', async () => {
    useCameraStore.setState({ cameras: [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })], selectedId: 'cam-002', total: 2 })
    vi.mocked(apiDelete).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().removeCamera('cam-001') })
    expect(useCameraStore.getState().selectedId).toBe('cam-002')
  })
})

describe('useCameraStore — selectCamera', () => {
  it('sets selectedId to the given id', () => {
    act(() => { useCameraStore.getState().selectCamera('cam-123') })
    expect(useCameraStore.getState().selectedId).toBe('cam-123')
  })

  it('sets selectedId to null when passed null', () => {
    useCameraStore.setState({ selectedId: 'cam-123' })
    act(() => { useCameraStore.getState().selectCamera(null) })
    expect(useCameraStore.getState().selectedId).toBeNull()
  })
})

describe('useCameraStore — setFilterStatus / setFilterSiteId', () => {
  it('setFilterStatus stores the status value', () => {
    act(() => { useCameraStore.getState().setFilterStatus('OFFLINE') })
    expect(useCameraStore.getState().filterStatus).toBe('OFFLINE')
  })

  it('setFilterStatus can be reset to empty string', () => {
    useCameraStore.setState({ filterStatus: 'ONLINE' })
    act(() => { useCameraStore.getState().setFilterStatus('') })
    expect(useCameraStore.getState().filterStatus).toBe('')
  })

  it('setFilterSiteId stores the site id', () => {
    act(() => { useCameraStore.getState().setFilterSiteId('site-42') })
    expect(useCameraStore.getState().filterSiteId).toBe('site-42')
  })
})

describe('useCameraStore — testCamera', () => {
  it('stores test result keyed by camera id', async () => {
    const result = { reachable: true, latency_ms: 18, message: 'OK' }
    vi.mocked(apiTest).mockResolvedValue(result)
    await act(async () => { await useCameraStore.getState().testCamera('cam-001') })
    expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
  })

  it('stores unreachable result correctly', async () => {
    const result = { reachable: false, latency_ms: null, message: 'Timeout' }
    vi.mocked(apiTest).mockResolvedValue(result)
    await act(async () => { await useCameraStore.getState().testCamera('cam-999') })
    expect(useCameraStore.getState().testResults['cam-999']).toEqual(result)
  })
})

describe('useCameraStore — startStream / stopStream', () => {
  it('startStream stores the HLS URL keyed by camera id', async () => {
    vi.mocked(apiStart).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'started' })
    await act(async () => { await useCameraStore.getState().startStream('cam-001') })
    expect(useCameraStore.getState().streamUrls['cam-001']).toContain('/hls/cam-001/index.m3u8')
  })

  it('startStream returns the full URL string', async () => {
    vi.mocked(apiStart).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'started' })
    let url!: string
    await act(async () => { url = await useCameraStore.getState().startStream('cam-001') })
    expect(url).toContain('/hls/cam-001/index.m3u8')
  })

  it('stopStream removes the URL entry for the camera', async () => {
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/hls.m3u8' } })
    vi.mocked(apiStop).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().stopStream('cam-001') })
    expect(useCameraStore.getState().streamUrls['cam-001']).toBeUndefined()
  })

  it('stopStream does not affect other stream entries', async () => {
    useCameraStore.setState({ streamUrls: { 'cam-001': 'http://x/a.m3u8', 'cam-002': 'http://x/b.m3u8' } })
    vi.mocked(apiStop).mockResolvedValue(undefined)
    await act(async () => { await useCameraStore.getState().stopStream('cam-001') })
    expect(useCameraStore.getState().streamUrls['cam-002']).toBe('http://x/b.m3u8')
  })
})
