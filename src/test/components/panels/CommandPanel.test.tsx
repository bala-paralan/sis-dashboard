import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CommandPanel } from '@/components/panels/CommandPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CommandPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<CommandPanel />)).not.toThrow()
  })

  it('shows node status counts in the stats bar', () => {
    render(<CommandPanel />)
    // The stats bar shows "Nodes: X/5"
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows the Nodes tab by default', () => {
    render(<CommandPanel />)
    // Should show node IDs
    expect(screen.getByText(/BOP-ALPHA-01/i)).toBeInTheDocument()
  })

  it('renders node cards for each BOP node', () => {
    render(<CommandPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-BETA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-GAMMA-01')).toBeInTheDocument()
  })

  it('switches to Incident tab when clicked', () => {
    render(<CommandPanel />)
    const incidentTab = screen.getByRole('button', { name: /Incident/i })
    fireEvent.click(incidentTab)
    expect(screen.getByText(/Incident Report Generator/i)).toBeInTheDocument()
  })

  it('switches to Handover tab when clicked', () => {
    render(<CommandPanel />)
    const handoverTab = screen.getByRole('button', { name: /Handover/i })
    fireEvent.click(handoverTab)
    expect(screen.getByText(/Shift Handover Summary/i)).toBeInTheDocument()
  })

  it('Incident tab shows textarea for narrative', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Incident/i }))
    expect(screen.getByPlaceholderText(/narrative description/i)).toBeInTheDocument()
  })

  it('Handover tab shows textarea for notes', () => {
    render(<CommandPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Handover/i }))
    expect(screen.getByPlaceholderText(/handover notes/i)).toBeInTheDocument()
  })

  it('sort buttons exist on Nodes tab', () => {
    render(<CommandPanel />)
    expect(screen.getByRole('button', { name: 'status' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'threat' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'alerts' })).toBeInTheDocument()
  })

  it('changes sort when a sort button is clicked', () => {
    render(<CommandPanel />)
    const threatBtn = screen.getByRole('button', { name: 'threat' })
    fireEvent.click(threatBtn)
    // After clicking, threat button should have active styling (bg-accent-blue)
    expect(threatBtn.className).toMatch(/bg-accent-blue/)
  })
})
