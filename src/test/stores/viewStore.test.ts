import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  describe('initial state', () => {
    it('panelViews is empty object', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('expandedPanel is null', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('getView', () => {
    it('returns "normal" for a panel with no view set', () => {
      expect(useViewStore.getState().getView('map')).toBe('normal')
    })

    it('returns stored view mode when set', () => {
      act(() => useViewStore.getState().setPanelView('map', 'minimized'))
      expect(useViewStore.getState().getView('map')).toBe('minimized')
    })
  })

  describe('setPanelView', () => {
    it('sets view mode for the specified panel', () => {
      act(() => useViewStore.getState().setPanelView('alerts', 'expanded'))
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
    })

    it('sets expandedPanel when mode is expanded', () => {
      act(() => useViewStore.getState().setPanelView('alerts', 'expanded'))
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('clears expandedPanel when mode is not expanded', () => {
      useViewStore.setState({ expandedPanel: 'alerts' })
      act(() => useViewStore.getState().setPanelView('alerts', 'normal'))
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('preserves expandedPanel when a DIFFERENT panel changes to non-expanded mode', () => {
      useViewStore.setState({ expandedPanel: 'map' })
      act(() => useViewStore.getState().setPanelView('alerts', 'minimized'))
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })
  })

  describe('toggleExpand', () => {
    it('expands a normal panel and sets expandedPanel', () => {
      act(() => useViewStore.getState().toggleExpand('map'))
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('collapses an already-expanded panel back to normal', () => {
      useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
      act(() => useViewStore.getState().toggleExpand('map'))
      expect(useViewStore.getState().panelViews['map']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('only one panel can be expanded — new expansion replaces previous', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
    })
  })

  describe('toggleMinimize', () => {
    it('minimizes a normal panel', () => {
      act(() => useViewStore.getState().toggleMinimize('video'))
      expect(useViewStore.getState().panelViews['video']).toBe('minimized')
    })

    it('restores a minimized panel to normal', () => {
      useViewStore.setState({ panelViews: { video: 'minimized' } })
      act(() => useViewStore.getState().toggleMinimize('video'))
      expect(useViewStore.getState().panelViews['video']).toBe('normal')
    })

    it('clears expandedPanel when the currently-expanded panel is minimized', () => {
      useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
      act(() => useViewStore.getState().toggleMinimize('map'))
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('preserves expandedPanel when a different panel is minimized', () => {
      useViewStore.setState({ expandedPanel: 'map', panelViews: { map: 'expanded' } })
      act(() => useViewStore.getState().toggleMinimize('alerts'))
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })
  })
})
