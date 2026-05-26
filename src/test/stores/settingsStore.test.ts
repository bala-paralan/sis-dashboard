import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('has widgets array with items', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
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
  })

  describe('isWidgetVisible', () => {
    it('returns true for a widget that is visible by default', () => {
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
    })

    it('returns false for a widget that is hidden by default', () => {
      expect(useSettingsStore.getState().isWidgetVisible('terrainView3D')).toBe(false)
    })

    it('returns true for an unknown widget id (defaults to visible)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('nonExistentWidget')).toBe(true)
    })
  })

  describe('toggleWidget', () => {
    it('hides a visible widget', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('alertQueue')
      })
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(false)
    })

    it('shows a hidden widget', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('terrainView3D')
      })
      expect(useSettingsStore.getState().isWidgetVisible('terrainView3D')).toBe(true)
    })

    it('toggling twice restores original state', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('alertQueue')
        useSettingsStore.getState().toggleWidget('alertQueue')
      })
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
    })

    it('persists toggle to localStorage', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('alertQueue')
      })
      const stored = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(stored.widgets['alertQueue'].visible).toBe(false)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for a visible panel', () => {
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('returns true for an unknown panel id (defaults to visible)', () => {
      expect(useSettingsStore.getState().isPanelVisible('unknownPanel')).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(false)
    })

    it('shows a hidden panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('map')
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('persists panel toggle to localStorage', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('alerts')
      })
      const stored = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(stored.panels['alerts']).toBe(false)
    })
  })

  describe('widgetsByCategory', () => {
    it('returns an object where keys are category names', () => {
      const categories = useSettingsStore.getState().widgetsByCategory()
      expect(typeof categories).toBe('object')
      expect(Object.keys(categories).length).toBeGreaterThan(0)
    })

    it('groups widgets under their category', () => {
      const categories = useSettingsStore.getState().widgetsByCategory()
      expect(categories['Alerts & Prioritisation']).toBeDefined()
      expect(Array.isArray(categories['Alerts & Prioritisation'])).toBe(true)
      expect(categories['Alerts & Prioritisation'].some((w) => w.id === 'alertQueue')).toBe(true)
    })

    it('every widget appears in exactly one category', () => {
      const categories = useSettingsStore.getState().widgetsByCategory()
      const allGrouped = Object.values(categories).flat()
      const { widgets } = useSettingsStore.getState()
      expect(allGrouped.length).toBe(widgets.length)
    })
  })

  describe('resetToDefaults', () => {
    it('restores hidden widgets to their defaults', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('alertQueue')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
    })

    it('restores hidden panels to their defaults', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('clears localStorage after reset', () => {
      act(() => {
        useSettingsStore.getState().toggleWidget('alertQueue')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })
  })

  describe('setWidgetOption', () => {
    it('sets updateRateHz on the specified widget', () => {
      act(() => {
        useSettingsStore.getState().setWidgetOption('alertQueue', 'updateRateHz', 5)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === 'alertQueue')
      expect(w?.updateRateHz).toBe(5)
    })

    it('sets threshold on the specified widget', () => {
      act(() => {
        useSettingsStore.getState().setWidgetOption('alertQueue', 'threshold', 0.75)
      })
      const w = useSettingsStore.getState().widgets.find((w) => w.id === 'alertQueue')
      expect(w?.threshold).toBe(0.75)
    })
  })
})
