import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
})

function fireKey(key: string, options: KeyboardEventInit = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
}

describe('useKeyboardShortcuts', () => {
  it('switches to alerts panel on Alt+2', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('2', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('switches to map panel on Alt+1', () => {
    useSystemStore.setState({ activePanel: 'alerts' })
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('1', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('switches to video panel on Alt+3', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('3', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('switches to sensors panel on Alt+4', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('4', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('sensors')
  })

  it('switches to aiml panel on Alt+5', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('5', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('aiml')
  })

  it('switches to health panel on Alt+6', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('6', { altKey: true }) })
    expect(useSystemStore.getState().activePanel).toBe('health')
  })

  it('does not change panel when key is pressed without Alt', () => {
    renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('2') })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('toggles helpOpen on ? key press', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    expect(result.current.helpOpen).toBe(false)
    act(() => { fireKey('?') })
    expect(result.current.helpOpen).toBe(true)
    act(() => { fireKey('?') })
    expect(result.current.helpOpen).toBe(false)
  })

  it('closes helpOpen on Escape', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    act(() => { fireKey('?') })
    expect(result.current.helpOpen).toBe(true)
    act(() => { fireKey('Escape') })
    expect(result.current.helpOpen).toBe(false)
  })

  it('does not change panel when typing in an input', () => {
    renderHook(() => useKeyboardShortcuts())
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent('keydown', { key: '2', altKey: true, bubbles: true })
      )
    })
    expect(useSystemStore.getState().activePanel).toBe('map')
    document.body.removeChild(input)
  })
})
