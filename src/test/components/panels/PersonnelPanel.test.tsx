import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  vi.useFakeTimers()
  useSettingsStore.setState({
    widgets: useSettingsStore.getState().widgets.map((w) => ({
      ...w,
      visible: true,
    })),
  })
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

  it('renders SVG mini map', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows known patrol member names', () => {
    render(<PersonnelPanel />)
    expect(screen.getAllByText(/Sharma|Verma|Singh|Kumar|Rao/).length).toBeGreaterThan(0)
  })

  it('shows personnel tab by default', () => {
    render(<PersonnelPanel />)
    expect(screen.getAllByText(/Personnel/).length).toBeGreaterThan(0)
  })

  it('shows GPR tab when gprScanViewer is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows MAD tab when madFieldStrengthMap is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('switches to GPR tab on click', () => {
    render(<PersonnelPanel />)
    const gprTab = screen.getByText(/GPR/i)
    fireEvent.click(gprTab)
    // After clicking GPR tab, GPR-specific content should be visible (either events or empty state)
    const anomaliesHeader = screen.queryByText(/Ground Penetrating Radar/i)
    const noAnomalies = screen.queryByText(/No GPR anomalies detected/i)
    expect(anomaliesHeader !== null || noAnomalies !== null).toBe(true)
  })

  it('switches to MAD tab on click', () => {
    render(<PersonnelPanel />)
    // Click the tab button (not just any element with "MAD")
    const madButtons = screen.getAllByRole('button', { name: /MAD/i })
    fireEvent.click(madButtons[0])
    // MAD tab shows sensor IDs like MAD-01 (multiple)
    expect(screen.getAllByText(/MAD-0/i).length).toBeGreaterThan(0)
  })

  it('shows Emergency Broadcast button when emergencyAlertDispatcher is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Emergency Broadcast/i)).toBeInTheDocument()
  })

  it('hides Emergency Broadcast when emergencyAlertDispatcher widget is disabled', () => {
    useSettingsStore.setState({
      widgets: useSettingsStore.getState().widgets.map((w) =>
        w.id === 'emergencyAlertDispatcher' ? { ...w, visible: false } : w
      ),
    })
    render(<PersonnelPanel />)
    expect(screen.queryByText(/Emergency Broadcast/i)).not.toBeInTheDocument()
  })

  it('shows battery indicator for each personnel', () => {
    render(<PersonnelPanel />)
    const batteryEls = screen.getAllByText(/🔋/)
    expect(batteryEls.length).toBeGreaterThan(0)
  })
})
