import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('settingsStore — initial state', () => {
  it('loads default widgets', () => {
    const { widgets } = useSettingsStore.getState()
    expect(widgets.length).toBeGreaterThan(0)
  })

  it('all default panels are visible', () => {
    const { panels } = useSettingsStore.getState()
    Object.values(panels).forEach((v) => expect(v).toBe(true))
  })

  it('defaultExpandedPanel is null initially', () => {
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })

  it('settingsOpen is false initially', () => {
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })
})

describe('settingsStore — widget visibility', () => {
  it('isWidgetVisible returns true for a default-visible widget', () => {
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
  })

  it('isWidgetVisible returns false for a default-hidden widget', () => {
    expect(useSettingsStore.getState().isWidgetVisible('terrainView3D')).toBe(false)
  })

  it('toggleWidget hides a visible widget', () => {
    useSettingsStore.getState().toggleWidget('alertQueue')
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(false)
  })

  it('toggleWidget shows a hidden widget', () => {
    useSettingsStore.getState().toggleWidget('terrainView3D')
    expect(useSettingsStore.getState().isWidgetVisible('terrainView3D')).toBe(true)
  })

  it('toggleWidget is idempotent over two calls', () => {
    const initial = useSettingsStore.getState().isWidgetVisible('alertQueue')
    useSettingsStore.getState().toggleWidget('alertQueue')
    useSettingsStore.getState().toggleWidget('alertQueue')
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(initial)
  })

  it('isWidgetVisible returns true for unknown widget id (safe fallback)', () => {
    expect(useSettingsStore.getState().isWidgetVisible('nonExistentWidget')).toBe(true)
  })
})

describe('settingsStore — panel visibility', () => {
  it('isPanelVisible returns true for map panel', () => {
    expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
  })

  it('togglePanel hides a visible panel', () => {
    useSettingsStore.getState().togglePanel('alerts')
    expect(useSettingsStore.getState().isPanelVisible('alerts')).toBe(false)
  })

  it('togglePanel shows a hidden panel', () => {
    useSettingsStore.getState().togglePanel('alerts')
    useSettingsStore.getState().togglePanel('alerts')
    expect(useSettingsStore.getState().isPanelVisible('alerts')).toBe(true)
  })

  it('isPanelVisible returns true for unknown panel id (safe fallback)', () => {
    expect(useSettingsStore.getState().isPanelVisible('unknownPanel')).toBe(true)
  })
})

describe('settingsStore — widget options', () => {
  it('setWidgetOption updates updateRateHz for a widget', () => {
    useSettingsStore.getState().setWidgetOption('alertQueue', 'updateRateHz', 5)
    const w = useSettingsStore.getState().widgets.find((x) => x.id === 'alertQueue')
    expect(w?.updateRateHz).toBe(5)
  })

  it('setWidgetOption updates threshold for a widget', () => {
    useSettingsStore.getState().setWidgetOption('alertQueue', 'threshold', 80)
    const w = useSettingsStore.getState().widgets.find((x) => x.id === 'alertQueue')
    expect(w?.threshold).toBe(80)
  })
})

describe('settingsStore — defaultExpandedPanel', () => {
  it('setDefaultExpandedPanel stores panel id', () => {
    useSettingsStore.getState().setDefaultExpandedPanel('map')
    expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
  })

  it('setDefaultExpandedPanel can be cleared with null', () => {
    useSettingsStore.getState().setDefaultExpandedPanel('map')
    useSettingsStore.getState().setDefaultExpandedPanel(null)
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })
})

describe('settingsStore — widgetsByCategory', () => {
  it('returns an object with category keys', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(Object.keys(byCategory).length).toBeGreaterThan(0)
  })

  it('groups widgets into the correct category', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(byCategory['Alerts & Prioritisation']).toBeDefined()
    const alertWidget = byCategory['Alerts & Prioritisation'].find((w) => w.id === 'alertQueue')
    expect(alertWidget).toBeDefined()
  })

  it('Counter-UAS category exists', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(byCategory['Counter-UAS']).toBeDefined()
  })
})

describe('settingsStore — resetToDefaults', () => {
  it('restores default widget visibility after toggling', () => {
    useSettingsStore.getState().toggleWidget('alertQueue')
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(false)
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
  })

  it('restores default panel visibility after toggling', () => {
    useSettingsStore.getState().togglePanel('alerts')
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().isPanelVisible('alerts')).toBe(true)
  })
})

describe('settingsStore — setSettingsOpen', () => {
  it('sets settingsOpen to true', () => {
    useSettingsStore.getState().setSettingsOpen(true)
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('sets settingsOpen to false', () => {
    useSettingsStore.getState().setSettingsOpen(true)
    useSettingsStore.getState().setSettingsOpen(false)
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })
})
