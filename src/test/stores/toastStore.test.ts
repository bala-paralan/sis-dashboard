import { describe, it, expect, beforeEach } from 'vitest'
import { useToastStore } from '@/store/toastStore'
import type { Toast } from '@/store/toastStore'

function makeToast(overrides: Partial<Omit<Toast, 'id'>> = {}): Omit<Toast, 'id'> {
  return {
    threatLevel:    'CRITICAL',
    classification: 'INTRUSION',
    timestamp:      new Date().toISOString(),
    location:       '21.94,88.12',
    ...overrides,
  }
}

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('toastStore — addToast', () => {
  it('adds a toast with a generated id', () => {
    useToastStore.getState().addToast(makeToast())
    const { toasts } = useToastStore.getState()
    expect(toasts).toHaveLength(1)
    expect(toasts[0].id).toMatch(/^toast-/)
  })

  it('prepends new toasts (most recent first)', () => {
    useToastStore.getState().addToast(makeToast({ classification: 'FIRST' }))
    useToastStore.getState().addToast(makeToast({ classification: 'SECOND' }))
    expect(useToastStore.getState().toasts[0].classification).toBe('SECOND')
  })

  it('caps toasts at 5', () => {
    for (let i = 0; i < 7; i++) {
      useToastStore.getState().addToast(makeToast({ classification: `cls-${i}` }))
    }
    expect(useToastStore.getState().toasts).toHaveLength(5)
  })

  it('stores correct threat level', () => {
    useToastStore.getState().addToast(makeToast({ threatLevel: 'HIGH' }))
    expect(useToastStore.getState().toasts[0].threatLevel).toBe('HIGH')
  })
})

describe('toastStore — dismissToast', () => {
  it('removes the toast with the matching id', () => {
    useToastStore.getState().addToast(makeToast())
    const { toasts } = useToastStore.getState()
    const id = toasts[0].id
    useToastStore.getState().dismissToast(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('does not remove other toasts', () => {
    useToastStore.getState().addToast(makeToast({ classification: 'A' }))
    useToastStore.getState().addToast(makeToast({ classification: 'B' }))
    const { toasts } = useToastStore.getState()
    useToastStore.getState().dismissToast(toasts[0].id)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].classification).toBe('A')
  })
})

describe('toastStore — dismissAll', () => {
  it('clears all toasts', () => {
    useToastStore.getState().addToast(makeToast())
    useToastStore.getState().addToast(makeToast())
    useToastStore.getState().dismissAll()
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })
})
