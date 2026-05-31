import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

beforeEach(() => {
  useSensorStore.setState({
    sensors: new Map(),
    sensorHistory: new Map(),
    tracks: [],
    selectedSensorId: null,
  })
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders SensiConnect text somewhere in the page', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SensiConnect/i).length).toBeGreaterThan(0)
  })

  it('renders the Overview tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/Overview/i).length).toBeGreaterThan(0)
  })

  it('renders the Port Configuration tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/Port Configuration/i).length).toBeGreaterThan(0)
  })

  it('renders port/interface information', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/GigE|RS-485|USB|PCIe|CAN/i).length).toBeGreaterThan(0)
  })

  it('shows unit selector buttons SC-001 and SC-002', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SC-001|SC-002/).length).toBeGreaterThan(0)
  })

  it('renders without crashing when sensors store is empty', () => {
    expect(() => render(<DeviceConfigPage />)).not.toThrow()
  })
})
