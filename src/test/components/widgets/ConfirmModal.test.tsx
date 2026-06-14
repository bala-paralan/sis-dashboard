import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmModal } from '@/components/widgets/ConfirmModal'

function renderModal(props?: Partial<React.ComponentProps<typeof ConfirmModal>>) {
  const onConfirm = vi.fn()
  const onCancel = vi.fn()
  render(
    <ConfirmModal
      isOpen={props?.isOpen ?? true}
      title={props?.title ?? 'Are you sure?'}
      message={props?.message ?? 'This is a test message.'}
      onConfirm={props?.onConfirm ?? onConfirm}
      onCancel={props?.onCancel ?? onCancel}
      confirmLabel={props?.confirmLabel}
      cancelLabel={props?.cancelLabel}
    />
  )
  return { onConfirm, onCancel }
}

describe('ConfirmModal', () => {
  it('renders when isOpen is true', () => {
    renderModal({ isOpen: true })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not render when isOpen is false', () => {
    renderModal({ isOpen: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows the title', () => {
    renderModal({ title: 'Delete item?' })
    expect(screen.getByText('Delete item?')).toBeInTheDocument()
  })

  it('shows the message', () => {
    renderModal({ message: 'This cannot be undone.' })
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderModal({ onConfirm, onCancel })
    fireEvent.click(screen.getByTestId('confirm-modal-confirm'))
    expect(onConfirm).toHaveBeenCalledOnce()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderModal({ onConfirm, onCancel })
    fireEvent.click(screen.getByTestId('confirm-modal-cancel'))
    expect(onCancel).toHaveBeenCalledOnce()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel when backdrop is clicked', () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderModal({ onConfirm, onCancel })
    fireEvent.click(screen.getByTestId('confirm-modal-backdrop'))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Escape key is pressed', () => {
    const onCancel = vi.fn()
    renderModal({ onCancel })
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('uses custom confirmLabel when provided', () => {
    renderModal({ confirmLabel: 'Delete Now' })
    expect(screen.getByText('Delete Now')).toBeInTheDocument()
  })

  it('uses custom cancelLabel when provided', () => {
    renderModal({ cancelLabel: 'Go Back' })
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })
})
