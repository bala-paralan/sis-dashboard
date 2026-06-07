import { useState, useEffect, useRef, useCallback } from 'react'
import { useTimelineStore } from '@/store/timelineStore'

const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH:     '#F97316',
  MEDIUM:   '#EAB308',
  LOW:      '#22C55E',
  CLEAR:    '#10B981',
}

function formatTime(tsMs: number): string {
  const d = new Date(tsMs)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  const ss = String(d.getUTCSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function TimelineBar() {
  const [collapsed, setCollapsed] = useState(true)
  const {
    events,
    isPlayingBack,
    playbackTs,
    playbackSpeed,
    startPlayback,
    stopPlayback,
    seekTo,
    setSpeed,
    goLive,
  } = useTimelineStore()

  const trackRef = useRef<HTMLDivElement>(null)
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const minTs = events.length > 0 ? events[events.length - 1].tsMs : Date.now() - 60000
  const maxTs = events.length > 0 ? events[0].tsMs : Date.now()
  const rangeMs = Math.max(maxTs - minTs, 1)

  const currentTs = playbackTs ?? Date.now()

  const tsToPercent = useCallback(
    (ts: number) => ((ts - minTs) / rangeMs) * 100,
    [minTs, rangeMs]
  )

  // Auto-advance during playback
  useEffect(() => {
    if (!isPlayingBack) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
      return
    }
    playIntervalRef.current = setInterval(() => {
      const ts = useTimelineStore.getState().playbackTs ?? minTs
      const next = ts + 1000 * playbackSpeed
      if (next >= maxTs) {
        useTimelineStore.getState().goLive()
      } else {
        seekTo(next)
      }
    }, 1000)
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlayingBack, playbackSpeed, minTs, maxTs, seekTo])

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const pct = (e.clientX - rect.left) / rect.width
    const ts = minTs + pct * rangeMs
    seekTo(ts)
    if (!isPlayingBack) startPlayback(ts)
  }

  const SPEEDS: Array<typeof playbackSpeed> = [0.5, 1, 2, 5]

  return (
    <div
      className="shrink-0 border-t border-border-color"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* Collapse toggle */}
      <div
        className="flex items-center gap-2 px-3 py-1 cursor-pointer select-none"
        onClick={() => setCollapsed((v) => !v)}
      >
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.1em]">
          Timeline
        </span>
        <span className="text-[10px] text-text-muted">({events.length} events)</span>
        {isPlayingBack && (
          <span className="text-[10px] font-bold text-accent-blue animate-pulse">● PLAYBACK</span>
        )}
        <div className="flex-1" />
        <span className="text-[10px] text-text-muted">{collapsed ? '▲' : '▼'}</span>
      </div>

      {!collapsed && (
        <div className="px-3 pb-2 flex flex-col gap-1.5">
          {/* Scrub track */}
          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative h-6 rounded cursor-pointer"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)' }}
          >
            {/* Event dots */}
            {events.map((evt) => {
              const pct = tsToPercent(evt.tsMs)
              return (
                <div
                  key={evt.id}
                  title={`${evt.label} @ ${formatTime(evt.tsMs)}`}
                  className="absolute top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-sm"
                  style={{
                    left: `${pct}%`,
                    background: evt.severity ? (SEVERITY_COLOR[evt.severity] ?? '#60A5FA') : '#60A5FA',
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              )
            })}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-[2px] pointer-events-none"
              style={{
                left: `${tsToPercent(currentTs)}%`,
                background: isPlayingBack ? '#60A5FA' : 'rgba(255,255,255,0.5)',
                boxShadow: isPlayingBack ? '0 0 4px #60A5FA' : 'none',
              }}
            />

            {/* Time labels */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none">
              {formatTime(minTs)}
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-text-muted pointer-events-none">
              {formatTime(maxTs)}
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex items-center gap-2">
            {!isPlayingBack ? (
              <button
                onClick={() => startPlayback()}
                className="text-[10px] px-2 py-[2px] rounded border-none cursor-pointer font-bold"
                style={{ background: 'var(--accent-blue)', color: '#fff' }}
              >
                ▶ Play
              </button>
            ) : (
              <button
                onClick={stopPlayback}
                className="text-[10px] px-2 py-[2px] rounded border-none cursor-pointer font-bold"
                style={{ background: 'var(--alert-medium)', color: '#000' }}
              >
                ⏸ Pause
              </button>
            )}

            <button
              onClick={goLive}
              className="text-[10px] px-2 py-[2px] rounded cursor-pointer"
              style={{
                background: !isPlayingBack ? 'rgba(34,197,94,0.2)' : 'var(--bg-tertiary)',
                color: !isPlayingBack ? 'var(--sensor-acoustic)' : 'var(--text-muted)',
                border: `1px solid ${!isPlayingBack ? 'rgba(34,197,94,0.4)' : 'var(--panel-border)'}`,
                fontWeight: !isPlayingBack ? 700 : 400,
              }}
            >
              ● Live
            </button>

            <span className="text-[9px] text-text-muted">Speed:</span>
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="text-[10px] px-1.5 py-[1px] rounded cursor-pointer border"
                style={{
                  background: playbackSpeed === s ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                  color: playbackSpeed === s ? '#fff' : 'var(--text-secondary)',
                  borderColor: playbackSpeed === s ? 'var(--accent-blue)' : 'var(--panel-border)',
                }}
              >
                {s}x
              </button>
            ))}

            {isPlayingBack && (
              <span className="text-[10px] font-mono text-text-secondary ml-auto">
                {formatTime(currentTs)}
              </span>
            )}
          </div>

          {/* Recent events list */}
          <div className="max-h-20 overflow-y-auto flex flex-col gap-[2px]">
            {events.slice(0, 10).map((evt) => (
              <button
                key={evt.id}
                onClick={() => seekTo(evt.tsMs)}
                className="flex items-center gap-2 text-left w-full px-1 py-[2px] rounded cursor-pointer hover:bg-bg-tertiary transition-colors bg-transparent border-none"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: evt.severity ? (SEVERITY_COLOR[evt.severity] ?? '#60A5FA') : '#60A5FA' }}
                />
                <span className="text-[9px] font-mono text-text-muted shrink-0">{formatTime(evt.tsMs)}</span>
                <span className="text-[10px] text-text-secondary truncate">{evt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
