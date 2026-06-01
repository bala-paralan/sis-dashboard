import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  act(() => { useToastStore.getState().clearToasts() })
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
    act(() => { useToastStore.getState().addToast('Camera saved') })
    render(<ToastContainer />)
    expect(screen.getByText('Camera saved')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    act(() => {
      useToastStore.getState().addToast('First')
      useToastStore.getState().addToast('Second')
    })
    render(<ToastContainer />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('has role="status" on each toast item', () => {
    act(() => { useToastStore.getState().addToast('Hello') })
    render(<ToastContainer />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows a dismiss button on each toast', () => {
    act(() => { useToastStore.getState().addToast('Hello') })
    render(<ToastContainer />)
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument()
  })

  it('removes the toast when dismiss is clicked', () => {
    act(() => { useToastStore.getState().addToast('Goodbye') })
    render(<ToastContainer />)
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(screen.queryByText('Goodbye')).not.toBeInTheDocument()
  })

  it('auto-dismisses after durationMs', () => {
    act(() => { useToastStore.getState().addToast('Auto', 'info', 3000) })
    render(<ToastContainer />)
    expect(screen.getByText('Auto')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(3001) })
    expect(screen.queryByText('Auto')).not.toBeInTheDocument()
  })

  it('does not dismiss before durationMs elapses', () => {
    act(() => { useToastStore.getState().addToast('Still here', 'info', 5000) })
    render(<ToastContainer />)
    act(() => { vi.advanceTimersByTime(4999) })
    expect(screen.getByText('Still here')).toBeInTheDocument()
  })

  it('has notifications landmark label', () => {
    act(() => { useToastStore.getState().addToast('Hi') })
    render(<ToastContainer />)
    expect(screen.getByLabelText('Notifications')).toBeInTheDocument()
  })

  it('shows success icon for success variant', () => {
    act(() => { useToastStore.getState().addToast('Done', 'success') })
    render(<ToastContainer />)
    // Success icon is ✓
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows error icon for error variant', () => {
    act(() => { useToastStore.getState().addToast('Oops', 'error') })
    render(<ToastContainer />)
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('shows warning icon for warning variant', () => {
    act(() => { useToastStore.getState().addToast('Watch out', 'warning') })
    render(<ToastContainer />)
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('shows info icon for info variant', () => {
    act(() => { useToastStore.getState().addToast('FYI', 'info') })
    render(<ToastContainer />)
    expect(screen.getByText('ℹ')).toBeInTheDocument()
  })
})
