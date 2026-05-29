import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIsMobile } from '@/hooks/useIsMobile'

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = []
  const mql = {
    matches,
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      listeners.push(cb)
    },
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => {
      const idx = listeners.indexOf(cb)
      if (idx >= 0) listeners.splice(idx, 1)
    },
    dispatchChange: (newMatches: boolean) => {
      listeners.forEach((cb) => cb({ matches: newMatches }))
    },
  }
  window.matchMedia = vi.fn().mockReturnValue(mql)
  return { mql, listeners }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useIsMobile', () => {
  it('returns false on a wide viewport (matches=false)', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true on a narrow viewport (matches=true)', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('calls matchMedia with the 768px breakpoint query', () => {
    const spy = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })
    window.matchMedia = spy
    renderHook(() => useIsMobile())
    expect(spy).toHaveBeenCalledWith('(max-width: 768px)')
  })

  it('updates to true when a resize event fires narrow', () => {
    const { mql } = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
    act(() => {
      mql.dispatchChange(true)
    })
    expect(result.current).toBe(true)
  })

  it('updates back to false when a resize event fires wide', () => {
    const { mql } = mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
    act(() => {
      mql.dispatchChange(false)
    })
    expect(result.current).toBe(false)
  })
})
