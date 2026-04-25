import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

const ALL_STATUSES: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']

describe('CameraStatusBadge', () => {
  it.each(ALL_STATUSES)('renders %s label', (status) => {
    render(<CameraStatusBadge status={status} />)
    expect(screen.getByText(status)).toBeInTheDocument()
  })

  it('applies green classes for ONLINE', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/green/)
  })

  it('applies gray classes for OFFLINE', () => {
    const { container } = render(<CameraStatusBadge status="OFFLINE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/gray/)
  })

  it('applies yellow classes for DEGRADED', () => {
    const { container } = render(<CameraStatusBadge status="DEGRADED" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/yellow/)
  })

  it('applies red classes for ERROR', () => {
    const { container } = render(<CameraStatusBadge status="ERROR" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/red/)
  })

  it('applies blue classes for MAINTENANCE', () => {
    const { container } = render(<CameraStatusBadge status="MAINTENANCE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toMatch(/blue/)
  })

  it('renders the coloured dot alongside the label', () => {
    const { container } = render(<CameraStatusBadge status="ONLINE" />)
    const dot = container.querySelector('span > span')
    expect(dot).toBeInTheDocument()
  })
})
