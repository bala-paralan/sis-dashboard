import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('useToastStore', () => {
  it('starts with an empty toast queue', () => {
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('addToast adds a toast to the queue', () => {
    act(() => { useToastStore.getState().addToast('success', 'Saved!') })
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].type).toBe('success')
    expect(toasts[0].message).toBe('Saved!')
  })

  it('addToast sets default duration to 3000ms', () => {
    act(() => { useToastStore.getState().addToast('info', 'Hello') })
    expect(useToastStore.getState().toasts[0].duration).toBe(3000)
  })

  it('addToast accepts a custom duration', () => {
    act(() => { useToastStore.getState().addToast('warning', 'Watch out', 5000) })
    expect(useToastStore.getState().toasts[0].duration).toBe(5000)
  })

  it('addToast generates a unique id for each toast', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'One')
      useToastStore.getState().addToast('error', 'Two')
    })
    const { toasts } = useToastStore.getState()
    expect(toasts[0].id).not.toBe(toasts[1].id)
  })

  it('addToast queues multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'First')
      useToastStore.getState().addToast('error', 'Second')
      useToastStore.getState().addToast('info', 'Third')
    })
    expect(useToastStore.getState().toasts).toHaveLength(3)
  })

  it('removeToast removes the matching toast by id', () => {
    act(() => { useToastStore.getState().addToast('success', 'Hello') })
    const id = useToastStore.getState().toasts[0].id
    act(() => { useToastStore.getState().removeToast(id) })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('removeToast leaves other toasts intact', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'Keep me')
      useToastStore.getState().addToast('error', 'Remove me')
    })
    const toasts = useToastStore.getState().toasts
    act(() => { useToastStore.getState().removeToast(toasts[1].id) })
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].message).toBe('Keep me')
  })

  it('clearAll removes all toasts', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'A')
      useToastStore.getState().addToast('error', 'B')
    })
    act(() => { useToastStore.getState().clearAll() })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('supports all four toast types', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'ok')
      useToastStore.getState().addToast('error', 'err')
      useToastStore.getState().addToast('warning', 'warn')
      useToastStore.getState().addToast('info', 'info')
    })
    const types = useToastStore.getState().toasts.map((t) => t.type)
    expect(types).toContain('success')
    expect(types).toContain('error')
    expect(types).toContain('warning')
    expect(types).toContain('info')
  })
})
