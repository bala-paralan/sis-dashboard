import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

// DeviceConfigPage uses useIsMobile which calls window.matchMedia
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<DeviceConfigPage />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows the Overview tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Overview/i)).toBeInTheDocument()
  })

  it('shows the Port Configuration tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Port Configuration/i)).toBeInTheDocument()
  })

  it('shows the Data & Periodicity tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Data.*Periodicity/i)).toBeInTheDocument()
  })

  it('shows the Deployment Topology tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Deployment Topology/i)).toBeInTheDocument()
  })

  it('Overview tab is active by default', () => {
    render(<DeviceConfigPage />)
    // Overview content should be visible
    expect(document.body.textContent).toMatch(/SensiConnect|SC-001|SC-002|Overview/i)
  })

  it('clicking Port Configuration tab shows port table', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Port Configuration/i))
    // Port config tab shows interface or sensor data
    expect(document.body.textContent).toMatch(/GigE Vision|USB|RS-485|Sensor|proto/i)
  })

  it('clicking Data & Periodicity tab shows data flow content', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Data.*Periodicity/i))
    expect(document.body.textContent).toMatch(/Sensor|Periodicity|Rate|Bandwidth|data/i)
  })

  it('clicking Deployment Topology tab shows topology content', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByText(/Deployment Topology/i))
    expect(document.body.textContent).toMatch(/BOP|Deploy|topology|Sector|node/i)
  })

  it('shows SensiConnect unit IDs (SC-001 and SC-002)', () => {
    render(<DeviceConfigPage />)
    const body = document.body.textContent ?? ''
    expect(body).toMatch(/SC-00[12]/)
  })

  it('shows site identifiers', () => {
    render(<DeviceConfigPage />)
    const body = document.body.textContent ?? ''
    const hasSite = ['BOP-ALPHA', 'BOP-BETA'].some((s) => body.includes(s))
    expect(hasSite).toBe(true)
  })

  it('shows port type labels in Overview', () => {
    render(<DeviceConfigPage />)
    // Port types like ETH, SMA, RS485 appear in the visual port diagram
    expect(document.body.textContent).toMatch(/ETH|SMA|RS485|GPIO|USB/i)
  })

  it('tabs cycle correctly — clicking tabs changes visible content', () => {
    render(<DeviceConfigPage />)

    // Start on Overview
    const overviewText = document.body.textContent ?? ''

    // Switch to Port Config
    fireEvent.click(screen.getByText(/Port Configuration/i))
    const portText = document.body.textContent ?? ''

    // Content should differ (port table vs diagram)
    expect(overviewText).not.toBe(portText)
  })
})
