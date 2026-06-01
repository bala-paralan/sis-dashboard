import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders status text: %s', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('renders a dot indicator inside the badge', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span.rounded-full')
    expect(dot).toBeInTheDocument()
  })

  it('applies green classes for ONLINE status', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('applies red classes for ERROR status', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/red/)
  })

  it('applies yellow classes for DEGRADED status', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/yellow/)
  })

  it('applies blue classes for MAINTENANCE status', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/blue/)
  })

  it('applies gray classes for OFFLINE status', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/gray/)
  })

  it('renders as an inline element', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.tagName.toLowerCase()).toBe('span')
  })
})
