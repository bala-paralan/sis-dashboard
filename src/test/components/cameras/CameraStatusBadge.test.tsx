import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders %s status label', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('renders a dot indicator element', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    // The badge contains a span dot + text
    const spans = document.querySelectorAll('span')
    expect(spans.length).toBeGreaterThan(1)
  })

  it('applies green classes for ONLINE status', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    const badge = screen.getByText('ONLINE').closest('span')
    expect(badge?.className).toMatch(/green/)
  })

  it('applies red classes for ERROR status', () => {
    render(<CameraStatusBadge status="ERROR" />)
    const badge = screen.getByText('ERROR').closest('span')
    expect(badge?.className).toMatch(/red/)
  })

  it('applies yellow classes for DEGRADED status', () => {
    render(<CameraStatusBadge status="DEGRADED" />)
    const badge = screen.getByText('DEGRADED').closest('span')
    expect(badge?.className).toMatch(/yellow/)
  })

  it('applies blue classes for MAINTENANCE status', () => {
    render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = screen.getByText('MAINTENANCE').closest('span')
    expect(badge?.className).toMatch(/blue/)
  })

  it('applies gray classes for OFFLINE status', () => {
    render(<CameraStatusBadge status="OFFLINE" />)
    const badge = screen.getByText('OFFLINE').closest('span')
    expect(badge?.className).toMatch(/gray/)
  })
})
