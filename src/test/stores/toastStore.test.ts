import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('useToastStore', () => {
  describe('add', () => {
    it('adds a toast with auto-generated id', () => {
      act(() => {
        useToastStore.getState().add({ type: 'success', message: 'Done!', duration: 3000 })
      })
      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Done!')
      expect(toasts[0].id).toBeTruthy()
    })

    it('queues multiple toasts', () => {
      act(() => {
        useToastStore.getState().add({ type: 'info', message: 'A', duration: 3000 })
        useToastStore.getState().add({ type: 'error', message: 'B', duration: 3000 })
      })
      expect(useToastStore.getState().toasts).toHaveLength(2)
    })

    it('preserves toast type', () => {
      act(() => {
        useToastStore.getState().add({ type: 'warning', message: 'Warn', duration: 5000 })
      })
      expect(useToastStore.getState().toasts[0].type).toBe('warning')
    })

    it('preserves toast duration', () => {
      act(() => {
        useToastStore.getState().add({ type: 'success', message: 'Fast', duration: 1000 })
      })
      expect(useToastStore.getState().toasts[0].duration).toBe(1000)
    })
  })

  describe('remove', () => {
    it('removes toast by id', () => {
      act(() => {
        useToastStore.getState().add({ type: 'success', message: 'Temp', duration: 3000 })
      })
      const id = useToastStore.getState().toasts[0].id
      act(() => {
        useToastStore.getState().remove(id)
      })
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not affect other toasts when removing one', () => {
      act(() => {
        useToastStore.getState().add({ type: 'info', message: 'First', duration: 3000 })
        useToastStore.getState().add({ type: 'error', message: 'Second', duration: 3000 })
      })
      const id = useToastStore.getState().toasts[0].id
      act(() => {
        useToastStore.getState().remove(id)
      })
      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].message).toBe('Second')
    })

    it('does nothing for unknown id', () => {
      act(() => {
        useToastStore.getState().add({ type: 'info', message: 'Keep', duration: 3000 })
      })
      act(() => {
        useToastStore.getState().remove('nonexistent')
      })
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })
})
