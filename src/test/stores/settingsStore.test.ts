import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  // Reset store to defaults after each test
  act(() => {
    useSettingsStore.getState().resetToDefaults()
  })
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('loads all default widgets', () => {
      const { widgets } = useSettingsStore.getState()
      expect(widgets.length).toBeGreaterThan(0)
    })

    it('default panels are all visible', () => {
      const { panels } = useSettingsStore.getState()
      expect(panels['map']).toBe(true)
      expect(panels['alerts']).toBe(true)
      expect(panels['video']).toBe(true)
    })

    it('settingsOpen defaults to false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('defaultExpandedPanel defaults to null', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('toggleWidget', () => {
    it('toggles a visible widget to hidden', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === id)
      expect(w?.visible).toBe(false)
    })

    it('toggles a hidden widget back to visible', () => {
      const id = useSettingsStore.getState().widgets.find((w) => !w.visible)?.id
        ?? useSettingsStore.getState().widgets[0].id
      // First make it hidden
      act(() => {
        const visible = useSettingsStore.getState().widgets.find((w) => w.id === id)?.visible
        if (visible) useSettingsStore.getState().toggleWidget(id)
      })
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === id)
      expect(w?.visible).toBe(true)
    })

    it('persists toggle to localStorage', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(saved.widgets?.[id]?.visible).toBe(false)
    })
  })

  describe('setWidgetOption', () => {
    it('sets updateRateHz on the specified widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 5)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === id)
      expect(w?.updateRateHz).toBe(5)
    })

    it('sets threshold on the specified widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().setWidgetOption(id, 'threshold', 0.8)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === id)
      expect(w?.threshold).toBe(0.8)
    })

    it('persists widget option to localStorage', () => {
      const id = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 10)
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(saved.widgets?.[id]?.updateRateHz).toBe(10)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().panels['map']).toBe(false)
    })

    it('shows a hidden panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().panels['map']).toBe(true)
    })

    it('persists panel toggle to localStorage', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('alerts')
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(saved.panels?.alerts).toBe(false)
    })
  })

  describe('setDefaultExpandedPanel', () => {
    it('sets the default expanded panel', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('aiml')
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('aiml')
    })

    it('clears the default expanded panel when null is passed', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('aiml')
        useSettingsStore.getState().setDefaultExpandedPanel(null)
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })

    it('persists to localStorage', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('health')
      })
      const saved = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(saved.defaultExpandedPanel).toBe('health')
    })
  })

  describe('setSettingsOpen', () => {
    it('opens settings panel', () => {
      act(() => {
        useSettingsStore.getState().setSettingsOpen(true)
      })
      expect(useSettingsStore.getState().settingsOpen).toBe(true)
    })

    it('closes settings panel', () => {
      act(() => {
        useSettingsStore.getState().setSettingsOpen(true)
        useSettingsStore.getState().setSettingsOpen(false)
      })
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })
  })

  describe('isWidgetVisible', () => {
    it('returns true for a visible widget', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
    })

    it('returns false for a hidden widget', () => {
      const id = useSettingsStore.getState().widgets.find((w) => w.visible)!.id
      act(() => {
        useSettingsStore.getState().toggleWidget(id)
      })
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
    })

    it('returns true for unknown widget id (fallback)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('nonexistent-widget')).toBe(true)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for a visible panel', () => {
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('returns false after toggling panel off', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('sensors')
      })
      expect(useSettingsStore.getState().isPanelVisible('sensors')).toBe(false)
    })

    it('returns true for unknown panel id (fallback)', () => {
      expect(useSettingsStore.getState().isPanelVisible('nonexistent-panel')).toBe(true)
    })
  })

  describe('widgetsByCategory', () => {
    it('returns an object keyed by category', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      expect(typeof byCategory).toBe('object')
      expect(Object.keys(byCategory).length).toBeGreaterThan(0)
    })

    it('every category has at least one widget', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      Object.values(byCategory).forEach((widgets) => {
        expect(widgets.length).toBeGreaterThan(0)
      })
    })

    it('includes Video & Imaging category', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      expect(byCategory['Video & Imaging']).toBeDefined()
    })
  })

  describe('resetToDefaults', () => {
    it('restores all widgets to defaults after changes', () => {
      const firstId = useSettingsStore.getState().widgets[0].id
      act(() => {
        useSettingsStore.getState().toggleWidget(firstId)
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().widgets.find((w) => w.id === firstId)?.visible).toBe(true)
      expect(useSettingsStore.getState().panels['map']).toBe(true)
    })

    it('clears localStorage sis-settings key', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('aiml')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })

    it('resets defaultExpandedPanel to null', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('video')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })
})
