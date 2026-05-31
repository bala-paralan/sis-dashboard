import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  localStorage.clear()
  useSettingsStore.getState().resetToDefaults()
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows all five main tab labels', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Widgets')).toBeInTheDocument()
    expect(screen.getByText('Panels')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Thresholds')).toBeInTheDocument()
  })

  it('shows widget category list on the Widgets tab by default', () => {
    render(<SettingsPanel />)
    // Should show at least some category names
    expect(screen.getByText(/Video & Imaging/i)).toBeInTheDocument()
    expect(screen.getByText(/Mapping & Geospatial/i)).toBeInTheDocument()
  })

  it('shows Reset to defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Reset to defaults/i)).toBeInTheDocument()
  })

  it('switches to Panels tab and shows panel list', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
    expect(screen.getByText(/Alert Management/i)).toBeInTheDocument()
    expect(screen.getByText(/Counter-UAS/i)).toBeInTheDocument()
  })

  it('switches to Display tab and shows Theme section', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Display'))
    expect(screen.getByText(/Theme/i)).toBeInTheDocument()
    expect(screen.getByText(/Dark Mode|Light Mode/i)).toBeInTheDocument()
  })

  it('shows Widget Catalogue Info on Display tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Display'))
    expect(screen.getByText(/Widget Catalogue Info/i)).toBeInTheDocument()
    expect(screen.getByText(/Total widgets/i)).toBeInTheDocument()
  })

  it('switches to Layout tab and shows Default Expanded Panel selector', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Layout'))
    expect(screen.getByText(/Default Expanded Panel/i)).toBeInTheDocument()
    expect(screen.getByText(/Quick View Controls/i)).toBeInTheDocument()
  })

  it('switches to Thresholds tab and shows threshold config section', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Thresholds'))
    // Shows at least one of the threshold categories
    expect(screen.getByText(/Acoustic & Seismic/i)).toBeInTheDocument()
  })

  it('expands a widget category when clicked', () => {
    render(<SettingsPanel />)
    // Click Video & Imaging category header to expand it
    const catBtn = screen.getByText(/Video & Imaging/i)
    fireEvent.click(catBtn)
    expect(screen.getByText(/Live Video Viewer/i)).toBeInTheDocument()
  })

  it('shows NEW badge for new panels in Panels tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    const newBadges = screen.getAllByText('NEW')
    expect(newBadges.length).toBeGreaterThan(0)
  })
})
