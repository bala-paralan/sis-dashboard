import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  vi.useFakeTimers()
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
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('DeviceConfigPage', () => {
  it('renders without throwing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows all four tab buttons', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Port Configuration/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Data & Periodicity/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Deployment Topology/i })).toBeInTheDocument()
  })

  it('shows Overview tab content by default', () => {
    render(<DeviceConfigPage />)
    // Overview tab has system metrics like uptime and port uptime
    expect(screen.getByText(/Port uptime/i)).toBeInTheDocument()
  })

  it('switches to Port Configuration tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Port Configuration/i }))
    // Port config table has a "Port ID" column header unique to this tab
    expect(screen.getByText('Port ID')).toBeInTheDocument()
  })

  it('switches to Data & Periodicity tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Data & Periodicity/i }))
    // Data tab shows "Sensor data transfer & periodicity" heading
    expect(screen.getByText(/Sensor data transfer/i)).toBeInTheDocument()
  })

  it('switches to Deployment Topology tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Deployment Topology/i }))
    // Deployment tab shows the topology legend header
    expect(screen.getByText(/border sector topology/i)).toBeInTheDocument()
  })

  it('shows unit selector buttons SC-001 and SC-002', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: 'SC-001' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'SC-002' })).toBeInTheDocument()
  })

  it('shows BOP-ALPHA-01 site for SC-001 (default unit)', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
  })

  it('switches to SC-002 unit when that button is clicked', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: 'SC-002' }))
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
  })

  it('shows the SensiConnect unit label', () => {
    render(<DeviceConfigPage />)
    // "SensiConnect" appears in multiple elements in the Overview tab — just verify presence
    expect(screen.getAllByText(/SensiConnect/i).length).toBeGreaterThan(0)
  })

  it('shows ports active count', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Ports active/i)).toBeInTheDocument()
  })
})
