import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  vi.spyOn(Math, 'random').mockReturnValue(0.5)
  // Ensure all command widgets are visible
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) =>
      ['multiNodeOverview', 'incidentReportGenerator', 'shiftHandoverSummary'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  }))
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows BOP node IDs in the nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-BETA-01/i)).toBeInTheDocument()
  })

  it('shows ONLINE and DEGRADED status badges', () => {
    render(<CommandPanel />)
    // Multiple nodes share the same status — use getAllByText
    const onlineBadges = screen.getAllByText('ONLINE')
    expect(onlineBadges.length).toBeGreaterThan(0)
    const degradedBadges = screen.getAllByText('DEGRADED')
    expect(degradedBadges.length).toBeGreaterThan(0)
  })

  it('shows Incident and Handover tab buttons', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Incident/i)).toBeInTheDocument()
    expect(screen.getByText(/Handover/i)).toBeInTheDocument()
  })

  it('switches to Incident tab and shows a textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Incident/i))
    const textareas = screen.getAllByRole('textbox')
    expect(textareas.length).toBeGreaterThan(0)
  })

  it('user can type into the incident report textarea', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Incident/i))
    const textarea = screen.getAllByRole('textbox')[0]
    fireEvent.change(textarea, { target: { value: 'Incident at sector 3' } })
    expect((textarea as HTMLTextAreaElement).value).toBe('Incident at sector 3')
  })

  it('switches to Handover tab on click', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByText(/Handover/i))
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
  })
})
