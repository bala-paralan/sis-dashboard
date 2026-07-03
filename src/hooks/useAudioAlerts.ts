import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'

function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  startTime: number,
  gain = 0.3,
) {
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  osc.connect(gainNode)
  gainNode.connect(ctx.destination)
  osc.type = 'sine'
  osc.frequency.setValueAtTime(frequency, startTime)
  gainNode.gain.setValueAtTime(gain, startTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

function playCritical(ctx: AudioContext) {
  // 3 sharp beeps at high frequency
  const now = ctx.currentTime
  for (let i = 0; i < 3; i++) {
    playTone(ctx, 880, 0.15, now + i * 0.22, 0.4)
  }
}

function playHigh(ctx: AudioContext) {
  // Single medium tone
  playTone(ctx, 660, 0.4, ctx.currentTime, 0.3)
}

export function useAudioAlerts() {
  const alertsRef = useRef<Set<string>>(new Set())
  const ctxRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    const unsubscribe = useAlertStore.subscribe((state) => {
      const muted = useSystemStore.getState().alertMuted
      if (muted || document.hidden) return

      const ctx = ctxRef.current ?? (ctxRef.current = new AudioContext())

      for (const alert of state.alerts) {
        if (alertsRef.current.has(alert.id)) continue
        alertsRef.current.add(alert.id)

        if (alert.threat_level === 'CRITICAL') {
          playCritical(ctx)
        } else if (alert.threat_level === 'HIGH') {
          playHigh(ctx)
        }
      }
    })

    return () => {
      unsubscribe()
      ctxRef.current?.close()
      ctxRef.current = null
    }
  }, [])
}
