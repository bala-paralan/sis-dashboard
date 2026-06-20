import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSensors, getSensorById, getSensorHistory } from '@/api/sensors'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/api/client'

const mockApiFetch = vi.mocked(apiFetch)

const mockEntry = {
  sensor_id: 'S01-GEO-001',
  modality: 'SEISMIC' as const,
  site_id: 'SITE-ALPHA',
  bop_id: 'BOP-ALPHA-01',
  sensor_status: 'ONLINE' as const,
  firmware_ver: '1.0.0',
  lat: 21.945,
  lon: 88.123,
}

const mockPayload = {
  sensor_id: 'S01-GEO-001',
  modality: 'SEISMIC' as const,
  timestamp: '2026-05-20T10:00:00.000Z',
  site_id: 'SITE-ALPHA',
  bop_id: 'BOP-ALPHA-01',
  quality_score: 0.92,
  raw_value: { amplitude: 0.04 },
  sensor_status: 'ONLINE' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getSensors', () => {
  it('calls apiFetch with /sensors', async () => {
    mockApiFetch.mockResolvedValueOnce([mockEntry])
    const result = await getSensors()
    expect(mockApiFetch).toHaveBeenCalledWith('/sensors')
    expect(result).toEqual([mockEntry])
  })

  it('returns an empty array when API returns []', async () => {
    mockApiFetch.mockResolvedValueOnce([])
    const result = await getSensors()
    expect(result).toHaveLength(0)
  })

  it('propagates API errors', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Network error'))
    await expect(getSensors()).rejects.toThrow('Network error')
  })
})

describe('getSensorById', () => {
  it('calls apiFetch with encoded sensor id', async () => {
    mockApiFetch.mockResolvedValueOnce(mockPayload)
    const result = await getSensorById('S01-GEO-001')
    expect(mockApiFetch).toHaveBeenCalledWith('/sensors/S01-GEO-001')
    expect(result).toEqual(mockPayload)
  })

  it('URL-encodes sensor ids with special characters', async () => {
    mockApiFetch.mockResolvedValueOnce(mockPayload)
    await getSensorById('sensor id/special')
    expect(mockApiFetch).toHaveBeenCalledWith('/sensors/sensor%20id%2Fspecial')
  })

  it('propagates 404 errors', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Not Found'))
    await expect(getSensorById('unknown')).rejects.toThrow('Not Found')
  })
})

describe('getSensorHistory', () => {
  const from = '2026-05-20T00:00:00.000Z'
  const to   = '2026-05-20T23:59:59.000Z'

  it('calls apiFetch with correct history URL', async () => {
    mockApiFetch.mockResolvedValueOnce([mockPayload])
    const result = await getSensorHistory('S01-GEO-001', from, to)
    expect(mockApiFetch).toHaveBeenCalledWith(
      `/sensors/S01-GEO-001/history?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    )
    expect(result).toEqual([mockPayload])
  })

  it('returns an array of SensorPayload entries', async () => {
    mockApiFetch.mockResolvedValueOnce([mockPayload, { ...mockPayload, timestamp: '2026-05-20T11:00:00.000Z' }])
    const result = await getSensorHistory('S01-GEO-001', from, to)
    expect(result).toHaveLength(2)
  })

  it('URL-encodes the from and to parameters', async () => {
    mockApiFetch.mockResolvedValueOnce([])
    await getSensorHistory('S01', from, to)
    const call = mockApiFetch.mock.calls[0][0] as string
    expect(call).toContain(encodeURIComponent(from))
    expect(call).toContain(encodeURIComponent(to))
  })
})
