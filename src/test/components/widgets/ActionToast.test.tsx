import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ActionToast } from '@/components/widgets/ActionToast'

describe('ActionToast', () => {
  it('renders the message text', () => {
    render(<ActionToast message="Operation successful" />)
    expect(screen.getByText('Operation successful')).toBeTruthy()
  })

  it('shows checkmark icon for success type', () => {
    render(<ActionToast message="Done" type="success" />)
    expect(screen.getByText('✔')).toBeTruthy()
  })

  it('shows x icon for error type', () => {
    render(<ActionToast message="Failed" type="error" />)
    expect(screen.getByText('✖')).toBeTruthy()
  })

  it('has aria role="status"', () => {
    render(<ActionToast message="Test" />)
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('calls onDone after durationMs', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<ActionToast message="Test" durationMs={1000} onDone={onDone} />)
    act(() => { vi.advanceTimersByTime(1001) })
    expect(onDone).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('disappears after timeout', () => {
    vi.useFakeTimers()
    const { container } = render(<ActionToast message="Fading" durationMs={500} />)
    act(() => { vi.advanceTimersByTime(600) })
    expect(container.firstChild).toBeNull()
    vi.useRealTimers()
  })
})
