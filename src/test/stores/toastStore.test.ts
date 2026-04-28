import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('toastStore — addToast', () => {
  it('adds a toast to the queue', () => {
    useToastStore.getState().addToast({ type: 'success', message: 'Done!', duration: 3000 })
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })

  it('assigns a unique id to each toast', () => {
    useToastStore.getState().addToast({ type: 'info', message: 'First',  duration: 3000 })
    useToastStore.getState().addToast({ type: 'info', message: 'Second', duration: 3000 })
    const [t1, t2] = useToastStore.getState().toasts
    expect(t1.id).not.toBe(t2.id)
  })

  it('stores the correct type, message, and duration', () => {
    useToastStore.getState().addToast({ type: 'error', message: 'Oops', duration: 5000 })
    const toast = useToastStore.getState().toasts[0]
    expect(toast.type).toBe('error')
    expect(toast.message).toBe('Oops')
    expect(toast.duration).toBe(5000)
  })

  it('appends multiple toasts in order', () => {
    useToastStore.getState().addToast({ type: 'success', message: 'A', duration: 1000 })
    useToastStore.getState().addToast({ type: 'warning', message: 'B', duration: 1000 })
    const messages = useToastStore.getState().toasts.map((t) => t.message)
    expect(messages).toEqual(['A', 'B'])
  })
})

describe('toastStore — removeToast', () => {
  it('removes the toast with the matching id', () => {
    useToastStore.getState().addToast({ type: 'info', message: 'Hello', duration: 3000 })
    const id = useToastStore.getState().toasts[0].id
    useToastStore.getState().removeToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('leaves other toasts untouched', () => {
    useToastStore.getState().addToast({ type: 'info', message: 'Keep', duration: 3000 })
    useToastStore.getState().addToast({ type: 'info', message: 'Remove', duration: 3000 })
    const idToRemove = useToastStore.getState().toasts[1].id
    useToastStore.getState().removeToast(idToRemove)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].message).toBe('Keep')
  })

  it('is a no-op for an unknown id', () => {
    useToastStore.getState().addToast({ type: 'success', message: 'OK', duration: 3000 })
    useToastStore.getState().removeToast('nonexistent-id')
    expect(useToastStore.getState().toasts).toHaveLength(1)
  })
})
