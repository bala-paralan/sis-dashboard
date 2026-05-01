import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { act } from '@testing-library/react'
import { useSensorStore } from '@/store/sensorStore'
import * as sensorsApi from '@/api/sensors'
import type { SensorPayload, Track } from '@/types/sensors'
import type { SensorConfig } from '@/api/sensors'

vi.mock('@/api/sensors')

function mockPayload(overrides?: Partial<SensorPayload>): SensorPayload {
  return {
    sensor_id: 'S02-GEO-001',
    modality: 'SEISMIC',
    timestamp: '2026-04-11T10:00:00.000Z',
    site_id: 'BOP-ALPHA-01',
    bop_id: 'BOP-001',
    quality_score: 0.95,
    raw_value: { pgv: 0.05, rms: 0.02 },
    sensor_status: 'ONLINE',
    ...overrides,
  }
}

function mockTrack(overrides?: Partial<Track>): Track {
  return {
    track_id: 'T-001',
    lat: 21.9452,
    lon: 88.1234,
    range_m: 150,
    velocity: 1.2,
    heading: 45,
    class: 'HUMAN',
    confidence: 0.87,
    age_frames: 10,
    ...overrides,
  }
}

function mockSensorConfig(overrides?: Partial<SensorConfig>): SensorConfig {
  return {
    sensor_id:    'S02-GEO-001',
    name:         'Geophone Alpha',
    site_id:      'BOP-ALPHA-01',
    bop_id:       'BOP-001',
    location:     'North perimeter',
    modality:     'SEISMIC',
    status:       'ONLINE',
    active:       true,
    firmware_ver: '2.1.0',
    lat:          21.9452,
    lon:          88.1234,
    thresholds:   { qualityMin: 0.5, alertOnOffline: true, alertOnDegraded: true },
    last_seen_at: '2026-04-11T10:00:00.000Z',
    created_at:   '2026-01-01T00:00:00.000Z',
    updated_at:   '2026-04-11T10:00:00.000Z',
    ...overrides,
  }
}

const resetState = () =>
  useSensorStore.setState({
    sensors:            new Map(),
    sensorHistory:      new Map(),
    tracks:             [],
    selectedSensorId:   null,
    registryList:       [],
    registryTotal:      0,
    registryPage:       1,
    registryLimit:      30,
    registryLoading:    false,
    registryError:      null,
    selectedRegistryId: null,
  })

beforeEach(() => {
  vi.clearAllMocks()
  resetState()
})

// ── Live WS actions ─────────────────────────────────────────────────────────

