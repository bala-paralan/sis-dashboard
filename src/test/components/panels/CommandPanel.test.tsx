import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the Nodes tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/▣ Nodes/)).toBeInTheDocument()
  })

  it('renders all 5 BOP node cards in the Nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-GAMMA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-DELTA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-ECHO-01')).toBeInTheDocument()
  })

  it('shows ONLINE and OFFLINE status labels', () => {
    render(<CommandPanel />)
    expect(screen.getAllByText('ONLINE').length).toBeGreaterThan(0)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('renders sector location labels', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Sector 1 NW/)).toBeInTheDocument()
    expect(screen.getByText(/Sector 5 C/)).toBeInTheDocument()
  })

  it('sort buttons use lowercase labels: status, threat, alerts', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: 'status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'threat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alerts' })).toBeInTheDocument()
  })

  it('switches to Incident tab when clicked', () => {
    render(<CommandPanel />)
    const incidentTab = screen.getByText(/📋 Incident/)
    fireEvent.click(incidentTab)
    expect(screen.getByPlaceholderText(/Add narrative description/i)).toBeInTheDocument()
  })

  it('switches to Handover tab when clicked', () => {
    render(<CommandPanel />)
    const handoverTab = screen.getByText(/📝 Handover/)
    fireEvent.click(handoverTab)
    expect(screen.getByPlaceholderText(/Key incidents and handover notes/i)).toBeInTheDocument()
  })

  it('shows Nodes online count in the stats bar', () => {
    render(<CommandPanel />)
    // Stats bar shows "Nodes: X/5"
    expect(screen.getByText(/Nodes:/)).toBeInTheDocument()
  })
})
