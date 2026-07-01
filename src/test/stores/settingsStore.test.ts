import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  // Reset to defaults between each test
  act(() => { useSettingsStore.getState().resetToDefaults() })
})

describe('useSettingsStore', () => {
  describe('initial state', () => {
    it('has a non-empty widgets array', () => {
      expect(useSettingsStore.getState().widgets.length).toBeGreaterThan(0)
    })

    it('has settingsOpen false', () => {
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })

    it('has null defaultExpandedPanel', () => {
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('isWidgetVisible', () => {
    it('returns true for a widget that is visible by default', () => {
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
    })

    it('returns false for a widget that is hidden by default', () => {
      expect(useSettingsStore.getState().isWidgetVisible('terrainView3D')).toBe(false)
    })

    it('returns true for an unknown widget id (default fallback)', () => {
      expect(useSettingsStore.getState().isWidgetVisible('nonexistent-widget')).toBe(true)
    })
  })

  describe('toggleWidget', () => {
    it('hides a visible widget', () => {
      const id = 'alertQueue'
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
      act(() => { useSettingsStore.getState().toggleWidget(id) })
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
    })

    it('shows a hidden widget', () => {
      const id = 'terrainView3D'
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(false)
      act(() => { useSettingsStore.getState().toggleWidget(id) })
      expect(useSettingsStore.getState().isWidgetVisible(id)).toBe(true)
    })

    it('persists to localStorage', () => {
      act(() => { useSettingsStore.getState().toggleWidget('alertQueue') })
      const stored = JSON.parse(localStorage.getItem('sis-settings') ?? '{}')
      expect(stored.widgets?.alertQueue?.visible).toBe(false)
    })
  })

  describe('setWidgetOption', () => {
    it('updates updateRateHz for a widget', () => {
      act(() => { useSettingsStore.getState().setWidgetOption('alertQueue', 'updateRateHz', 5) })
      const widget = useSettingsStore.getState().widgets.find((w) => w.id === 'alertQueue')
      expect(widget?.updateRateHz).toBe(5)
    })

    it('updates threshold for a widget', () => {
      act(() => { useSettingsStore.getState().setWidgetOption('alertQueue', 'threshold', 0.75) })
      const widget = useSettingsStore.getState().widgets.find((w) => w.id === 'alertQueue')
      expect(widget?.threshold).toBe(0.75)
    })
  })

  describe('isPanelVisible', () => {
    it('returns true for panels that are visible by default', () => {
      expect(useSettingsStore.getState().isPanelVisible('video')).toBe(true)
    })

    it('returns true for unknown panel ids (default fallback)', () => {
      expect(useSettingsStore.getState().isPanelVisible('nonexistent-panel')).toBe(true)
    })
  })

  describe('togglePanel', () => {
    it('hides a visible panel', () => {
      expect(useSettingsStore.getState().isPanelVisible('video')).toBe(true)
      act(() => { useSettingsStore.getState().togglePanel('video') })
      expect(useSettingsStore.getState().isPanelVisible('video')).toBe(false)
    })

    it('shows a hidden panel', () => {
      act(() => { useSettingsStore.getState().togglePanel('video') })
      act(() => { useSettingsStore.getState().togglePanel('video') })
      expect(useSettingsStore.getState().isPanelVisible('video')).toBe(true)
    })
  })

  describe('setDefaultExpandedPanel', () => {
    it('sets the default expanded panel', () => {
      act(() => { useSettingsStore.getState().setDefaultExpandedPanel('map') })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBe('map')
    })

    it('clears the default expanded panel when null is passed', () => {
      act(() => { useSettingsStore.getState().setDefaultExpandedPanel('map') })
      act(() => { useSettingsStore.getState().setDefaultExpandedPanel(null) })
      expect(useSettingsStore.getState().defaultExpandedPanel).toBeNull()
    })
  })

  describe('setSettingsOpen', () => {
    it('opens the settings panel', () => {
      act(() => { useSettingsStore.getState().setSettingsOpen(true) })
      expect(useSettingsStore.getState().settingsOpen).toBe(true)
    })

    it('closes the settings panel', () => {
      act(() => { useSettingsStore.getState().setSettingsOpen(true) })
      act(() => { useSettingsStore.getState().setSettingsOpen(false) })
      expect(useSettingsStore.getState().settingsOpen).toBe(false)
    })
  })

  describe('resetToDefaults', () => {
    it('restores widget visibility to defaults after changes', () => {
      act(() => { useSettingsStore.getState().toggleWidget('alertQueue') })
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(false)
      act(() => { useSettingsStore.getState().resetToDefaults() })
      expect(useSettingsStore.getState().isWidgetVisible('alertQueue')).toBe(true)
    })

    it('removes sis-settings from localStorage', () => {
      act(() => { useSettingsStore.getState().toggleWidget('alertQueue') })
      act(() => { useSettingsStore.getState().resetToDefaults() })
      expect(localStorage.getItem('sis-settings')).toBeNull()
    })
  })

  describe('widgetsByCategory', () => {
    it('returns an object with category keys', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      expect(typeof byCategory).toBe('object')
      expect(Object.keys(byCategory).length).toBeGreaterThan(0)
    })

    it('each category contains widget objects with id and label', () => {
      const byCategory = useSettingsStore.getState().widgetsByCategory()
      const firstCategory = Object.values(byCategory)[0]
      expect(firstCategory[0]).toHaveProperty('id')
      expect(firstCategory[0]).toHaveProperty('label')
    })
  })
})
