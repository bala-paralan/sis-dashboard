import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2T47G2',
  siteId:       'site-01',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-01-01T00:00:00.000Z',
}

describe('CameraFormModal — add mode', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose  = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('renders without crashing', () => {
    const { container } = render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows "Add Camera" heading as h2', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /Add Camera/i })).toBeInTheDocument()
  })

  it('renders Name and RTSP URL labels', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText(/^Name/i)).toBeInTheDocument()
    expect(screen.getByText(/RTSP URL/i)).toBeInTheDocument()
  })

  it('renders Cancel button', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByText(/cancel/i)).toBeInTheDocument()
  })

  it('calls onClose when Cancel clicked', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    fireEvent.click(screen.getByText(/cancel/i))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('renders submit button with "Add Camera" text', () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    const submitBtn = screen.getByRole('button', { name: /Add Camera/i })
    expect(submitBtn).toBeInTheDocument()
  })

  it('calls onSubmit when form submitted with name and RTSP URL', async () => {
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
    // Fill all required fields
    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    // First input is Name, second is RTSP URL
    fireEvent.change(inputs[0], { target: { value: 'Test Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
  })

  it('shows error message when onSubmit rejects', async () => {
    const failSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
    render(<CameraFormModal mode="add" onSubmit={failSubmit} onClose={onClose} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    fireEvent.change(inputs[0], { target: { value: 'Test Cam' } })
    fireEvent.change(inputs[1], { target: { value: 'rtsp://192.168.1.100/stream' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => expect(screen.getByText(/network error/i)).toBeInTheDocument())
  })
})

describe('CameraFormModal — edit mode', () => {
  const onSubmit = vi.fn().mockResolvedValue(undefined)
  const onClose  = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('shows "Edit Camera" heading as h2', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('heading', { name: /Edit Camera/i })).toBeInTheDocument()
  })

  it('pre-fills name from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    const nameInput = Array.from(inputs).find((i) => i.value === 'Gate Camera A')
    expect(nameInput).toBeDefined()
  })

  it('pre-fills manufacturer from initial camera', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    const inputs = document.querySelectorAll<HTMLInputElement>('input')
    const mfgInput = Array.from(inputs).find((i) => i.value === 'Hikvision')
    expect(mfgInput).toBeDefined()
  })

  it('renders Save Changes submit button', () => {
    render(<CameraFormModal mode="edit" initial={mockCamera} onSubmit={onSubmit} onClose={onClose} />)
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument()
  })
})
