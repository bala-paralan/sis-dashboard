import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const mockCamera: Camera = {
  id: 'cam-001',
  name: 'Gate Camera Alpha',
  manufacturer: 'Hikvision',
  model: 'DS-2CD2T47G2',
  siteId: 'SITE-01',
  location: 'North Gate',
  status: 'ONLINE',
  lastSeenAt: null,
  createdBy: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const defaultProps = {
  mode: 'add' as const,
  onSubmit: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CameraFormModal', () => {
  describe('add mode', () => {
    it('renders "Add Camera" title in add mode', () => {
      render(<CameraFormModal {...defaultProps} />)
      expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('renders the Name field', () => {
      render(<CameraFormModal {...defaultProps} />)
      expect(screen.getByText(/^Name/i)).toBeInTheDocument()
    })

    it('renders the RTSP URL field', () => {
      render(<CameraFormModal {...defaultProps} />)
      expect(screen.getByPlaceholderText(/rtsp:\/\//i)).toBeInTheDocument()
    })

    it('renders the submit button with "Add Camera" label', () => {
      render(<CameraFormModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Add Camera' })).toBeInTheDocument()
    })

    it('calls onClose when Cancel is clicked', () => {
      render(<CameraFormModal {...defaultProps} />)
      fireEvent.click(screen.getByText('Cancel'))
      expect(defaultProps.onClose).toHaveBeenCalledOnce()
    })

    it('calls onSubmit with name and rtspUrl on valid submit', async () => {
      render(<CameraFormModal {...defaultProps} />)
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Cam' } })
      fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
        target: { value: 'rtsp://192.168.1.1/stream' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
      await waitFor(() => expect(defaultProps.onSubmit).toHaveBeenCalled())
      const arg = defaultProps.onSubmit.mock.calls[0][0] as { name: string; rtspUrl: string }
      expect(arg.name).toBe('New Cam')
      expect(arg.rtspUrl).toBe('rtsp://192.168.1.1/stream')
    })

    it('closes modal after successful submit', async () => {
      render(<CameraFormModal {...defaultProps} />)
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Cam' } })
      fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
        target: { value: 'rtsp://192.168.1.1/stream' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
      await waitFor(() => expect(defaultProps.onClose).toHaveBeenCalled())
    })

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'))
      render(<CameraFormModal {...defaultProps} onSubmit={onSubmit} />)
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Cam' } })
      fireEvent.change(screen.getByPlaceholderText(/rtsp:\/\//i), {
        target: { value: 'rtsp://x/s' },
      })
      fireEvent.click(screen.getByRole('button', { name: 'Add Camera' }))
      await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
    })
  })

  describe('edit mode', () => {
    it('renders "Edit Camera" title in edit mode', () => {
      render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
      expect(screen.getByText('Edit Camera')).toBeInTheDocument()
    })

    it('pre-fills name from initial prop', () => {
      render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
      const nameInput = screen.getAllByRole('textbox')[0] as HTMLInputElement
      expect(nameInput.value).toBe('Gate Camera Alpha')
    })

    it('pre-fills manufacturer from initial prop', () => {
      render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
      const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
      const mfr = inputs.find((i) => i.value === 'Hikvision')
      expect(mfr).toBeInTheDocument()
    })

    it('does not pre-fill RTSP URL (encrypted at rest)', () => {
      render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
      const rtspInput = screen.getByPlaceholderText(/rtsp:\/\//i) as HTMLInputElement
      expect(rtspInput.value).toBe('')
    })

    it('renders "Save Changes" as submit button label', () => {
      render(<CameraFormModal {...defaultProps} mode="edit" initial={mockCamera} />)
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
    })
  })
})
