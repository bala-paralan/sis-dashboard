import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

function makeCamera(overrides: Partial<Camera> = {}): Camera {
  return {
    id:           'cam-001',
    name:         'Front Gate',
    manufacturer: 'Hikvision',
    model:        'DS-2CD2T47G2-L',
    siteId:       'site-alpha',
    location:     'Main entrance',
    status:       'ONLINE',
    lastSeenAt:   null,
    createdBy:    'admin',
    createdAt:    '2026-01-01T00:00:00Z',
    updatedAt:    '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

describe('CameraFormModal', () => {
  let onSubmit: ReturnType<typeof vi.fn>
  let onClose: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSubmit = vi.fn().mockResolvedValue(undefined)
    onClose  = vi.fn()
  })

  describe('add mode', () => {
    it('renders "Add Camera" heading', () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders Name and RTSP URL as required fields', () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByText(/Name/)).toBeInTheDocument()
      expect(screen.getByText(/RTSP URL/)).toBeInTheDocument()
    })

    it('renders Add Camera submit button', () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByRole('button', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('calls onClose when Cancel is clicked', () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(onClose).toHaveBeenCalled()
    })

    it('calls onSubmit with form data on submit', async () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Camera' } })
      fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'rtsp://192.168.1.1/stream' } })

      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'New Camera', rtspUrl: 'rtsp://192.168.1.1/stream' })
        )
      })
    })

    it('calls onClose after successful submit', async () => {
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Cam' } })
      fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'rtsp://x' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
    })

    it('shows error message when onSubmit rejects', async () => {
      onSubmit = vi.fn().mockRejectedValue(new Error('API error'))
      render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Cam' } })
      fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: 'rtsp://x' } })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))

      await waitFor(() => expect(screen.getByText('API error')).toBeInTheDocument())
    })
  })

  describe('edit mode', () => {
    it('renders "Edit Camera" heading', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByText('Edit Camera')).toBeInTheDocument()
    })

    it('pre-fills name from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ name: 'Back Gate' })} onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByDisplayValue('Back Gate')).toBeInTheDocument()
    })

    it('pre-fills manufacturer from initial camera', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera({ manufacturer: 'Axis' })} onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByDisplayValue('Axis')).toBeInTheDocument()
    })

    it('renders Save Changes submit button', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })

    it('does not pre-fill RTSP URL (security: encrypted at rest)', () => {
      render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={onSubmit} onClose={onClose} />)
      const inputs = screen.getAllByRole('textbox')
      // rtspUrl input (index 1) should be empty
      expect(inputs[1]).toHaveValue('')
    })
  })
})
