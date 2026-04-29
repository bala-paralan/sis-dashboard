import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

vi.mock('@/api/client', () => ({
  getAccessToken:  vi.fn(() => null),
  clearTokens:     vi.fn(),
  storeTokens:     vi.fn(),
  getRefreshToken: vi.fn(() => null),
  apiFetch:        vi.fn(),
}))

function fireKey(key: string, options: Partial<KeyboardEventInit> = {}) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
  vi.clearAllMocks()
})

describe('useKeyboardShortcuts', () => {
  it('switches to panel 1 (map) on Alt+1', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    useSystemStore.setState({ activePanel: 'alerts' })
    fireKey('1', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('switches to panel 2 (alerts) on Alt+2', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    fireKey('2', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('switches to panel 6 (health) on Alt+6', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    fireKey('6', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('health')
  })

  it('calls onHelp when ? is pressed', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    fireKey('?')
    expect(onHelp).toHaveBeenCalledTimes(1)
  })

  it('does not call onHelp when Alt+? is pressed', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    fireKey('?', { altKey: true })
    expect(onHelp).not.toHaveBeenCalled()
  })

  it('does not switch panels when Ctrl+Alt+1 is pressed', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    useSystemStore.setState({ activePanel: 'alerts' })
    fireKey('1', { altKey: true, ctrlKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('does not switch when Alt+0 is pressed (out of range)', () => {
    const onHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onHelp))
    useSystemStore.setState({ activePanel: 'alerts' })
    fireKey('0', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('removes event listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const onHelp = vi.fn()
    const { unmount } = renderHook(() => useKeyboardShortcuts(onHelp))
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
