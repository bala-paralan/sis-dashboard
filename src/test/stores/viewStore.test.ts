import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

function resetStore() {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
}

beforeEach(resetStore)

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
    it('returns "normal" for an unknown panel id', () => {
      expect(useViewStore.getState().getView('unknown')).toBe('normal')
    })

    it('returns the stored view mode for a known panel', () => {
      act(() => {
        useViewStore.setState({ panelViews: { map: 'minimized' } })
      })
      expect(useViewStore.getState().getView('map')).toBe('minimized')
    })
  })

  describe('setPanelView', () => {
    it('sets the view mode for the given panel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'minimized')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
    })

    it('setting a panel to "expanded" updates expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('setting a panel away from "expanded" clears expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('map', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('only one panel can be expanded at a time', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('alerts', 'expanded')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('does not clear expandedPanel when a different panel changes mode', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('video', 'minimized')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
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

    it('collapses an already-expanded panel back to normal', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('map')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('expanding a second panel updates expandedPanel to the new panel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
    })
  })

  describe('toggleMinimize', () => {
    it('minimises a normal panel', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('sensors')
      })
      expect(useViewStore.getState().panelViews['sensors']).toBe('minimized')
    })

    it('restores a minimised panel to normal', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('sensors')
        useViewStore.getState().toggleMinimize('sensors')
      })
      expect(useViewStore.getState().panelViews['sensors']).toBe('normal')
    })

    it('minimising the expanded panel clears expandedPanel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleMinimize('map')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
    })

    it('minimising a non-expanded panel does not clear expandedPanel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleMinimize('video')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('multiple panels can be minimised simultaneously', () => {
      act(() => {
        useViewStore.getState().toggleMinimize('map')
        useViewStore.getState().toggleMinimize('alerts')
        useViewStore.getState().toggleMinimize('video')
      })
      const { panelViews } = useViewStore.getState()
      expect(panelViews['map']).toBe('minimized')
      expect(panelViews['alerts']).toBe('minimized')
      expect(panelViews['video']).toBe('minimized')
    })
  })
})
