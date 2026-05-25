import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('useSettingsStore', () => {
  // ── Initial state ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('has widgets array with entries', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
    })

    it('settingsOpen is false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('defaultExpandedPanel is null', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })

    it('default panels include map and alerts', () => {
      const { panels } = useSettingsStore.getState()
      expect(panels['map']).toBe(true)
      expect(panels['alerts']).toBe(true)
    })
  })

  // ── toggleWidget ───────────────────────────────────────────────────────────
  describe('toggleWidget', () => {
    it('hides a visible widget', () => {
      const { widgets } = useSettingsStore.getState()
      const id = widgets.find((w) => w.visible)!.id
      useSettingsStore.getState().toggleWidget(id)
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
    })

    it('shows a hidden widget', () => {
      const { widgets } = useSettingsStore.getState()
      const id = widgets.find((w) => !w.visible)!.id
      useSettingsStore.getState().toggleWidget(id)
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
    })

    it('persists change to localStorage', () => {
      const { widgets } = useSettingsStore.getState()
      const id = widgets.find((w) => w.visible)!.id
      useSettingsStore.getState().toggleWidget(id)
      const saved = JSON.parse(localStorage.getItem('sis-settings')!)
      expect(saved.widgets[id].visible).toBe(false)
    })
  })

  // ── setWidgetOption ────────────────────────────────────────────────────────
  describe('setWidgetOption', () => {
    it('sets updateRateHz on a widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      useSettingsStore.getState().setWidgetOption(id, 'updateRateHz', 10)
      const w = useSettingsStore.getState().widgets.find((x) => x.id === id)!
      expect(w.updateRateHz).toBe(10)
    })

    it('sets threshold on a widget', () => {
      const id = useSettingsStore.getState().widgets[0].id
      useSettingsStore.getState().setWidgetOption(id, 'threshold', 0.75)
      const w = useSettingsStore.getState().widgets.find((x) => x.id === id)!
      expect(w.threshold).toBe(0.75)
    })
  })

  // ── togglePanel ────────────────────────────────────────────────────────────
  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      useSettingsStore.getState().togglePanel('map')
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(false)
    })

    it('shows a hidden panel', () => {
      useSettingsStore.getState().togglePanel('map')
      useSettingsStore.getState().togglePanel('map')
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('persists panel change to localStorage', () => {
      useSettingsStore.getState().togglePanel('health')
      const saved = JSON.parse(localStorage.getItem('sis-settings')!)
      expect(saved.panels['health']).toBe(false)
    })
  })

  // ── setDefaultExpandedPanel ────────────────────────────────────────────────
  describe('setDefaultExpandedPanel', () => {
    it('sets defaultExpandedPanel', () => {
      useSettingsStore.getState().setDefaultExpandedPanel('map')
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
    })

    it('clears defaultExpandedPanel when null', () => {
      useSettingsStore.getState().setDefaultExpandedPanel('map')
      useSettingsStore.getState().setDefaultExpandedPanel(null)
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  // ── setSettingsOpen ────────────────────────────────────────────────────────
  describe('setSettingsOpen', () => {
    it('opens settings', () => {
      useSettingsStore.getState().setSettingsOpen(true)
      expect(useSettingsStore.getState().settingsOpen).toBe(true)
    })

    it('closes settings', () => {
      useSettingsStore.getState().setSettingsOpen(true)
      useSettingsStore.getState().setSettingsOpen(false)
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })
  })

  // ── resetToDefaults ────────────────────────────────────────────────────────
  describe('resetToDefaults', () => {
    it('restores all panels to default', () => {
      useSettingsStore.getState().togglePanel('map')
      useSettingsStore.getState().resetToDefaults()
      expect(useSettingsStore.getState().isPanelVisible('map')).toBe(true)
    })

    it('removes saved settings from localStorage', () => {
      useSettingsStore.getState().togglePanel('map')
      useSettingsStore.getState().resetToDefaults()
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })

    it('resets defaultExpandedPanel to null', () => {
      useSettingsStore.getState().setDefaultExpandedPanel('alerts')
      useSettingsStore.getState().resetToDefaults()
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  // ── isWidgetVisible ────────────────────────────────────────────────────────
  describe('isWidgetVisible', () => {
    it('returns true for unknown widget id (safe default)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('nonexistent')).toBe(true)
    })
  })

  // ── isPanelVisible ─────────────────────────────────────────────────────────
  describe('isPanelVisible', () => {
    it('returns true for unknown panel id (safe default)', () => {
      expect(useSettingsStore.getState().isPanelVisible('nonexistent')).toBe(true)
    })
  })

  // ── widgetsByCategory ──────────────────────────────────────────────────────
  describe('widgetsByCategory', () => {
    it('returns an object with category keys', () => {
      const cats = useSettingsStore.getState().widgetsByCategory()
      expect(Object.keys(cats).length).toBeGreaterThan(0)
    })

    it('each category contains WidgetDef objects with id and label', () => {
      const cats = useSettingsStore.getState().widgetsByCategory()
      const first = Object.values(cats)[0]
      expect(first[0]).toHaveProperty('id')
      expect(first[0]).toHaveProperty('label')
    })

    it('all widgets are distributed across categories', () => {
      const cats = useSettingsStore.getState().widgetsByCategory()
      const totalInCats = Object.values(cats).reduce((sum, arr) => sum + arr.length, 0)
      expect(totalInCats).toBe(useSettingsStore.getState().widgets.length)
    })
  })
})
