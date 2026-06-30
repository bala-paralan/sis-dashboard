import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

// DeviceConfigPage uses useIsMobile which calls window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows unit selector buttons', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText('SC-001')).toBeInTheDocument()
    expect(screen.getByText('SC-002')).toBeInTheDocument()
  })

  it('shows site metadata for the default unit', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('shows Overview tab as active by default', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0)
  })

  it('shows all four tab buttons', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Port Configuration/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Data & Periodicity/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Deployment Topology/i).length).toBeGreaterThan(0)
  })

  it('shows ports active counter', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Ports active/i)).toBeInTheDocument()
  })

  it('shows sensor count metric in Overview', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Sensors connected/i)).toBeInTheDocument()
  })

  it('shows SensiConnect nodes metric in Overview', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/SensiConnect nodes/i)).toBeInTheDocument()
  })

  it('switching to Ports tab shows port table header', () => {
    render(<DeviceConfigPage />)
    const portTab = screen.getByRole('button', { name: /Port/i })
    fireEvent.click(portTab)
    expect(screen.getByText(/Port Configuration/i)).toBeInTheDocument()
  })

  it('switching to Ports tab shows filter buttons', () => {
    render(<DeviceConfigPage />)
    const portTab = screen.getByRole('button', { name: /Port/i })
    fireEvent.click(portTab)
    expect(screen.getByText(/All ports/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Active/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Degraded/i).length).toBeGreaterThan(0)
  })

  it('switching to Data tab shows periodicity table', () => {
    render(<DeviceConfigPage />)
    const dataTab = screen.getByRole('button', { name: /Data/i })
    fireEvent.click(dataTab)
    // "Sensor data transfer & periodicity" heading only appears in Data tab content
    expect(document.body.textContent).toMatch(/data transfer/i)
  })

  it('switching to Deployment tab shows topology', () => {
    render(<DeviceConfigPage />)
    const deployTab = screen.getByRole('button', { name: /Deployment/i })
    fireEvent.click(deployTab)
    // Legend header appears only in Deployment tab content
    expect(screen.getByText(/border sector topology/i)).toBeInTheDocument()
  })

  it('switching unit updates site ID', () => {
    render(<DeviceConfigPage />)
    const sc002 = screen.getByText('SC-002')
    fireEvent.click(sc002)
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
  })

  it('clicking Config button in Ports tab opens periodicity modal', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Port/i }))
    // "Config" action buttons have exact text "Config" (not "Port Configuration")
    const configButtons = screen.getAllByRole('button', { name: 'Config' })
    fireEvent.click(configButtons[0])
    expect(document.body.textContent).toMatch(/Edit periodicity/i)
  })

  it('periodicity modal can be closed via Cancel', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Port/i }))
    const configButtons = screen.getAllByRole('button', { name: 'Config' })
    fireEvent.click(configButtons[0])
    expect(document.body.textContent).toMatch(/Edit periodicity/i)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(document.body.textContent).not.toMatch(/Edit periodicity/i)
  })

  it('pin table is shown in Overview tab', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Modality/i)).toBeInTheDocument()
  })
})
