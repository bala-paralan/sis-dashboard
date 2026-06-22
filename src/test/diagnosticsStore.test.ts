import { describe, it, expect, beforeEach } from 'vitest'
import { useDiagnosticsStore } from '@/store/diagnosticsStore'

describe('diagnosticsStore', () => {
  beforeEach(() => {
    useDiagnosticsStore.setState({
      fps: 0,
      wsLatencyMs: null,
      eventsPerSec: 0,
      sparklineFps: [],
      sparklineLatency: [],
      sparklineEvents: [],
      totalAlerts: 0,
      acknowledgedAlerts: 0,
      sessionStartMs: Date.now(),
    })
  })

  it('starts with zeroed state', () => {
    const s = useDiagnosticsStore.getState()
    expect(s.fps).toBe(0)
    expect(s.wsLatencyMs).toBeNull()
    expect(s.eventsPerSec).toBe(0)
    expect(s.totalAlerts).toBe(0)
  })

  it('setFps updates fps', () => {
    useDiagnosticsStore.getState().setFps(60)
    expect(useDiagnosticsStore.getState().fps).toBe(60)
  })

  it('setWsLatency updates wsLatencyMs', () => {
    useDiagnosticsStore.getState().setWsLatency(42)
    expect(useDiagnosticsStore.getState().wsLatencyMs).toBe(42)
  })

  it('setWsLatency accepts null', () => {
    useDiagnosticsStore.getState().setWsLatency(100)
    useDiagnosticsStore.getState().setWsLatency(null)
    expect(useDiagnosticsStore.getState().wsLatencyMs).toBeNull()
  })

  it('recordAlert increments counters', () => {
    useDiagnosticsStore.getState().recordAlert(false)
    useDiagnosticsStore.getState().recordAlert(true)
    const s = useDiagnosticsStore.getState()
    expect(s.totalAlerts).toBe(2)
    expect(s.acknowledgedAlerts).toBe(1)
  })

  it('tick appends to sparklines', () => {
    useDiagnosticsStore.getState().setFps(30)
    useDiagnosticsStore.getState().setWsLatency(50)
    useDiagnosticsStore.getState().tick()
    const s = useDiagnosticsStore.getState()
    expect(s.sparklineFps).toHaveLength(1)
    expect(s.sparklineFps[0]).toBe(30)
    expect(s.sparklineLatency[0]).toBe(50)
  })

  it('sparklines cap at 60 entries', () => {
    useDiagnosticsStore.getState().setFps(30)
    for (let i = 0; i < 65; i++) {
      useDiagnosticsStore.getState().tick()
    }
    expect(useDiagnosticsStore.getState().sparklineFps.length).toBeLessThanOrEqual(60)
  })
})
