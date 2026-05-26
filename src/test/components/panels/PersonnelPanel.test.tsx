import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => {
      if (['navicGpsBoard', 'emergencyAlertDispatcher', 'personnelTracker', 'gprScanViewer', 'madFieldStrengthMap'].includes(w.id)) {
        return { ...w, visible: true }
      }
      return w
    }),
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('PersonnelPanel', () => {
  it('renders without throwing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Personnel count in stats bar', () => {
    render(<PersonnelPanel />)
    // Stats bar has "Personnel: 5" — use colon to distinguish from tab label "👥 Personnel (5)"
    expect(screen.getByText(/Personnel:/i)).toBeInTheDocument()
  })

  it('renders 5 personnel member names in the default tab', () => {
    render(<PersonnelPanel />)
    // Names are rendered as "P01: Cpl. Sharma" etc — use regex to match partial text
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Verma/i)).toBeInTheDocument()
    expect(screen.getByText(/Pvt\. Singh/i)).toBeInTheDocument()
    expect(screen.getByText(/Cpl\. Kumar/i)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Rao/i)).toBeInTheDocument()
  })

  it('shows GPR tab button when gprScanViewer is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /GPR/i })).toBeInTheDocument()
  })

  it('shows MAD tab button when madFieldStrengthMap is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /MAD/i })).toBeInTheDocument()
  })

  it('hides GPR tab when gprScanViewer widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'gprScanViewer' ? { ...w, visible: false } : w
      ),
    })
    render(<PersonnelPanel />)
    expect(screen.queryByRole('button', { name: /GPR/i })).not.toBeInTheDocument()
  })

  it('hides MAD tab when madFieldStrengthMap widget is invisible', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'madFieldStrengthMap' ? { ...w, visible: false } : w
      ),
    })
    render(<PersonnelPanel />)
    expect(screen.queryByRole('button', { name: /MAD/i })).not.toBeInTheDocument()
  })

  it('hides all personnel when personnelTracker widget is invisible and other tabs hidden', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        ['personnelTracker', 'navicGpsBoard'].includes(w.id) ? { ...w, visible: false } : w
      ),
    })
    render(<PersonnelPanel />)
    expect(screen.queryByText(/Cpl\. Sharma/i)).not.toBeInTheDocument()
  })

  it('shows no OOB warnings when all personnel are inside fence initially', () => {
    render(<PersonnelPanel />)
    // All personnel initialise with geofence: 'INSIDE'; no "OOB" warnings expected
    expect(screen.queryAllByText(/⚡ OOB/).length).toBe(0)
  })
})
