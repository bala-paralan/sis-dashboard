import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('useViewStore', () => {
  describe('initial state', () => {
    it('has empty panelViews', () => {
      expect(useViewStore.getState().panelViews).toEqual({})
    })

    it('has null expandedPanel', () => {
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })
  })

  describe('getView', () => {
    it('returns "normal" for unknown panels', () => {
      expect(useViewStore.getState().getView('unknown')).toBe('normal')
    })

    it('returns the set view mode for a known panel', () => {
      useViewStore.setState({ panelViews: { alerts: 'minimized' } })
      expect(useViewStore.getState().getView('alerts')).toBe('minimized')
    })
  })

  describe('setPanelView', () => {
    it('sets a panel to minimized', () => {
      act(() => { useViewStore.getState().setPanelView('map', 'minimized') })
      expect(useViewStore.getState().panelViews['map']).toBe('minimized')
    })

    it('sets a panel to expanded and records expandedPanel', () => {
      act(() => { useViewStore.getState().setPanelView('video', 'expanded') })
      expect(useViewStore.getState().panelViews['video']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('video')
    })

    it('clears expandedPanel when the previously expanded panel is set to normal', () => {
      useViewStore.setState({ panelViews: { video: 'expanded' }, expandedPanel: 'video' })
      act(() => { useViewStore.getState().setPanelView('video', 'normal') })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not clear expandedPanel when a different panel changes to normal', () => {
      useViewStore.setState({ panelViews: { video: 'expanded', map: 'normal' }, expandedPanel: 'video' })
      act(() => { useViewStore.getState().setPanelView('map', 'minimized') })
      expect(useViewStore.getState().expandedPanel).toBe('video')
    })
  })

  describe('toggleExpand', () => {
    it('expands a normal panel', () => {
      act(() => { useViewStore.getState().toggleExpand('alerts') })
      expect(useViewStore.getState().panelViews['alerts']).toBe('expanded')
      expect(useViewStore.getState().expandedPanel).toBe('alerts')
    })

    it('collapses an already-expanded panel back to normal', () => {
      useViewStore.setState({ panelViews: { alerts: 'expanded' }, expandedPanel: 'alerts' })
      act(() => { useViewStore.getState().toggleExpand('alerts') })
      expect(useViewStore.getState().panelViews['alerts']).toBe('normal')
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('only one panel is expanded at a time — expanding a second replaces the first', () => {
      useViewStore.setState({ panelViews: { video: 'expanded' }, expandedPanel: 'video' })
      act(() => { useViewStore.getState().toggleExpand('map') })
      expect(useViewStore.getState().expandedPanel).toBe('map')
      expect(useViewStore.getState().panelViews['map']).toBe('expanded')
    })
  })

  describe('toggleMinimize', () => {
    it('minimizes a normal panel', () => {
      act(() => { useViewStore.getState().toggleMinimize('sensors') })
      expect(useViewStore.getState().panelViews['sensors']).toBe('minimized')
    })

    it('restores a minimized panel to normal', () => {
      useViewStore.setState({ panelViews: { sensors: 'minimized' } })
      act(() => { useViewStore.getState().toggleMinimize('sensors') })
      expect(useViewStore.getState().panelViews['sensors']).toBe('normal')
    })

    it('clears expandedPanel when the expanded panel is minimized', () => {
      useViewStore.setState({ panelViews: { video: 'expanded' }, expandedPanel: 'video' })
      act(() => { useViewStore.getState().toggleMinimize('video') })
      expect(useViewStore.getState().expandedPanel).toBeNull()
    })

    it('does not affect expandedPanel when a different panel is minimized', () => {
      useViewStore.setState({ panelViews: { video: 'expanded', map: 'normal' }, expandedPanel: 'video' })
      act(() => { useViewStore.getState().toggleMinimize('map') })
      expect(useViewStore.getState().expandedPanel).toBe('video')
    })
  })
})
