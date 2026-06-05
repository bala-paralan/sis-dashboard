import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

// Prevent localStorage persistence from polluting tests
const storageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, val: string) => { store[key] = val },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: storageMock, writable: true })

beforeEach(() => {
  storageMock.clear()
  act(() => useSettingsStore.getState().resetToDefaults())
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('widgets array is not empty', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
    })

    it('all default panels are visible', () => {
      const { panels } = useSettingsStore.getState()
      Object.values(panels).forEach((v) => expect(v).toBe(true))
    })

    it('settingsOpen is false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('defaultExpandedPanel is null', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('toggleWidget', () => {
    it('flips visible from true to false', () => {
      const { widgets } = useSettingsStore.getState()
      const targetId = widgets.find((w) => w.visible)!.id
      act(() => useSettingsStore.getState().toggleWidget(targetId))
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === targetId)!
      expect(updated.visible).toBe(false)
    })

    it('flips visible from false back to true', () => {
      const { widgets } = useSettingsStore.getState()
      const targetId = widgets[0].id
      act(() => {
        useSettingsStore.getState().toggleWidget(targetId) // → false
        useSettingsStore.getState().toggleWidget(targetId) // → true
      })
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === targetId)!
      expect(updated.visible).toBe(true)
    })

    it('does not affect other widgets', () => {
      const { widgets } = useSettingsStore.getState()
      const [first, second] = widgets
      act(() => useSettingsStore.getState().toggleWidget(first.id))
      const other = useSettingsStore.getState().widgets.find((w) => w.id === second.id)!
      expect(other.visible).toBe(second.visible)
    })
  })

  describe('isWidgetVisible', () => {
    it('returns true for a visible widget', () => {
      const { widgets } = useSettingsStore.getState()
      const visible = widgets.find((w) => w.visible)!
      expect(useSettingsStore.getState().isWidgetVisible(visible.id)).toBe(true)
    })

    it('returns false after toggling a widget off', () => {
      const { widgets } = useSettingsStore.getState()
      const target = widgets.find((w) => w.visible)!
      act(() => useSettingsStore.getState().toggleWidget(target.id))
      expect(useSettingsStore.getState().isWidgetVisible(target.id)).toBe(false)
    })

    it('returns true for an unknown widget id (safe default)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('non-existent-id')).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      act(() => useSettingsStore.getState().togglePanel('map'))
      expect(useSettingsStore.getState().panels['map']).toBe(false)
    })

    it('re-shows a hidden panel', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map') // → false
        useSettingsStore.getState().togglePanel('map') // → true
      })
      expect(useSettingsStore.getState().panels['map']).toBe(true)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for a visible panel', () => {
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('returns false after toggling panel off', () => {
      act(() => useSettingsStore.getState().togglePanel('alerts'))
      expect(useSettingsStore.getState().isPanelVisible('alerts')).toBe(false)
    })

    it('returns true for an unknown panel id', () => {
      expect(useSettingsStore.getState().isPanelVisible('unknown-panel')).toBe(true)
    })
  })

  describe('setWidgetOption', () => {
    it('sets updateRateHz on a widget', () => {
      const { widgets } = useSettingsStore.getState()
      const target = widgets[0]
      act(() => useSettingsStore.getState().setWidgetOption(target.id, 'updateRateHz', 5))
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === target.id)!
      expect(updated.updateRateHz).toBe(5)
    })

    it('sets threshold on a widget', () => {
      const { widgets } = useSettingsStore.getState()
      const target = widgets[0]
      act(() => useSettingsStore.getState().setWidgetOption(target.id, 'threshold', 0.75))
      const updated = useSettingsStore.getState().widgets.find((w) => w.id === target.id)!
      expect(updated.threshold).toBe(0.75)
    })
  })

  describe('setDefaultExpandedPanel', () => {
    it('stores the panel id', () => {
      act(() => useSettingsStore.getState().setDefaultExpandedPanel('aiml'))
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('aiml')
    })

    it('clears with null', () => {
      act(() => {
        useSettingsStore.getState().setDefaultExpandedPanel('aiml')
        useSettingsStore.getState().setDefaultExpandedPanel(null)
      })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('setSettingsOpen', () => {
    it('opens settings panel', () => {
      act(() => useSettingsStore.getState().setSettingsOpen(true))
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

  describe('widgetsByCategory', () => {
    it('returns an object with at least one category', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      expect(Object.keys(byCategory).length).toBeGreaterThan(0)
    })

    it('every widget appears in its correct category', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      const { widgets } = useSettingsStore.getState()
      widgets.forEach((w) => {
        expect(byCategory[w.category]).toBeDefined()
        expect(byCategory[w.category].some((bw) => bw.id === w.id)).toBe(true)
      })
    })
  })

  describe('resetToDefaults', () => {
    it('restores all panels to visible after they were hidden', () => {
      act(() => {
        useSettingsStore.getState().togglePanel('map')
        useSettingsStore.getState().togglePanel('alerts')
        useSettingsStore.getState().resetToDefaults()
      })
      expect(useSettingsStore.getState().panels['map']).toBe(true)
      expect(useSettingsStore.getState().panels['alerts']).toBe(true)
    })

    it('restores widget visibility to defaults', () => {
      const { widgets } = useSettingsStore.getState()
      const originalVisible = widgets.map((w) => ({ id: w.id, visible: w.visible }))
      act(() => {
        widgets.forEach((w) => useSettingsStore.getState().toggleWidget(w.id))
        useSettingsStore.getState().resetToDefaults()
      })
      const afterReset = useSettingsStore.getState().widgets
      originalVisible.forEach(({ id, visible }) => {
        const found = afterReset.find((w) => w.id === id)!
        expect(found.visible).toBe(visible)
      })
    })
  })
})
