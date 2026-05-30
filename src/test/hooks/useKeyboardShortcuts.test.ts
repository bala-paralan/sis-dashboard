import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

function fireKey(key: string, options: KeyboardEventInit = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  })
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
  useViewStore.setState({ expandedPanel: null, panelViews: {} })
  vi.restoreAllMocks()
})

describe('useKeyboardShortcuts', () => {
  it('Alt+1 sets activePanel to map', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('1', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('Alt+2 sets activePanel to alerts', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('2', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('Alt+3 sets activePanel to video', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('3', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('Alt+4 sets activePanel to sensors', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('4', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('sensors')
  })

  it('Alt+5 sets activePanel to aiml', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('5', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('aiml')
  })

  it('Alt+6 sets activePanel to health', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('6', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('health')
  })

  it('Alt+S opens settings when not in settings', () => {
    useSystemStore.setState({ activePanel: 'map' })
    renderHook(() => useKeyboardShortcuts())
    fireKey('s', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('settings')
  })

  it('Alt+S closes settings when already in settings', () => {
    useSystemStore.setState({ activePanel: 'settings' })
    renderHook(() => useKeyboardShortcuts())
    fireKey('s', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('Alt+C opens cameras when not in cameras', () => {
    useSystemStore.setState({ activePanel: 'map' })
    renderHook(() => useKeyboardShortcuts())
    fireKey('c', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('cameras')
  })

  it('Alt+C closes cameras when already in cameras', () => {
    useSystemStore.setState({ activePanel: 'cameras' })
    renderHook(() => useKeyboardShortcuts())
    fireKey('c', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('Escape collapses an expanded panel', () => {
    useViewStore.setState({ expandedPanel: 'map', panelViews: { map: 'expanded' } })
    renderHook(() => useKeyboardShortcuts())
    fireKey('Escape')
    expect(useViewStore.getState().expandedPanel).toBeNull()
    expect(useViewStore.getState().panelViews['map']).toBe('normal')
  })

  it('Escape does nothing when no panel is expanded', () => {
    useViewStore.setState({ expandedPanel: null, panelViews: {} })
    renderHook(() => useKeyboardShortcuts())
    fireKey('Escape')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('? toggles helpOpen true then false', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    expect(result.current.helpOpen).toBe(false)
    fireKey('?')
    expect(result.current.helpOpen).toBe(true)
    fireKey('?')
    expect(result.current.helpOpen).toBe(false)
  })

  it('does not fire shortcuts when an input is focused', () => {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    renderHook(() => useKeyboardShortcuts())
    fireKey('2', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')

    document.body.removeChild(input)
  })

  it('does not fire shortcuts when a textarea is focused', () => {
    const ta = document.createElement('textarea')
    document.body.appendChild(ta)
    ta.focus()

    renderHook(() => useKeyboardShortcuts())
    fireKey('s', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')

    document.body.removeChild(ta)
  })

  it('cleans up the event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardShortcuts())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
