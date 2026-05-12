import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'
import type { SensorPayload } from '@/types/sensors'

// Mock useIsMobile to return false (desktop layout)
vi.mock('@/hooks/useIsMobile', () => ({ useIsMobile: vi.fn(() => false) }))

function makeSensor(id: string, modality = 'SEISMIC'): SensorPayload {
  return {
    sensor_id:     id,
    modality:      modality as SensorPayload['modality'],
    timestamp:     '2026-05-01T10:00:00.000Z',
    site_id:       'BOP-ALPHA-01',
    bop_id:        'BOP-001',
    quality_score: 0.9,
    raw_value:     {},
    sensor_status: 'ONLINE',
    lat:           21.9452,
    lon:           88.1234,
  }
}

beforeEach(() => {
  const sensors = new Map([['S02-GEO-001', makeSensor('S02-GEO-001')]])
  useSensorStore.setState({
    sensors,
    tracks:        [],
    sensorHistory: new Map(),
  } as any)
  vi.clearAllMocks()
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<DeviceConfigPage />)).not.toThrow()
  })

  it('shows "SensiConnect" or device branding', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SensiConnect/i).length).toBeGreaterThan(0)
  })

  it('renders Overview tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /overview/i })).toBeInTheDocument()
  })

  it('renders Port Configuration tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /port configuration/i })).toBeInTheDocument()
  })

  it('renders Data & Periodicity tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /data & periodicity/i })).toBeInTheDocument()
  })

  it('renders Deployment Topology tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /deployment topology/i })).toBeInTheDocument()
  })

  it('shows Overview content by default', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SC-001/i).length).toBeGreaterThan(0)
  })

  it('switches to Port Configuration tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /port configuration/i }))
    expect(screen.getAllByText(/Interface/i).length).toBeGreaterThan(0)
  })

  it('switches to Data & Periodicity tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /data & periodicity/i }))
    expect(screen.getAllByText(/Sensor/i).length).toBeGreaterThan(0)
  })

  it('switches to Deployment Topology tab on click', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /deployment topology/i }))
    expect(screen.getAllByText(/Deployment/i).length).toBeGreaterThan(0)
  })

  it('shows known sensor port labels in Overview', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/ETH|SMA|RS|GPIO|USB/i).length).toBeGreaterThan(0)
  })

  it('shows unit selector with at least two units', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SC-001/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/SC-002/).length).toBeGreaterThan(0)
  })

  it('switches active unit when a unit tab is clicked', () => {
    render(<DeviceConfigPage />)
    const sc002buttons = screen.getAllByText(/SC-002/)
    fireEvent.click(sc002buttons[0])
    expect(screen.getAllByText(/BOP-BETA-01/i).length).toBeGreaterThan(0)
  })
})
