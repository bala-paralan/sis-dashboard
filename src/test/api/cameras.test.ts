import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import {
  fetchCameras,
  fetchCamera,
  createCamera,
  updateCamera,
  deleteCamera,
  testCamera,
  startStream,
  stopStream,
} from '@/api/cameras'
import { apiFetch } from '@/api/client'

const mockApiFetch = vi.mocked(apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const CAMERA = {
  id: 'cam-1',
  name: 'Gate Cam',
  manufacturer: 'Axis',
  model: 'P3245',
  siteId: 'SITE-01',
  location: 'Gate A',
  status: 'ONLINE' as const,
  lastSeenAt: '2026-01-01T00:00:00Z',
  createdBy: 'user-1',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
}

// ── fetchCameras ──────────────────────────────────────────────────────────────

describe('fetchCameras', () => {
  it('calls /cameras with no query string when no params given', async () => {
    mockApiFetch.mockResolvedValueOnce({ total: 0, page: 1, limit: 20, count: 0, cameras: [] })
    await fetchCameras()
    expect(mockApiFetch).toHaveBeenCalledWith('/cameras?')
  })

  it('appends siteId param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce({ total: 0, page: 1, limit: 20, count: 0, cameras: [] })
    await fetchCameras({ siteId: 'SITE-01' })
    const path = mockApiFetch.mock.calls[0][0] as string
    expect(path).toContain('siteId=SITE-01')
  })

  it('appends status param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce({ total: 0, page: 1, limit: 20, count: 0, cameras: [] })
    await fetchCameras({ status: 'ONLINE' })
    const path = mockApiFetch.mock.calls[0][0] as string
    expect(path).toContain('status=ONLINE')
  })

  it('appends page and limit params', async () => {
    mockApiFetch.mockResolvedValueOnce({ total: 10, page: 2, limit: 5, count: 5, cameras: [] })
    await fetchCameras({ page: 2, limit: 5 })
    const path = mockApiFetch.mock.calls[0][0] as string
    expect(path).toContain('page=2')
    expect(path).toContain('limit=5')
  })

  it('returns CameraListResponse', async () => {
    const resp = { total: 1, page: 1, limit: 20, count: 1, cameras: [CAMERA] }
    mockApiFetch.mockResolvedValueOnce(resp)
    const result = await fetchCameras()
    expect(result.cameras).toHaveLength(1)
    expect(result.cameras[0].name).toBe('Gate Cam')
  })
})

// ── fetchCamera ──────────────────────────────────────────────────────────────

describe('fetchCamera', () => {
  it('calls /cameras/:id', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    await fetchCamera('cam-1')
    expect(mockApiFetch).toHaveBeenCalledWith('/cameras/cam-1')
  })

  it('returns Camera object', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    const result = await fetchCamera('cam-1')
    expect(result).toEqual(CAMERA)
  })
})

// ── createCamera ──────────────────────────────────────────────────────────────

describe('createCamera', () => {
  it('sends POST to /cameras', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    await createCamera({ name: 'Gate Cam', rtspUrl: 'rtsp://192.168.1.1/stream' })
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/cameras',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('includes camera data in request body', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    await createCamera({ name: 'Gate Cam', rtspUrl: 'rtsp://192.168.1.1/stream', siteId: 'SITE-01' })
    const body = JSON.parse(mockApiFetch.mock.calls[0][1]?.body as string)
    expect(body.name).toBe('Gate Cam')
    expect(body.siteId).toBe('SITE-01')
  })

  it('returns the created Camera', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    const result = await createCamera({ name: 'Gate Cam', rtspUrl: 'rtsp://192.168.1.1/stream' })
    expect(result).toEqual(CAMERA)
  })
})

// ── updateCamera ──────────────────────────────────────────────────────────────

describe('updateCamera', () => {
  it('sends PUT to /cameras/:id', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    await updateCamera('cam-1', { name: 'Updated Cam' })
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/cameras/cam-1',
      expect.objectContaining({ method: 'PUT' })
    )
  })

  it('includes updated fields in request body', async () => {
    mockApiFetch.mockResolvedValueOnce(CAMERA)
    await updateCamera('cam-1', { name: 'Updated Cam', location: 'Gate B' })
    const body = JSON.parse(mockApiFetch.mock.calls[0][1]?.body as string)
    expect(body.name).toBe('Updated Cam')
    expect(body.location).toBe('Gate B')
  })
})

// ── deleteCamera ──────────────────────────────────────────────────────────────

describe('deleteCamera', () => {
  it('sends DELETE to /cameras/:id', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined)
    await deleteCamera('cam-1')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/cameras/cam-1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

// ── testCamera ──────────────────────────────────────────────────────────────

describe('testCamera', () => {
  it('sends POST to /cameras/:id/test', async () => {
    mockApiFetch.mockResolvedValueOnce({ reachable: true, latency_ms: 12, message: 'OK' })
    await testCamera('cam-1')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/cameras/cam-1/test',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns TestResult', async () => {
    const testResult = { reachable: true, latency_ms: 12, message: 'Stream reachable' }
    mockApiFetch.mockResolvedValueOnce(testResult)
    const result = await testCamera('cam-1')
    expect(result.reachable).toBe(true)
    expect(result.latency_ms).toBe(12)
  })
})

// ── startStream ──────────────────────────────────────────────────────────────

describe('startStream', () => {
  it('sends POST to /streams/:id/start', async () => {
    mockApiFetch.mockResolvedValueOnce({ cameraId: 'cam-1', hlsUrl: 'http://hls', message: 'Started' })
    await startStream('cam-1')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/streams/cam-1/start',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns StreamStartResponse with hlsUrl', async () => {
    const resp = { cameraId: 'cam-1', hlsUrl: 'http://hls/stream.m3u8', message: 'Started' }
    mockApiFetch.mockResolvedValueOnce(resp)
    const result = await startStream('cam-1')
    expect(result.hlsUrl).toBe('http://hls/stream.m3u8')
  })
})

// ── stopStream ──────────────────────────────────────────────────────────────

describe('stopStream', () => {
  it('sends DELETE to /streams/:id', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined)
    await stopStream('cam-1')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/streams/cam-1',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
