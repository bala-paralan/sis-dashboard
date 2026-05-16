import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { useToastStore, type Toast } from '@/store/toastStore'

function makeToast(overrides: Partial<Omit<Toast, 'id'>> = {}): Omit<Toast, 'id'> {
  return {
    threatLevel:    'CRITICAL',
    classification: 'INTRUSION',
    timestamp:      '2024-01-15T10:30:00Z',
    location:       '21.94,88.12',
    ...overrides,
  }
}

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a toast when one is added', () => {
    useToastStore.getState().addToast(makeToast())
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows threat level and classification', () => {
    useToastStore.getState().addToast(makeToast({ threatLevel: 'HIGH', classification: 'PERIMETER_BREACH' }))
    render(<ToastContainer />)
    expect(screen.getByText('HIGH')).toBeInTheDocument()
    expect(screen.getByText('PERIMETER_BREACH')).toBeInTheDocument()
  })

  it('shows location in the toast', () => {
    useToastStore.getState().addToast(makeToast({ location: 'North Gate' }))
    render(<ToastContainer />)
    expect(screen.getByText('North Gate')).toBeInTheDocument()
  })

  it('dismiss button removes the toast', () => {
    useToastStore.getState().addToast(makeToast())
    render(<ToastContainer />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('shows "Dismiss all" button when more than 1 toast', () => {
    useToastStore.getState().addToast(makeToast({ classification: 'A' }))
    useToastStore.getState().addToast(makeToast({ classification: 'B' }))
    render(<ToastContainer />)
    expect(screen.getByRole('button', { name: /dismiss all/i })).toBeInTheDocument()
  })

  it('"Dismiss all" clears all toasts', () => {
    useToastStore.getState().addToast(makeToast({ classification: 'A' }))
    useToastStore.getState().addToast(makeToast({ classification: 'B' }))
    render(<ToastContainer />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss all/i }))
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('does not show "Dismiss all" with only 1 toast', () => {
    useToastStore.getState().addToast(makeToast())
    render(<ToastContainer />)
    expect(screen.queryByRole('button', { name: /dismiss all/i })).not.toBeInTheDocument()
  })

  it('CRITICAL toast auto-dismisses after 5s', () => {
    useToastStore.getState().addToast(makeToast({ threatLevel: 'CRITICAL' }))
    render(<ToastContainer />)
    expect(useToastStore.getState().toasts).toHaveLength(1)
    act(() => { vi.advanceTimersByTime(5001) })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('HIGH toast auto-dismisses after 3s', () => {
    useToastStore.getState().addToast(makeToast({ threatLevel: 'HIGH' }))
    render(<ToastContainer />)
    act(() => { vi.advanceTimersByTime(3001) })
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('renders with aria-live="polite" for accessibility', () => {
    useToastStore.getState().addToast(makeToast())
    const { container } = render(<ToastContainer />)
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })
})
