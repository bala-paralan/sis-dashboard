import { create } from 'zustand'
import type { Alert, ThreatAssessment, ThreatLevel, SensorFamily } from '@/types/sensors'

const MAX_ALERTS = 200

export type TimeRange = '1h' | '6h' | '24h' | 'ALL'

interface AlertFilter {
  threatLevel: ThreatLevel | 'ALL'
  sensorFamily: SensorFamily | 'ALL'
  acknowledged: 'ALL' | 'UNACKED' | 'ACKED'
  timeRange: TimeRange
}

interface AlertState {
  alerts: Alert[]
  threatAssessment: ThreatAssessment | null
  filter: AlertFilter
  addAlert: (alert: Alert) => void
  acknowledgeAlert: (id: string, comment: string) => void
  acknowledgeAll: (comment: string) => void
  setThreatAssessment: (ta: ThreatAssessment) => void
  setFilter: (filter: Partial<AlertFilter>) => void
  filteredAlerts: () => Alert[]
}

const TIME_RANGE_MS: Record<TimeRange, number> = {
  '1h':  60 * 60 * 1000,
  '6h':  6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  'ALL': Infinity,
}

export const useAlertStore = create<AlertState>()((set, get) => ({
  alerts: [],
  threatAssessment: null,
  filter: {
    threatLevel: 'ALL',
    sensorFamily: 'ALL',
    acknowledged: 'UNACKED',
    timeRange: 'ALL',
  },

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

  acknowledgeAll: (comment: string) => {
    const visible = get().filteredAlerts()
    const ids = new Set(visible.filter((a) => !a.acknowledged).map((a) => a.id))
    if (ids.size === 0) return
    set((state) => ({
      alerts: state.alerts.map((a) =>
        ids.has(a.id) ? { ...a, acknowledged: true, annotation: comment } : a
      ),
    }))
  },

  setThreatAssessment: (ta: ThreatAssessment) => {
    set({ threatAssessment: ta })
  },

  setFilter: (filter: Partial<AlertFilter>) => {
    set((state) => ({ filter: { ...state.filter, ...filter } }))
  },

  filteredAlerts: () => {
    const { alerts, filter } = get()
    const cutoff = filter.timeRange && filter.timeRange !== 'ALL'
      ? Date.now() - TIME_RANGE_MS[filter.timeRange]
      : -Infinity
    return alerts.filter((alert) => {
      if (filter.threatLevel !== 'ALL' && alert.threat_level !== filter.threatLevel) {
        return false
      }
      if (filter.sensorFamily !== 'ALL' && alert.sensor_family !== filter.sensorFamily) {
        return false
      }
      if (filter.acknowledged === 'UNACKED' && alert.acknowledged) {
        return false
      }
      if (filter.acknowledged === 'ACKED' && !alert.acknowledged) {
        return false
      }
      if (new Date(alert.timestamp).getTime() < cutoff) {
        return false
      }
      return true
    })
  },
}))
