import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type MQCallback = (e: MediaQueryListEvent) => void

/**
 * Sets up window.matchMedia spy returning a mock MediaQueryList.
 * Returns helpers to trigger change events and inspect calls.
 */
function setupMQ(matches: boolean) {
  const listeners: MQCallback[] = []
  const mq = {
    matches,
    addEventListener: vi.fn((_: string, cb: MQCallback) => listeners.push(cb)),
    removeEventListener: vi.fn(),
    dispatchChange: (newMatches: boolean) =>
      listeners.forEach((cb) => cb({ matches: newMatches } as MediaQueryListEvent)),
  }
  vi.spyOn(window, 'matchMedia').mockImplementation(() => mq as unknown as MediaQueryList)
  return mq
}

beforeEach(() => {
  // Default: desktop — window.innerWidth in jsdom is 0, so we set a spy that
  // returns matches:false so the hook settles to 'not mobile'.
  setupMQ(false)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('returns false when viewport is wider than the breakpoint', () => {
    setupMQ(false)
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(false)
  })

  it('returns true when viewport is narrower than the breakpoint', () => {
    setupMQ(true)
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(true)
  })

  it('uses 768 as the default breakpoint', () => {
    renderHook(() => useIsMobile())
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 768px)')
  })

  it('uses the custom breakpoint in the media query', () => {
    renderHook(() => useIsMobile(1024))
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1024px)')
  })

  it('updates to true when media query fires a matching change', () => {
    const mq = setupMQ(false)
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(false)
    act(() => mq.dispatchChange(true))
    expect(result.current).toBe(true)
  })

  it('updates to false when media query fires a non-matching change', () => {
    const mq = setupMQ(true)
    const { result } = renderHook(() => useIsMobile(768))
    expect(result.current).toBe(true)
    act(() => mq.dispatchChange(false))
    expect(result.current).toBe(false)
  })

  it('adds an event listener on mount', () => {
    const mq = setupMQ(false)
    renderHook(() => useIsMobile(768))
    expect(mq.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('removes the event listener on unmount', () => {
    const mq = setupMQ(false)
    const { unmount } = renderHook(() => useIsMobile(768))
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })
})
