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

  it('addToast adds a toast to the queue', () => {
    useToastStore.getState().addToast('success', 'Saved!')
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it('addToast uses the provided type', () => {
    useToastStore.getState().addToast('error', 'Failed!')
    expect(useToastStore.getState().toasts[0].type).toBe('error')
  })

  it('addToast uses the provided message', () => {
    useToastStore.getState().addToast('info', 'Hello world')
    expect(useToastStore.getState().toasts[0].message).toBe('Hello world')
  })

  it('addToast assigns default duration of 3000', () => {
    useToastStore.getState().addToast('success', 'Done')
    expect(useToastStore.getState().toasts[0].duration).toBe(3000)
  })

  it('addToast uses custom duration when provided', () => {
    useToastStore.getState().addToast('warning', 'Warn', 5000)
    expect(useToastStore.getState().toasts[0].duration).toBe(5000)
  })

  it('addToast generates a unique id', () => {
    useToastStore.getState().addToast('success', 'A')
    useToastStore.getState().addToast('success', 'B')
    const ids = useToastStore.getState().toasts.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('removeToast removes the correct toast', () => {
    useToastStore.getState().addToast('success', 'A')
    useToastStore.getState().addToast('success', 'B')
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].message).toBe('B')
  })

  it('toast auto-removes after duration', () => {
    useToastStore.getState().addToast('info', 'Temporary', 1000)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    vi.advanceTimersByTime(1001)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('supports all four toast types', () => {
    const types = ['success', 'error', 'warning', 'info'] as const
    types.forEach((t) => useToastStore.getState().addToast(t, t))
    const stored = useToastStore.getState().toasts.map((t) => t.type)
    expect(stored).toEqual(types)
  })
})
