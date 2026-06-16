import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({
    ...s,
    widgets: s.widgets.map((w) => {
      const ids = ['navicGpsBoard', 'personnelTracker', 'gprScanViewer', 'madFieldStrengthMap', 'emergencyAlertDispatcher']
      return ids.includes(w.id) ? { ...w, visible: true } : w
    }),
  }))
  vi.useFakeTimers()
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
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders Emergency Broadcast button when emergencyAlertDispatcher is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /Emergency Broadcast/i })).toBeInTheDocument()
  })

  it('shows personnel tab label with count', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel \(5\)/i)).toBeInTheDocument()
  })

  it('shows GPR tab when gprScanViewer is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows MAD tab when madFieldStrengthMap is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('renders SVG mini-map for personnel positions', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows patrol names in personnel list', () => {
    render(<PersonnelPanel />)
    expect(screen.getAllByText(/Sharma|Verma|Singh|Kumar|Rao/i).length).toBeGreaterThan(0)
  })

  it('hides Emergency Broadcast button when dispatcher widget is disabled', () => {
    useSettingsStore.setState((s) => ({
      ...s,
      widgets: s.widgets.map((w) =>
        w.id === 'emergencyAlertDispatcher' ? { ...w, visible: false } : w
      ),
    }))
    render(<PersonnelPanel />)
    expect(screen.queryByRole('button', { name: /Emergency Broadcast/i })).not.toBeInTheDocument()
  })
})
