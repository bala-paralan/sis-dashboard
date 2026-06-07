import { useEffect, useRef } from 'react'
import { useDiagnosticsStore } from '@/store/diagnosticsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'

export function useDiagnostics() {
  const setFps = useDiagnosticsStore((s) => s.setFps)
  const setWsLatency = useDiagnosticsStore((s) => s.setWsLatency)
  const recordAlert = useDiagnosticsStore((s) => s.recordAlert)
  const tick = useDiagnosticsStore((s) => s.tick)
  const alerts = useAlertStore((s) => s.alerts)
  const sendMessage = useSystemStore((s) => s.sendMessage)

  const frameRef = useRef<number>(0)
  const lastFrameRef = useRef<number>(performance.now())
  const frameCountRef = useRef<number>(0)
  const seenAlertsRef = useRef<Set<string>>(new Set())
  const pingTimestampRef = useRef<number | null>(null)

  // FPS counter via rAF
  useEffect(() => {
    let rafId: number
    const measure = (now: number) => {
      frameCountRef.current++
      const elapsed = now - lastFrameRef.current
      if (elapsed >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / elapsed))
        frameCountRef.current = 0
        lastFrameRef.current = now
      }
      rafId = requestAnimationFrame(measure)
    }
    rafId = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(rafId)
  }, [setFps])

  // Periodic tick (1s)
  useEffect(() => {
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [tick])

  // WS latency via ping
  useEffect(() => {
    const pingInterval = setInterval(() => {
      pingTimestampRef.current = Date.now()
      try {
        sendMessage({ type: 'ping', ts: pingTimestampRef.current })
      } catch {
        // WS may not be connected
      }
    }, 5000)
    return () => clearInterval(pingInterval)
  }, [sendMessage])

  // Track new alerts
  useEffect(() => {
    alerts.forEach((alert) => {
      if (!seenAlertsRef.current.has(alert.id)) {
        seenAlertsRef.current.add(alert.id)
        recordAlert(alert.acknowledged)
      }
    })
    frameRef.current = frameRef.current
  }, [alerts, recordAlert])

  // Simulate latency updates (in production, respond to 'pong' WebSocket message)
  useEffect(() => {
    const id = setInterval(() => {
      setWsLatency(40 + Math.random() * 60)
    }, 5000)
    return () => clearInterval(id)
  }, [setWsLatency])
}
