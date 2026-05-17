import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AlertRow } from '@/components/widgets/AlertRow'
import type { Alert } from '@/types/sensors'

function mockAlert(overrides = {}): Alert {
  return {
    id: 'alert-001',
    timestamp: '2026-04-11T10:00:00.000Z',
    source_sensors: ['S02-GEO-001'],
    location: '21.9452, 88.1234',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: false,
    description: 'Seismic anomaly detected',
    ...overrides,
  }
}

describe('AlertRow', () => {
  let onAck:     ReturnType<typeof vi.fn>
  let onDismiss: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onAck     = vi.fn()
    onDismiss = vi.fn()
  })

  it('renders without crashing', () => {
    expect(() => render(<AlertRow alert={mockAlert()} onAck={onAck} onDismiss={onDismiss} />)).not.toThrow()
  })

  it('shows the alert description text', () => {
    render(<AlertRow alert={mockAlert()} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.getByText('Seismic anomaly detected')).toBeInTheDocument()
  })

  it("shows the threat_level initial badge — 'H' for HIGH", () => {
    render(<AlertRow alert={mockAlert({ threat_level: 'HIGH' })} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.getByText('H')).toBeInTheDocument()
  })

  it("shows 'C' initial badge for CRITICAL", () => {
    render(<AlertRow alert={mockAlert({ threat_level: 'CRITICAL' })} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.getByText('C')).toBeInTheDocument()
  })

  it('shows ACK button when alert.acknowledged is false', () => {
    render(<AlertRow alert={mockAlert({ acknowledged: false })} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.getByText('ACK')).toBeInTheDocument()
  })

  it("shows 'ACKED' and no ACK button when alert.acknowledged is true", () => {
    render(<AlertRow alert={mockAlert({ acknowledged: true })} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.queryByText('ACK')).not.toBeInTheDocument()
    expect(screen.getByText('ACKED')).toBeInTheDocument()
  })

  it('clicking ACK button once opens confirm input, second click calls onAck with alert id', () => {
    render(<AlertRow alert={mockAlert({ id: 'alert-001', acknowledged: false })} onAck={onAck} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByText('ACK'))
    expect(screen.getByText('Confirm')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Confirm'))
    expect(onAck).toHaveBeenCalledWith('alert-001')
  })

  it('shows CRITICAL alert with class containing "critical"', () => {
    const { container } = render(
      <AlertRow alert={mockAlert({ threat_level: 'CRITICAL' })} onAck={onAck} onDismiss={onDismiss} />
    )
    const row = container.firstChild as HTMLElement
    expect(row.className).toMatch(/critical/)
  })

  it('shows LOW alert with class containing "low"', () => {
    const { container } = render(
      <AlertRow alert={mockAlert({ threat_level: 'LOW' })} onAck={onAck} onDismiss={onDismiss} />
    )
    const row = container.firstChild as HTMLElement
    expect(row.className).toMatch(/low/)
  })

  it('renders a dismiss button', () => {
    render(<AlertRow alert={mockAlert()} onAck={onAck} onDismiss={onDismiss} />)
    expect(screen.getByRole('button', { name: 'Dismiss alert' })).toBeInTheDocument()
  })

  it('calls onDismiss with alert id when dismiss button is clicked', () => {
    render(<AlertRow alert={mockAlert({ id: 'alert-007' })} onAck={onAck} onDismiss={onDismiss} />)
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss alert' }))
    expect(onDismiss).toHaveBeenCalledWith('alert-007')
  })
})
