import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ToastContainer } from '@/components/widgets/ToastContainer'
import { useToastStore } from '@/store/toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
})

describe('ToastContainer', () => {
  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a success toast message', () => {
    useToastStore.getState().addToast('success', 'Saved!')
    render(<ToastContainer />)
    expect(screen.getByText('Saved!')).toBeInTheDocument()
  })

  it('renders an error toast message', () => {
    useToastStore.getState().addToast('error', 'Something went wrong')
    render(<ToastContainer />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders multiple toasts', () => {
    useToastStore.getState().addToast('success', 'First')
    useToastStore.getState().addToast('info', 'Second')
    render(<ToastContainer />)
    expect(screen.getByText('First')).toBeInTheDocument()
    expect(screen.getByText('Second')).toBeInTheDocument()
  })

  it('dismiss button removes toast', () => {
    useToastStore.getState().addToast('warning', 'Dismiss me')
    render(<ToastContainer />)
    expect(screen.getByText('Dismiss me')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Dismiss'))
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument()
  })

  it('has aria-live attribute for accessibility', () => {
    useToastStore.getState().addToast('info', 'Accessible')
    render(<ToastContainer />)
    const container = document.querySelector('[aria-live]')
    expect(container).toBeInTheDocument()
  })

  it('renders toast with role=alert', () => {
    useToastStore.getState().addToast('error', 'Error!')
    render(<ToastContainer />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })
})
