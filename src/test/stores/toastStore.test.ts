import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toastStore', () => {
  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('addToast adds a toast with correct type and message', () => {
    useToastStore.getState().addToast('success', 'Saved!')
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].message).toBe('Saved!')
  })

  it('addToast assigns a unique id', () => {
    useToastStore.getState().addToast('info', 'Hello')
    useToastStore.getState().addToast('info', 'World')
    const { toasts } = useToastStore.getState()
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('toast auto-dismisses after default duration (3000ms)', () => {
    useToastStore.getState().addToast('success', 'Auto-dismiss')
    expect(useToastStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(3001)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('toast auto-dismisses after custom duration', () => {
    useToastStore.getState().addToast('error', 'Quick', 1000)
    vi.advanceTimersByTime(1001)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('removeToast removes only the specified toast', () => {
    useToastStore.getState().addToast('success', 'A')
    useToastStore.getState().addToast('error', 'B')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].message).toBe('B')
  })

  it('clearAll removes all toasts', () => {
    useToastStore.getState().addToast('success', 'A')
    useToastStore.getState().addToast('error', 'B')
    useToastStore.getState().addToast('warning', 'C')
    useToastStore.getState().clearAll()
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('supports all four toast types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const
    for (const type of types) {
      useToastStore.getState().addToast(type, `${type} message`)
    }
    const { toasts } = useToastStore.getState()
    expect(toasts.map((t) => t.type)).toEqual(types)
  })
})
