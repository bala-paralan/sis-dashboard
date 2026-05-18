import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    render(<ToastContainer />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders a toast message', () => {
    act(() => {
      useToastStore.getState().add({ type: 'success', message: 'Saved!', duration: 3000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    act(() => {
      useToastStore.getState().add({ type: 'success', message: 'First', duration: 3000 })
      useToastStore.getState().add({ type: 'error', message: 'Second', duration: 3000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('removes toast after clicking dismiss button', () => {
    act(() => {
      useToastStore.getState().add({ type: 'info', message: 'Click to dismiss', duration: 5000 })
    })
    render(<ToastContainer />)
    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByText('Click to dismiss')).not.toBeInTheDocument()
  })

  it('auto-removes toast after duration expires', () => {
    act(() => {
      useToastStore.getState().add({ type: 'warning', message: 'Auto gone', duration: 2000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Auto gone')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(2001) })
    expect(screen.queryByText('Auto gone')).not.toBeInTheDocument()
  })
})
