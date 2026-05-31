import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('has a non-empty widgets array', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
    })

    it('panels object contains the map panel', () => {
      expect(useSettingsStore.getState().panels['map']).toBe(true)
    })

    it('settingsOpen defaults to false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('defaultExpandedPanel defaults to null', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('toggleWidget', () => {
    it('hides a visible widget', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === id)?.visible).toBe(false)
    })

    it('shows a hidden widget', () => {
      const id = useSettingsStore.getState().widgets.find((w) => !w.visible)?.id
      if (!id) return // all visible — skip
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === id)?.visible).toBe(true)
    })

    it('persists the change to localStorage', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings')!)
      expect(saved.widgets[id].visible).toBe(false)
    })
  })

  describe('isWidgetVisible', () => {
    it('returns true for a visible widget', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
    })

    it('returns false after toggling a visible widget off', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
    })

    it('returns true for an unknown id (safe default)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('nonexistent-widget')).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().panels['map']).toBe(false)
    })

    it('shows a hidden panel after two toggles', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().panels['map']).toBe(true)
    })

    it('persists panel visibility to localStorage', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('alerts')
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings')!)
      expect(saved.panels['alerts']).toBe(false)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for a panel that exists and is visible', () => {
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('returns false after hiding a panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(false)
    })

    it('returns true for an unknown panel id (safe default)', () => {
      expect(useSettingsStore.getState().isPanelVisible('unknown-panel')).toBe(true)
    })
  })

  describe('setWidgetOption', () => {
    it('sets the updateRateHz on a widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 5)
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === id)?.updateRateHz).toBe(5)
    })

    it('sets the threshold on a widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().setWidgetOption(id, 'threshold', 0.75)
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === id)?.threshold).toBe(0.75)
    })
  })

  describe('setDefaultExpandedPanel', () => {
    it('sets the default expanded panel id', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('map')
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
    })

    it('can be cleared to null', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('map')
        useSettingsStore.getState().setDefaultExpandedPanel(null)
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('setSettingsOpen', () => {
    it('opens the settings panel', () => {
      act(() => {
        useSettingsStore.getState().setSettingsOpen(true)
      })
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

  describe('widgetsByCategory', () => {
    it('returns an object with at least one category key', () => {
      const categories = useSettingsStore.getState().widgetsByCategory()
      expect(Object.keys(categories).length).toBeGreaterThan(0)
    })

    it('every value is a non-empty array of widgets', () => {
      const categories = useSettingsStore.getState().widgetsByCategory()
      for (const arr of Object.values(categories)) {
        expect(arr.length).toBeGreaterThan(0)
      }
    })
  })

  describe('resetToDefaults', () => {
    it('restores all widgets to default visible state', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === id)?.visible).toBe(true)
    })

    it('removes sis-settings from localStorage', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })
  })
})
