import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('applies green classes for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('applies red classes for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/red/)
  })

  it('renders a dot indicator inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const spans = container.querySelectorAll('span')
    // outer badge + inner dot
    expect(spans.length).toBeGreaterThanOrEqual(2)
  })
})
