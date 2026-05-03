import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'

describe('CameraStatusBadge', () => {
  it('renders without crashing', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('displays ONLINE status text', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    expect(screen.getByText('ONLINE')).toBeInTheDocument()
  })

  it('displays OFFLINE status text', () => {
    render(<CameraStatusBadge status="OFFLINE" />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('displays DEGRADED status text', () => {
    render(<CameraStatusBadge status="DEGRADED" />)
    expect(screen.getByText('DEGRADED')).toBeInTheDocument()
  })

  it('displays ERROR status text', () => {
    render(<CameraStatusBadge status="ERROR" />)
    expect(screen.getByText('ERROR')).toBeInTheDocument()
  })

  it('displays MAINTENANCE status text', () => {
    render(<CameraStatusBadge status="MAINTENANCE" />)
    expect(screen.getByText('MAINTENANCE')).toBeInTheDocument()
  })

  it('renders a <span> element', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    expect(screen.getByText('ONLINE').tagName).toBe('SPAN')
  })

  it('renders an inner dot span', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const spans = container.querySelectorAll('span')
    expect(spans.length).toBe(2) // outer badge + inner dot
  })
})
