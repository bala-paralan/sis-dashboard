import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore — initial state', () => {
  it('panelViews is empty', () => {
    expect(useViewStore.getState().panelViews).toEqual({})
  })

  it('expandedPanel is null', () => {
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })
})

describe('getView', () => {
  it('returns "normal" for unknown panel', () => {
    expect(useViewStore.getState().getView('unknown')).toBe('normal')
  })

  it('returns the stored view for a known panel', () => {
    useViewStore.setState({ panelViews: { 'map': 'expanded' } })
    expect(useViewStore.getState().getView('map')).toBe('expanded')
  })
})

describe('setPanelView', () => {
  it('sets a panel to expanded', () => {
    act(() => { useViewStore.getState().setPanelView('map', 'expanded') })
    expect(useViewStore.getState().panelViews['map']).toBe('expanded')
  })

  it('sets expandedPanel when mode is expanded', () => {
    act(() => { useViewStore.getState().setPanelView('alerts', 'expanded') })
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
  })

  it('clears expandedPanel when mode changes from expanded to normal', () => {
    act(() => { useViewStore.getState().setPanelView('map', 'expanded') })
    act(() => { useViewStore.getState().setPanelView('map', 'normal') })
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('clears expandedPanel when a different panel is un-expanded', () => {
    act(() => { useViewStore.getState().setPanelView('map', 'expanded') })
    act(() => { useViewStore.getState().setPanelView('alerts', 'normal') })
    // map was the expanded panel; alerts going normal does not clear it
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('sets panel to minimized', () => {
    act(() => { useViewStore.getState().setPanelView('video', 'minimized') })
    expect(useViewStore.getState().panelViews['video']).toBe('minimized')
  })
})

describe('toggleExpand', () => {
  it('expands a normal panel', () => {
    act(() => { useViewStore.getState().toggleExpand('map') })
    expect(useViewStore.getState().panelViews['map']).toBe('expanded')
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })

  it('collapses an already-expanded panel back to normal', () => {
    act(() => { useViewStore.getState().toggleExpand('map') })
    act(() => { useViewStore.getState().toggleExpand('map') })
    expect(useViewStore.getState().panelViews['map']).toBe('normal')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('only one panel tracked in expandedPanel at a time', () => {
    act(() => { useViewStore.getState().toggleExpand('map') })
    act(() => { useViewStore.getState().toggleExpand('alerts') })
    // expandedPanel reflects the latest expanded panel
    expect(useViewStore.getState().expandedPanel).toBe('alerts')
    // panelViews['alerts'] is expanded
    expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
  })
})

describe('toggleMinimize', () => {
  it('minimizes a normal panel', () => {
    act(() => { useViewStore.getState().toggleMinimize('video') })
    expect(useViewStore.getState().panelViews['video']).toBe('minimized')
  })

  it('restores a minimized panel to normal', () => {
    act(() => { useViewStore.getState().toggleMinimize('video') })
    act(() => { useViewStore.getState().toggleMinimize('video') })
    expect(useViewStore.getState().panelViews['video']).toBe('normal')
  })

  it('minimizing the expanded panel clears expandedPanel', () => {
    act(() => { useViewStore.getState().toggleExpand('map') })
    act(() => { useViewStore.getState().toggleMinimize('map') })
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('minimizing a different panel does not clear expandedPanel', () => {
    act(() => { useViewStore.getState().toggleExpand('map') })
    act(() => { useViewStore.getState().toggleMinimize('alerts') })
    expect(useViewStore.getState().expandedPanel).toBe('map')
  })
})
