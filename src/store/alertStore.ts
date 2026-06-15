import { create } from 'zustand'
import type { Alert, ThreatAssessment, ThreatLevel, SensorFamily } from '@/types/sensors'

const MAX_ALERTS = 200

type TimeRange = '1h' | '6h' | '24h' | 'ALL'

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
  acknowledgeAll: () => void
  setThreatAssessment: (ta: ThreatAssessment) => void
  setFilter: (filter: Partial<AlertFilter>) => void
  filteredAlerts: () => Alert[]
}

function isWithinTimeRange(timestamp: string, range: TimeRange | undefined): boolean {
  if (!range || range === 'ALL') return true
  const now = Date.now()
  const alertTime = new Date(timestamp).getTime()
  const ms = range === '1h' ? 3_600_000 : range === '6h' ? 21_600_000 : 86_400_000
  return now - alertTime <= ms
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

  acknowledgeAll: () => {
    const visible = get().filteredAlerts()
    const ids = new Set(visible.map((a) => a.id))
    set((state) => ({
      alerts: state.alerts.map((a) =>
        ids.has(a.id) ? { ...a, acknowledged: true } : a
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
      if (!isWithinTimeRange(alert.timestamp, filter.timeRange)) {
        return false
      }
      return true
    })
  },
}))
