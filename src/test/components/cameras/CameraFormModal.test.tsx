import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera',
  manufacturer: 'Axis',
  model:        'P1448',
  siteId:       'site-a',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T00:00:00Z',
}

const defaultProps = {
  mode:     'add' as const,
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onClose:  vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal', () => {
  it('renders Add Camera heading in add mode', () => {
    render(<CameraFormModal {...defaultProps} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders Edit Camera heading in edit mode', () => {
    render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
    const nameInput = screen.getByDisplayValue('Gate Camera')
    expect(nameInput).toBeInTheDocument()
  })

  it('pre-fills manufacturer in edit mode', () => {
    render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
    expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
  })

  it('shows Name required field', () => {
    render(<CameraFormModal {...defaultProps} />)
    const nameLabel = screen.getByText('Name')
    expect(nameLabel).toBeInTheDocument()
  })

  it('shows RTSP URL field', () => {
    render(<CameraFormModal {...defaultProps} />)
    expect(screen.getByText('RTSP URL')).toBeInTheDocument()
  })

  it('calls onClose when cancel is clicked', () => {
    render(<CameraFormModal {...defaultProps} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('calls onSubmit with form data on submit', async () => {
    render(<CameraFormModal {...defaultProps} />)
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
      target: { value: 'rtsp://192.168.1.1/stream' },
    })
    // Fill required name field
    const nameInputs = screen.getAllByRole('textbox')
    fireEvent.change(nameInputs[0], { target: { value: 'New Cam' } })
    fireEvent.submit(screen.getByRole('button', { name: /Save|Add Camera/i }) || document.querySelector('form')!)
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalled()
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal {...defaultProps} onSubmit={onSubmit} />)
    const nameInputs = screen.getAllByRole('textbox')
    fireEvent.change(nameInputs[0], { target: { value: 'New Cam' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
      target: { value: 'rtsp://192.168.1.1/stream' },
    })
    // Submit the form
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
})
