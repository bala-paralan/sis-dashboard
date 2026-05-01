import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'
import { act } from '@testing-library/react'
import { useAlertStore } from '@/store/alertStore'
import * as alertsApi from '@/api/alerts'
import type { Alert, ThreatAssessment } from '@/types/sensors'

vi.mock('@/api/alerts')

function mockAlert(overrides?: Partial<Alert>): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-04-11T10:00:00.000Z',
    source_sensors: ['S02-GEO-001'],
    location: '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Seismic anomaly detected',
    ...overrides,
  }
}

function mockThreatAssessment(overrides?: Partial<ThreatAssessment>): ThreatAssessment {
  return {
    assessment_id: 'ta-001',
    timestamp: '2026-04-11T10:00:00.000Z',
    threat_score: 0.85,
    threat_level: 'HIGH',
    contributing_sensors: ['S02-GEO-001'],
    dominant_modality: 'SEISMIC',
    location: { lat: 21.9452, lon: 88.1234, accuracy_m: 15 },
    recommended_action: 'Deploy QRT to sector 4',
    model_version: '1.4.2',
    ...overrides,
  }
}

const resetState = () =>
  useAlertStore.setState({
    alerts:           [],
    threatAssessment: null,
    filter:           { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
    loading:          false,
    loadError:        null,
    pagination:       { total: 0, page: 1, limit: 50 },
    selectedIds:      new Set<string>(),
  })

beforeEach(() => {
  vi.clearAllMocks()
  resetState()
})

// ── Legacy WS-driven actions ────────────────────────────────────────────────

describe('useAlertStore', () => {
  describe('initial state', () => {
    it('alerts array is empty', () => {
      expect(useAlertStore.getState().alerts).toEqual([])
    })

    it('threatAssessment is null', () => {
      expect(useAlertStore.getState().threatAssessment).toBeNull()
    })

    it('loading is false', () => {
      expect(useAlertStore.getState().loading).toBe(false)
    })

    it('loadError is null', () => {
      expect(useAlertStore.getState().loadError).toBeNull()
    })

    it('selectedIds is empty', () => {
      expect(useAlertStore.getState().selectedIds.size).toBe(0)
    })
  })

  describe('addAlert', () => {
    it('prepends a new alert to the front of the array', () => {
      const alert = mockAlert({ id: 'alert-001' })
      act(() => { useAlertStore.getState().addAlert(alert) })
      expect(useAlertStore.getState().alerts[0]).toEqual(alert)
    })

    it('caps the alerts array at 200 items when 205 alerts are added', () => {
      act(() => {
        for (let i = 0; i < 205; i++) {
          useAlertStore.getState().addAlert(mockAlert({ id: `alert-${i}` }))
        }
      })
      expect(useAlertStore.getState().alerts).toHaveLength(200)
    })

    it('most recently added alert is first in the array', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-first' }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-second' }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-third' }))
      })
      expect(useAlertStore.getState().alerts[0].id).toBe('alert-third')
    })
  })

  describe('acknowledgeAlert', () => {
    it('sets acknowledged to true on the matching alert id', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-001', acknowledged: false }))
        useAlertStore.getState().acknowledgeAlert('alert-001', 'Confirmed by operator')
      })
      const alert = useAlertStore.getState().alerts.find((a) => a.id === 'alert-001')
      expect(alert?.acknowledged).toBe(true)
    })

    it('sets annotation to the provided comment string', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-001' }))
        useAlertStore.getState().acknowledgeAlert('alert-001', 'False positive — wildlife')
      })
      const alert = useAlertStore.getState().alerts.find((a) => a.id === 'alert-001')
      expect(alert?.annotation).toBe('False positive — wildlife')
    })

    it('does not modify other alerts', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-001', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'alert-002', acknowledged: false }))
        useAlertStore.getState().acknowledgeAlert('alert-001', 'Confirmed')
      })
      const other = useAlertStore.getState().alerts.find((a) => a.id === 'alert-002')
      expect(other?.acknowledged).toBe(false)
      expect(other?.annotation).toBeUndefined()
    })
  })

  describe('setThreatAssessment', () => {
    it('stores the threat assessment object', () => {
      const ta = mockThreatAssessment()
      act(() => { useAlertStore.getState().setThreatAssessment(ta) })
      expect(useAlertStore.getState().threatAssessment).toEqual(ta)
    })
  })

  describe('setFilter', () => {
    it('partial merge preserves other filter fields', () => {
      act(() => { useAlertStore.getState().setFilter({ threatLevel: 'CRITICAL' }) })
      const { filter } = useAlertStore.getState()
      expect(filter.threatLevel).toBe('CRITICAL')
      expect(filter.sensorFamily).toBe('ALL')
      expect(filter.acknowledged).toBe('UNACKED')
    })
  })

  describe('filteredAlerts', () => {
    it('returns all alerts when filter is ALL/ALL/ALL', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'a1', threat_level: 'HIGH', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a2', threat_level: 'LOW', acknowledged: true }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a3', threat_level: 'CRITICAL', acknowledged: false }))
        useAlertStore.getState().setFilter({ threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'ALL' })
      })
      expect(useAlertStore.getState().filteredAlerts()).toHaveLength(3)
    })

    it('filters by threat level — CRITICAL only returns CRITICAL alerts', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'a1', threat_level: 'CRITICAL' }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a2', threat_level: 'HIGH' }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a3', threat_level: 'CRITICAL' }))
        useAlertStore.getState().setFilter({ threatLevel: 'CRITICAL', acknowledged: 'ALL' })
      })
      const result = useAlertStore.getState().filteredAlerts()
      expect(result).toHaveLength(2)
      expect(result.every((a) => a.threat_level === 'CRITICAL')).toBe(true)
    })

    it('filters out acknowledged alerts when filter is UNACKED', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'a1', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a2', acknowledged: true }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a3', acknowledged: false }))
        useAlertStore.getState().setFilter({ acknowledged: 'UNACKED', threatLevel: 'ALL' })
      })
      const result = useAlertStore.getState().filteredAlerts()
      expect(result).toHaveLength(2)
      expect(result.every((a) => !a.acknowledged)).toBe(true)
    })

    it('shows only acknowledged alerts when filter is ACKED', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'a1', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a2', acknowledged: true }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a3', acknowledged: true }))
        useAlertStore.getState().setFilter({ acknowledged: 'ACKED', threatLevel: 'ALL' })
      })
      const result = useAlertStore.getState().filteredAlerts()
      expect(result).toHaveLength(2)
      expect(result.every((a) => a.acknowledged)).toBe(true)
    })

    it('applies combined filters — HIGH threat level AND UNACKED', () => {
      act(() => {
        useAlertStore.getState().addAlert(mockAlert({ id: 'a1', threat_level: 'HIGH', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a2', threat_level: 'HIGH', acknowledged: true }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a3', threat_level: 'CRITICAL', acknowledged: false }))
        useAlertStore.getState().addAlert(mockAlert({ id: 'a4', threat_level: 'LOW', acknowledged: false }))
        useAlertStore.getState().setFilter({ threatLevel: 'HIGH', acknowledged: 'UNACKED' })
      })
      const result = useAlertStore.getState().filteredAlerts()
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('a1')
    })
  })

  // ── REST-backed actions ───────────────────────────────────────────────────

  describe('loadAlerts', () => {
    it('sets loading true then false on success', async () => {
      ;(alertsApi.fetchAlerts as Mock).mockResolvedValueOnce({
        total: 2, page: 1, limit: 50, count: 2,
        alerts: [mockAlert({ id: 'srv-1' }), mockAlert({ id: 'srv-2' })],
      })
      const promise = act(() => useAlertStore.getState().loadAlerts())
      expect(useAlertStore.getState().loading).toBe(true)
      await promise
      expect(useAlertStore.getState().loading).toBe(false)
    })

    it('merges server alerts into local ring buffer without duplicates', async () => {
      // seed one local alert
      useAlertStore.setState({ alerts: [mockAlert({ id: 'local-1' })] })
      ;(alertsApi.fetchAlerts as Mock).mockResolvedValueOnce({
        total: 2, page: 1, limit: 50, count: 2,
        alerts: [mockAlert({ id: 'srv-1' }), mockAlert({ id: 'local-1' })],
      })
      await act(() => useAlertStore.getState().loadAlerts())
      const { alerts } = useAlertStore.getState()
      const ids = alerts.map((a) => a.id)
      // local-1 should appear only once
      expect(ids.filter((id) => id === 'local-1')).toHaveLength(1)
      expect(ids).toContain('srv-1')
    })

    it('updates pagination from server response', async () => {
      ;(alertsApi.fetchAlerts as Mock).mockResolvedValueOnce({
        total: 120, page: 2, limit: 50, count: 50,
        alerts: [],
      })
      await act(() => useAlertStore.getState().loadAlerts({ page: 2 }))
      const { pagination } = useAlertStore.getState()
      expect(pagination.total).toBe(120)
      expect(pagination.page).toBe(2)
      expect(pagination.limit).toBe(50)
    })

    it('sets loadError on failure', async () => {
      ;(alertsApi.fetchAlerts as Mock).mockRejectedValueOnce(new Error('Network error'))
      await act(() => useAlertStore.getState().loadAlerts())
      expect(useAlertStore.getState().loadError).toBe('Network error')
      expect(useAlertStore.getState().loading).toBe(false)
    })
  })

  describe('bulkAcknowledgeAlerts', () => {
    it('marks all provided ids as acknowledged locally', async () => {
      useAlertStore.setState({
        alerts: [
          mockAlert({ id: 'a1', acknowledged: false }),
          mockAlert({ id: 'a2', acknowledged: false }),
          mockAlert({ id: 'a3', acknowledged: false }),
        ],
      })
      ;(alertsApi.bulkAcknowledgeAlerts as Mock).mockResolvedValueOnce({
        acknowledged: 2, ids: ['a1', 'a2'],
      })
      await act(() => useAlertStore.getState().bulkAcknowledgeAlerts(['a1', 'a2'], 'Bulk ack'))
      const { alerts } = useAlertStore.getState()
      expect(alerts.find((a) => a.id === 'a1')?.acknowledged).toBe(true)
      expect(alerts.find((a) => a.id === 'a2')?.acknowledged).toBe(true)
      expect(alerts.find((a) => a.id === 'a3')?.acknowledged).toBe(false)
    })

    it('clears selectedIds after bulk ack', async () => {
      useAlertStore.setState({ selectedIds: new Set(['a1', 'a2']) })
      ;(alertsApi.bulkAcknowledgeAlerts as Mock).mockResolvedValueOnce({ acknowledged: 2, ids: ['a1', 'a2'] })
      await act(() => useAlertStore.getState().bulkAcknowledgeAlerts(['a1', 'a2']))
      expect(useAlertStore.getState().selectedIds.size).toBe(0)
    })

    it('sets loadError on failure', async () => {
      ;(alertsApi.bulkAcknowledgeAlerts as Mock).mockRejectedValueOnce(new Error('Server error'))
      await act(() => useAlertStore.getState().bulkAcknowledgeAlerts(['a1']))
      expect(useAlertStore.getState().loadError).toBe('Server error')
    })
  })

  describe('dismissAlert', () => {
    it('removes the alert from the local array', async () => {
      useAlertStore.setState({
        alerts: [mockAlert({ id: 'a1' }), mockAlert({ id: 'a2' })],
      })
      ;(alertsApi.dismissAlert as Mock).mockResolvedValueOnce(undefined)
      await act(() => useAlertStore.getState().dismissAlert('a1'))
      const ids = useAlertStore.getState().alerts.map((a) => a.id)
      expect(ids).not.toContain('a1')
      expect(ids).toContain('a2')
    })

    it('also removes the id from selectedIds', async () => {
      useAlertStore.setState({
        alerts: [mockAlert({ id: 'a1' })],
        selectedIds: new Set(['a1']),
      })
      ;(alertsApi.dismissAlert as Mock).mockResolvedValueOnce(undefined)
      await act(() => useAlertStore.getState().dismissAlert('a1'))
      expect(useAlertStore.getState().selectedIds.has('a1')).toBe(false)
    })

    it('sets loadError on failure', async () => {
      ;(alertsApi.dismissAlert as Mock).mockRejectedValueOnce(new Error('Delete failed'))
      await act(() => useAlertStore.getState().dismissAlert('a1'))
      expect(useAlertStore.getState().loadError).toBe('Delete failed')
    })
  })

  // ── Selection actions ─────────────────────────────────────────────────────

  describe('toggleSelected', () => {
    it('adds id to selectedIds when not present', () => {
      act(() => { useAlertStore.getState().toggleSelected('a1') })
      expect(useAlertStore.getState().selectedIds.has('a1')).toBe(true)
    })

    it('removes id from selectedIds when already present', () => {
      useAlertStore.setState({ selectedIds: new Set(['a1']) })
      act(() => { useAlertStore.getState().toggleSelected('a1') })
      expect(useAlertStore.getState().selectedIds.has('a1')).toBe(false)
    })
  })

  describe('selectAll', () => {
    it('sets selectedIds to the provided ids', () => {
      act(() => { useAlertStore.getState().selectAll(['a1', 'a2', 'a3']) })
      const { selectedIds } = useAlertStore.getState()
      expect(selectedIds.has('a1')).toBe(true)
      expect(selectedIds.has('a2')).toBe(true)
      expect(selectedIds.has('a3')).toBe(true)
      expect(selectedIds.size).toBe(3)
    })
  })

  describe('clearSelection', () => {
    it('empties selectedIds', () => {
      useAlertStore.setState({ selectedIds: new Set(['a1', 'a2']) })
      act(() => { useAlertStore.getState().clearSelection() })
      expect(useAlertStore.getState().selectedIds.size).toBe(0)
    })
  })
})
