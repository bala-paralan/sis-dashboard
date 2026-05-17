import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { DeviceConfigPage } from '@/components/pages/DeviceConfigPage'
import { useSensorStore } from '@/store/sensorStore'

// DeviceConfigPage uses SVG and canvas — both mocked in setup.tsx.
// It also calls useIsMobile (window.matchMedia).
vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})))

beforeEach(() => {
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
})

describe('DeviceConfigPage', () => {
  it('renders without crashing', () => {
    expect(() => render(<DeviceConfigPage />)).not.toThrow()
  })

  // ── Tab navigation ───────────────────────────────────────────────────────────

  it('renders Overview tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument()
  })

  it('renders Port Configuration tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /Port Configuration/i })).toBeInTheDocument()
  })

  it('renders Data & Periodicity tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /Data & Periodicity/i })).toBeInTheDocument()
  })

  it('renders Deployment Topology tab button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: /Deployment Topology/i })).toBeInTheDocument()
  })

  it('Overview tab is active by default', () => {
    render(<DeviceConfigPage />)
    // The overview tab should render SC-001 port content (the port map SVG area)
    // Check for a unit-specific label that appears only in overview
    expect(screen.getByText('SC-001')).toBeInTheDocument()
  })

  it('clicking Port Configuration tab shows port config content', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Port Configuration/i }))
    // Port config renders interface type text like GigE Vision or RS-485
    expect(screen.getAllByText(/GigE Vision|RS-485|USB/i).length).toBeGreaterThan(0)
  })

  it('clicking Data & Periodicity tab shows data flow content', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: /Data & Periodicity/i }))
    // Data tab renders rate/period column headers
    expect(screen.getAllByText(/Rate|Period|Mbps|kB/i).length).toBeGreaterThan(0)
  })

  it('clicking Deployment Topology tab renders without crashing', () => {
    render(<DeviceConfigPage />)
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /Deployment Topology/i }))
    ).not.toThrow()
  })

  // ── Unit selector ────────────────────────────────────────────────────────────

  it('renders SC-001 unit selector button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: 'SC-001' })).toBeInTheDocument()
  })

  it('renders SC-002 unit selector button', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByRole('button', { name: 'SC-002' })).toBeInTheDocument()
  })

  it('clicking SC-002 switches the active unit', () => {
    render(<DeviceConfigPage />)
    fireEvent.click(screen.getByRole('button', { name: 'SC-002' }))
    // After switching, SC-002's site id should appear
    expect(screen.getAllByText(/BOP-BETA-01/).length).toBeGreaterThan(0)
  })

  // ── Header meta information ──────────────────────────────────────────────────

  it('shows Site ID for the active unit', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/BOP-ALPHA-01/).length).toBeGreaterThan(0)
  })

  it('shows BOP ID for the active unit', () => {
    render(<DeviceConfigPage />)
    expect(screen.getAllByText(/BOP-001/).length).toBeGreaterThan(0)
  })

  it('shows "Ports active" indicator', () => {
    render(<DeviceConfigPage />)
    expect(screen.getByText(/Ports active/i)).toBeInTheDocument()
  })

  // ── Tab switching round-trip ─────────────────────────────────────────────────

  it('can switch between all tabs without crashing', () => {
    render(<DeviceConfigPage />)
    const tabs = ['Port Configuration', 'Data & Periodicity', 'Deployment Topology', 'Overview']
    for (const label of tabs) {
      expect(() =>
        fireEvent.click(screen.getByRole('button', { name: new RegExp(label.split(' ')[0], 'i') }))
      ).not.toThrow()
    }
  })
})
