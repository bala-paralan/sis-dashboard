import { describe, it, expect, beforeEach, vi } from 'vitest'
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
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a toast when one is in the store', () => {
    act(() => { useToastStore.getState().addToast('success', 'Saved!') })
    render(<ToastContainer />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast('success', 'First toast')
      useToastStore.getState().addToast('error', 'Second toast')
    })
    render(<ToastContainer />)
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })

  it('removes a toast when the dismiss button is clicked', () => {
    act(() => { useToastStore.getState().addToast('info', 'Dismiss me') })
    render(<ToastContainer />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
  })

  it('auto-removes toast after its duration', async () => {
    act(() => { useToastStore.getState().addToast('warning', 'Auto remove', 1000) })
    render(<ToastContainer />)
    expect(screen.getByText('Auto remove')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1001) })
    expect(screen.queryByText('Auto remove')).not.toBeInTheDocument()
  })

  it('renders success toast with role=alert', () => {
    act(() => { useToastStore.getState().addToast('success', 'Success msg') })
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders the correct icon for error type', () => {
    act(() => { useToastStore.getState().addToast('error', 'Error msg') })
    render(<ToastContainer />)
    expect(screen.getByText('✗')).toBeInTheDocument()
  })

  it('renders the correct icon for success type', () => {
    act(() => { useToastStore.getState().addToast('success', 'Done') })
    render(<ToastContainer />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('has aria-live=polite on the container', () => {
    act(() => { useToastStore.getState().addToast('info', 'Live region') })
    render(<ToastContainer />)
    expect(screen.getByText('Live region').closest('[aria-live]')).toHaveAttribute('aria-live', 'polite')
  })
})
