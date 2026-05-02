import { describe, it, expect, beforeEach } from 'vitest'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('viewStore', () => {
  it('has empty panelViews initially', () => {
    expect(useViewStore.getState().panelViews).toEqual({})
  })

  it('has no expandedPanel initially', () => {
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('setPanelView sets mode for a panel', () => {
    useViewStore.getState().setPanelView('map', 'minimized')
    expect(useViewStore.getState().panelViews['map']).toBe('minimized')
  })

  it('setPanelView expanded sets expandedPanel', () => {
    useViewStore.getState().setPanelView('alerts', 'expanded')
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
  })

  it('setPanelView normal clears expandedPanel if it was the expanded panel', () => {
    useViewStore.getState().setPanelView('map', 'expanded')
    useViewStore.getState().setPanelView('map', 'normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('toggleExpand expands a normal panel', () => {
    useViewStore.getState().toggleExpand('sensors')
    expect(useViewStore.getState().panelViews['sensors']).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('sensors')
  })

  it('toggleExpand collapses an already-expanded panel', () => {
    useViewStore.getState().toggleExpand('sensors')
    useViewStore.getState().toggleExpand('sensors')
    expect(useViewStore.getState().panelViews['sensors']).toBe('normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('toggleExpand sets new expandedPanel when another is expanded', () => {
    useViewStore.getState().toggleExpand('map')
    useViewStore.getState().toggleExpand('alerts')
    // expandedPanel updated to new one; old panelView entry stays as-is in this store
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
  })

  it('toggleMinimize sets panel to minimized from normal', () => {
    useViewStore.getState().toggleMinimize('video')
    expect(useViewStore.getState().panelViews['video']).toBe('minimized')
  })

  it('toggleMinimize restores normal from minimized', () => {
    useViewStore.getState().toggleMinimize('video')
    useViewStore.getState().toggleMinimize('video')
    expect(useViewStore.getState().panelViews['video']).toBe('normal')
  })

  it('getView returns normal for unknown panel', () => {
    expect(useViewStore.getState().getView('nonexistent')).toBe('normal')
  })

  it('getView returns set mode', () => {
    useViewStore.getState().setPanelView('health', 'minimized')
    expect(useViewStore.getState().getView('health')).toBe('minimized')
  })
})
