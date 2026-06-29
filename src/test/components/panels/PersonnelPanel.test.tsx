import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState({
    ...useSettingsStore.getState(),
    isWidgetVisible: () => true,
  })
})

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows Personnel GPS heading', () => {
    render(<PersonnelPanel />)
    // "Personnel" appears in stats bar and tab label
    expect(screen.getAllByText(/Personnel/i).length).toBeGreaterThan(0)
  })

  it('shows patrol names from mock data', () => {
    render(<PersonnelPanel />)
    // Multiple patrol names are visible; just confirm at least one is present
    expect(screen.getAllByText(/Sharma|Verma|Singh|Kumar|Rao/).length).toBeGreaterThan(0)
  })

  it('renders emergency alert button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Emergency/i)).toBeInTheDocument()
  })

  it('renders GPR tab label', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
  })

  it('shows GPR and MAD tab labels', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/GPR/i)).toBeInTheDocument()
    expect(screen.getByText(/MAD/i)).toBeInTheDocument()
  })

  it('renders battery status indicators', () => {
    render(<PersonnelPanel />)
    // Battery shown as "🔋 n%" with no separate "Battery" label
    expect(screen.getAllByText(/🔋/).length).toBeGreaterThan(0)
  })

  it('shows geofence boundary on mini-map', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Geofence boundary/i)).toBeInTheDocument()
  })
})
