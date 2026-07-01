import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(STATUSES)('renders the %s status text', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('renders a dot indicator', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span span')
    expect(dot).toBeInTheDocument()
  })

  it('applies green styling for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('applies red styling for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/red/)
  })

  it('applies yellow styling for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/yellow/)
  })
})
