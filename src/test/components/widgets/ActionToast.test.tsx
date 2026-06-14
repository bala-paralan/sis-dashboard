import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ActionToast } from '@/components/widgets/ActionToast'

describe('ActionToast', () => {
  it('renders when visible is true', () => {
    render(<ActionToast message="Action done" visible onDismiss={vi.fn()} />)
    expect(screen.getByTestId('action-toast')).toBeInTheDocument()
  })

  it('does not render when visible is false', () => {
    render(<ActionToast message="Action done" visible={false} onDismiss={vi.fn()} />)
    expect(screen.queryByTestId('action-toast')).not.toBeInTheDocument()
  })

  it('shows the provided message', () => {
    render(<ActionToast message="QRT notified" visible onDismiss={vi.fn()} />)
    expect(screen.getByText('QRT notified')).toBeInTheDocument()
  })

  it('calls onDismiss after 3 seconds', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<ActionToast message="Done" visible onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(3000) })
    expect(onDismiss).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })

  it('does not call onDismiss before 3 seconds', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<ActionToast message="Done" visible onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(2999) })
    expect(onDismiss).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('does not auto-dismiss when visible is false', () => {
    vi.useFakeTimers()
    const onDismiss = vi.fn()
    render(<ActionToast message="Done" visible={false} onDismiss={onDismiss} />)
    act(() => { vi.advanceTimersByTime(5000) })
    expect(onDismiss).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('renders as a status role element', () => {
    render(<ActionToast message="Success" visible onDismiss={vi.fn()} />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
