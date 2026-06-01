import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  // Reset to DEFAULT_WIDGETS / DEFAULT_PANELS by calling resetToDefaults
  act(() => { useSettingsStore.getState().resetToDefaults() })
})

describe('useSettingsStore — initial state', () => {
  it('has widgets array with entries', () => {
    expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
  })

  it('has panels record with map panel visible by default', () => {
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('defaultExpandedPanel is null', () => {
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })

  it('settingsOpen is false', () => {
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })
})

describe('toggleWidget', () => {
  it('toggles a visible widget to invisible', () => {
    const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
    act(() => { useSettingsStore.getState().toggleWidget(id) })
    const widget = useSettingsStore.getState().widgets.find((w) => w.id === id)
    expect(widget?.visible).toBe(false)
  })

  it('toggles an invisible widget to visible', () => {
    const id = useSettingsStore.getState().widgets.find((w) => !w.visible)!.id
    act(() => { useSettingsStore.getState().toggleWidget(id) })
    const widget = useSettingsStore.getState().widgets.find((w) => w.id === id)
    expect(widget?.visible).toBe(true)
  })

  it('does not affect other widgets', () => {
    const widgets = useSettingsStore.getState().widgets
    const [target, other] = widgets.filter((w) => w.visible)
    act(() => { useSettingsStore.getState().toggleWidget(target.id) })
    const otherAfter = useSettingsStore.getState().widgets.find((w) => w.id === other.id)
    expect(otherAfter?.visible).toBe(true)
  })

  it('persists to localStorage', () => {
    const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
    act(() => { useSettingsStore.getState().toggleWidget(id) })
    const stored = JSON.parse(localStorage.getItem('sis-settings')!)
    expect(stored.widgets[id].visible).toBe(false)
  })
})

describe('setWidgetOption', () => {
  it('sets updateRateHz on a widget', () => {
    const id = useSettingsStore.getState().widgets[0].id
    act(() => { useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 5) })
    const widget = useSettingsStore.getState().widgets.find((w) => w.id === id)
    expect(widget?.updateRateHz).toBe(5)
  })

  it('sets threshold on a widget', () => {
    const id = useSettingsStore.getState().widgets[0].id
    act(() => { useSettingsStore.getState().setWidgetOption(id, 'threshold', 80) })
    const widget = useSettingsStore.getState().widgets.find((w) => w.id === id)
    expect(widget?.threshold).toBe(80)
  })
})

describe('togglePanel', () => {
  it('toggles a visible panel to hidden', () => {
    act(() => { useSettingsStore.getState().togglePanel('map') })
    expect(useSettingsStore.getState().panels['map']).toBe(false)
  })

  it('toggles a hidden panel to visible', () => {
    // First hide it
    act(() => { useSettingsStore.getState().togglePanel('map') })
    // Then toggle back
    act(() => { useSettingsStore.getState().togglePanel('map') })
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('persists panels to localStorage', () => {
    act(() => { useSettingsStore.getState().togglePanel('alerts') })
    const stored = JSON.parse(localStorage.getItem('sis-settings')!)
    expect(stored.panels['alerts']).toBe(false)
  })
})

describe('setDefaultExpandedPanel', () => {
  it('sets defaultExpandedPanel', () => {
    act(() => { useSettingsStore.getState().setDefaultExpandedPanel('aiml') })
    expect(useSettingsStore.getState().defaultExpandedPanel).toBe('aiml')
  })

  it('clears defaultExpandedPanel with null', () => {
    act(() => { useSettingsStore.getState().setDefaultExpandedPanel('map') })
    act(() => { useSettingsStore.getState().setDefaultExpandedPanel(null) })
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })
})

describe('setSettingsOpen', () => {
  it('opens settings', () => {
    act(() => { useSettingsStore.getState().setSettingsOpen(true) })
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('closes settings', () => {
    act(() => { useSettingsStore.getState().setSettingsOpen(true) })
    act(() => { useSettingsStore.getState().setSettingsOpen(false) })
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })
})

describe('resetToDefaults', () => {
  it('restores all widgets to default visibility', () => {
    // Hide some widgets
    act(() => {
      useSettingsStore.getState().toggleWidget('liveVideoViewer')
      useSettingsStore.getState().toggleWidget('tacticalMap2D')
    })
    act(() => { useSettingsStore.getState().resetToDefaults() })
    const liveVideo = useSettingsStore.getState().widgets.find((w) => w.id === 'liveVideoViewer')
    expect(liveVideo?.visible).toBe(true)
  })

  it('removes sis-settings from localStorage', () => {
    act(() => { useSettingsStore.getState().toggleWidget('liveVideoViewer') })
    act(() => { useSettingsStore.getState().resetToDefaults() })
    expect(localStorage.getItem('sis-settings')).toBeNull()
  })
})

describe('isWidgetVisible', () => {
  it('returns true for a visible widget', () => {
    const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
    expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
  })

  it('returns false for a hidden widget', () => {
    const id = useSettingsStore.getState().widgets.find((w) => !w.visible)!.id
    expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
  })

  it('returns true for unknown widget id (default)', () => {
    expect(useSettingsStore.getState().isWidgetVisible('non-existent-widget')).toBe(true)
  })
})

describe('isPanelVisible', () => {
  it('returns true for a visible panel', () => {
    expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
  })

  it('returns false after toggling a panel off', () => {
    act(() => { useSettingsStore.getState().togglePanel('video') })
    expect(useSettingsStore.getState().isPanelVisible('video')).toBe(false)
  })

  it('returns true for unknown panel id (default)', () => {
    expect(useSettingsStore.getState().isPanelVisible('unknown-panel')).toBe(true)
  })
})

describe('widgetsByCategory', () => {
  it('returns an object keyed by category names', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(Object.keys(byCategory).length).toBeGreaterThan(0)
  })

  it('includes "Video & Imaging" category', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(byCategory['Video & Imaging']).toBeDefined()
  })

  it('each category array has at least one widget', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    Object.values(byCategory).forEach((widgets) => {
      expect(widgets.length).toBeGreaterThan(0)
    })
  })
})
