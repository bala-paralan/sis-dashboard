import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  // Reset to defaults before each test
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore', () => {
  it('initial state has widgets array with entries', () => {
    const { widgets } = useSettingsStore.getState()
    expect(Array.isArray(widgets)).toBe(true)
    expect(widgets.length).toBeGreaterThan(0)
  })

  it('toggleWidget sets visible to false for a visible widget', () => {
    const { widgets, toggleWidget } = useSettingsStore.getState()
    const visibleWidget = widgets.find((w) => w.visible)!
    expect(visibleWidget).toBeDefined()
    toggleWidget(visibleWidget.id)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === visibleWidget.id)!
    expect(updated.visible).toBe(false)
  })

  it('toggleWidget sets visible to true for a hidden widget', () => {
    const hiddenWidget = useSettingsStore.getState().widgets.find((w) => !w.visible)!
    expect(hiddenWidget).toBeDefined()
    useSettingsStore.getState().toggleWidget(hiddenWidget.id)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === hiddenWidget.id)!
    expect(updated.visible).toBe(true)
  })

  it('isWidgetVisible returns correct value for a known widget', () => {
    const { isWidgetVisible } = useSettingsStore.getState()
    // alertQueue is visible by default
    expect(isWidgetVisible('alertQueue')).toBe(true)
    // terrainView3D is NOT visible by default
    expect(isWidgetVisible('terrainView3D')).toBe(false)
  })

  it('widgetsByCategory returns grouped widgets object', () => {
    const categories = useSettingsStore.getState().widgetsByCategory()
    expect(typeof categories).toBe('object')
    expect(Object.keys(categories).length).toBeGreaterThan(0)
    // Every value should be an array
    Object.values(categories).forEach((arr) => {
      expect(Array.isArray(arr)).toBe(true)
      expect(arr.length).toBeGreaterThan(0)
    })
  })

  it('togglePanel flips panel visibility', () => {
    const { panels, togglePanel } = useSettingsStore.getState()
    // 'map' is true by default
    expect(panels['map']).toBe(true)
    togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(false)
    togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('resetToDefaults restores widget visibility to defaults', () => {
    // Hide a widget that is normally visible
    useSettingsStore.getState().toggleWidget('alertQueue')
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(false)

    // Reset
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
  })

  it('resetToDefaults restores panels to default state', () => {
    useSettingsStore.getState().togglePanel('alerts')
    expect(useSettingsStore.getState().panels['alerts']).toBe(false)

    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().panels['alerts']).toBe(true)
  })
})
