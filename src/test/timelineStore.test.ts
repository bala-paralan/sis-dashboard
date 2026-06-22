import { describe, it, expect, beforeEach } from 'vitest'
import { useTimelineStore } from '@/store/timelineStore'

const makeEvent = (overrides = {}) => ({
  type: 'ALERT' as const,
  timestamp: new Date().toISOString(),
  label: 'Test alert',
  severity: 'HIGH',
  ...overrides,
})

describe('timelineStore', () => {
  beforeEach(() => {
    useTimelineStore.setState({
      events: [],
      isPlayingBack: false,
      playbackTs: null,
      playbackSpeed: 1,
    })
  })

  it('starts with empty events and not playing', () => {
    const s = useTimelineStore.getState()
    expect(s.events).toHaveLength(0)
    expect(s.isPlayingBack).toBe(false)
  })

  it('addEvent stores event with id and tsMs', () => {
    useTimelineStore.getState().addEvent(makeEvent())
    const { events } = useTimelineStore.getState()
    expect(events).toHaveLength(1)
    expect(events[0].id).toBeTruthy()
    expect(events[0].tsMs).toBeGreaterThan(0)
  })

  it('addEvent does not record during playback', () => {
    useTimelineStore.setState({ isPlayingBack: true })
    useTimelineStore.getState().addEvent(makeEvent())
    expect(useTimelineStore.getState().events).toHaveLength(0)
  })

  it('startPlayback sets isPlayingBack and playbackTs', () => {
    useTimelineStore.getState().addEvent(makeEvent())
    useTimelineStore.getState().startPlayback()
    const s = useTimelineStore.getState()
    expect(s.isPlayingBack).toBe(true)
    expect(s.playbackTs).toBeTruthy()
  })

  it('stopPlayback pauses without going live', () => {
    useTimelineStore.getState().startPlayback(Date.now())
    useTimelineStore.getState().stopPlayback()
    const s = useTimelineStore.getState()
    expect(s.isPlayingBack).toBe(false)
    expect(s.playbackTs).not.toBeNull()
  })

  it('goLive clears playback state', () => {
    useTimelineStore.getState().startPlayback(Date.now())
    useTimelineStore.getState().goLive()
    const s = useTimelineStore.getState()
    expect(s.isPlayingBack).toBe(false)
    expect(s.playbackTs).toBeNull()
  })

  it('seekTo sets playbackTs', () => {
    const ts = Date.now() - 5000
    useTimelineStore.getState().seekTo(ts)
    expect(useTimelineStore.getState().playbackTs).toBe(ts)
  })

  it('setSpeed updates playbackSpeed', () => {
    useTimelineStore.getState().setSpeed(5)
    expect(useTimelineStore.getState().playbackSpeed).toBe(5)
  })

  it('caps events at MAX_EVENTS (500)', () => {
    for (let i = 0; i < 505; i++) {
      useTimelineStore.getState().addEvent(makeEvent({ label: `evt-${i}` }))
    }
    expect(useTimelineStore.getState().events.length).toBeLessThanOrEqual(500)
  })
})
