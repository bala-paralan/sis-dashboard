import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore — initial state', () => {
  it('widgets array is non-empty', () => {
    expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
  })

  it('panels record has expected keys', () => {
    const { panels } = useSettingsStore.getState()
    expect(panels).toHaveProperty('map')
    expect(panels).toHaveProperty('alerts')
    expect(panels).toHaveProperty('video')
    expect(panels).toHaveProperty('sensors')
    expect(panels).toHaveProperty('aiml')
    expect(panels).toHaveProperty('health')
  })

  it('all core panels are visible by default', () => {
    const { panels } = useSettingsStore.getState()
    expect(panels['map']).toBe(true)
    expect(panels['alerts']).toBe(true)
    expect(panels['video']).toBe(true)
  })

  it('settingsOpen starts false', () => {
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })

  it('defaultExpandedPanel starts null', () => {
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })
})

describe('useSettingsStore — toggleWidget', () => {
  it('toggles a visible widget to hidden', () => {
    const { widgets } = useSettingsStore.getState()
    const visibleWidget = widgets.find((w) => w.visible)!
    useSettingsStore.getState().toggleWidget(visibleWidget.id)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === visibleWidget.id)!
    expect(updated.visible).toBe(false)
  })

  it('toggles a hidden widget to visible', () => {
    const { widgets } = useSettingsStore.getState()
    const hiddenWidget = widgets.find((w) => !w.visible)!
    useSettingsStore.getState().toggleWidget(hiddenWidget.id)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === hiddenWidget.id)!
    expect(updated.visible).toBe(true)
  })

  it('does not affect other widgets', () => {
    const { widgets } = useSettingsStore.getState()
    const targetId = widgets[0].id
    const others = widgets.filter((w) => w.id !== targetId).map((w) => ({ id: w.id, visible: w.visible }))
    useSettingsStore.getState().toggleWidget(targetId)
    const afterToggle = useSettingsStore.getState().widgets.filter((w) => w.id !== targetId)
    afterToggle.forEach((w, i) => expect(w.visible).toBe(others[i].visible))
  })
})

describe('useSettingsStore — setWidgetOption', () => {
  it('sets updateRateHz on a widget', () => {
    const { widgets } = useSettingsStore.getState()
    const id = widgets[0].id
    useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 5)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === id)!
    expect(updated.updateRateHz).toBe(5)
  })

  it('sets threshold on a widget', () => {
    const { widgets } = useSettingsStore.getState()
    const id = widgets[0].id
    useSettingsStore.getState().setWidgetOption(id, 'threshold', 80)
    const updated = useSettingsStore.getState().widgets.find((w) => w.id === id)!
    expect(updated.threshold).toBe(80)
  })
})

describe('useSettingsStore — togglePanel', () => {
  it('toggles map panel off', () => {
    useSettingsStore.getState().togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(false)
  })

  it('toggles a panel back on', () => {
    useSettingsStore.getState().togglePanel('map')
    useSettingsStore.getState().togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })
})

describe('useSettingsStore — isWidgetVisible / isPanelVisible', () => {
  it('isWidgetVisible returns true for a visible widget', () => {
    const { widgets } = useSettingsStore.getState()
    const visibleId = widgets.find((w) => w.visible)!.id
    expect(useSettingsStore.getState().isWidgetVisible(visibleId)).toBe(true)
  })

  it('isWidgetVisible returns false after toggling off', () => {
    const { widgets } = useSettingsStore.getState()
    const id = widgets.find((w) => w.visible)!.id
    useSettingsStore.getState().toggleWidget(id)
    expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
  })

  it('isPanelVisible returns true for map by default', () => {
    expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
  })

  it('isPanelVisible returns false after toggling off', () => {
    useSettingsStore.getState().togglePanel('map')
    expect(useSettingsStore.getState().isPanelVisible('map')).toBe(false)
  })
})

describe('useSettingsStore — widgetsByCategory', () => {
  it('returns an object keyed by category', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    expect(typeof byCategory).toBe('object')
    const keys = Object.keys(byCategory)
    expect(keys.length).toBeGreaterThan(0)
  })

  it('each category has at least one widget', () => {
    const byCategory = useSettingsStore.getState().widgetsByCategory()
    Object.values(byCategory).forEach((widgets) => {
      expect(widgets.length).toBeGreaterThan(0)
    })
  })
})

describe('useSettingsStore — setDefaultExpandedPanel', () => {
  it('sets the defaultExpandedPanel', () => {
    useSettingsStore.getState().setDefaultExpandedPanel('map')
    expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
  })

  it('clears defaultExpandedPanel when set to null', () => {
    useSettingsStore.getState().setDefaultExpandedPanel('map')
    useSettingsStore.getState().setDefaultExpandedPanel(null)
    expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
  })
})

describe('useSettingsStore — setSettingsOpen', () => {
  it('opens the settings panel', () => {
    useSettingsStore.getState().setSettingsOpen(true)
    expect(useSettingsStore.getState().settingsOpen).toBe(true)
  })

  it('closes the settings panel', () => {
    useSettingsStore.getState().setSettingsOpen(true)
    useSettingsStore.getState().setSettingsOpen(false)
    expect(useSettingsStore.getState().settingsOpen).toBe(false)
  })
})

describe('useSettingsStore — resetToDefaults', () => {
  it('restores all panels to default visibility', () => {
    useSettingsStore.getState().togglePanel('map')
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('restores widgets to default visibility', () => {
    const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
    useSettingsStore.getState().toggleWidget(id)
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
  })
})
