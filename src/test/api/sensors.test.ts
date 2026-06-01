import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSensors, fetchSensor, acknowledgeSensor } from '@/api/sensors'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/api/client'
const mockApiFetch = vi.mocked(apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const mockSensor = {
  sensor_id: 'S01-GEO',
  modality: 'SEISMIC' as const,
  timestamp: '2026-06-01T00:00:00Z',
  site_id: 'SITE-01',
  bop_id: 'BOP-ALPHA-01',
  quality_score: 0.95,
  raw_value: {},
  sensor_status: 'ONLINE' as const,
}

const mockListResponse = {
  total: 1, page: 1, limit: 50, count: 1,
  sensors: [mockSensor],
}

describe('fetchSensors', () => {
  it('calls /sensors with no query params when no options given', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors()
    expect(mockApiFetch).toHaveBeenCalledWith('/sensors?')
  })

  it('includes siteId query param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors({ siteId: 'SITE-01' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('siteId=SITE-01'))
  })

  it('includes bopId query param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors({ bopId: 'BOP-ALPHA-01' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('bopId=BOP-ALPHA-01'))
  })

  it('includes status query param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors({ status: 'OFFLINE' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('status=OFFLINE'))
  })

  it('includes modality query param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors({ modality: 'ACOUSTIC' })
    expect(mockApiFetch).toHaveBeenCalledWith(expect.stringContaining('modality=ACOUSTIC'))
  })

  it('includes page and limit query params when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    await fetchSensors({ page: 2, limit: 25 })
    const call = mockApiFetch.mock.calls[0][0] as string
    expect(call).toContain('page=2')
    expect(call).toContain('limit=25')
  })

  it('returns the sensor list response', async () => {
    mockApiFetch.mockResolvedValueOnce(mockListResponse)
    const result = await fetchSensors()
    expect(result.sensors).toHaveLength(1)
    expect(result.sensors[0].sensor_id).toBe('S01-GEO')
  })
})

describe('fetchSensor', () => {
  it('calls /sensors/:id with the given id', async () => {
    mockApiFetch.mockResolvedValueOnce(mockSensor)
    await fetchSensor('S01-GEO')
    expect(mockApiFetch).toHaveBeenCalledWith('/sensors/S01-GEO')
  })

  it('returns the sensor payload', async () => {
    mockApiFetch.mockResolvedValueOnce(mockSensor)
    const result = await fetchSensor('S01-GEO')
    expect(result.modality).toBe('SEISMIC')
    expect(result.sensor_status).toBe('ONLINE')
  })
})

describe('acknowledgeSensor', () => {
  it('calls POST /sensors/:id/acknowledge', async () => {
    mockApiFetch.mockResolvedValueOnce(undefined)
    await acknowledgeSensor('S01-GEO')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/sensors/S01-GEO/acknowledge',
      { method: 'POST' },
    )
  })
})
