import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { Alert } from '@/types/sensors'

// Mock Web Audio API
const mockOscStart = vi.fn()
const mockOscStop = vi.fn()
const mockOscConnect = vi.fn()
const mockGainConnect = vi.fn()
const mockClose = vi.fn()
const mockGainNode = {
  connect: mockGainConnect,
  gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
}
const mockOsc = {
  connect: mockOscConnect,
  type: 'sine',
  frequency: { setValueAtTime: vi.fn() },
  start: mockOscStart,
  stop: mockOscStop,
}
const mockCtx = {
  currentTime: 0,
  destination: {},
  createOscillator: vi.fn(() => mockOsc),
  createGain: vi.fn(() => mockGainNode),
  close: mockClose,
}

vi.stubGlobal('AudioContext', vi.fn(() => mockCtx))

function makeAlert(id: string, threat_level: Alert['threat_level']): Alert {
  return {
    id,
    timestamp: new Date().toISOString(),
    source_sensors: ['S01'],
    location: '0,0',
    classification: 'INTRUSION',
    threat_level,
    acknowledged: false,
    description: `Alert ${id}`,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  Object.defineProperty(document, 'hidden', { value: false, writable: true, configurable: true })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  useSystemStore.setState((s) => ({ ...s, alertMuted: false }))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useAudioAlerts', () => {
  it('plays tone when a CRITICAL alert arrives', async () => {
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a1', 'CRITICAL'))
    })

    expect(mockOscStart).toHaveBeenCalled()
  })

  it('plays tone when a HIGH alert arrives', async () => {
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a2', 'HIGH'))
    })

    expect(mockOscStart).toHaveBeenCalled()
  })

  it('does not play for MEDIUM alerts', async () => {
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a3', 'MEDIUM'))
    })

    expect(mockOscStart).not.toHaveBeenCalled()
  })

  it('does not play when muted', async () => {
    useSystemStore.setState((s) => ({ ...s, alertMuted: true }))
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a4', 'CRITICAL'))
    })

    expect(mockOscStart).not.toHaveBeenCalled()
  })

  it('does not play when document is hidden', async () => {
    Object.defineProperty(document, 'hidden', { value: true, writable: true, configurable: true })
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a5', 'CRITICAL'))
    })

    expect(mockOscStart).not.toHaveBeenCalled()
  })

  it('does not replay the same alert twice', async () => {
    const { useAudioAlerts } = await import('@/hooks/useAudioAlerts')
    renderHook(() => useAudioAlerts())

    act(() => {
      useAlertStore.getState().addAlert(makeAlert('a6', 'CRITICAL'))
    })
    const callCount = mockOscStart.mock.calls.length

    act(() => {
      // Re-add same alert (store deduplication + hook deduplication)
      useAlertStore.setState((s) => ({ ...s }))
    })

    expect(mockOscStart.mock.calls.length).toBe(callCount)
  })
})
