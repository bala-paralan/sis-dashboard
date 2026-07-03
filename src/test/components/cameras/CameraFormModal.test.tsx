import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const noop = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal — Add mode', () => {
  it('renders the modal with Add Camera heading', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('renders the Name label', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
  })

  it('renders the RTSP URL field', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    expect(screen.getByText(/RTSP URL/i)).toBeInTheDocument()
  })

  it('renders a Cancel button', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('renders a submit button', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    // The submit button says "Add Camera" in add mode
    const submitBtn = screen.getByRole('button', { name: /Add Camera/i })
    expect(submitBtn).toBeInTheDocument()
    expect(submitBtn).toHaveAttribute('type', 'submit')
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onSubmit on successful form submit', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    // Fill required fields
    const allInputs = screen.getAllByRole('textbox')
    fireEvent.change(allInputs[0], { target: { value: 'Test Camera' } })  // Name
    fireEvent.change(allInputs[1], { target: { value: 'rtsp://192.168.1.100/stream' } })  // RTSP

    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('shows an error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={noop} />)

    const allInputs = screen.getAllByRole('textbox')
    fireEvent.change(allInputs[0], { target: { value: 'Test Camera' } })
    fireEvent.change(allInputs[1], { target: { value: 'rtsp://test' } })

    const form = document.querySelector('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(screen.getByText(/Network error|Error saving/i)).toBeInTheDocument()
    })
  })

  it('renders optional fields (Manufacturer, Model, Location, Site ID)', () => {
    render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
    expect(screen.getByText('Manufacturer')).toBeInTheDocument()
    expect(screen.getByText('Model')).toBeInTheDocument()
    expect(screen.getByText('Location')).toBeInTheDocument()
    expect(screen.getByText(/Site ID/i)).toBeInTheDocument()
  })
})

describe('CameraFormModal — Edit mode', () => {
  const existingCamera: Camera = {
    id: 'cam-001',
    name: 'Gate Alpha',
    manufacturer: 'Hikvision',
    model: 'DS-2CD2143',
    siteId: 'SITE-A',
    location: 'Main Gate',
    status: 'ONLINE',
    lastSeenAt: '2026-04-11T10:00:00.000Z',
    createdBy: 'admin',
    createdAt: '2026-04-01T00:00:00.000Z',
    updatedAt: '2026-04-11T10:00:00.000Z',
  }

  it('renders Edit Camera heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    expect(screen.getByRole('heading', { name: /Edit Camera/i })).toBeInTheDocument()
  })

  it('pre-fills the camera name from initial prop', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    expect(screen.getByDisplayValue('Gate Alpha')).toBeInTheDocument()
  })

  it('pre-fills the manufacturer from initial prop', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('pre-fills the location from initial prop', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    expect(screen.getByDisplayValue('Main Gate')).toBeInTheDocument()
  })

  it('does not pre-fill the RTSP URL (encrypted at rest)', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    // RTSP placeholder should exist but field should be empty
    const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i)
    expect(rtspInput).toHaveValue('')
  })

  it('renders Save Changes button in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })
})
