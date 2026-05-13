import { useEffect, useRef, useCallback } from 'react'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import type { Alert, SensorPayload, Track, ThreatAssessment, SystemHealth, ScenarioType } from '@/types/sensors'

const WS_URL = import.meta.env.VITE_WS_URL ?? 'wss://sis-sse.onrender.com'
const BACKOFF_DELAYS = [1000, 2000, 4000, 8000, 16000]
const PING_INTERVAL_MS  = 15_000
const PONG_TIMEOUT_MS   =  5_000
const SENSOR_THROTTLE_MS =  100  // max 10 Hz for SENSOR_DATA batching

export function useWebSocket() {
  const wsRef              = useRef<WebSocket | null>(null)
  const reconnectAttemptRef = useRef(0)
  const reconnectTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pingTimerRef       = useRef<ReturnType<typeof setInterval> | null>(null)
  const pongTimeoutRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef         = useRef(true)

  // SENSOR_DATA throttle: accumulate payloads then flush at ≤10 Hz
  const sensorBatchRef     = useRef<SensorPayload[]>([])
  const sensorFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearPingPong() {
    if (pingTimerRef.current)   clearInterval(pingTimerRef.current)
    if (pongTimeoutRef.current) clearTimeout(pongTimeoutRef.current)
    pingTimerRef.current   = null
    pongTimeoutRef.current = null
  }

  function flushSensorBatch() {
    sensorFlushTimerRef.current = null
    const batch = sensorBatchRef.current.splice(0)
    if (batch.length === 0) return
    const store = useSensorStore.getState()
    for (const payload of batch) store.updateSensor(payload)
  }

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    const attempt = reconnectAttemptRef.current

    if (attempt === 0) {
      useSystemStore.getState().setConnectionStatus('connecting')
    } else {
      useSystemStore.getState().setConnectionStatus('reconnecting')
    }

    let ws: WebSocket
    try {
      ws = new WebSocket(WS_URL)
    } catch {
      scheduleReconnect()
      return
    }

    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      reconnectAttemptRef.current = 0
      useSystemStore.getState().setConnectionStatus('connected')
      ws.send(JSON.stringify({ type: 'SUBSCRIBE', payload: { streams: ['ALL'] } }))

      // Start heartbeat
      pingTimerRef.current = setInterval(() => {
        if (ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify({ type: 'PING' }))
        // Force-reconnect if no PONG within timeout
        pongTimeoutRef.current = setTimeout(() => {
          if (!mountedRef.current) return
          ws.close()
        }, PONG_TIMEOUT_MS)
      }, PING_INTERVAL_MS)
    }

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return
      let msg: { type: string; payload: unknown }
      try {
        msg = JSON.parse(event.data as string)
      } catch {
        return
      }

      const { type, payload } = msg

      switch (type) {
        case 'PONG': {
          // Received heartbeat reply — clear the pong timeout
          if (pongTimeoutRef.current) {
            clearTimeout(pongTimeoutRef.current)
            pongTimeoutRef.current = null
          }
          break
        }
        case 'SENSOR_DATA': {
          // Throttle: batch and flush at ≤10 Hz
          sensorBatchRef.current.push(payload as SensorPayload)
          if (!sensorFlushTimerRef.current) {
            sensorFlushTimerRef.current = setTimeout(flushSensorBatch, SENSOR_THROTTLE_MS)
          }
          break
        }
        case 'AIML_TRACK_UPDATE': {
          const p = payload as { tracks: Track[] }
          useSensorStore.getState().updateTracks(p.tracks ?? [])
          break
        }
        case 'AIML_ALERT': {
          const p = payload as {
            alert_id: string
            timestamp: string
            contributing_sensors?: string[]
            location?: { lat?: number; lon?: number }
            scenario?: string
            threat_level: import('../types/sensors').ThreatLevel
            recommended_action?: string
            sensor_family?: import('../types/sensors').SensorFamily
            ai_model?: string
          }
          const alert: Alert = {
            id: p.alert_id,
            timestamp: p.timestamp,
            source_sensors: p.contributing_sensors ?? [],
            location:
              p.location?.lat != null && p.location?.lon != null
                ? `${p.location.lat.toFixed(4)}, ${p.location.lon.toFixed(4)}`
                : 'Unknown',
            classification: p.scenario ?? 'Multi-sensor event',
            threat_level: p.threat_level,
            acknowledged: false,
            description: p.recommended_action ?? 'Alert detected',
            sensor_family: p.sensor_family,
            ai_model: p.ai_model,
          }
          useAlertStore.getState().addAlert(alert)
          break
        }
        case 'THREAT_ASSESSMENT': {
          useAlertStore.getState().setThreatAssessment(payload as ThreatAssessment)
          break
        }
        case 'SYSTEM_HEALTH': {
          useSystemStore.getState().setHealth(payload as SystemHealth)
          break
        }
        case 'SCENARIO_CHANGE': {
          const p = payload as { current: ScenarioType }
          useSystemStore.getState().setScenario(p.current)
          break
        }
        case 'CONNECTED': {
          useSystemStore.getState().setConnectionStatus('connected')
          break
        }
        default:
          break
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      clearPingPong()
      useSystemStore.getState().setConnectionStatus('disconnected')
      scheduleReconnect()
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      useSystemStore.getState().setConnectionStatus('reconnecting')
    }
  }, [])

  function scheduleReconnect() {
    if (!mountedRef.current) return
    const attempt = reconnectAttemptRef.current
    if (attempt >= BACKOFF_DELAYS.length) {
      useSystemStore.getState().setConnectionStatus('disconnected')
      return
    }
    const delay = BACKOFF_DELAYS[attempt]
    reconnectAttemptRef.current = attempt + 1
    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) connect()
    }, delay)
  }

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      clearPingPong()
      if (reconnectTimerRef.current)   clearTimeout(reconnectTimerRef.current)
      if (sensorFlushTimerRef.current) clearTimeout(sensorFlushTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose   = null
        wsRef.current.onerror   = null
        wsRef.current.onmessage = null
        wsRef.current.onopen    = null
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [connect])

  const sendMessage = useCallback((msg: object) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg))
    }
  }, [])

  return { sendMessage, connect }
}
