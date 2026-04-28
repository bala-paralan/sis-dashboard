import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
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
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a toast message', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'success', message: 'Saved!', duration: 3000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'success', message: 'First',  duration: 3000 })
      useToastStore.getState().addToast({ type: 'error',   message: 'Second', duration: 3000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('removes a toast when the dismiss button is clicked', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'info', message: 'Click to dismiss', duration: 3000 })
    })
    render(<ToastContainer />)
    const dismissBtn = screen.getByLabelText('Dismiss notification')
    fireEvent.click(dismissBtn)
    expect(screen.queryByText('Click to dismiss')).not.toBeInTheDocument()
  })

  it('auto-removes a toast after its duration', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'success', message: 'Auto dismiss', duration: 2000 })
    })
    render(<ToastContainer />)
    expect(screen.getByText('Auto dismiss')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument()
  })

  it('uses role="alert" for accessibility', () => {
    act(() => {
      useToastStore.getState().addToast({ type: 'error', message: 'Error!', duration: 3000 })
    })
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
