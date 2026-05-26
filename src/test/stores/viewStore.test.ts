import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  describe('initial state', () => {
    it('panelViews is an empty object', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('expandedPanel is null', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('getView', () => {
    it('returns normal for an unknown panel id', () => {
      expect(useViewStore.getState().getView('unknownPanel')).toBe('normal')
    })

    it('returns the mode set by setPanelView', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
      })
      expect(useViewStore.getState().getView('map')).toBe('expanded')
    })
  })

  describe('setPanelView', () => {
    it('sets a panel to minimized mode', () => {
      act(() => {
        useViewStore.getState().setPanelView('alerts', 'minimized')
      })
      expect(useViewStore.getState().panelViews['alerts']).toBe('minimized')
    })

    it('setting to expanded updates expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('setting to normal clears expandedPanel if it was the expanded panel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('map', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('setting another panel to expanded replaces the current expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('alerts', 'expanded')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
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

    it('only one panel can be expanded at a time', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      // alerts is now expanded
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
    })
  })

  describe('toggleMinimize', () => {
    it('minimizes a normal panel', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('sensors')
      })
      expect(useViewStore.getState().panelViews['sensors']).toBe('minimized')
    })

    it('restores a minimized panel to normal', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('sensors')
        useViewStore.getState().toggleMinimize('sensors')
      })
      expect(useViewStore.getState().panelViews['sensors']).toBe('normal')
    })

    it('clears expandedPanel when minimizing the currently expanded panel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('map')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not affect expandedPanel when minimizing a different panel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })
  })
})