describe('useSensorStore', () => {
  describe('initial state', () => {
    it('sensors map is empty', () => {
      expect(useSensorStore.getState().sensors.size).toBe(0)
    })

    it('tracks is an empty array', () => {
      expect(useSensorStore.getState().tracks).toEqual([])
    })

    it('selectedSensorId is null', () => {
      expect(useSensorStore.getState().selectedSensorId).toBeNull()
    })

    it('registryList is empty', () => {
      expect(useSensorStore.getState().registryList).toEqual([])
    })

    it('registryLoading is false', () => {
      expect(useSensorStore.getState().registryLoading).toBe(false)
    })
  })

  describe('updateSensor', () => {
    it('stores payload in sensors map', () => {
      const payload = mockPayload()
      act(() => { useSensorStore.getState().updateSensor(payload) })
      expect(useSensorStore.getState().sensors.get('S02-GEO-001')).toEqual(payload)
    })

    it('updates existing sensor with the same sensor_id', () => {
      const first  = mockPayload({ timestamp: '2026-04-11T10:00:00.000Z', quality_score: 0.80 })
      const second = mockPayload({ timestamp: '2026-04-11T10:00:05.000Z', quality_score: 0.92 })
      act(() => {
        useSensorStore.getState().updateSensor(first)
        useSensorStore.getState().updateSensor(second)
      })
      expect(useSensorStore.getState().sensors.size).toBe(1)
      expect(useSensorStore.getState().sensors.get('S02-GEO-001')).toEqual(second)
    })

    it('appends payload to sensorHistory', () => {
      const payload = mockPayload()
      act(() => { useSensorStore.getState().updateSensor(payload) })
      const history = useSensorStore.getState().sensorHistory.get('S02-GEO-001')
      expect(history).toHaveLength(1)
      expect(history![0]).toEqual(payload)
    })

    it('caps sensorHistory at 100 items', () => {
      act(() => {
        for (let i = 0; i < 105; i++) {
          useSensorStore.getState().updateSensor(
            mockPayload({ timestamp: `2026-04-11T10:00:${String(i).padStart(2, '0')}.000Z` })
          )
        }
      })
      expect(useSensorStore.getState().sensorHistory.get('S02-GEO-001')).toHaveLength(100)
    })

    it('stores multiple sensors independently', () => {
      const pA = mockPayload({ sensor_id: 'S02-GEO-001' })
      const pB = mockPayload({ sensor_id: 'S03-ACO-002', modality: 'ACOUSTIC' })
      act(() => {
        useSensorStore.getState().updateSensor(pA)
        useSensorStore.getState().updateSensor(pB)
      })
      expect(useSensorStore.getState().sensors.size).toBe(2)
    })
  })

  describe('updateTracks', () => {
    it('replaces the tracks array', () => {
      const tracks = [mockTrack({ track_id: 'T-001' }), mockTrack({ track_id: 'T-002' })]
      act(() => { useSensorStore.getState().updateTracks(tracks) })
      expect(useSensorStore.getState().tracks).toEqual(tracks)
    })

    it('with empty array clears tracks', () => {
      act(() => {
        useSensorStore.getState().updateTracks([mockTrack()])
        useSensorStore.getState().updateTracks([])
      })
      expect(useSensorStore.getState().tracks).toEqual([])
    })
  })

  describe('selectSensor', () => {
    it('sets selectedSensorId', () => {
      act(() => { useSensorStore.getState().selectSensor('S02-GEO-001') })
      expect(useSensorStore.getState().selectedSensorId).toBe('S02-GEO-001')
    })

    it('null clears the selection', () => {
      act(() => {
        useSensorStore.getState().selectSensor('S02-GEO-001')
        useSensorStore.getState().selectSensor(null)
      })
      expect(useSensorStore.getState().selectedSensorId).toBeNull()
    })
  })

  // ── Registry REST actions ──────────────────────────────────────────────────

  describe('loadSensors', () => {
    it('sets registryLoading true then false on success', async () => {
      ;(sensorsApi.fetchSensors as Mock).mockResolvedValueOnce({
        total: 2, page: 1, limit: 30, count: 2,
        sensors: [mockSensorConfig({ sensor_id: 'S-1' }), mockSensorConfig({ sensor_id: 'S-2' })],
      })
      const promise = act(() => useSensorStore.getState().loadSensors())
      expect(useSensorStore.getState().registryLoading).toBe(true)
      await promise
      expect(useSensorStore.getState().registryLoading).toBe(false)
    })

    it('populates registryList with server response', async () => {
      const sensors = [mockSensorConfig({ sensor_id: 'S-1' }), mockSensorConfig({ sensor_id: 'S-2' })]
      ;(sensorsApi.fetchSensors as Mock).mockResolvedValueOnce({ total: 2, page: 1, limit: 30, count: 2, sensors })
      await act(() => useSensorStore.getState().loadSensors())
      expect(useSensorStore.getState().registryList).toHaveLength(2)
      expect(useSensorStore.getState().registryList[0].sensor_id).toBe('S-1')
    })

    it('updates pagination fields', async () => {
      ;(sensorsApi.fetchSensors as Mock).mockResolvedValueOnce({ total: 90, page: 2, limit: 30, count: 30, sensors: [] })
      await act(() => useSensorStore.getState().loadSensors({ page: 2 }))
      expect(useSensorStore.getState().registryTotal).toBe(90)
      expect(useSensorStore.getState().registryPage).toBe(2)
    })

    it('sets registryError on failure', async () => {
      ;(sensorsApi.fetchSensors as Mock).mockRejectedValueOnce(new Error('Network error'))
      await act(() => useSensorStore.getState().loadSensors())
      expect(useSensorStore.getState().registryError).toBe('Network error')
      expect(useSensorStore.getState().registryLoading).toBe(false)
    })
  })

  describe('selectRegistrySensor', () => {
    it('sets selectedRegistryId', () => {
      act(() => { useSensorStore.getState().selectRegistrySensor('S02-GEO-001') })
      expect(useSensorStore.getState().selectedRegistryId).toBe('S02-GEO-001')
    })

    it('null clears the selection', () => {
      act(() => {
        useSensorStore.getState().selectRegistrySensor('S02-GEO-001')
        useSensorStore.getState().selectRegistrySensor(null)
      })
      expect(useSensorStore.getState().selectedRegistryId).toBeNull()
    })
  })

  describe('updateConfig', () => {
    it('replaces the matching sensor in registryList', async () => {
      const original = mockSensorConfig({ sensor_id: 'S-1', name: 'Old name' })
      const updated  = mockSensorConfig({ sensor_id: 'S-1', name: 'New name' })
      useSensorStore.setState({ registryList: [original] })
      ;(sensorsApi.updateSensorConfig as Mock).mockResolvedValueOnce(updated)
      await act(() => useSensorStore.getState().updateConfig('S-1', { name: 'New name' }))
      expect(useSensorStore.getState().registryList[0].name).toBe('New name')
    })

    it('throws and sets registryError on failure', async () => {
      ;(sensorsApi.updateSensorConfig as Mock).mockRejectedValueOnce(new Error('Save failed'))
      await expect(act(() => useSensorStore.getState().updateConfig('S-1', { name: 'X' }))).rejects.toThrow()
      expect(useSensorStore.getState().registryError).toBe('Save failed')
    })
  })

  describe('setThresholds', () => {
    it('replaces thresholds in registryList entry', async () => {
      const original = mockSensorConfig({ sensor_id: 'S-1', thresholds: { qualityMin: 0.3 } })
      const updated  = mockSensorConfig({ sensor_id: 'S-1', thresholds: { qualityMin: 0.8 } })
      useSensorStore.setState({ registryList: [original] })
      ;(sensorsApi.setSensorThresholds as Mock).mockResolvedValueOnce(updated)
      await act(() => useSensorStore.getState().setThresholds('S-1', { qualityMin: 0.8 }))
      expect(useSensorStore.getState().registryList[0].thresholds.qualityMin).toBe(0.8)
    })
  })

  describe('toggleActive', () => {
    it('optimistically sets active flag, then confirms from server', async () => {
      const sensor = mockSensorConfig({ sensor_id: 'S-1', active: true })
      const serverResponse = mockSensorConfig({ sensor_id: 'S-1', active: false })
      useSensorStore.setState({ registryList: [sensor] })
      ;(sensorsApi.toggleSensorActive as Mock).mockResolvedValueOnce(serverResponse)
      await act(() => useSensorStore.getState().toggleActive('S-1', false))
      expect(useSensorStore.getState().registryList[0].active).toBe(false)
    })

    it('rolls back optimistic update on failure', async () => {
      const sensor = mockSensorConfig({ sensor_id: 'S-1', active: true })
      useSensorStore.setState({ registryList: [sensor] })
      ;(sensorsApi.toggleSensorActive as Mock).mockRejectedValueOnce(new Error('Server down'))
      await act(() => useSensorStore.getState().toggleActive('S-1', false))
      // Should roll back to original true
      expect(useSensorStore.getState().registryList[0].active).toBe(true)
      expect(useSensorStore.getState().registryError).toBe('Server down')
    })
  })
})
