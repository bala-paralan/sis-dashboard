import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'

describe('CameraStatusBadge', () => {
  it('renders ONLINE status', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders OFFLINE status', () => {
    render(<CameraStatusBadge status="OFFLINE" />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('renders DEGRADED status', () => {
    render(<CameraStatusBadge status="DEGRADED" />)
    expect(screen.getByText('DEGRADED')).toBeInTheDocument()
  })

  it('renders ERROR status', () => {
    render(<CameraStatusBadge status="ERROR" />)
    expect(screen.getByText('ERROR')).toBeInTheDocument()
  })

  it('renders MAINTENANCE status', () => {
    render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(screen.getByText('MAINTENANCE')).toBeInTheDocument()
  })

  it('applies green colour class for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies red colour class for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('applies yellow colour class for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('applies blue colour class for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })

  it('renders a dot indicator inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('.rounded-full')
    expect(dot).toBeInTheDocument()
  })
})
