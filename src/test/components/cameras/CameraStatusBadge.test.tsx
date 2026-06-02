import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CameraStatusBadge } from '@/components/cameras/CameraStatusBadge'
import type { CameraStatus } from '@/api/cameras'

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

  it('applies correct CSS class for ONLINE', () => {
    render(<CameraStatusBadge status="ONLINE" />)
    const badge = screen.getByText('ONLINE').closest('span')
    expect(badge?.className).toContain('green')
  })

  it('applies correct CSS class for OFFLINE', () => {
    render(<CameraStatusBadge status="OFFLINE" />)
    const badge = screen.getByText('OFFLINE').closest('span')
    expect(badge?.className).toContain('gray')
  })

  it('renders all 5 statuses without crashing', () => {
    const statuses: CameraStatus[] = ['ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE']
    for (const status of statuses) {
      const { unmount } = render(<CameraStatusBadge status={status} />)
      expect(screen.getByText(status)).toBeInTheDocument()
      unmount()
    }
  })
})
