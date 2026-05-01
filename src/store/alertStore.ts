import { create } from 'zustand'
import type { Alert, ThreatLevel, SensorFamily } from '@/types/sensors'
import {
  fetchAlerts,
  acknowledgeAlertApi,
  bulkAcknowledgeAlerts as bulkAckApi,
  dismissAlert as dismissAlertApi,
  fetchAlertsCsvUrl,
  type AlertListParams,
} from '@/api/alerts'

const MAX_ALERTS = 200

interface AlertFilter {
  threatLevel: ThreatLevel | 'ALL'
  sensorFamily: SensorFamily | 'ALL'
  acknowledged: 'ALL' | 'UNACKED' | 'ACKED'
}

interface AlertPagination {
  total: number
  page:  number
  limit: number
}

interface AlertState {
  // Live WS-driven alerts (in-memory ring buffer)
  alerts:           Alert[]
  threatAssessment: import('@/types/sensors').ThreatAssessment | null
  filter:           AlertFilter

  // Server-load state
  loading:          boolean
  loadError:        string | null
  pagination:       AlertPagination

  // Selected for bulk-ack
  selectedIds:      Set<string>

  // ── WS-driven actions (existing) ──────────────────────────────
  addAlert:           (alert: Alert) => void
  acknowledgeAlert:   (id: string, comment: string) => void
  setThreatAssessment:(ta: import('@/types/sensors').ThreatAssessment) => void
  setFilter:          (filter: Partial<AlertFilter>) => void
  filteredAlerts:     () => Alert[]

  // ── REST-driven actions (new) ──────────────────────────────────
  loadAlerts:           (params?: AlertListParams) => Promise<void>
  acknowledgeFromServer:(id: string, comment?: string) => Promise<void>
  bulkAcknowledgeAlerts:(ids: string[], comment?: string) => Promise<void>
  dismissAlert:         (id: string) => Promise<void>
  exportAlerts:         () => void

  // ── Selection helpers ──────────────────────────────────────────
  toggleSelected:  (id: string) => void
  selectAll:       (ids: string[]) => void
  clearSelection:  () => void
}

export const useAlertStore = create<AlertState>()((set, get) => ({
  alerts:           [],
  threatAssessment: null,
  filter: {
    threatLevel:  'ALL',
    sensorFamily: 'ALL',
    acknowledged: 'UNACKED',
  },
  loading:    false,
  loadError:  null,
  pagination: { total: 0, page: 1, limit: 50 },
  selectedIds: new Set<string>(),

  // ── WS-driven actions ────────────────────────────────────────────────────────

  addAlert: (alert: Alert) => {
    set((state) => {
      const alerts = [alert, ...state.alerts].slice(0, MAX_ALERTS)
      return { alerts }
    })
  },

  acknowledgeAlert: (id: string, comment: string) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, acknowledged: true, annotation: comment } : a
      ),
    }))
  },

  setThreatAssessment: (ta) => {
    set({ threatAssessment: ta })
  },

  setFilter: (filter: Partial<AlertFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }))
  },

  filteredAlerts: () => {
    const { alerts, filter } = get()
    return alerts.filter((alert) => {
      if (filter.threatLevel !== 'ALL' && alert.threat_level !== filter.threatLevel) return false
      if (filter.sensorFamily !== 'ALL' && alert.sensor_family !== filter.sensorFamily) return false
      if (filter.acknowledged === 'UNACKED' && alert.acknowledged) return false
      if (filter.acknowledged === 'ACKED' && !alert.acknowledged) return false
      return true
    })
  },

  // ── REST-driven actions ──────────────────────────────────────────────────────

  loadAlerts: async (params?: AlertListParams) => {
    set({ loading: true, loadError: null })
    try {
      const res = await fetchAlerts(params)
      set((state) => {
        // Merge server alerts into local ring buffer, deduplicating by id
        const existingIds = new Set(state.alerts.map((a) => a.id))
        const newAlerts = res.alerts.filter((a) => !existingIds.has(a.id))
        const merged = [...newAlerts, ...state.alerts].slice(0, MAX_ALERTS)
        return {
          alerts:     merged,
          loading:    false,
          pagination: { total: res.total, page: res.page, limit: res.limit },
        }
      })
    } catch (e) {
      set({ loading: false, loadError: e instanceof Error ? e.message : 'Failed to load alerts' })
    }
  },

  acknowledgeFromServer: async (id: string, comment?: string) => {
    try {
      const updated = await acknowledgeAlertApi(id, { comment })
      set((state) => ({
        alerts: state.alerts.map((a) => (a.id === id ? updated : a)),
      }))
    } catch (e) {
      set({ loadError: e instanceof Error ? e.message : 'Acknowledge failed' })
    }
  },

  bulkAcknowledgeAlerts: async (ids: string[], comment?: string) => {
    set({ loading: true, loadError: null })
    try {
      await bulkAckApi({ ids, comment })
      set((state) => ({
        loading:    false,
        selectedIds: new Set<string>(),
        alerts: state.alerts.map((a) =>
          ids.includes(a.id) ? { ...a, acknowledged: true, annotation: comment ?? '' } : a
        ),
      }))
    } catch (e) {
      set({ loading: false, loadError: e instanceof Error ? e.message : 'Bulk acknowledge failed' })
    }
  },

  dismissAlert: async (id: string) => {
    try {
      await dismissAlertApi(id)
      set((state) => ({
        alerts: state.alerts.filter((a) => a.id !== id),
        selectedIds: (() => {
          const next = new Set(state.selectedIds)
          next.delete(id)
          return next
        })(),
      }))
    } catch (e) {
      set({ loadError: e instanceof Error ? e.message : 'Dismiss failed' })
    }
  },

  exportAlerts: () => {
    const { filter } = get()
    const url = fetchAlertsCsvUrl({
      threatLevel:  filter.threatLevel,
      sensorFamily: filter.sensorFamily,
      acknowledged: filter.acknowledged === 'ALL'
        ? undefined
        : filter.acknowledged === 'ACKED',
    })
    const a = document.createElement('a')
    a.href = url
    a.download = `alerts-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  },

  // ── Selection ────────────────────────────────────────────────────────────────

  toggleSelected: (id: string) => {
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    })
  },

  selectAll: (ids: string[]) => {
    set({ selectedIds: new Set(ids) })
  },

  clearSelection: () => {
    set({ selectedIds: new Set<string>() })
  },
}))
