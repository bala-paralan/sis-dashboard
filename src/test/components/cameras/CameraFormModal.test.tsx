import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Perimeter Cam',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'East Wall',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('CameraFormModal', () => {
  const onClose  = vi.fn()
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    const nameInput = screen.getByDisplayValue('Perimeter Cam')
    expect(nameInput).toBeInTheDocument()
  })

  it('pre-fills manufacturer in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit and onClose on successful form submit', async () => {
    onSubmit.mockResolvedValueOnce(undefined)
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://192.168.1.10/stream' },
    })
    // Fill name field
    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'New Camera' } })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValueOnce(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const inputs = screen.getAllByRole('textbox')
    fireEvent.change(inputs[0], { target: { value: 'Fail Cam' } })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), {
      target: { value: 'rtsp://fail' },
    })

    fireEvent.click(screen.getByRole('button', { name: /Add Camera/i }))
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows "Save Changes" button in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('renders all expected input fields', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getAllByText(/Name/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('RTSP URL')).toBeInTheDocument()
    expect(screen.getByText('Username')).toBeInTheDocument()
    expect(screen.getByText('Manufacturer')).toBeInTheDocument()
  })
})
