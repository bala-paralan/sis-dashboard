import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import '@testing-library/jest-dom'
import { TopNavBar } from '@/components/layout/TopNavBar'
import { useSystemStore } from '@/store/systemStore'
import { useAlertStore } from '@/store/alertStore'
import type { Alert } from '@/types/sensors'

function renderWithRouter(ui: React.ReactNode) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

function makeAlert(id: string, acked = false): Alert {
  return {
    id,
    timestamp: new Date().toISOString(),
    source_sensors: ['S01-GEO-001'],
    location: '21.94, 88.12',
    classification: 'INTRUSION',
    threat_level: 'HIGH',
    acknowledged: acked,
    description: `Alert ${id}`,
  }
}

beforeEach(() => {
  useSystemStore.setState({
    theme: 'dark',
    scenario: 'NORMAL',
    connectionStatus: 'connected',
    health: null,
    sidebarCollapsed: false,
    activePanel: 'map',
  })
  useAlertStore.setState({
    alerts: [],
    threatAssessment: null,
    filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' },
  })
})

describe('TopNavBar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithRouter(<TopNavBar />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it("shows 'SIS' logo text", () => {
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it("shows 'IINVSYS' subtitle", () => {
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('IINVSYS')).toBeInTheDocument()
  })

  it('shows the current UTC time in HH:mm:ss format', () => {
    renderWithRouter(<TopNavBar />)
    // The time is displayed as "HH:mm:ss UTC"
    const timeEl = screen.getByText(/^\d{2}:\d{2}:\d{2} UTC$/)
    expect(timeEl).toBeInTheDocument()
  })

  it('shows the current scenario name (NORMAL by default)', () => {
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()
  })

  it('shows site selector dropdown with BOP-ALPHA-01 and BOP-BETA-01 options', () => {
    renderWithRouter(<TopNavBar />)
    // Two comboboxes exist (site selector + scenario selector); pick the first (site)
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThanOrEqual(1)
    const siteSelect = selects[0]
    expect(siteSelect).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'BOP-ALPHA-01' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'BOP-BETA-01' })).toBeInTheDocument()
  })

  it('shows 0 unacknowledged alerts badge when no alerts', () => {
    renderWithRouter(<TopNavBar />)
    // The badge should not render when unackedCount === 0
    expect(screen.queryByText(/^[1-9]\d*$/)).not.toBeInTheDocument()
  })

  it('shows unacknowledged count badge when there are unacked alerts', () => {
    useAlertStore.setState({ alerts: [makeAlert('a1'), makeAlert('a2')] })
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show alert badge when all alerts are acknowledged', () => {
    useAlertStore.setState({
      alerts: [makeAlert('a1', true), makeAlert('a2', true)],
    })
    renderWithRouter(<TopNavBar />)
    // No badge — unackedCount is 0
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('renders ConnectionBadge component showing connection status text', () => {
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('Connected')).toBeInTheDocument()
  })

  it('renders ThemeToggle button', () => {
    renderWithRouter(<TopNavBar />)
    // ThemeToggle renders a button with a title about switching mode
    const toggleBtn = screen.getByTitle(/switch to (light|dark) mode/i)
    expect(toggleBtn).toBeInTheDocument()
  })

  it("shows 'Operator' role label", () => {
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('Operator')).toBeInTheDocument()
  })

  it("INTRUSION scenario shows 'INTRUSION' in the nav bar", () => {
    useSystemStore.setState({ scenario: 'INTRUSION' })
    renderWithRouter(<TopNavBar />)
    expect(screen.getByText('INTRUSION')).toBeInTheDocument()
  })

  it('scenario chip changes when store scenario changes', () => {
    const { rerender } = renderWithRouter(<TopNavBar />)
    expect(screen.getByText('NORMAL')).toBeInTheDocument()

    act(() => {
      useSystemStore.setState({ scenario: 'ELEVATED' })
    })
    rerender(<MemoryRouter><TopNavBar /></MemoryRouter>)
    expect(screen.getByText('ELEVATED')).toBeInTheDocument()
    // The scenario select value should reflect the new scenario
    const selects = screen.getAllByRole('combobox')
    const scenarioSelect = selects.find(
      (s) => (s as HTMLSelectElement).value === 'ELEVATED'
    )
    expect(scenarioSelect).toBeDefined()
  })
})
