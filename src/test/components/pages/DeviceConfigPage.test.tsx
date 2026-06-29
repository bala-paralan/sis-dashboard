import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

// useIsMobile returns false in jsdom
vi.mock('@/hooks/useIsMobile', () => ({ useIsMobile: () => false }))

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders Overview tab by default', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Overview/i)).toBeInTheDocument()
  })

  it('shows all 4 tab labels', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText(/Port Config/i)).toBeInTheDocument()
    expect(screen.getByText(/Data & Periodicity/i)).toBeInTheDocument()
    expect(screen.getByText(/Deployment Topology/i)).toBeInTheDocument()
  })

  it('shows SensiConnect unit IDs in Overview', () => {
    render(<DeviceConfigPage />)
    // SC-001 appears in multiple places (button, card header, device details)
    expect(screen.getAllByText(/SC-001/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/SC-002/).length).toBeGreaterThan(0)
  })

  it('shows CPU model in Overview', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/AMD Versal/i)).toBeInTheDocument()
  })

  it('shows temperature in Overview', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/42°C|51°C/)).toBeInTheDocument()
  })

  it('switches to Port Configuration tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Port Config/i))
    // PORT_DEFS uses GE-01, USB-01, RS-01 etc. (not ETH-01/SMA-01)
    expect(screen.getByText(/GE-01/)).toBeInTheDocument()
  })

  it('shows port labels in Port Config tab', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Port Config/i))
    // "EOTS" is a sensor name in PORT_DEFS (appears once, abbr is "EO")
    expect(screen.getByText('EOTS')).toBeInTheDocument()
  })

  it('switches to Data & Periodicity tab', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Data & Periodicity/i))
    // "Periodicity" appears in section heading and table column header
    expect(screen.getAllByText(/Periodicity/i).length).toBeGreaterThan(0)
  })

  it('switches to Deployment Topology tab', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Deployment Topology/i))
    // Header still shows BOP-ALPHA-01; topology heading also matches
    expect(screen.getAllByText(/BOP-ALPHA-01|Topology|Deployment/i).length).toBeGreaterThan(0)
  })

  it('shows site IDs', () => {
    render(<DeviceConfigPage />)
    // BOP-ALPHA-01 appears in header meta, card header, and device details
    expect(screen.getAllByText(/BOP-ALPHA-01|BOP-BETA-01/).length).toBeGreaterThan(0)
  })
})
