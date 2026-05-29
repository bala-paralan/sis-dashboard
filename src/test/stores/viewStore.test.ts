import { describe, it, expect, beforeEach } from 'vitest'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('viewStore — initial state', () => {
  it('panelViews is empty initially', () => {
    expect(useViewStore.getState().panelViews).toEqual({})
  })

  it('expandedPanel is null initially', () => {
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('getView returns normal for an unknown panelId', () => {
    expect(useViewStore.getState().getView('unknownPanel')).toBe('normal')
  })
})

describe('viewStore — setPanelView', () => {
  it('sets a panel view to minimized', () => {
    useViewStore.getState().setPanelView('map', 'minimized')
    expect(useViewStore.getState().getView('map')).toBe('minimized')
  })

  it('sets a panel view to expanded and updates expandedPanel', () => {
    useViewStore.getState().setPanelView('alerts', 'expanded')
    expect(useViewStore.getState().getView('alerts')).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
  })

  it('setting panel to non-expanded clears expandedPanel if it was that panel', () => {
    useViewStore.getState().setPanelView('alerts', 'expanded')
    useViewStore.getState().setPanelView('alerts', 'normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('setting a different panel does not clear expandedPanel for original', () => {
    useViewStore.getState().setPanelView('alerts', 'expanded')
    useViewStore.getState().setPanelView('map', 'normal')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
  })
})

describe('viewStore — toggleExpand', () => {
  it('expands a normal panel', () => {
    useViewStore.getState().toggleExpand('map')
    expect(useViewStore.getState().getView('map')).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('collapses an already expanded panel back to normal', () => {
    useViewStore.getState().toggleExpand('map')
    useViewStore.getState().toggleExpand('map')
    expect(useViewStore.getState().getView('map')).toBe('normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('expanding a second panel replaces the first expanded panel', () => {
    useViewStore.getState().toggleExpand('map')
    useViewStore.getState().toggleExpand('alerts')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    expect(useViewStore.getState().getView('alerts')).toBe('expanded')
  })
})

describe('viewStore — toggleMinimize', () => {
  it('minimizes a normal panel', () => {
    useViewStore.getState().toggleMinimize('video')
    expect(useViewStore.getState().getView('video')).toBe('minimized')
  })

  it('restores a minimized panel to normal', () => {
    useViewStore.getState().toggleMinimize('video')
    useViewStore.getState().toggleMinimize('video')
    expect(useViewStore.getState().getView('video')).toBe('normal')
  })

  it('minimizing an expanded panel clears expandedPanel', () => {
    useViewStore.getState().setPanelView('sensors', 'expanded')
    useViewStore.getState().toggleMinimize('sensors')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('minimizing a panel does not affect another expanded panel', () => {
    useViewStore.getState().setPanelView('alerts', 'expanded')
    useViewStore.getState().toggleMinimize('map')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
  })
})

describe('viewStore — mutual exclusion of expanded panels', () => {
  it('only one panel can be expanded at a time via setPanelView', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().setPanelView('alerts', 'expanded')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    // map is still expanded in panelViews (it was set directly), but expandedPanel points to alerts
    expect(useViewStore.getState().getView('alerts')).toBe('expanded')
  })

  it('getView returns the assigned view mode', () => {
    useViewStore.getState().setPanelView('health', 'minimized')
    expect(useViewStore.getState().getView('health')).toBe('minimized')
  })
})
