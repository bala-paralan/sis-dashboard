import { create } from 'zustand'
import type { ThreatLevel } from '@/types/sensors'

export type RuleField = 'quality_score' | 'sensor_status'
export type RuleOperator = '<' | '<=' | '>' | '>=' | '=='

export interface AlertRule {
  id: string
  name: string
  enabled: boolean
  field: RuleField
  operator: RuleOperator
  value: number | string
  severity: ThreatLevel
  messageTemplate: string
  createdAt: string
}

const STORAGE_KEY = 'sis-alert-rules'

const DEFAULT_RULES: AlertRule[] = [
  {
    id: 'rule-default-1',
    name: 'Low Quality Sensor',
    enabled: true,
    field: 'quality_score',
    operator: '<',
    value: 0.3,
    severity: 'HIGH',
    messageTemplate: 'Sensor {sensor_id} quality degraded to {value}',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rule-default-2',
    name: 'Sensor Offline',
    enabled: true,
    field: 'sensor_status',
    operator: '==',
    value: 'OFFLINE',
    severity: 'CRITICAL',
    messageTemplate: 'Sensor {sensor_id} is OFFLINE',
    createdAt: new Date().toISOString(),
  },
]

function loadFromStorage(): AlertRule[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_RULES
    return JSON.parse(raw) as AlertRule[]
  } catch {
    return DEFAULT_RULES
  }
}

function saveToStorage(rules: AlertRule[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules))
}

interface AlertRulesState {
  rules: AlertRule[]
  addRule: (rule: Omit<AlertRule, 'id' | 'createdAt'>) => AlertRule
  updateRule: (id: string, updates: Partial<Omit<AlertRule, 'id' | 'createdAt'>>) => void
  deleteRule: (id: string) => void
  toggleRule: (id: string) => void
  resetToDefaults: () => void
}

export const useAlertRulesStore = create<AlertRulesState>()((set, get) => ({
  rules: loadFromStorage(),

  addRule: (rule) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }
    const rules = [...get().rules, newRule]
    saveToStorage(rules)
    set({ rules })
    return newRule
  },

  updateRule: (id, updates) => {
    const rules = get().rules.map((r) => (r.id === id ? { ...r, ...updates } : r))
    saveToStorage(rules)
    set({ rules })
  },

  deleteRule: (id) => {
    const rules = get().rules.filter((r) => r.id !== id)
    saveToStorage(rules)
    set({ rules })
  },

  toggleRule: (id) => {
    const rules = get().rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    saveToStorage(rules)
    set({ rules })
  },

  resetToDefaults: () => {
    saveToStorage(DEFAULT_RULES)
    set({ rules: DEFAULT_RULES })
  },
}))
