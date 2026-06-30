import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  describe('initial state', () => {
    it('starts with empty panelViews', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('starts with null expandedPanel', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('getView', () => {
    it('returns normal for unknown panel', () => {
      expect(useViewStore.getState().getView('unknown-panel')).toBe('normal')
    })

    it('returns previously set view mode', () => {
      act(() => {
        useViewStore.getState().setPanelView('alerts', 'minimized')
      })
      expect(useViewStore.getState().getView('alerts')).toBe('minimized')
    })
  })

  describe('setPanelView', () => {
    it('sets the panel to expanded and records expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
      })
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('clears expandedPanel when current expanded panel is set to normal', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('map', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not clear expandedPanel when a different panel is set to normal', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().setPanelView('alerts', 'normal')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })

    it('sets panel to minimized without affecting expandedPanel', () => {
      act(() => {
        useViewStore.getState().setPanelView('video', 'minimized')
      })
      expect(useViewStore.getState().panelViews['video']).toBe('minimized')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('toggleExpand', () => {
    it('expands a normal panel and sets expandedPanel', () => {
      act(() => {
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('collapses an already-expanded panel back to normal', () => {
      act(() => {
        useViewStore.getState().toggleExpand('alerts')
        useViewStore.getState().toggleExpand('alerts')
      })
      expect(useViewStore.getState().panelViews['alerts']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('only one panel can be expanded at a time — new expand replaces old', () => {
      act(() => {
        useViewStore.getState().toggleExpand('map')
        useViewStore.getState().toggleExpand('video')
      })
      expect(useViewStore.getState().expandedPanel).toBe('video')
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
      expect(useViewStore.getState().panelViews['video']).toBe('expanded')
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

    it('clears expandedPanel if the expanded panel is minimized', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('map')
      })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not affect expandedPanel when a different panel is minimized', () => {
      act(() => {
        useViewStore.getState().setPanelView('map', 'expanded')
        useViewStore.getState().toggleMinimize('alerts')
      })
      expect(useViewStore.getState().expandedPanel).toBe('map')
    })
  })
})
