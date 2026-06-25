import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const existingCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera',
  status: 'ONLINE',
  rtspUrl: 'rtsp://example.com/stream',
  manufacturer: 'Acme',
  model: 'X100',
  location: 'Main Gate',
  siteId: 'SITE-A',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
}

describe('CameraFormModal', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Gate Camera')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with name and rtspUrl when form is submitted', async () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://10.0.0.1/live' },
    })
    // Fill in name
    const nameInput = screen.getAllByRole('textbox').find(
      (el) => (el as HTMLInputElement).required
    )!
    fireEvent.change(nameInput, { target: { value: 'New Cam' } })
    fireEvent.submit(nameInput.closest('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const arg = onSubmit.mock.calls[0][0]
    expect(arg.name).toBe('New Cam')
    expect(arg.rtspUrl).toBe('rtsp://10.0.0.1/live')
  })

  it('shows error message when onSubmit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={failSubmit} onClose={onClose} />)
    const nameInput = screen.getAllByRole('textbox').find(
      (el) => (el as HTMLInputElement).required
    )!
    fireEvent.change(nameInput, { target: { value: 'Cam' } })
    fireEvent.submit(nameInput.closest('form')!)
    await waitFor(() => expect(screen.getByText('Server error')).toBeInTheDocument())
  })

  it('renders all form fields', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('RTSP URL')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Manufacturer')).toBeInTheDocument()
    expect(screen.getByText('Site ID')).toBeInTheDocument()
  })
})
