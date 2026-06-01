import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  act(() => { useToastStore.getState().clearToasts() })
})

describe('useToastStore — addToast', () => {
  it('adds a toast to the list', () => {
    act(() => { useToastStore.getState().addToast('Hello') })
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it('defaults variant to info', () => {
    act(() => { useToastStore.getState().addToast('Hello') })
    expect(useToastStore.getState().toasts[0].variant).toBe('info')
  })

  it('accepts an explicit variant', () => {
    act(() => { useToastStore.getState().addToast('OK', 'success') })
    expect(useToastStore.getState().toasts[0].variant).toBe('success')
  })

  it('defaults durationMs to 4000', () => {
    act(() => { useToastStore.getState().addToast('Hi') })
    expect(useToastStore.getState().toasts[0].durationMs).toBe(4000)
  })

  it('accepts a custom durationMs', () => {
    act(() => { useToastStore.getState().addToast('Hi', 'warning', 2000) })
    expect(useToastStore.getState().toasts[0].durationMs).toBe(2000)
  })

  it('stores the message correctly', () => {
    act(() => { useToastStore.getState().addToast('Camera saved') })
    expect(useToastStore.getState().toasts[0].message).toBe('Camera saved')
  })

  it('returns the toast id', () => {
    let id!: string
    act(() => { id = useToastStore.getState().addToast('Test') })
    expect(id).toMatch(/^toast-/)
  })

  it('accumulates multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast('First')
      useToastStore.getState().addToast('Second')
      useToastStore.getState().addToast('Third')
    })
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })

  it('assigns unique ids to each toast', () => {
    act(() => {
      useToastStore.getState().addToast('A')
      useToastStore.getState().addToast('B')
    })
    const ids = useToastStore.getState().toasts.map((t) => t.id)
    expect(new Set(ids).size).toBe(2)
  })
})

describe('useToastStore — removeToast', () => {
  it('removes the toast with the given id', () => {
    let id!: string
    act(() => { id = useToastStore.getState().addToast('Hello') })
    act(() => { useToastStore.getState().removeToast(id) })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('leaves other toasts untouched', () => {
    let id1!: string
    act(() => {
      id1 = useToastStore.getState().addToast('First')
      useToastStore.getState().addToast('Second')
    })
    act(() => { useToastStore.getState().removeToast(id1) })
    const remaining = useToastStore.getState().toasts
    expect(remaining).toHaveLength(1)
    expect(remaining[0].message).toBe('Second')
  })

  it('is a no-op for unknown id', () => {
    act(() => { useToastStore.getState().addToast('Hello') })
    act(() => { useToastStore.getState().removeToast('toast-9999999') })
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })
})

describe('useToastStore — clearToasts', () => {
  it('removes all toasts', () => {
    act(() => {
      useToastStore.getState().addToast('A')
      useToastStore.getState().addToast('B')
      useToastStore.getState().addToast('C')
    })
    act(() => { useToastStore.getState().clearToasts() })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('is a no-op when list is already empty', () => {
    act(() => { useToastStore.getState().clearToasts() })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
