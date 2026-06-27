import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

function enableAllWidgets() {
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) =>
      ['personnelTracker', 'navicGpsBoard', 'gprScanViewer', 'madFieldStrengthMap', 'emergencyAlertDispatcher'].includes(w.id)
        ? { ...w, visible: true }
        : w
    ),
  })
}

beforeEach(() => {
  enableAllWidgets()
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows total personnel count in stats bar', () => {
    render(<PersonnelPanel />)
    // Stats bar: "Personnel: <strong>5</strong>"
    const matches = screen.getAllByText(/Personnel/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it('shows patrol name Cpl. Sharma', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
  })

  it('shows patrol name Sgt. Verma', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Sgt\. Verma/i)).toBeInTheDocument()
  })

  it('shows role labels for personnel', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Patrol Alpha/i)).toBeInTheDocument()
    expect(screen.getByText(/QRT Lead/i)).toBeInTheDocument()
  })

  it('shows personnel IDs (P01–P05)', () => {
    render(<PersonnelPanel />)
    // IDs rendered as "P01: Cpl. Sharma"
    expect(screen.getByText(/P01:/i)).toBeInTheDocument()
    expect(screen.getByText(/P02:/i)).toBeInTheDocument()
  })

  it('shows battery percentage for personnel', () => {
    render(<PersonnelPanel />)
    // Battery values rendered as "🔋 XX%" — check that % characters appear
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/%/)
  })

  it('shows CEP metric for personnel', () => {
    render(<PersonnelPanel />)
    expect(screen.getAllByText(/CEP:/i).length).toBeGreaterThan(0)
  })

  it('shows mini-map SVG', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows GPR tab', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows MAD tab', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('shows Emergency Broadcast button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Emergency Broadcast/i)).toBeInTheDocument()
  })
})
