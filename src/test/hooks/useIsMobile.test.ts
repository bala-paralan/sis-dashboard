import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

type MQListener = (e: MediaQueryListEvent) => void

function makeMockMQ(matches: boolean) {
  const listeners: MQListener[] = []
  const mq = {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((_: string, fn: MQListener) => listeners.push(fn)),
    removeEventListener: vi.fn((_: string, fn: MQListener) => {
      const i = listeners.indexOf(fn)
      if (i !== -1) listeners.splice(i, 1)
    }),
    dispatchEvent: vi.fn(),
    _fire: (matches: boolean) => {
      listeners.forEach((fn) => fn({ matches } as MediaQueryListEvent))
    },
  }
  return mq
}

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('returns false when window.innerWidth > default breakpoint (768)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 })
    const mq = makeMockMQ(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when window.innerWidth <= default breakpoint (768)', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    const mq = makeMockMQ(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('calls matchMedia with the correct query for default breakpoint', () => {
    const mq = makeMockMQ(false)
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    renderHook(() => useIsMobile())
    expect(spy).toHaveBeenCalledWith('(max-width: 768px)')
  })

  it('calls matchMedia with a custom breakpoint query', () => {
    const mq = makeMockMQ(false)
    const spy = vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    renderHook(() => useIsMobile(1024))
    expect(spy).toHaveBeenCalledWith('(max-width: 1024px)')
  })

  it('updates to true when a "change" event fires with matches=true', () => {
    const mq = makeMockMQ(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      mq._fire(true)
    })
    expect(result.current).toBe(true)
  })

  it('updates to false when a "change" event fires with matches=false', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 })
    const mq = makeMockMQ(true)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)

    act(() => {
      mq._fire(false)
    })
    expect(result.current).toBe(false)
  })

  it('removes the event listener on unmount', () => {
    const mq = makeMockMQ(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { unmount } = renderHook(() => useIsMobile())
    unmount()
    expect(mq.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('the listener removed on unmount is the same function added', () => {
    const mq = makeMockMQ(false)
    vi.spyOn(window, 'matchMedia').mockReturnValue(mq as unknown as MediaQueryList)

    const { unmount } = renderHook(() => useIsMobile())

    const added = mq.addEventListener.mock.calls[0][1]
    unmount()
    const removed = mq.removeEventListener.mock.calls[0][1]
    expect(added).toBe(removed)
  })
})
