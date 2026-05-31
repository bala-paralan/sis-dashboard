import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes stat in the stats bar', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows node status section with node cards', () => {
    render(<CommandPanel />)
    // The grid of nodes should be rendered; BOP-ALPHA-01 is a fixed node id
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('shows multiple node ids', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-BETA-01/i)).toBeInTheDocument()
    expect(screen.getByText(/BOP-GAMMA-01/i)).toBeInTheDocument()
  })

  it('shows sort controls on the nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /status/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /threat/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /alerts/i })).toBeInTheDocument()
  })

  it('shows sub-tabs when all command widgets are visible', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: /Nodes/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Incident/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Handover/i })).toBeInTheDocument()
  })

  it('switches to Incident tab and shows report generator', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('switches to Handover tab and shows handover summary', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Handover/i }))
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
  })
})
