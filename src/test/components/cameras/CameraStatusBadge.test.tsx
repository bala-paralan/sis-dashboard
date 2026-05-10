import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'

describe('CameraStatusBadge', () => {
  it('renders ONLINE status text', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('renders OFFLINE status text', () => {
    render(<CameraStatusBadge status="OFFLINE" />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('renders DEGRADED status text', () => {
    render(<CameraStatusBadge status="DEGRADED" />)
    expect(screen.getByText('DEGRADED')).toBeInTheDocument()
  })

  it('renders ERROR status text', () => {
    render(<CameraStatusBadge status="ERROR" />)
    expect(screen.getByText('ERROR')).toBeInTheDocument()
  })

  it('renders MAINTENANCE status text', () => {
    render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(screen.getByText('MAINTENANCE')).toBeInTheDocument()
  })

  it('applies green classes for ONLINE status', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toHaveClass('text-green-300')
  })

  it('applies gray classes for OFFLINE status', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    expect(container.firstChild).toHaveClass('text-gray-400')
  })

  it('applies red classes for ERROR status', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    expect(container.firstChild).toHaveClass('text-red-300')
  })

  it('applies yellow classes for DEGRADED status', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    expect(container.firstChild).toHaveClass('text-yellow-300')
  })

  it('applies blue classes for MAINTENANCE status', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(container.firstChild).toHaveClass('text-blue-300')
  })

  it('renders a dot indicator span inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span.rounded-full')
    expect(dot).toBeInTheDocument()
  })
})
