import { useEffect, useRef } from 'react'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertRulesStore } from '@/store/alertRulesStore'
import { useAlertStore } from '@/store/alertStore'
import type { SensorPayload } from '@/types/sensors'
import type { AlertRule } from '@/store/alertRulesStore'

function evaluateCondition(sensor: SensorPayload, rule: AlertRule): boolean {
  let sensorVal: number | string
  if (rule.field === 'quality_score') {
    sensorVal = sensor.quality_score
  } else {
    sensorVal = sensor.sensor_status
  }

  const ruleVal = rule.value
  switch (rule.operator) {
    case '<':  return typeof sensorVal === 'number' && sensorVal < (ruleVal as number)
    case '<=': return typeof sensorVal === 'number' && sensorVal <= (ruleVal as number)
    case '>':  return typeof sensorVal === 'number' && sensorVal > (ruleVal as number)
    case '>=': return typeof sensorVal === 'number' && sensorVal >= (ruleVal as number)
    case '==': return String(sensorVal) === String(ruleVal)
    default:   return false
  }
}

function formatMessage(template: string, sensor: SensorPayload): string {
  return template
    .replace('{sensor_id}', sensor.sensor_id)
    .replace('{value}', String(sensor.quality_score.toFixed(2)))
    .replace('{status}', sensor.sensor_status)
    .replace('{modality}', sensor.modality)
}

export function useRuleEvaluator() {
  const sensors = useSensorStore((s) => s.sensors)
  const rules = useAlertRulesStore((s) => s.rules)
  const addAlert = useAlertStore((s) => s.addAlert)

  // Track which (sensor × rule) combinations have already fired to avoid spam
  const firedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const enabledRules = rules.filter((r) => r.enabled)
    if (enabledRules.length === 0) return

    sensors.forEach((sensor) => {
      enabledRules.forEach((rule) => {
        const key = `${sensor.sensor_id}:${rule.id}`
        const fires = evaluateCondition(sensor, rule)

        if (fires && !firedRef.current.has(key)) {
          firedRef.current.add(key)
          addAlert({
            id: `rule-${rule.id}-${sensor.sensor_id}-${Date.now()}`,
            timestamp: new Date().toISOString(),
            source_sensors: [sensor.sensor_id],
            location: sensor.bop_id,
            classification: `RULE:${rule.name}`,
            threat_level: rule.severity,
            acknowledged: false,
            description: formatMessage(rule.messageTemplate, sensor),
            sensor_family: undefined,
          })
        }

        // Clear fire state when condition no longer holds (so it can fire again if condition recurs)
        if (!fires) {
          firedRef.current.delete(key)
        }
      })
    })
  }, [sensors, rules, addAlert])
}
