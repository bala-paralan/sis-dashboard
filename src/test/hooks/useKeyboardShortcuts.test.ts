import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...opts }))
  })
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
})

describe('useKeyboardShortcuts', () => {
  it('returns helpOpen=false initially', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    expect(result.current.helpOpen).toBe(false)
  })

  it('Alt+1 switches to the first panel (map)', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('1', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('Alt+2 switches to the second panel (alerts)', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('2', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('Alt+3 switches to the third panel (video)', () => {
    renderHook(() => useKeyboardShortcuts())
    fireKey('3', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('pressing ? opens help overlay', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    fireKey('?')
    expect(result.current.helpOpen).toBe(true)
  })

  it('pressing Escape closes help overlay', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    fireKey('?')
    expect(result.current.helpOpen).toBe(true)
    fireKey('Escape')
    expect(result.current.helpOpen).toBe(false)
  })

  it('does not switch panels when focus is inside an input', () => {
    renderHook(() => useKeyboardShortcuts())
    useSystemStore.setState({ activePanel: 'map' })
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '2', altKey: true, bubbles: true }))
    })
    expect(useSystemStore.getState().activePanel).toBe('map')
    document.body.removeChild(input)
  })

  it('setHelpOpen can close the modal programmatically', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    act(() => { result.current.setHelpOpen(true) })
    expect(result.current.helpOpen).toBe(true)
    act(() => { result.current.setHelpOpen(false) })
    expect(result.current.helpOpen).toBe(false)
  })

  it('panels list has 9 entries', () => {
    const { result } = renderHook(() => useKeyboardShortcuts())
    expect(result.current.panels).toHaveLength(9)
  })

  it('does not respond to non-alt digit keys', () => {
    renderHook(() => useKeyboardShortcuts())
    useSystemStore.setState({ activePanel: 'map' })
    fireKey('2')
    expect(useSystemStore.getState().activePanel).toBe('map')
  })
})
