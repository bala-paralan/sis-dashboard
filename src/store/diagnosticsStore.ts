import { create } from 'zustand'

const SPARKLINE_LENGTH = 60

export interface DiagnosticsSnapshot {
  tsMs: number
  fps: number
  wsLatencyMs: number | null
  eventsPerSec: number
  alertRate: number
}

interface DiagnosticsState {
  fps: number
  wsLatencyMs: number | null
  eventsPerSec: number
  sparklineFps: number[]
  sparklineLatency: number[]
  sparklineEvents: number[]

  totalAlerts: number
  acknowledgedAlerts: number
  sessionStartMs: number

  setFps: (fps: number) => void
  setWsLatency: (ms: number | null) => void
  recordEvent: () => void
  recordAlert: (acked: boolean) => void
  tick: () => void
}

let eventCountInWindow = 0

export const useDiagnosticsStore = create<DiagnosticsState>()((set, get) => ({
  fps: 0,
  wsLatencyMs: null,
  eventsPerSec: 0,
  sparklineFps: [],
  sparklineLatency: [],
  sparklineEvents: [],
  totalAlerts: 0,
  acknowledgedAlerts: 0,
  sessionStartMs: Date.now(),

  setFps: (fps) => set({ fps }),

  setWsLatency: (ms) => set({ wsLatencyMs: ms }),

  recordEvent: () => {
    eventCountInWindow++
  },

  recordAlert: (acked) => {
    set((s) => ({
      totalAlerts: s.totalAlerts + 1,
      acknowledgedAlerts: acked ? s.acknowledgedAlerts + 1 : s.acknowledgedAlerts,
    }))
  },

  tick: () => {
    const { fps, wsLatencyMs } = get()
    const eventsPerSec = eventCountInWindow
    eventCountInWindow = 0

    set((s) => ({
      eventsPerSec,
      sparklineFps: [...s.sparklineFps, fps].slice(-SPARKLINE_LENGTH),
      sparklineLatency: [...s.sparklineLatency, wsLatencyMs ?? 0].slice(-SPARKLINE_LENGTH),
      sparklineEvents: [...s.sparklineEvents, eventsPerSec].slice(-SPARKLINE_LENGTH),
    }))
  },
}))
