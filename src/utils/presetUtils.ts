import type { WidgetDef } from '@/store/settingsStore'

export interface DashboardPreset {
  name: string
  createdAt: string
  widgets: Record<string, { visible: boolean; updateRateHz?: number; threshold?: number }>
  panels: Record<string, boolean>
  defaultExpandedPanel: string | null
}

const STORAGE_KEY = 'sis-dashboard-presets'
const MAX_PRESETS = 5

export function loadPresets(): DashboardPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as DashboardPreset[]
  } catch {
    return []
  }
}

export function savePresets(presets: DashboardPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
}

export function addPreset(
  name: string,
  widgets: WidgetDef[],
  panels: Record<string, boolean>,
  defaultExpandedPanel: string | null,
): DashboardPreset[] {
  const presets = loadPresets().filter((p) => p.name !== name)
  const preset: DashboardPreset = {
    name,
    createdAt: new Date().toISOString(),
    widgets: Object.fromEntries(
      widgets.map((w) => [w.id, { visible: w.visible, updateRateHz: w.updateRateHz, threshold: w.threshold }])
    ),
    panels,
    defaultExpandedPanel,
  }
  const updated = [preset, ...presets].slice(0, MAX_PRESETS)
  savePresets(updated)
  return updated
}

export function deletePreset(name: string): DashboardPreset[] {
  const updated = loadPresets().filter((p) => p.name !== name)
  savePresets(updated)
  return updated
}

export function exportPresetJson(preset: DashboardPreset): void {
  const content = JSON.stringify(preset, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sis-preset-${preset.name.replace(/\s+/g, '-').toLowerCase()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importPresetJson(file: File): Promise<DashboardPreset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const preset = JSON.parse(e.target?.result as string) as DashboardPreset
        if (!preset.name || !preset.widgets || !preset.panels) {
          reject(new Error('Invalid preset file format'))
          return
        }
        resolve(preset)
      } catch {
        reject(new Error('Could not parse preset file'))
      }
    }
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsText(file)
  })
}
