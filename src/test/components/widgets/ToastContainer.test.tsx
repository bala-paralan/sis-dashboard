import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('ToastContainer', () => {
  it('renders nothing when there are no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a toast message when one is added', () => {
    useToastStore.setState({
      toasts: [{ id: 't1', type: 'success', message: 'Saved!', duration: 3000 }],
    })
    render(<ToastContainer />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    useToastStore.setState({
      toasts: [
        { id: 't1', type: 'success', message: 'First toast', duration: 3000 },
        { id: 't2', type: 'error', message: 'Second toast', duration: 3000 },
      ],
    })
    render(<ToastContainer />)
    expect(screen.getByText('First toast')).toBeInTheDocument()
    expect(screen.getByText('Second toast')).toBeInTheDocument()
  })

  it('dismiss button removes the toast', () => {
    useToastStore.setState({
      toasts: [{ id: 't1', type: 'info', message: 'Dismiss me', duration: 3000 }],
    })
    render(<ToastContainer />)
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' })
    fireEvent.click(dismissBtn)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('toasts have role="alert"', () => {
    useToastStore.setState({
      toasts: [{ id: 't1', type: 'warning', message: 'Warning!', duration: 3000 }],
    })
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
