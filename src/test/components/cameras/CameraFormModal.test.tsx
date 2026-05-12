import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function mockCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Gate Alpha',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2143G2-I',
    siteId:       'SITE-01',
    location:     'North Gate',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00.000Z',
    updatedAt:    '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  let onSubmit: ReturnType<typeof vi.fn>
  let onClose:  ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined)
    onClose  = vi.fn()
  })

  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /add camera/i })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText('Edit Camera')).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera({ name: 'South Gate' })} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('South Gate')).toBeInTheDocument()
  })

  it('pre-fills manufacturer field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera({ manufacturer: 'Axis' })} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
  })

  it('calls onClose when Cancel button is clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows submit button label "Add Camera" in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('button', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('shows submit button label "Save Changes" in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera()} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('calls onSubmit and then onClose on successful submit', async () => {
    const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const inputs = container.querySelectorAll('input[type="text"]')
    fireEvent.change(inputs[0], { target: { value: 'New Cam' } })          // Name
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://192.168.1.1/stream' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('shows error message when onSubmit rejects', async () => {
    onSubmit.mockRejectedValue(new Error('API unavailable'))
    const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const inputs = container.querySelectorAll('input[type="text"]')
    fireEvent.change(inputs[0], { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), { target: { value: 'rtsp://x' } })
    fireEvent.submit(container.querySelector('form')!)
    await waitFor(() => expect(screen.getByText('API unavailable')).toBeInTheDocument())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('renders all expected form fields', () => {
    const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const textInputs = container.querySelectorAll('input[type="text"]')
    expect(textInputs.length).toBeGreaterThanOrEqual(6)
    expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
  })
})
