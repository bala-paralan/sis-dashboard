import { describe, it, expect, beforeEach } from 'vitest'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  // ── initial state ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('panelViews is empty', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('expandedPanel is null', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  // ── getView ────────────────────────────────────────────────────────────────
  describe('getView', () => {
    it('returns "normal" for unknown panel', () => {
      expect(useViewStore.getState().getView('unknown-panel')).toBe('normal')
    })

    it('returns the stored view mode', () => {
      useViewStore.setState({ panelViews: { map: 'minimized' } })
      expect(useViewStore.getState().getView('map')).toBe('minimized')
    })
  })

  // ── setPanelView ────────────────────────────────────────────────────────────
  describe('setPanelView', () => {
    it('sets a panel to minimized', () => {
      useViewStore.getState().setPanelView('map', 'minimized')
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
    })

    it('sets a panel to expanded and records expandedPanel', () => {
      useViewStore.getState().setPanelView('alerts', 'expanded')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('setting non-expanded mode clears expandedPanel for that panel', () => {
      useViewStore.setState({ panelViews: { alerts: 'expanded' }, expandedPanel: 'alerts' })
      useViewStore.getState().setPanelView('alerts', 'normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not clear expandedPanel when a different panel is set to normal', () => {
      useViewStore.setState({ panelViews: { alerts: 'expanded' }, expandedPanel: 'alerts' })
      useViewStore.getState().setPanelView('map', 'normal')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })
  })

  // ── toggleExpand ───────────────────────────────────────────────────────────
  describe('toggleExpand', () => {
    it('expands a normal panel', () => {
      useViewStore.getState().toggleExpand('map')
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('collapses an expanded panel back to normal', () => {
      useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
      useViewStore.getState().toggleExpand('map')
      expect(useViewStore.getState().panelViews['map']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('only one panel can be expanded at a time', () => {
      useViewStore.getState().toggleExpand('map')
      useViewStore.getState().toggleExpand('alerts')
      const { expandedPanel, panelViews } = useViewStore.getState()
      expect(expandedPanel).toBe('alerts')
      // map is still tracked but no longer the expandedPanel
      expect(panelViews['map']).toBe('expanded')
      expect(panelViews['alerts']).toBe('expanded')
    })

    it('treats undefined panel view as normal before toggling', () => {
      useViewStore.getState().toggleExpand('new-panel')
      expect(useViewStore.getState().panelViews['new-panel']).toBe('expanded')
    })
  })

  // ── toggleMinimize ─────────────────────────────────────────────────────────
  describe('toggleMinimize', () => {
    it('minimizes a normal panel', () => {
      useViewStore.getState().toggleMinimize('map')
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
    })

    it('restores a minimized panel to normal', () => {
      useViewStore.setState({ panelViews: { map: 'minimized' } })
      useViewStore.getState().toggleMinimize('map')
      expect(useViewStore.getState().panelViews['map']).toBe('normal')
    })

    it('clears expandedPanel when the expanded panel is minimized', () => {
      useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
      useViewStore.getState().toggleMinimize('map')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not clear expandedPanel when a different panel is minimized', () => {
      useViewStore.setState({ panelViews: { alerts: 'expanded', map: 'normal' }, expandedPanel: 'alerts' })
      useViewStore.getState().toggleMinimize('map')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('treats undefined panel view as normal before toggling', () => {
      useViewStore.getState().toggleMinimize('new-panel')
      expect(useViewStore.getState().panelViews['new-panel']).toBe('minimized')
    })
  })
})
