import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAlerts, fetchAlert, acknowledgeAlert, dismissAlert } from '@/api/alerts'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/api/client'
const mockApiFetch = vi.mocked(apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const mockAlert = {
  id: 'alert-001',
  timestamp: '2026-06-01T00:00:00Z',
  source_sensors: ['S01'],
  location: 'SITE-01',
  classification: 'INTRUSION',
  threat_level: 'HIGH' as const,
  acknowledged: false,
  description: 'Suspected intrusion at northern perimeter',
}

const mockListResponse = {
  total: 1, page: 1, limit: 50, count: 1,
  alerts: [mockAlert],
}

describe('fetchAlerts', () => {
  it('calls /alerts with no query params when no options given', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts()
    expect(mockApiFetch).toHaveBeenCalledWith('/alerts?')
  })

  it('omits threatLevel param when value is ALL', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ threatLevel: 'ALL' })
    const call = mockApiFetch.mock.calls[0][0] as string
    expect(call).not.toContain('threatLevel')
  })

  it('includes threatLevel param when not ALL', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ threatLevel: 'CRITICAL' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('threatLevel=CRITICAL'))
  })

  it('omits sensorFamily param when value is ALL', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ sensorFamily: 'ALL' })
    const call = mockApiFetch.mock.calls[0][0] as string
    expect(call).not.toContain('sensorFamily')
  })

  it('includes sensorFamily param when not ALL', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ sensorFamily: 'Seismic' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('sensorFamily=Seismic'))
  })

  it('includes acknowledged=false when explicitly set', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ acknowledged: false })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('acknowledged=false'))
  })

  it('includes page and limit query params', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchAlerts({ page: 3, limit: 10 })
    const call = mockApiFetch.mock.calls[0][0] as string
    expect(call).toContain('page=3')
    expect(call).toContain('limit=10')
  })

  it('returns the alert list response', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    const result = await fetchAlerts()
    expect(result.alerts[0].id).toBe('alert-001')
    expect(result.alerts[0].threat_level).toBe('HIGH')
  })
})

describe('fetchAlert', () => {
  it('calls /alerts/:id with the given id', async () => {
    mockApiFetch.mockResolvedValueOnce(mockAlert)
    await fetchAlert('alert-001')
    expect(mockApiFetch).toHaveBeenCalledWith('/alerts/alert-001')
  })

  it('returns the alert object', async () => {
    mockApiFetch.mockResolvedValueOnce(mockAlert)
    const result = await fetchAlert('alert-001')
    expect(result.classification).toBe('INTRUSION')
  })
})

describe('acknowledgeAlert', () => {
  it('calls POST /alerts/:id/acknowledge with annotation in body', async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockAlert, acknowledged: true })
    await acknowledgeAlert('alert-001', 'False alarm — checked physically')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/alerts/alert-001/acknowledge',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ annotation: 'False alarm — checked physically' }),
      }),
    )
  })

  it('uses empty string annotation when none provided', async () => {
    mockApiFetch.mockResolvedValueOnce({ ...mockAlert, acknowledged: true })
    await acknowledgeAlert('alert-001')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/alerts/alert-001/acknowledge',
      expect.objectContaining({ body: JSON.stringify({ annotation: '' }) }),
    )
  })

  it('returns updated alert with acknowledged=true', async () => {
    const acknowledged = { ...mockAlert, acknowledged: true }
    mockApiFetch.mockResolvedValueOnce(acknowledged)
    const result = await acknowledgeAlert('alert-001')
    expect(result.acknowledged).toBe(true)
  })
})

describe('dismissAlert', () => {
  it('calls DELETE /alerts/:id', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined)
    await dismissAlert('alert-001')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/alerts/alert-001',
      { method: 'DELETE' },
    )
  })
})
