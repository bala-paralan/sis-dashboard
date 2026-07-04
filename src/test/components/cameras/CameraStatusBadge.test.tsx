import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders %s status text', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('applies green classes for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('green')
  })

  it('applies red classes for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('red')
  })

  it('applies yellow classes for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('yellow')
  })

  it('applies blue classes for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('blue')
  })

  it('applies gray classes for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    const badge = container.querySelector('span')
    expect(badge?.className).toContain('gray')
  })

  it('renders a colour dot alongside the label', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    // The dot is a nested <span> inside the badge
    const spans = container.querySelectorAll('span')
    expect(spans.length).toBeGreaterThanOrEqual(2)
  })
})
