import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AlertStatsPanel } from '@/components/panels/AlertStatsPanel'
import { useAlertStore } from '@/store/alertStore'

vi.mock('@/store/alertStore')
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Cell: () => null,
}))

const SAMPLE_ALERTS = [
  { id: 'a1', threat_level: 'CRITICAL', sensor_family: 'Seismic',  description: 'breach',   acknowledged: false, timestamp: '2024-01-01T00:00:02Z' },
  { id: 'a2', threat_level: 'HIGH',     sensor_family: 'Acoustic', description: 'footstep', acknowledged: true,  timestamp: '2024-01-01T00:00:01Z' },
  { id: 'a3', threat_level: 'MEDIUM',   sensor_family: 'Optical',  description: 'motion',   acknowledged: false, timestamp: '2024-01-01T00:00:00Z' },
  { id: 'a4', threat_level: 'LOW',      sensor_family: 'Radar',    description: 'drone',    acknowledged: false, timestamp: '2024-01-01T00:00:03Z' },
  { id: 'a5', threat_level: 'CRITICAL', sensor_family: 'Seismic',  description: 'tunnel',   acknowledged: false, timestamp: '2024-01-01T00:00:04Z' },
]

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAlertStore).mockImplementation((sel: (s: unknown) => unknown) =>
    sel({ alerts: SAMPLE_ALERTS })
  )
})

describe('AlertStatsPanel', () => {
  it('renders severity cards for all four levels', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId('severity-card-CRITICAL')).toBeInTheDocument()
    expect(screen.getByTestId('severity-card-HIGH')).toBeInTheDocument()
    expect(screen.getByTestId('severity-card-MEDIUM')).toBeInTheDocument()
    expect(screen.getByTestId('severity-card-LOW')).toBeInTheDocument()
  })

  it('shows correct CRITICAL count', () => {
    render(<AlertStatsPanel />)
    const card = screen.getByTestId('severity-card-CRITICAL')
    expect(card).toHaveTextContent('2')
  })

  it('shows correct HIGH count', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId('severity-card-HIGH')).toHaveTextContent('1')
  })

  it('shows correct LOW count', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId('severity-card-LOW')).toHaveTextContent('1')
  })

  it('renders acknowledgement rate bar', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId('ack-rate-bar')).toBeInTheDocument()
  })

  it('shows correct acknowledgement percentage', () => {
    render(<AlertStatsPanel />)
    // 1 of 5 acked = 20%
    expect(screen.getByText('20%')).toBeInTheDocument()
  })

  it('renders sensor family bar chart', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })

  it('renders the recent alerts section', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByText(/recent alerts/i)).toBeInTheDocument()
  })

  it('shows recent alert items', () => {
    render(<AlertStatsPanel />)
    expect(screen.getByTestId(`recent-alert-a5`)).toBeInTheDocument()
  })

  it('shows "No alerts yet" when store is empty', () => {
    vi.mocked(useAlertStore).mockImplementation((sel: (s: unknown) => unknown) =>
      sel({ alerts: [] })
    )
    render(<AlertStatsPanel />)
    expect(screen.getByText(/no alerts yet/i)).toBeInTheDocument()
    expect(screen.getByTestId('severity-card-CRITICAL')).toHaveTextContent('0')
  })
})
