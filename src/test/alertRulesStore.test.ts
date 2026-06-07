import { describe, it, expect, beforeEach } from 'vitest'
import { useAlertRulesStore } from '@/store/alertRulesStore'

describe('alertRulesStore', () => {
  beforeEach(() => {
    useAlertRulesStore.getState().resetToDefaults()
  })

  it('loads with default rules', () => {
    const rules = useAlertRulesStore.getState().rules
    expect(rules.length).toBeGreaterThanOrEqual(2)
    expect(rules.find((r) => r.name === 'Low Quality Sensor')).toBeTruthy()
    expect(rules.find((r) => r.name === 'Sensor Offline')).toBeTruthy()
  })

  it('addRule creates rule with id and createdAt', () => {
    const rule = useAlertRulesStore.getState().addRule({
      name: 'Test Rule',
      enabled: true,
      field: 'quality_score',
      operator: '<',
      value: 0.5,
      severity: 'MEDIUM',
      messageTemplate: 'Sensor {sensor_id} below threshold',
    })
    expect(rule.id).toBeTruthy()
    expect(rule.createdAt).toBeTruthy()
    expect(rule.name).toBe('Test Rule')
    const rules = useAlertRulesStore.getState().rules
    expect(rules.find((r) => r.id === rule.id)).toBeTruthy()
  })

  it('toggleRule flips enabled', () => {
    const { rules, toggleRule } = useAlertRulesStore.getState()
    const first = rules[0]
    const initialEnabled = first.enabled
    toggleRule(first.id)
    const updated = useAlertRulesStore.getState().rules.find((r) => r.id === first.id)
    expect(updated?.enabled).toBe(!initialEnabled)
  })

  it('deleteRule removes rule', () => {
    const newRule = useAlertRulesStore.getState().addRule({
      name: 'Delete Me',
      enabled: true,
      field: 'sensor_status',
      operator: '==',
      value: 'OFFLINE',
      severity: 'HIGH',
      messageTemplate: 'Gone',
    })
    useAlertRulesStore.getState().deleteRule(newRule.id)
    const found = useAlertRulesStore.getState().rules.find((r) => r.id === newRule.id)
    expect(found).toBeUndefined()
  })

  it('updateRule modifies name', () => {
    const { rules, updateRule } = useAlertRulesStore.getState()
    const first = rules[0]
    updateRule(first.id, { name: 'Updated Name' })
    const updated = useAlertRulesStore.getState().rules.find((r) => r.id === first.id)
    expect(updated?.name).toBe('Updated Name')
  })

  it('persists to localStorage', () => {
    useAlertRulesStore.getState().addRule({
      name: 'Persist Me',
      enabled: true,
      field: 'quality_score',
      operator: '<',
      value: 0.1,
      severity: 'LOW',
      messageTemplate: '',
    })
    const stored = JSON.parse(localStorage.getItem('sis-alert-rules') ?? '[]') as unknown[]
    expect(stored.length).toBeGreaterThan(0)
  })
})
