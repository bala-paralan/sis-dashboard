import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

function fireKey(key: string, altKey = false) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, altKey, bubbles: true }))
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
})

describe('useKeyboardShortcuts', () => {
  it('calls onShowHelp when ? is pressed', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('?')
    expect(onShowHelp).toHaveBeenCalledTimes(1)
  })

  it('Alt+1 switches to the first panel (map)', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('1', true)
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('Alt+2 switches to the second panel (alerts)', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('2', true)
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('Alt+3 switches to the third panel (video)', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('3', true)
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('Alt+5 switches to the fifth panel (aiml)', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('5', true)
    expect(useSystemStore.getState().activePanel).toBe('aiml')
  })

  it('does not call onShowHelp for non-? keys', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    fireKey('a')
    fireKey('Enter')
    expect(onShowHelp).not.toHaveBeenCalled()
  })

  it('cleans up event listener on unmount', () => {
    const onShowHelp = vi.fn()
    const { unmount } = renderHook(() => useKeyboardShortcuts(onShowHelp))
    unmount()
    fireKey('?')
    expect(onShowHelp).not.toHaveBeenCalled()
  })
})
