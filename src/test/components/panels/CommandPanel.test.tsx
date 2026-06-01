import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({ ...w, visible: true })),
  } as never)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<CommandPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders BOP nodes in nodes tab (BOP-ALPHA-01)', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders BOP-ECHO-01 node', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/BOP-ECHO-01/i)).toBeInTheDocument()
  })

  it('renders sort controls for nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: 'status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'threat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alerts' })).toBeInTheDocument()
  })

  it('renders incident report section when tab clicked', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('renders shift handover section when tab clicked', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Handover/i }))
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
  })

  it('renders CIBMS / NATGRID feed section in nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByText(/CIBMS \/ NATGRID Feed/i)).toBeInTheDocument()
  })

  it('shows OFFLINE status for BOP-ECHO-01', () => {
    render(<CommandPanel />)
    expect(screen.getByText('OFFLINE')).toBeInTheDocument()
  })

  it('shows DEGRADED status for at least one node', () => {
    render(<CommandPanel />)
    const degraded = screen.getAllByText('DEGRADED')
    expect(degraded.length).toBeGreaterThan(0)
  })
})
