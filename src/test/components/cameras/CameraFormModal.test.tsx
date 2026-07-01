import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(): Camera {
  return {
    id: 'cam-001',
    name: 'Gate Camera',
    manufacturer: 'Axis',
    model: 'P3245',
    siteId: 'SITE-01',
    location: 'North Gate',
    status: 'ONLINE',
    lastSeenAt: '2026-07-01T10:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-07-01T10:00:00.000Z',
  }
}

describe('CameraFormModal', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
  })

  it('pre-fills name field from initial camera in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
    const nameInput = screen.getByDisplayValue('Gate Camera')
    expect(nameInput).toBeInTheDocument()
  })

  it('pre-fills manufacturer field from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit and onClose on valid form submission', async () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    // Use getAllByRole and pick the first textbox (Name field)
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'New Camera' } })
    fireEvent.change(textboxes[1], { target: { value: 'rtsp://192.168.1.1/stream' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows error message when onSubmit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={failSubmit} onClose={onClose} />)
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Cam' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows required asterisk on Name field', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const required = document.querySelectorAll('span.text-red-400')
    expect(required.length).toBeGreaterThan(0)
  })

  it('submit button shows "Saving…" while submitting', async () => {
    let resolve!: () => void
    const slowSubmit = vi.fn().mockReturnValue(new Promise<void>((r) => { resolve = r }))
    render(<CameraFormModal mode="add" onSubmit={slowSubmit} onClose={onClose} />)
    const textboxes = screen.getAllByRole('textbox')
    fireEvent.change(textboxes[0], { target: { value: 'Cam' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => expect(screen.getByText('Saving…')).toBeInTheDocument())
    resolve()
  })
})
