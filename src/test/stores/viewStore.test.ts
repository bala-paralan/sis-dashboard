import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  describe('initial state', () => {
    it('panelViews is empty', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('expandedPanel is null', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('getView', () => {
    it('returns normal for an unknown panel', () => {
      expect(useViewStore.getState().getView('unknown')).toBe('normal')
    })

    it('returns the stored mode once set', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'minimized')
      })
      expect(useViewStore.getState().getView('map')).toBe('minimized')
    })
  })

  describe('setPanelView', () => {
    it('sets expanded mode and records expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('alerts', 'expanded')
      })
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('clears expandedPanel when a previously expanded panel is set to normal', () => {
      act(() => {
        useViewStore.getState().setPanelView('alerts', 'expanded')
        useViewStore.getState().setPanelView('alerts', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not change expandedPanel when a different panel is set to normal', () => {
      act(() => {
        useViewStore.getState().setPanelView('alerts', 'expanded')
        useViewStore.getState().setPanelView('video', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('sets minimized mode without touching expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'minimized')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('toggleExpand', () => {
    it('expands a normal panel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('collapses an already expanded panel back to normal', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('map')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('expanding a second panel replaces the first expanded panel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
    })
  })

  describe('toggleMinimize', () => {
    it('minimizes a normal panel', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('video')
      })
      expect(useViewStore.getState().panelViews['video']).toBe('minimized')
    })

    it('restores a minimized panel to normal', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('video')
        useViewStore.getState().toggleMinimize('video')
      })
      expect(useViewStore.getState().panelViews['video']).toBe('normal')
    })

    it('clears expandedPanel if the expanded panel is minimized', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('map')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not clear expandedPanel when a different panel is minimized', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })
  })
})
