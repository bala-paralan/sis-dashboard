import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraFormModal } from '@/components/cameras/CameraFormModal'
import type { Camera } from '@/api/cameras'

const makeCamera = (): Camera => ({
  id:           'cam-1',
  name:         'Gate A',
  manufacturer: 'Hikvision',
  model:        'DS-2CD2',
  siteId:       'site-1',
  location:     'Main Gate',
  status:       'ONLINE',
  lastSeenAt:   null,
  createdBy:    'admin',
  createdAt:    '2026-01-01T00:00:00.000Z',
  updatedAt:    '2026-04-24T10:00:00.000Z',
})

describe('CameraFormModal', () => {
  it('renders "Add Camera" heading in add mode', () => {
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Add Camera' })).toBeInTheDocument()
  })

  it('renders "Edit Camera" heading in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Edit Camera' })).toBeInTheDocument()
  })

  it('pre-fills name field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const nameInput = inputs.find((el) => el.value === 'Gate A')
    expect(nameInput).toBeDefined()
  })

  it('pre-fills location field in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const locationInput = inputs.find((el) => el.value === 'Main Gate')
    expect(locationInput).toBeDefined()
  })

  it('does not pre-fill RTSP URL in edit mode', () => {
    render(<CameraFormModal mode="edit" initial={makeCamera()} onSubmit={vi.fn()} onClose={vi.fn()} />)
    const rtspInput = screen.getByPlaceholderText('rtsp://192.168.1.x/stream') as HTMLInputElement
    expect(rtspInput.value).toBe('')
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onSubmit and then onClose on successful save', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose  = vi.fn()
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={onClose} />)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    const nameInput = inputs[0]
    const rtspInput = screen.getByPlaceholderText('rtsp://192.168.1.x/stream')
    fireEvent.change(nameInput, { target: { value: 'New Camera' } })
    fireEvent.change(rtspInput, { target: { value: 'rtsp://10.0.0.1/stream' } })

    fireEvent.submit(nameInput.closest('form')!)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('shows error message when onSubmit throws', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('API error'))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0], { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })
    fireEvent.submit(inputs[0].closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument()
    })
  })

  it('shows "Saving…" label while saving', async () => {
    let resolve!: () => void
    const onSubmit = vi.fn().mockReturnValue(new Promise<void>((res) => { resolve = res }))
    render(<CameraFormModal mode="add" onSubmit={onSubmit} onClose={vi.fn()} />)

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[]
    fireEvent.change(inputs[0], { target: { value: 'Test' } })
    fireEvent.change(screen.getByPlaceholderText('rtsp://192.168.1.x/stream'), { target: { value: 'rtsp://x' } })
    fireEvent.submit(inputs[0].closest('form')!)

    await waitFor(() => {
      expect(screen.getByText('Saving…')).toBeInTheDocument()
    })
    resolve()
  })
})
