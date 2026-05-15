import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

function setupMocks(overrides: Record<string, boolean> = {}) {
  const defaults: Record<string, boolean> = {
    multiNodeOverview: true,
    incidentReportGenerator: true,
    shiftHandoverSummary: true,
    cibmsNatgridFeedMonitor: false,
    ...overrides,
  }
  const isWidgetVisible = (id: string) => defaults[id] ?? true
  ;(useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { isWidgetVisible: typeof isWidgetVisible }) => unknown) =>
    selector({ isWidgetVisible })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes: in the stats bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows sort buttons: status, threat, alerts', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: 'status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'threat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alerts' })).toBeInTheDocument()
  })

  it('shows Nodes tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Nodes/i })).toBeInTheDocument()
  })

  it('shows Incident tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Incident/i })).toBeInTheDocument()
  })

  it('shows Handover tab button', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Handover/i })).toBeInTheDocument()
  })

  it('clicking Incident tab shows the incident report content', () => {
    render(<CommandPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    })
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('node cards are rendered with known node IDs', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-ECHO-01')).toBeInTheDocument()
  })
})
