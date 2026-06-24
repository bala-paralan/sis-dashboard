import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mock the API client so cameras.ts calls are interceptable ─────────────────
vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/api/client'
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

beforeEach(() => vi.clearAllMocks())

describe('fetchCameras', () => {
  it('calls GET /cameras with no query string when no params', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras()
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(expect.stringContaining('/cameras'))
  })

  it('appends siteId to query string when provided', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras({ siteId: 'site-01' })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(expect.stringContaining('siteId=site-01'))
  })

  it('appends status to query string when provided', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras({ status: 'ONLINE' })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(expect.stringContaining('status=ONLINE'))
  })

  it('appends page to query string when provided', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 2, limit: 24, count: 0 })
    await fetchCameras({ page: 2 })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })

  it('appends limit to query string when provided', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 10, count: 0 })
    await fetchCameras({ limit: 10 })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(expect.stringContaining('limit=10'))
  })

  it('combines multiple query params', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras({ status: 'OFFLINE', page: 3 })
    const url = vi.mocked(apiFetch).mock.calls[0][0] as string
    expect(url).toContain('status=OFFLINE')
    expect(url).toContain('page=3')
  })
})

describe('fetchCamera', () => {
  it('calls GET /cameras/:id with the correct id', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 'cam-001' })
    await fetchCamera('cam-001')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith('/cameras/cam-001')
  })
})

describe('createCamera', () => {
  it('calls POST /cameras with JSON body', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 'cam-new' })
    await createCamera({ name: 'New Cam', rtspUrl: 'rtsp://host/stream' })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/cameras',
      expect.objectContaining({
        method: 'POST',
        body:   JSON.stringify({ name: 'New Cam', rtspUrl: 'rtsp://host/stream' }),
      })
    )
  })
})

describe('updateCamera', () => {
  it('calls PUT /cameras/:id with the correct path and body', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ id: 'cam-001', name: 'Updated' })
    await updateCamera('cam-001', { name: 'Updated' })
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/cameras/cam-001',
      expect.objectContaining({
        method: 'PUT',
        body:   JSON.stringify({ name: 'Updated' }),
      })
    )
  })
})

describe('deleteCamera', () => {
  it('calls DELETE /cameras/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    await deleteCamera('cam-001')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/cameras/cam-001',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})

describe('testCamera', () => {
  it('calls POST /cameras/:id/test', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ reachable: true, latency_ms: 12, message: 'OK' })
    await testCamera('cam-001')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/cameras/cam-001/test',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('startStream', () => {
  it('calls POST /streams/:id/start', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ cameraId: 'cam-001', hlsUrl: '/hls/cam-001/index.m3u8', message: 'started' })
    await startStream('cam-001')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/streams/cam-001/start',
      expect.objectContaining({ method: 'POST' })
    )
  })
})

describe('stopStream', () => {
  it('calls DELETE /streams/:id', async () => {
    vi.mocked(apiFetch).mockResolvedValue(undefined)
    await stopStream('cam-001')
    expect(vi.mocked(apiFetch)).toHaveBeenCalledWith(
      '/streams/cam-001',
      expect.objectContaining({ method: 'DELETE' })
    )
  })
})
