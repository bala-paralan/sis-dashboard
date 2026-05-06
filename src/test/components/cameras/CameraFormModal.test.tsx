import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const noop = vi.fn()

const existingCamera: Camera = {
  id:           'cam-001',
  name:         'Gate Camera',
  manufacturer: 'Axis',
  model:        'P3245',
  siteId:       'site-a',
  location:     'North Gate',
  status:       'ONLINE',
  lastSeenAt:   '2026-05-01T12:00:00Z',
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00Z',
  updatedAt:    '2026-01-01T00:00:00Z',
}

beforeEach(() => { vi.clearAllMocks() })

describe('CameraFormModal', () => {
  describe('add mode', () => {
    it('renders Add Camera heading', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
      expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders Name and RTSP URL fields', () => {
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={noop} />)
      expect(screen.getAllByText(/Name/).length).toBeGreaterThan(0)
      expect(screen.getByText(/RTSP URL/)).toBeInTheDocument()
    })

    it('calls onClose when Cancel is clicked', () => {
      const onClose = vi.fn()
      render(<CameraFormModal mode="add" onSubmit={noop} onClose={onClose} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onSubmit with form data on submit', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined)
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={noop} />)
      // Find the first text input (Name field) by querying all inputs and getting the first
      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'New Cam' } })
      const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i)
      fireEvent.change(rtspInput, { target: { value: 'rtsp://192.168.1.10/stream' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
      await waitFor(() => { expect(onSubmit).toHaveBeenCalled() })
      const arg = onSubmit.mock.calls[0][0] as Record<string, string>
      expect(arg.name).toBe('New Cam')
      expect(arg.rtspUrl).toBe('rtsp://192.168.1.10/stream')
    })

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'))
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={noop} />)
      const inputs = screen.getAllByRole('textbox')
      fireEvent.change(inputs[0], { target: { value: 'Cam' } })
      const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i)
      fireEvent.change(rtspInput, { target: { value: 'rtsp://x' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
      await waitFor(() => { expect(screen.getByText('Server error')).toBeInTheDocument() })
    })
  })

  describe('edit mode', () => {
    it('renders Edit Camera heading', () => {
      render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
      expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
    })

    it('pre-fills name from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
      const inputs = screen.getAllByRole('textbox')
      expect(inputs[0]).toHaveValue('Gate Camera')
    })

    it('pre-fills manufacturer from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
      const inputs = screen.getAllByRole('textbox')
      const mfr = inputs.find((el) => (el as HTMLInputElement).value === 'Axis')
      expect(mfr).toBeDefined()
    })

    it('shows Save Changes button instead of Add Camera', () => {
      render(<CameraFormModal mode="edit" initial={existingCamera} onSubmit={noop} onClose={noop} />)
      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })
})
