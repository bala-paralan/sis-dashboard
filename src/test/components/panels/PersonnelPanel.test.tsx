import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Personnel count in toolbar', () => {
    render(<PersonnelPanel />)
    expect(screen.getAllByText(/Personnel/i).length).toBeGreaterThan(0)
  })

  it('shows Personnel tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel \(\d+\)/i)).toBeInTheDocument()
  })

  it('shows GPR tab button when widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR \(\d+\)/i)).toBeInTheDocument()
  })

  it('shows MAD tab button when widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('renders personnel names from simulation data', () => {
    render(<PersonnelPanel />)
    const names = ['Sharma', 'Verma', 'Singh', 'Kumar', 'Rao']
    const found = names.filter((n) => screen.queryByText(new RegExp(n, 'i')) !== null)
    expect(found.length).toBeGreaterThan(0)
  })

  it('hides Personnel tab when personnelTracker and navicGpsBoard widgets are both hidden', () => {
    useSettingsStore.getState().toggleWidget('personnelTracker')
    useSettingsStore.getState().toggleWidget('navicGpsBoard')
    render(<PersonnelPanel />)
    expect(screen.queryByText(/Personnel \(\d+\)/i)).not.toBeInTheDocument()
  })

  it('hides GPR tab when gprScanViewer widget is hidden', () => {
    useSettingsStore.getState().toggleWidget('gprScanViewer')
    render(<PersonnelPanel />)
    expect(screen.queryByText(/GPR \(\d+\)/i)).not.toBeInTheDocument()
  })

  it('hides MAD tab when madFieldStrengthMap widget is hidden', () => {
    useSettingsStore.getState().toggleWidget('madFieldStrengthMap')
    render(<PersonnelPanel />)
    expect(screen.queryByText(/🧲 MAD/)).not.toBeInTheDocument()
  })
})
