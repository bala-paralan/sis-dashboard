import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'

vi.mock('@/api/cameras', () => ({
  fetchCameras: vi.fn().mockResolvedValue({ cameras: [], total: 0, page: 1, limit: 24, count: 0 }),
  createCamera: vi.fn(),
  updateCamera: vi.fn(),
  deleteCamera: vi.fn().mockResolvedValue(undefined),
  testCamera: vi.fn(),
  startStream: vi.fn(),
  stopStream: vi.fn(),
}))

import {
  createCamera as mockCreate,
  updateCamera as mockUpdate,
  deleteCamera as mockDelete,
} from '@/api/cameras'

function makeCamera(id: string, name: string): Camera {
  return {
    id, name, manufacturer: null, model: null, siteId: null,
    location: null, status: 'ONLINE', lastSeenAt: null,
    createdBy: 'admin', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z',
  }
}

beforeEach(() => {
  useCameraStore.setState({
    cameras: [], total: 0, page: 1, loading: false, error: null,
    selectedId: null, streamUrls: {}, testResults: {},
    filterStatus: '', filterSiteId: '',
  })
  vi.clearAllMocks()
})

describe('cameraStore', () => {
  it('starts with empty cameras list', () => {
    expect(useCameraStore.getState().cameras).toHaveLength(0)
  })

  it('addCamera adds camera to the list', async () => {
    const newCam = makeCamera('c1', 'Camera One')
    vi.mocked(mockCreate).mockResolvedValue(newCam)
    await useCameraStore.getState().addCamera({ name: 'Camera One', rtspUrl: 'rtsp://x' })
    expect(useCameraStore.getState().cameras).toHaveLength(1)
    expect(useCameraStore.getState().cameras[0].name).toBe('Camera One')
  })

  it('editCamera updates existing camera', async () => {
    const existing = makeCamera('c1', 'Old Name')
    useCameraStore.setState({ cameras: [existing], total: 1 })
    vi.mocked(mockUpdate).mockResolvedValue({ ...existing, name: 'New Name' })
    await useCameraStore.getState().editCamera('c1', { name: 'New Name' })
    expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
  })

  it('removeCamera removes camera from the list', async () => {
    useCameraStore.setState({
      cameras: [makeCamera('c1', 'Cam A'), makeCamera('c2', 'Cam B')],
      total: 2,
    })
    await useCameraStore.getState().removeCamera('c1')
    expect(useCameraStore.getState().cameras).toHaveLength(1)
    expect(useCameraStore.getState().cameras[0].id).toBe('c2')
  })

  it('selectCamera sets selectedId', () => {
    useCameraStore.getState().selectCamera('c1')
    expect(useCameraStore.getState().selectedId).toBe('c1')
    useCameraStore.getState().selectCamera(null)
    expect(useCameraStore.getState().selectedId).toBeNull()
  })

  it('setFilterStatus updates filterStatus', () => {
    useCameraStore.getState().setFilterStatus('ONLINE')
    expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
  })

  it('setFilterSiteId updates filterSiteId', () => {
    useCameraStore.getState().setFilterSiteId('SITE-42')
    expect(useCameraStore.getState().filterSiteId).toBe('SITE-42')
  })

  it('loadCameras sets loading to false after completion', async () => {
    await useCameraStore.getState().loadCameras()
    expect(useCameraStore.getState().loading).toBe(false)
  })
})
