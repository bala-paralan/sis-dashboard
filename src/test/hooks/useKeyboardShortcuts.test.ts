import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardShortcuts, SHORTCUT_PANELS } from '@/hooks/useKeyboardShortcuts'
import { useViewStore } from '@/store/viewStore'
import { useSystemStore } from '@/store/systemStore'

function pressKey(key: string, options: KeyboardEventInit = {}) {
  act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...options }))
  })
}

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
  useSystemStore.setState({ mutedAlerts: false })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useKeyboardShortcuts — Alt+digit', () => {
  it('Alt+1 toggle-expands the first panel (map)', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('1', { altKey: true })
    expect(useViewStore.getState().expandedPanel).toBe(SHORTCUT_PANELS[0])
  })

  it('Alt+2 toggle-expands the second panel (alerts)', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('2', { altKey: true })
    expect(useViewStore.getState().expandedPanel).toBe(SHORTCUT_PANELS[1])
  })

  it('pressing Alt+1 twice collapses the panel', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('1', { altKey: true })
    pressKey('1', { altKey: true })
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })

  it('Alt+9 expands the 9th panel', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('9', { altKey: true })
    expect(useViewStore.getState().expandedPanel).toBe(SHORTCUT_PANELS[8])
  })

  it('Alt+digit without altKey does nothing', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('1')
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })
})

describe('useKeyboardShortcuts — Escape', () => {
  it('Escape collapses the currently expanded panel', () => {
    useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
    renderHook(() => useKeyboardShortcuts())
    pressKey('Escape')
    expect(useViewStore.getState().expandedPanel).toBeNull()
    expect(useViewStore.getState().panelViews['map']).toBe('normal')
  })

  it('Escape does nothing when no panel is expanded', () => {
    renderHook(() => useKeyboardShortcuts())
    expect(() => pressKey('Escape')).not.toThrow()
    expect(useViewStore.getState().expandedPanel).toBeNull()
  })
})

describe('useKeyboardShortcuts — Alt+M (mute)', () => {
  it('Alt+M toggles mutedAlerts on', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('m', { altKey: true })
    expect(useSystemStore.getState().mutedAlerts).toBe(true)
  })

  it('Alt+M toggles mutedAlerts off when already muted', () => {
    useSystemStore.setState({ mutedAlerts: true })
    renderHook(() => useKeyboardShortcuts())
    pressKey('m', { altKey: true })
    expect(useSystemStore.getState().mutedAlerts).toBe(false)
  })

  it('Alt+M uppercase also toggles mute', () => {
    renderHook(() => useKeyboardShortcuts())
    pressKey('M', { altKey: true })
    expect(useSystemStore.getState().mutedAlerts).toBe(true)
  })
})

describe('useKeyboardShortcuts — Alt+? (legend)', () => {
  it('calls onShowLegend when Alt+? is pressed', () => {
    const onShowLegend = vi.fn()
    renderHook(() => useKeyboardShortcuts({ onShowLegend }))
    pressKey('?', { altKey: true })
    expect(onShowLegend).toHaveBeenCalledOnce()
  })

  it('does not throw if onShowLegend is not provided', () => {
    renderHook(() => useKeyboardShortcuts())
    expect(() => pressKey('?', { altKey: true })).not.toThrow()
  })
})

describe('useKeyboardShortcuts — input elements ignored', () => {
  it('does not expand panel when key is pressed inside an input', () => {
    renderHook(() => useKeyboardShortcuts())
    const input = document.createElement('input')
    document.body.appendChild(input)
    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    })
    expect(useViewStore.getState().expandedPanel).toBeNull()
    document.body.removeChild(input)
  })
})

describe('useKeyboardShortcuts — cleanup', () => {
  it('removes event listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useKeyboardShortcuts())
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })
})
