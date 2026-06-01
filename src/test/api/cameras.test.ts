import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchCameras, fetchCamera, createCamera, updateCamera, deleteCamera,
  testCamera, startStream, stopStream,
} from '@/api/cameras'

vi.mock('@/api/client', () => ({ apiFetch: vi.fn() }))
import * as clientModule from '@/api/client'

const mockCam = {
  id: 'c-001', name: 'Test Cam', manufacturer: null, model: null,
  siteId: null, location: null, status: 'ONLINE' as const,
  lastSeenAt: null, createdBy: 'admin', createdAt: '', updatedAt: '',
}

beforeEach(() => { vi.clearAllMocks() })

describe('fetchCameras', () => {
  it('calls apiFetch with /cameras path', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras()
    expect(clientModule.apiFetch).toHaveBeenCalledWith(expect.stringContaining('/cameras'))
  })

  it('includes status query param when provided', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras({ status: 'ONLINE' })
    expect(clientModule.apiFetch).toHaveBeenCalledWith(expect.stringContaining('status=ONLINE'))
  })

  it('includes siteId query param when provided', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
    await fetchCameras({ siteId: 'site-north' })
    expect(clientModule.apiFetch).toHaveBeenCalledWith(expect.stringContaining('siteId=site-north'))
  })

  it('includes page query param when provided', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue({ cameras: [], total: 0, page: 2, limit: 24, count: 0 })
    await fetchCameras({ page: 2 })
    expect(clientModule.apiFetch).toHaveBeenCalledWith(expect.stringContaining('page=2'))
  })

  it('returns the CameraListResponse from apiFetch', async () => {
    const response = { cameras: [mockCam], total: 1, page: 1, limit: 24, count: 1 }
    vi.mocked(clientModule.apiFetch).mockResolvedValue(response)
    const result = await fetchCameras()
    expect(result).toEqual(response)
  })
})

describe('fetchCamera', () => {
  it('calls apiFetch with /cameras/:id', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    await fetchCamera('c-001')
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/cameras/c-001')
  })

  it('returns the camera object', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    const result = await fetchCamera('c-001')
    expect(result).toEqual(mockCam)
  })
})

describe('createCamera', () => {
  it('calls apiFetch with POST /cameras', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    await createCamera({ name: 'New', rtspUrl: 'rtsp://x' })
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/cameras', expect.objectContaining({ method: 'POST' }))
  })

  it('passes name and rtspUrl in request body', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    await createCamera({ name: 'Cam A', rtspUrl: 'rtsp://10.0.0.1' })
    const body = JSON.parse((vi.mocked(clientModule.apiFetch).mock.calls[0][1]?.body as string) ?? '{}')
    expect(body.name).toBe('Cam A')
    expect(body.rtspUrl).toBe('rtsp://10.0.0.1')
  })

  it('returns the created camera', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    const result = await createCamera({ name: 'New', rtspUrl: 'rtsp://x' })
    expect(result).toEqual(mockCam)
  })
})

describe('updateCamera', () => {
  it('calls apiFetch with PUT /cameras/:id', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(mockCam)
    await updateCamera('c-001', { name: 'Updated' })
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/cameras/c-001', expect.objectContaining({ method: 'PUT' }))
  })
})

describe('deleteCamera', () => {
  it('calls apiFetch with DELETE /cameras/:id', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(undefined)
    await deleteCamera('c-001')
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/cameras/c-001', expect.objectContaining({ method: 'DELETE' }))
  })
})

describe('testCamera', () => {
  it('calls apiFetch with POST /cameras/:id/test', async () => {
    const result = { reachable: true, latency_ms: 12, message: 'OK' }
    vi.mocked(clientModule.apiFetch).mockResolvedValue(result)
    const res = await testCamera('c-001')
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/cameras/c-001/test', expect.objectContaining({ method: 'POST' }))
    expect(res).toEqual(result)
  })
})

describe('startStream', () => {
  it('calls apiFetch with POST /streams/:id/start', async () => {
    const result = { cameraId: 'c-001', hlsUrl: '/hls/c-001.m3u8', message: 'OK' }
    vi.mocked(clientModule.apiFetch).mockResolvedValue(result)
    const res = await startStream('c-001')
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/streams/c-001/start', expect.objectContaining({ method: 'POST' }))
    expect(res.hlsUrl).toBe('/hls/c-001.m3u8')
  })
})

describe('stopStream', () => {
  it('calls apiFetch with DELETE /streams/:id', async () => {
    vi.mocked(clientModule.apiFetch).mockResolvedValue(undefined)
    await stopStream('c-001')
    expect(clientModule.apiFetch).toHaveBeenCalledWith('/streams/c-001', expect.objectContaining({ method: 'DELETE' }))
  })
})
