import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
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

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Personnel count in stats bar', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel:/i)).toBeInTheDocument()
  })

  it('shows personnel count (5 members)', () => {
    render(<PersonnelPanel />)
    // 5 patrol names are defined
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders Emergency Broadcast button when emergencyAlertDispatcher visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /Emergency Broadcast/i })).toBeInTheDocument()
  })

  it('renders MiniMap SVG', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows personnel names from PATROL_NAMES', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
  })

  it('renders sub-tab buttons (Personnel, GPR, MAD)', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /Personnel/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /GPR/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /MAD/i })).toBeInTheDocument()
  })

  it('clicking GPR tab shows GPR content', () => {
    render(<PersonnelPanel />)
    fireEvent.click(screen.getByRole('button', { name: /GPR/i }))
    expect(screen.getByText(/Ground Penetrating Radar/i)).toBeInTheDocument()
  })

  it('clicking MAD tab shows MAD content', () => {
    render(<PersonnelPanel />)
    fireEvent.click(screen.getByRole('button', { name: /MAD/i }))
    expect(screen.getByText(/Magnetic Anomaly Detection/i)).toBeInTheDocument()
  })

  it('MAD tab shows sensor IDs (MAD-01..MAD-04)', () => {
    render(<PersonnelPanel />)
    fireEvent.click(screen.getByRole('button', { name: /MAD/i }))
    expect(screen.getByText('MAD-01')).toBeInTheDocument()
  })
})
