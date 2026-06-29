import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows node IDs', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/)).toBeInTheDocument()
  })

  it('renders ONLINE / DEGRADED / OFFLINE status labels', () => {
    render(<CommandPanel />)
    // Multiple nodes with different statuses
    expect(screen.getAllByText(/ONLINE|DEGRADED|OFFLINE/).length).toBeGreaterThan(0)
  })

  it('shows Incident Report section after switching tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/))
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('shows Export PDF button in incident tab', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/📋 Incident/))
    expect(screen.getByText(/Export PDF/i)).toBeInTheDocument()
  })

  it('shows Shift Handover section', () => {
    render(<CommandPanel />)
    // "📝 Handover" tab button is always visible when showHandover is true
    expect(screen.getByText(/Handover/i)).toBeInTheDocument()
  })

  it('shows sort controls in nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Sort:/i)).toBeInTheDocument()
  })

  it('shows CIBMS / NATGRID feed section', () => {
    render(<CommandPanel />)
    // appears in stats bar and in nodes tab content
    expect(screen.getAllByText(/CIBMS|NATGRID/i).length).toBeGreaterThan(0)
  })
})
