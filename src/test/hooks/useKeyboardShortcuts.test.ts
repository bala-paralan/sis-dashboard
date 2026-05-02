import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

function dispatchKey(key: string, opts?: KeyboardEventInit) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, ...opts }))
}

beforeEach(() => {
  useSystemStore.setState({ activePanel: 'map' })
})

describe('useKeyboardShortcuts', () => {
  it('calls onShowHelp when ? is pressed', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    dispatchKey('?')
    expect(onShowHelp).toHaveBeenCalled()
  })

  it('does NOT call onShowHelp when ? in an input', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: '?', bubbles: true }))
    document.body.removeChild(input)
    expect(onShowHelp).not.toHaveBeenCalled()
  })

  it('switches to panel 1 (map) on Alt+1', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    dispatchKey('1', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('switches to panel 2 (alerts) on Alt+2', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    dispatchKey('2', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('switches to panel 3 (video) on Alt+3', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    dispatchKey('3', { altKey: true })
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('does not switch panel on plain digit without Alt', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    useSystemStore.setState({ activePanel: 'map' })
    dispatchKey('2')
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('does not switch panel when focused in textarea', () => {
    const onShowHelp = vi.fn()
    renderHook(() => useKeyboardShortcuts(onShowHelp))
    useSystemStore.setState({ activePanel: 'map' })
    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: '2', altKey: true, bubbles: true }))
    document.body.removeChild(textarea)
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('cleans up event listener on unmount', () => {
    const spy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardShortcuts(vi.fn()))
    unmount()
    expect(spy).toHaveBeenCalledWith('keydown', expect.any(Function))
    spy.mockRestore()
  })
})
