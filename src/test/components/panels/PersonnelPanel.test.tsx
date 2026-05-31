import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows personnel count in stats bar', () => {
    render(<PersonnelPanel />)
    // Shows "Personnel: <strong>5</strong>" in stats bar
    expect(screen.getByText('Personnel:')).toBeInTheDocument()
    expect(screen.getByText('5', { selector: 'strong' })).toBeInTheDocument()
  })

  it('renders personnel list with names by default', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Verma/i)).toBeInTheDocument()
  })

  it('renders MiniMap SVG', () => {
    render(<PersonnelPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows personnel roles in list', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Patrol Alpha/i)).toBeInTheDocument()
    expect(screen.getByText(/QRT Lead/i)).toBeInTheDocument()
  })

  it('shows battery percentage indicator for personnel', () => {
    render(<PersonnelPanel />)
    // Each row shows a battery icon with percentage
    const batteryIcons = screen.getAllByText(/🔋/)
    expect(batteryIcons.length).toBeGreaterThan(0)
  })

  it('shows Emergency Broadcast button when emergencyAlertDispatcher widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Emergency Broadcast/i)).toBeInTheDocument()
  })

  it('hides Emergency Broadcast button when emergencyAlertDispatcher widget is disabled', () => {
    useSettingsStore.getState().toggleWidget('emergencyAlertDispatcher')
    render(<PersonnelPanel />)
    expect(screen.queryByText(/Emergency Broadcast/i)).not.toBeInTheDocument()
  })

  it('shows GPR sub-tab when gprScanViewer widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows MAD sub-tab when madFieldStrengthMap widget is visible', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('shows Geofence boundary text in SVG', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Geofence boundary/i)).toBeInTheDocument()
  })
})
