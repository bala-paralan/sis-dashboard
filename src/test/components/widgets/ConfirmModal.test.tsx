import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ConfirmModal } from '@/components/widgets/ConfirmModal'

describe('ConfirmModal', () => {
  it('renders the title', () => {
    render(<ConfirmModal title="Delete Item" message="Are you sure?" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Delete Item')).toBeTruthy()
  })

  it('renders the message', () => {
    render(<ConfirmModal title="T" message="Please confirm this action" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Please confirm this action')).toBeTruthy()
  })

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal title="T" message="M" onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('does NOT call onConfirm when cancel is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmModal title="T" message="M" onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('calls onCancel on ESC key', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onCancel).toHaveBeenCalled()
  })

  it('renders custom confirmLabel', () => {
    render(<ConfirmModal title="T" message="M" confirmLabel="Destroy" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Destroy')).toBeTruthy()
  })

  it('renders custom cancelLabel', () => {
    render(<ConfirmModal title="T" message="M" cancelLabel="Abort" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Abort')).toBeTruthy()
  })

  it('calls onCancel when backdrop is clicked', () => {
    const onCancel = vi.fn()
    render(<ConfirmModal title="T" message="M" onConfirm={vi.fn()} onCancel={onCancel} />)
    const backdrop = screen.getByRole('dialog')
    fireEvent.click(backdrop)
    expect(onCancel).toHaveBeenCalled()
  })
})
