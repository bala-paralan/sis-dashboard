import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
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
    expect(() => render(<DeviceConfigPage />)).not.toThrow()
  })

  it('shows unit IDs SC-001 and SC-002', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/SC-001/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/SC-002/i).length).toBeGreaterThan(0)
  })

  it('shows temperature readings in °C', () => {
    render(<DeviceConfigPage />)
    expect(document.body.textContent).toMatch(/°C/)
  })

  it('shows percentage values (uptime or port uptime)', () => {
    render(<DeviceConfigPage />)
    expect(document.body.textContent).toMatch(/%/)
  })

  it('renders tab navigation', () => {
    render(<DeviceConfigPage />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('shows Overview content with sensor counts', () => {
    render(<DeviceConfigPage />)
    expect(document.body.textContent).toMatch(/sensor/i)
  })

  it('shows port interface types', () => {
    render(<DeviceConfigPage />)
    // Should show interface types like ETH or RJ45 or SMA
    expect(document.body.textContent).toMatch(/ETH|SMA|RS-485|RJ45|port/i)
  })

  it('shows BOP site IDs', () => {
    render(<DeviceConfigPage />)
    expect(document.body.textContent).toMatch(/BOP-ALPHA-01|BOP-BETA-01/)
  })
})
