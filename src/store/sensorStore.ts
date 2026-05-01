import { create } from 'zustand'
import type { SensorPayload, Track } from '@/types/sensors'
import {
  fetchSensors,
  fetchSensor,
  updateSensorConfig as updateConfigApi,
  setSensorThresholds as setThresholdsApi,
  toggleSensorActive as toggleActiveApi,
  type SensorConfig,
  type SensorListParams,
  type UpdateSensorConfigInput,
  type SensorThresholds,
} from '@/api/sensors'

const MAX_HISTORY = 100

// ── Live WS state ─────────────────────────────────────────────────────────────

interface SensorState {
  // Live WebSocket data
  sensors:         Map<string, SensorPayload>
  sensorHistory:   Map<string, SensorPayload[]>
  tracks:          Track[]
  selectedSensorId:string | null

  // Registry (REST-backed)
  registryList:    SensorConfig[]
  registryTotal:   number
  registryPage:    number
  registryLimit:   number
  registryLoading: boolean
  registryError:   string | null
  selectedRegistryId: string | null

  // ── Live WS actions (existing) ────────────────────────────────
  updateSensor: (payload: SensorPayload) => void
  updateTracks: (tracks: Track[]) => void
  selectSensor: (id: string | null) => void

  // ── Registry REST actions ─────────────────────────────────────
  loadSensors:          (params?: SensorListParams) => Promise<void>
  reloadSensor:         (id: string) => Promise<void>
  selectRegistrySensor: (id: string | null) => void
  updateConfig:         (id: string, input: UpdateSensorConfigInput) => Promise<void>
  setThresholds:        (id: string, thresholds: SensorThresholds) => Promise<void>
  toggleActive:         (id: string, active: boolean) => Promise<void>
}

export const useSensorStore = create<SensorState>()((set, get) => ({
  // ── Live WS initial state ─────────────────────────────────────────────────────
  sensors:          new Map(),
  sensorHistory:    new Map(),
  tracks:           [],
  selectedSensorId: null,

  // ── Registry initial state ────────────────────────────────────────────────────
  registryList:      [],
  registryTotal:     0,
  registryPage:      1,
  registryLimit:     30,
  registryLoading:   false,
  registryError:     null,
  selectedRegistryId: null,

  // ── Live WS actions ───────────────────────────────────────────────────────────

  updateSensor: (payload: SensorPayload) => {
    set((state) => {
      const sensors = new Map(state.sensors)
      sensors.set(payload.sensor_id, payload)

      const sensorHistory = new Map(state.sensorHistory)
      const history = sensorHistory.get(payload.sensor_id) ?? []
      const newHistory = [...history, payload].slice(-MAX_HISTORY)
      sensorHistory.set(payload.sensor_id, newHistory)

      return { sensors, sensorHistory }
    })
  },

  updateTracks: (tracks: Track[]) => {
    set({ tracks })
  },

  selectSensor: (id: string | null) => {
    set({ selectedSensorId: id })
  },

  // ── Registry REST actions ─────────────────────────────────────────────────────

  loadSensors: async (params?: SensorListParams) => {
    set({ registryLoading: true, registryError: null })
    try {
      const res = await fetchSensors(params)
      set({
        registryList:    res.sensors,
        registryTotal:   res.total,
        registryPage:    res.page,
        registryLimit:   res.limit,
        registryLoading: false,
      })
    } catch (e) {
      set({
        registryLoading: false,
        registryError: e instanceof Error ? e.message : 'Failed to load sensors',
      })
    }
  },

  reloadSensor: async (id: string) => {
    try {
      const updated = await fetchSensor(id)
      set((state) => ({
        registryList: state.registryList.map((s) => (s.sensor_id === id ? updated : s)),
      }))
    } catch (e) {
      set({ registryError: e instanceof Error ? e.message : 'Failed to reload sensor' })
    }
  },

  selectRegistrySensor: (id: string | null) => {
    set({ selectedRegistryId: id })
  },

  updateConfig: async (id: string, input: UpdateSensorConfigInput) => {
    set({ registryLoading: true, registryError: null })
    try {
      const updated = await updateConfigApi(id, input)
      set((state) => ({
        registryLoading: false,
        registryList: state.registryList.map((s) => (s.sensor_id === id ? updated : s)),
      }))
    } catch (e) {
      set({
        registryLoading: false,
        registryError: e instanceof Error ? e.message : 'Update failed',
      })
      throw e
    }
  },

  setThresholds: async (id: string, thresholds: SensorThresholds) => {
    set({ registryLoading: true, registryError: null })
    try {
      const updated = await setThresholdsApi(id, thresholds)
      set((state) => ({
        registryLoading: false,
        registryList: state.registryList.map((s) => (s.sensor_id === id ? updated : s)),
      }))
    } catch (e) {
      set({
        registryLoading: false,
        registryError: e instanceof Error ? e.message : 'Set thresholds failed',
      })
      throw e
    }
  },

  toggleActive: async (id: string, active: boolean) => {
    // Optimistic update
    set((state) => ({
      registryList: state.registryList.map((s) =>
        s.sensor_id === id ? { ...s, active } : s
      ),
    }))
    try {
      const updated = await toggleActiveApi(id, active)
      set((state) => ({
        registryList: state.registryList.map((s) => (s.sensor_id === id ? updated : s)),
      }))
    } catch (e) {
      // Roll back optimistic update
      set((state) => ({
        registryList: state.registryList.map((s) =>
          s.sensor_id === id ? { ...s, active: !active } : s
        ),
        registryError: e instanceof Error ? e.message : 'Toggle active failed',
      }))
    }
  },
}))

// Convenience selectors
export const getRegistrySensor = (id: string) =>
  useSensorStore.getState().registryList.find((s) => s.sensor_id === id) ?? null
