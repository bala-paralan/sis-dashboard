import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn(),
  testCamera:   vi.fn(),
  startStream:  vi.fn(),
  stopStream:   vi.fn(),
}))

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Camera',
    manufacturer: 'Axis',
    model:        'P1448',
    siteId:       'site-a',
    location:     'Main Gate',
    status:       'ONLINE',
    lastSeenAt:   '2026-01-01T00:00:00Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

beforeEach(() => {
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

describe('cameraStore', () => {
  it('starts with empty cameras list', () => {
    expect(useCameraStore.getState().cameras).toHaveLength(0)
  })

  it('addCamera appends to cameras list', async () => {
    const { createCamera } = await import('@/api/cameras')
    vi.mocked(createCamera).mockResolvedValueOnce(makeCamera())
    await useCameraStore.getState().addCamera({ name: 'Gate Camera', rtspUrl: 'rtsp://x' })
    expect(useCameraStore.getState().cameras).toHaveLength(1)
    expect(useCameraStore.getState().cameras[0].name).toBe('Gate Camera')
  })

  it('addCamera increments total', async () => {
    const { createCamera } = await import('@/api/cameras')
    vi.mocked(createCamera).mockResolvedValueOnce(makeCamera())
    await useCameraStore.getState().addCamera({ name: 'Gate Camera', rtspUrl: 'rtsp://x' })
    expect(useCameraStore.getState().total).toBe(1)
  })

  it('editCamera updates the camera in state', async () => {
    useCameraStore.setState({ cameras: [makeCamera()] })
    const { updateCamera } = await import('@/api/cameras')
    vi.mocked(updateCamera).mockResolvedValueOnce(makeCamera({ name: 'Updated Cam' }))
    await useCameraStore.getState().editCamera('cam-001', { name: 'Updated Cam' })
    expect(useCameraStore.getState().cameras[0].name).toBe('Updated Cam')
  })

  it('removeCamera removes the camera from state', async () => {
    useCameraStore.setState({ cameras: [makeCamera()], total: 1 })
    const { deleteCamera } = await import('@/api/cameras')
    vi.mocked(deleteCamera).mockResolvedValueOnce(undefined)
    await useCameraStore.getState().removeCamera('cam-001')
    expect(useCameraStore.getState().cameras).toHaveLength(0)
    expect(useCameraStore.getState().total).toBe(0)
  })

  it('selectCamera sets selectedId', () => {
    useCameraStore.getState().selectCamera('cam-001')
    expect(useCameraStore.getState().selectedId).toBe('cam-001')
  })

  it('selectCamera clears selectedId when null passed', () => {
    useCameraStore.getState().selectCamera('cam-001')
    useCameraStore.getState().selectCamera(null)
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('setFilterStatus updates filterStatus', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    useCameraStore.getState().setFilterSiteId('site-b')
    expect(useCameraStore.getState().filterSiteId).toBe('site-b')
  })

  it('loadCameras sets loading to false after completion', async () => {
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().loading).toBe(false)
  })
})
