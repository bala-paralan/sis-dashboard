import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides?: Partial<Camera>): Camera {
  return {
    id:           'cam-001',
    name:         'North Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'BOP-ALPHA-01',
    location:     'Gate 1 North',
    status:       'ONLINE',
    lastSeenAt:   '2026-05-10T10:00:00.000Z',
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-05-10T10:00:00.000Z',
    ...overrides,
  }
}

describe('CameraFormModal — Add mode', () => {
  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('renders Name field', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/^Name/)).toBeInTheDocument()
  })

  it('renders RTSP URL field', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/RTSP URL/)).toBeInTheDocument()
  })

  it('renders Cancel button', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows "Add Camera" submit button in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /^Add Camera$/ })).toBeInTheDocument()
  })

  it('calls onSubmit and onClose when form is submitted with valid data', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const nameInputs = screen.getAllByRole('textbox')
    // First input is Name, second is RTSP URL
    fireEvent.change(nameInputs[0], { target: { value: 'Test Camera' } })
    fireEvent.change(nameInputs[1], { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add Camera$/ }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const nameInputs = screen.getAllByRole('textbox')
    fireEvent.change(nameInputs[0], { target: { value: 'Test Camera' } })
    fireEvent.change(nameInputs[1], { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.click(screen.getByRole('button', { name: /^Add Camera$/ }))

    await waitFor(() => {
      expect(screen.getByText(/Server error/)).toBeInTheDocument()
    })
  })
})

describe('CameraFormModal — Edit mode', () => {
  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: /Edit Camera/i })).toBeInTheDocument()
  })

  it('pre-fills the name field with the camera name', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const nameInput = screen.getByDisplayValue('North Gate')
    expect(nameInput).toBeInTheDocument()
  })

  it('pre-fills the manufacturer field', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByDisplayValue('Hikvision')).toBeInTheDocument()
  })

  it('shows "Save Changes" submit button in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })
})
