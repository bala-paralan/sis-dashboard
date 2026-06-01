import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSystemHealth, fetchScenario, setScenario } from '@/api/system'

vi.mock('@/api/client', () => ({
  apiFetch: vi.fn(),
}))

import { apiFetch } from '@/api/client'
const mockApiFetch = vi.mocked(apiFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

const mockHealth = {
  timestamp: '2026-06-01T00:00:00Z',
  node_id: 'BOP-ALPHA-01',
  hardware: {
    cpu_percent: 42,
    gpu_percent: 65,
    ram_percent: 50,
    nvme_percent: 20,
    temperature_c: 48,
    uptime_hours: 100,
  },
  comms: { SATCOM: { active: true, signal_quality: 0.9 } },
  aiml: {
    inference_fps: 24,
    gpu_memory_percent: 70,
    model_versions: { detection: 'yolov9-v1.2' },
  },
}

const mockScenario = {
  current: 'NORMAL' as const,
  updatedAt: '2026-06-01T00:00:00Z',
}

describe('fetchSystemHealth', () => {
  it('calls /system/health with no nodeId when not provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockHealth)
    await fetchSystemHealth()
    expect(mockApiFetch).toHaveBeenCalledWith('/system/health?')
  })

  it('includes nodeId query param when provided', async () => {
    mockApiFetch.mockResolvedValueOnce(mockHealth)
    await fetchSystemHealth('BOP-ALPHA-01')
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining('nodeId=BOP-ALPHA-01'),
    )
  })

  it('returns the system health payload', async () => {
    mockApiFetch.mockResolvedValueOnce(mockHealth)
    const result = await fetchSystemHealth()
    expect(result.node_id).toBe('BOP-ALPHA-01')
    expect(result.hardware.cpu_percent).toBe(42)
  })
})

describe('fetchScenario', () => {
  it('calls GET /system/scenario', async () => {
    mockApiFetch.mockResolvedValueOnce(mockScenario)
    await fetchScenario()
    expect(mockApiFetch).toHaveBeenCalledWith('/system/scenario')
  })

  it('returns the current scenario', async () => {
    mockApiFetch.mockResolvedValueOnce(mockScenario)
    const result = await fetchScenario()
    expect(result.current).toBe('NORMAL')
  })
})

describe('setScenario', () => {
  it('calls POST /system/scenario with the scenario in the body', async () => {
    mockApiFetch.mockResolvedValueOnce({ current: 'INTRUSION', updatedAt: '2026-06-01T00:01:00Z' })
    await setScenario('INTRUSION')
    expect(mockApiFetch).toHaveBeenCalledWith(
      '/system/scenario',
      { method: 'POST', body: JSON.stringify({ scenario: 'INTRUSION' }) },
    )
  })

  it('returns updated ScenarioResponse with new scenario', async () => {
    const updated = { current: 'DRONE' as const, updatedAt: '2026-06-01T00:02:00Z' }
    mockApiFetch.mockResolvedValueOnce(updated)
    const result = await setScenario('DRONE')
    expect(result.current).toBe('DRONE')
  })

  it('propagates errors from apiFetch', async () => {
    mockApiFetch.mockRejectedValueOnce(new Error('Forbidden'))
    await expect(setScenario('ELEVATED')).rejects.toThrow('Forbidden')
  })
})
