import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type MediaQueryCallback = (event: MediaQueryListEvent) => void

function mockMatchMedia(matches: boolean) {
  const listeners: MediaQueryCallback[] = []

  const mq = {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_event: string, cb: MediaQueryCallback) => {
      listeners.push(cb)
    }),
    removeEventListener: vi.fn((_event: string, cb: MediaQueryCallback) => {
      const idx = listeners.indexOf(cb)
      if (idx !== -1) listeners.splice(idx, 1)
    }),
    dispatchEvent: vi.fn(),
    trigger: (newMatches: boolean) => {
      listeners.forEach((cb) =>
        cb({ matches: newMatches } as MediaQueryListEvent)
      )
    },
  }

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn(() => mq),
  })

  return mq
}

describe('useIsMobile', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false when viewport is wider than the breakpoint', () => {
    mockMatchMedia(false)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 })
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is at or below the breakpoint', () => {
    mockMatchMedia(true)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 })
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(true)
  })

  it('returns true when viewport equals the breakpoint', () => {
    mockMatchMedia(true)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 768 })
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(true)
  })

  it('updates to true when a media query change event fires with matches=true', () => {
    const mq = mockMatchMedia(false)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1024 })
    const { result } = renderHook(() => useIsMobile(768))

    expect(result.current).toBe(false)

    act(() => {
      mq.trigger(true)
    })

    expect(result.current).toBe(true)
  })

  it('updates to false when a media query change event fires with matches=false', () => {
    const mq = mockMatchMedia(true)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 375 })
    const { result } = renderHook(() => useIsMobile(768))

    expect(result.current).toBe(true)

    act(() => {
      mq.trigger(false)
    })

    expect(result.current).toBe(false)
  })

  it('uses a custom breakpoint', () => {
    mockMatchMedia(false)
    Object.defineProperty(window, 'innerWidth', { writable: true, value: 1200 })
    const { result } = renderHook(() => useIsMobile(1280))
    expect(result.current).toBe(false)
  })

  it('removes the event listener on unmount', () => {
    const mq = mockMatchMedia(false)
    const { unmount } = renderHook(() => useIsMobile(768))
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalled()
  })
})
