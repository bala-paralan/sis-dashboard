import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, PANEL_ORDER } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

function fireKeydown(key: string, altKey = false) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, altKey, bubbles: true }))
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useKeyboardShortcuts', () => {
  it('Alt+1 switches to panel 1 (map)', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    fireKeydown('1', true)
    expect(useSystemStore.getState().activePanel).toBe(PANEL_ORDER[0])
  })

  it('Alt+2 switches to panel 2 (alerts)', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    fireKeydown('2', true)
    expect(useSystemStore.getState().activePanel).toBe(PANEL_ORDER[1])
  })

  it('Alt+9 switches to panel 9', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    fireKeydown('9', true)
    expect(useSystemStore.getState().activePanel).toBe(PANEL_ORDER[8])
  })

  it('? key calls onToggleHelp', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    fireKeydown('?')
    expect(onToggle).toHaveBeenCalled()
  })

  it('does not switch panel for unregistered alt key', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    useSystemStore.setState({ activePanel: 'alerts' })
    fireKeydown('0', true)
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('does not trigger on input elements', () => {
    const onToggle = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    expect(onToggle).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it('removes event listener on unmount', () => {
    const onToggle = vi.fn()
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardShortcuts(onToggle))
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
