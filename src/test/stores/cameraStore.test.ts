import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useCameraStore } from '@/store/cameraStore'
import type { Camera } from '@/api/cameras'
import * as camerasApi from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           overrides?.id ?? 'cam-001',
    name:         overrides?.name ?? 'Main Gate',
    manufacturer: overrides?.manufacturer ?? 'Hikvision',
    model:        overrides?.model ?? 'DS-2CD2T47G2',
    siteId:       overrides?.siteId ?? 'BOP-ALPHA-01',
    location:     overrides?.location ?? 'Gate 1 North',
    status:       overrides?.status ?? 'ONLINE',
    lastSeenAt:   overrides?.lastSeenAt ?? '2026-04-11T10:00:00.000Z',
    createdBy:    overrides?.createdBy ?? 'admin',
    createdAt:    overrides?.createdAt ?? '2026-04-01T00:00:00.000Z',
    updatedAt:    overrides?.updatedAt ?? '2026-04-11T10:00:00.000Z',
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
  vi.restoreAllMocks()
})

describe('useCameraStore', () => {
  describe('initial state', () => {
    it('cameras array is empty', () => {
      expect(useCameraStore.getState().cameras).toEqual([])
    })

    it('loading is false', () => {
      expect(useCameraStore.getState().loading).toBe(false)
    })

    it('error is null', () => {
      expect(useCameraStore.getState().error).toBeNull()
    })
  })

  describe('loadCameras', () => {
    it('sets loading to true while fetching', async () => {
      let resolvePromise!: (v: unknown) => void
      vi.spyOn(camerasApi, 'fetchCameras').mockReturnValue(
        new Promise((r) => { resolvePromise = r })
      )
      const loadPromise = act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().loading).toBe(true)
      resolvePromise({ cameras: [], total: 0, page: 1, limit: 24, count: 0 })
      await loadPromise
    })

    it('populates cameras from fetch result', async () => {
      const cams = [makeCamera({ id: 'cam-001' }), makeCamera({ id: 'cam-002' })]
      vi.spyOn(camerasApi, 'fetchCameras').mockResolvedValue({
        cameras: cams, total: 2, page: 1, limit: 24, count: 2,
      })
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().cameras).toHaveLength(2)
      expect(useCameraStore.getState().total).toBe(2)
    })

    it('sets error when fetch fails', async () => {
      vi.spyOn(camerasApi, 'fetchCameras').mockRejectedValue(new Error('Network error'))
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().error).toBe('Network error')
    })

    it('clears loading and error on success', async () => {
      vi.spyOn(camerasApi, 'fetchCameras').mockResolvedValue({
        cameras: [], total: 0, page: 1, limit: 24, count: 0,
      })
      await act(() => useCameraStore.getState().loadCameras())
      expect(useCameraStore.getState().loading).toBe(false)
      expect(useCameraStore.getState().error).toBeNull()
    })
  })

  describe('addCamera', () => {
    it('prepends new camera to the list', async () => {
      const cam = makeCamera({ id: 'cam-new' })
      vi.spyOn(camerasApi, 'createCamera').mockResolvedValue(cam)
      await act(() =>
        useCameraStore.getState().addCamera({
          name: 'Main Gate', rtspUrl: 'rtsp://192.168.1.1/stream',
        })
      )
      expect(useCameraStore.getState().cameras[0].id).toBe('cam-new')
    })

    it('increments total count after add', async () => {
      const cam = makeCamera({ id: 'cam-new' })
      vi.spyOn(camerasApi, 'createCamera').mockResolvedValue(cam)
      await act(() =>
        useCameraStore.getState().addCamera({
          name: 'Main Gate', rtspUrl: 'rtsp://192.168.1.1/stream',
        })
      )
      expect(useCameraStore.getState().total).toBe(1)
    })
  })

  describe('editCamera', () => {
    it('updates the camera with matching id', async () => {
      const original = makeCamera({ id: 'cam-001', name: 'Old Name' })
      useCameraStore.setState({ cameras: [original], total: 1 })
      const updated = makeCamera({ id: 'cam-001', name: 'New Name' })
      vi.spyOn(camerasApi, 'updateCamera').mockResolvedValue(updated)
      await act(() =>
        useCameraStore.getState().editCamera('cam-001', { name: 'New Name' })
      )
      expect(useCameraStore.getState().cameras[0].name).toBe('New Name')
    })
  })

  describe('removeCamera', () => {
    it('removes camera with matching id from list', async () => {
      const cam = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1 })
      vi.spyOn(camerasApi, 'deleteCamera').mockResolvedValue(undefined)
      await act(() => useCameraStore.getState().removeCamera('cam-001'))
      expect(useCameraStore.getState().cameras).toHaveLength(0)
      expect(useCameraStore.getState().total).toBe(0)
    })

    it('clears selectedId if the deleted camera was selected', async () => {
      const cam = makeCamera({ id: 'cam-001' })
      useCameraStore.setState({ cameras: [cam], total: 1, selectedId: 'cam-001' })
      vi.spyOn(camerasApi, 'deleteCamera').mockResolvedValue(undefined)
      await act(() => useCameraStore.getState().removeCamera('cam-001'))
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('testCamera', () => {
    it('stores test result for the camera', async () => {
      const result = { reachable: true, latency_ms: 12, message: 'OK' }
      vi.spyOn(camerasApi, 'testCamera').mockResolvedValue(result)
      await act(() => useCameraStore.getState().testCamera('cam-001'))
      expect(useCameraStore.getState().testResults['cam-001']).toEqual(result)
    })
  })

  describe('selectCamera', () => {
    it('sets selectedId', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-001')
      })
      expect(useCameraStore.getState().selectedId).toBe('cam-001')
    })

    it('clears selectedId when null is passed', () => {
      act(() => {
        useCameraStore.getState().selectCamera('cam-001')
        useCameraStore.getState().selectCamera(null)
      })
      expect(useCameraStore.getState().selectedId).toBeNull()
    })
  })

  describe('filters', () => {
    it('setFilterStatus updates filterStatus', () => {
      act(() => {
        useCameraStore.getState().setFilterStatus('ONLINE')
      })
      expect(useCameraStore.getState().filterStatus).toBe('ONLINE')
    })

    it('setFilterSiteId updates filterSiteId', () => {
      act(() => {
        useCameraStore.getState().setFilterSiteId('BOP-ALPHA-01')
      })
      expect(useCameraStore.getState().filterSiteId).toBe('BOP-ALPHA-01')
    })
  })
})
