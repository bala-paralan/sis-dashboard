import { useEffect, useRef } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { useSystemStore } from '@/store/systemStore'
import { useTimelineStore } from '@/store/timelineStore'

export function useTimelineRecorder() {
  const alerts = useAlertStore((s) => s.alerts)
  const connectionStatus = useSystemStore((s) => s.connectionStatus)
  const addEvent = useTimelineStore((s) => s.addEvent)

  const seenAlertsRef = useRef<Set<string>>(new Set())
  const prevConnectionRef = useRef<string>(connectionStatus)

  // Record new alerts
  useEffect(() => {
    alerts.forEach((alert) => {
      if (!seenAlertsRef.current.has(alert.id)) {
        seenAlertsRef.current.add(alert.id)
        addEvent({
          type: 'ALERT',
          timestamp: alert.timestamp,
          label: `${alert.threat_level} — ${alert.classification}`,
          severity: alert.threat_level,
          data: alert,
        })
      }
    })
  }, [alerts, addEvent])

  // Record connection state changes
  useEffect(() => {
    if (connectionStatus !== prevConnectionRef.current) {
      addEvent({
        type: 'CONNECTION',
        timestamp: new Date().toISOString(),
        label: `Connection: ${connectionStatus}`,
        data: { status: connectionStatus },
      })
      prevConnectionRef.current = connectionStatus
    }
  }, [connectionStatus, addEvent])
}
