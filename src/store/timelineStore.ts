import { create } from 'zustand'
import type { Alert } from '@/types/sensors'
import type { SensorPayload } from '@/types/sensors'

export type TimelineEventType = 'ALERT' | 'SENSOR_CHANGE' | 'CONNECTION'

export interface TimelineEvent {
  id: string
  type: TimelineEventType
  timestamp: string
  tsMs: number
  label: string
  severity?: string
  data?: Alert | SensorPayload | { status: string }
}

const MAX_EVENTS = 500

interface TimelineState {
  events: TimelineEvent[]
  isPlayingBack: boolean
  playbackTs: number | null
  playbackSpeed: 1 | 2 | 5 | 0.5

  addEvent: (event: Omit<TimelineEvent, 'id' | 'tsMs'>) => void
  startPlayback: (fromTs?: number) => void
  stopPlayback: () => void
  seekTo: (tsMs: number) => void
  setSpeed: (speed: TimelineState['playbackSpeed']) => void
  goLive: () => void
}

export const useTimelineStore = create<TimelineState>()((set, get) => ({
  events: [],
  isPlayingBack: false,
  playbackTs: null,
  playbackSpeed: 1,

  addEvent: (event) => {
    if (get().isPlayingBack) return
    const newEvent: TimelineEvent = {
      ...event,
      id: `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
      tsMs: new Date(event.timestamp).getTime(),
    }
    set((s) => ({
      events: [newEvent, ...s.events].slice(0, MAX_EVENTS),
    }))
  },

  startPlayback: (fromTs) => {
    const { events } = get()
    const start = fromTs ?? (events.length > 0 ? events[events.length - 1].tsMs : Date.now())
    set({ isPlayingBack: true, playbackTs: start })
  },

  stopPlayback: () => {
    set({ isPlayingBack: false })
  },

  seekTo: (tsMs) => {
    set({ playbackTs: tsMs })
  },

  setSpeed: (speed) => {
    set({ playbackSpeed: speed })
  },

  goLive: () => {
    set({ isPlayingBack: false, playbackTs: null })
  },
}))
