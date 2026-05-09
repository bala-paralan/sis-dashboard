import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSystemStore } from '@/store/systemStore'

function fireKey(key: string) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
}

beforeEach(() => {
  useSystemStore.setState({
    ...useSystemStore.getState(),
    activePanel: 'map',
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useKeyboardShortcuts', () => {
  it('switches to map panel on "m" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('m')
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('switches to alerts panel on "a" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('a')
    expect(useSystemStore.getState().activePanel).toBe('alerts')
  })

  it('switches to video panel on "v" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('v')
    expect(useSystemStore.getState().activePanel).toBe('video')
  })

  it('switches to sensors panel on "s" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('s')
    expect(useSystemStore.getState().activePanel).toBe('sensors')
  })

  it('switches to aiml panel on "i" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('i')
    expect(useSystemStore.getState().activePanel).toBe('aiml')
  })

  it('switches to health panel on "h" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('h')
    expect(useSystemStore.getState().activePanel).toBe('health')
  })

  it('calls onToggleHelp on "?" key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('?')
    expect(onToggle).toHaveBeenCalledOnce()
  })

  it('calls onCloseOverlay on Escape key', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    fireKey('Escape')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('does not change panel for unrecognised keys', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    useSystemStore.setState({ ...useSystemStore.getState(), activePanel: 'map' })
    fireKey('z')
    expect(useSystemStore.getState().activePanel).toBe('map')
  })

  it('does not fire panel switch when an input element has focus', () => {
    const onToggle = vi.fn()
    const onClose = vi.fn()
    renderHook(() => useKeyboardShortcuts(onToggle, onClose))
    useSystemStore.setState({ ...useSystemStore.getState(), activePanel: 'map' })

    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()

    fireKey('a')
    expect(useSystemStore.getState().activePanel).toBe('map')

    document.body.removeChild(input)
  })
})
