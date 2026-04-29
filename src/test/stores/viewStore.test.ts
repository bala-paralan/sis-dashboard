import { describe, it, expect, beforeEach } from 'vitest'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore — initial state', () => {
  it('panelViews starts empty', () => {
    expect(useViewStore.getState().panelViews).toEqual({})
  })

  it('expandedPanel starts null', () => {
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })
})

describe('useViewStore — getView', () => {
  it('returns "normal" for unknown panel', () => {
    expect(useViewStore.getState().getView('some-panel')).toBe('normal')
  })

  it('returns set view mode', () => {
    useViewStore.getState().setPanelView('map', 'minimized')
    expect(useViewStore.getState().getView('map')).toBe('minimized')
  })
})

describe('useViewStore — setPanelView', () => {
  it('sets a panel to expanded and updates expandedPanel', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    expect(useViewStore.getState().panelViews['map']).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('sets a panel to minimized', () => {
    useViewStore.getState().setPanelView('alerts', 'minimized')
    expect(useViewStore.getState().panelViews['alerts']).toBe('minimized')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('clears expandedPanel when the expanded panel is set to normal', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().setPanelView('map', 'normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('keeps expandedPanel unchanged when a different panel changes to normal', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().setPanelView('alerts', 'normal')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('replaces expandedPanel when another panel is expanded', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().setPanelView('alerts', 'expanded')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
  })
})

describe('useViewStore — toggleExpand', () => {
  it('expands a normal panel', () => {
    useViewStore.getState().toggleExpand('map')
    expect(useViewStore.getState().panelViews['map']).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('collapses an already-expanded panel back to normal', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().toggleExpand('map')
    expect(useViewStore.getState().panelViews['map']).toBe('normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('only one panel is expanded at a time', () => {
    useViewStore.getState().toggleExpand('map')
    useViewStore.getState().toggleExpand('alerts')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    expect(useViewStore.getState().panelViews['map']).toBe('expanded')
  })
})

describe('useViewStore — toggleMinimize', () => {
  it('minimizes a normal panel', () => {
    useViewStore.getState().toggleMinimize('map')
    expect(useViewStore.getState().panelViews['map']).toBe('minimized')
  })

  it('restores a minimized panel to normal', () => {
    useViewStore.getState().setPanelView('map', 'minimized')
    useViewStore.getState().toggleMinimize('map')
    expect(useViewStore.getState().panelViews['map']).toBe('normal')
  })

  it('clears expandedPanel when the expanded panel is minimized', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().toggleMinimize('map')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('does not affect expandedPanel when a different panel is minimized', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().toggleMinimize('alerts')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })
})
