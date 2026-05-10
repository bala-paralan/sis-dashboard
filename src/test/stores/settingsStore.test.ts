import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

// Reset store and localStorage before each test so tests are isolated.
beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('loads 12 panels by default', () => {
      const panels = useSettingsStore.getState().panels
      expect(Object.keys(panels)).toHaveLength(12)
    })

    it('all core panels are visible by default', () => {
      const { panels } = useSettingsStore.getState()
      expect(panels['map']).toBe(true)
      expect(panels['alerts']).toBe(true)
      expect(panels['video']).toBe(true)
      expect(panels['sensors']).toBe(true)
      expect(panels['aiml']).toBe(true)
      expect(panels['health']).toBe(true)
    })

    it('defaultExpandedPanel is null', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })

    it('settingsOpen is false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('loads a non-empty widgets list', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(10)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for a visible panel', () => {
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('returns true for an unknown panel id (default behaviour)', () => {
      expect(useSettingsStore.getState().isPanelVisible('unknown-panel')).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      act(() => { useSettingsStore.getState().togglePanel('map') })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(false)
    })

    it('shows a hidden panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('toggling one panel does not affect others', () => {
      act(() => { useSettingsStore.getState().togglePanel('video') })
      expect(useSettingsStore.getState().isPanelVisible('alerts')).toBe(true)
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('persists the change in localStorage', () => {
      act(() => { useSettingsStore.getState().togglePanel('map') })
      const raw = localStorage.getItem('sis-settings')
      expect(raw).not.toBeNull()
      const saved = JSON.parse(raw!)
      expect(saved.panels['map']).toBe(false)
    })
  })

  describe('isWidgetVisible', () => {
    it('returns the visible flag for an existing widget', () => {
      const { widgets } = useSettingsStore.getState()
      const first = widgets[0]
      expect(useSettingsStore.getState().isWidgetVisible(first.id)).toBe(first.visible)
    })

    it('returns true for an unknown widget id', () => {
      expect(useSettingsStore.getState().isWidgetVisible('non-existent-widget')).toBe(true)
    })
  })

  describe('toggleWidget', () => {
    it('hides a visible widget', () => {
      const { widgets } = useSettingsStore.getState()
      const visibleWidget = widgets.find((w) => w.visible)!
      act(() => { useSettingsStore.getState().toggleWidget(visibleWidget.id) })
      expect(useSettingsStore.getState().isWidgetVisible(visibleWidget.id)).toBe(false)
    })

    it('shows a hidden widget', () => {
      const { widgets } = useSettingsStore.getState()
      const hiddenWidget = widgets.find((w) => !w.visible)!
      act(() => { useSettingsStore.getState().toggleWidget(hiddenWidget.id) })
      expect(useSettingsStore.getState().isWidgetVisible(hiddenWidget.id)).toBe(true)
    })

    it('does not affect other widgets', () => {
      const { widgets } = useSettingsStore.getState()
      const [w1, w2] = widgets
      const originalVisibility = w2.visible
      act(() => { useSettingsStore.getState().toggleWidget(w1.id) })
      expect(useSettingsStore.getState().isWidgetVisible(w2.id)).toBe(originalVisibility)
    })

    it('persists widget visibility in localStorage', () => {
      const { widgets } = useSettingsStore.getState()
      const widget = widgets[0]
      act(() => { useSettingsStore.getState().toggleWidget(widget.id) })
      const raw = localStorage.getItem('sis-settings')
      const saved = JSON.parse(raw!)
      expect(saved.widgets[widget.id].visible).toBe(!widget.visible)
    })
  })

  describe('setWidgetOption', () => {
    it('sets updateRateHz on the target widget', () => {
      const { widgets } = useSettingsStore.getState()
      const widget = widgets[0]
      act(() => { useSettingsStore.getState().setWidgetOption(widget.id, 'updateRateHz', 5) })
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === widget.id)
      expect(updated?.updateRateHz).toBe(5)
    })

    it('sets threshold on the target widget', () => {
      const { widgets } = useSettingsStore.getState()
      const widget = widgets[0]
      act(() => { useSettingsStore.getState().setWidgetOption(widget.id, 'threshold', 0.75) })
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === widget.id)
      expect(updated?.threshold).toBe(0.75)
    })

    it('does not change other widgets', () => {
      const { widgets } = useSettingsStore.getState()
      const [w1, w2] = widgets
      act(() => { useSettingsStore.getState().setWidgetOption(w1.id, 'updateRateHz', 10) })
      const other = useSettingsStore.getState().widgets.find((w) => w.id === w2.id)
      expect(other?.updateRateHz).toBeUndefined()
    })
  })

  describe('setDefaultExpandedPanel', () => {
    it('stores the panel id', () => {
      act(() => { useSettingsStore.getState().setDefaultExpandedPanel('map') })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
    })

    it('can be cleared by passing null', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('alerts')
        useSettingsStore.getState().setDefaultExpandedPanel(null)
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })

    it('persists to localStorage', () => {
      act(() => { useSettingsStore.getState().setDefaultExpandedPanel('video') })
      const raw = localStorage.getItem('sis-settings')
      const saved = JSON.parse(raw!)
      expect(saved.defaultExpandedPanel).toBe('video')
    })
  })

  describe('setSettingsOpen', () => {
    it('opens the settings panel', () => {
      act(() => { useSettingsStore.getState().setSettingsOpen(true) })
      expect(useSettingsStore.getState().settingsOpen).toBe(true)
    })

    it('closes the settings panel', () => {
      act(() => {
        useSettingsStore.getState().setSettingsOpen(true)
        useSettingsStore.getState().setSettingsOpen(false)
      })
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('restores all panel visibilities to true', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('video')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
      expect(useSettingsStore.getState().isPanelVisible('video')).toBe(true)
    })

    it('clears defaultExpandedPanel', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('sensors')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })

    it('removes the sis-settings key from localStorage', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })
  })

  describe('widgetsByCategory', () => {
    it('returns an object keyed by category', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      expect(typeof byCategory).toBe('object')
      const keys = Object.keys(byCategory)
      expect(keys.length).toBeGreaterThan(0)
    })

    it('every category contains at least one widget', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      for (const widgets of Object.values(byCategory)) {
        expect(widgets.length).toBeGreaterThan(0)
      }
    })

    it('total widget count matches the full widgets list', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      const total = Object.values(byCategory).reduce((sum, ws) => sum + ws.length, 0)
      expect(total).toBe(useSettingsStore.getState().widgets.length)
    })
  })
})
