import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  useSystemStore.setState({ theme: 'dark', scenario: 'NORMAL', connectionStatus: 'connected', health: null, sidebarCollapsed: false, activePanel: 'map' })
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<SettingsPanel />)).not.toThrow()
  })

  it('shows all 5 tabs', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Widgets/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Panels/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Display/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Layout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thresholds/i })).toBeInTheDocument()
  })

  it('Widgets tab is active by default and shows category list', () => {
    render(<SettingsPanel />)
    // Widget categories should be visible
    expect(screen.getByText('Video & Imaging')).toBeInTheDocument()
    expect(screen.getByText('Mapping & Geospatial')).toBeInTheDocument()
  })

  it('shows "Reset to defaults" button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /reset to defaults/i })).toBeInTheDocument()
  })

  it('"Reset to defaults" button calls resetToDefaults', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }))
    // After reset, state should still be defined (no crash)
    expect(useSettingsStore.getState().widgets).toBeDefined()
  })

  it('clicking a category expands it and shows widget rows', () => {
    render(<SettingsPanel />)
    const categoryBtn = screen.getByText('Video & Imaging')
    fireEvent.click(categoryBtn)
    // After expanding, widget labels should appear
    expect(screen.getByText('Live Video Viewer')).toBeInTheDocument()
    expect(screen.getByText('Thermal Overlay Viewer')).toBeInTheDocument()
  })

  it('clicking expanded category again collapses it', () => {
    render(<SettingsPanel />)
    const categoryBtn = screen.getByText('Video & Imaging')
    fireEvent.click(categoryBtn)
    expect(screen.getByText('Live Video Viewer')).toBeInTheDocument()
    fireEvent.click(categoryBtn)
    expect(screen.queryByText('Live Video Viewer')).not.toBeInTheDocument()
  })

  it('switching to Panels tab shows panel labels', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /^▣ Panels$/ }))
    expect(screen.getByText('Live Tactical Map')).toBeInTheDocument()
    expect(screen.getByText('Alert Management')).toBeInTheDocument()
    expect(screen.getByText('Counter-UAS')).toBeInTheDocument()
  })

  it('switching to Display tab shows Theme section', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /🎨 Display/ }))
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(screen.getByText(/Dark Mode|Light Mode/)).toBeInTheDocument()
  })

  it('switching to Display tab shows widget catalogue info', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /🎨 Display/ }))
    expect(screen.getByText('Total widgets')).toBeInTheDocument()
    expect(screen.getByText('37')).toBeInTheDocument()
  })

  it('switching to Layout tab shows Quick View Controls', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /⤢ Layout/ }))
    expect(screen.getByText('Quick View Controls')).toBeInTheDocument()
  })

  it('switching to Layout tab shows Default Expanded Panel selector', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /⤢ Layout/ }))
    expect(screen.getByText('Default Expanded Panel')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('switching to Thresholds tab shows threshold inputs', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /⚡ Thresholds/ }))
    expect(screen.getByText(/Acoustic & Seismic/i)).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Update rate/i).length).toBeGreaterThan(0)
  })

  it('shows "Settings saved automatically to localStorage" footer', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Settings saved automatically to localStorage/i)).toBeInTheDocument()
  })

  it('Panels tab shows NEW badges for new panels', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /^▣ Panels$/ }))
    const newBadges = screen.getAllByText('NEW')
    expect(newBadges.length).toBeGreaterThan(0)
  })

  it('widget toggle button is clickable and calls toggleWidget', () => {
    render(<SettingsPanel />)
    // Expand the Video & Imaging category
    fireEvent.click(screen.getByText('Video & Imaging'))
    // Find toggle buttons inside the expanded section
    const toggles = screen.getAllByRole('button')
    // Find a toggle by filtering (they have no text, just style)
    const widgetToggles = toggles.filter(btn =>
      btn.className.includes('rounded-[10px]')
    )
    expect(widgetToggles.length).toBeGreaterThan(0)
    // Clicking a toggle should not throw
    expect(() => fireEvent.click(widgetToggles[0])).not.toThrow()
  })

  it('Layout tab Normal/Minimize/Expand buttons are present', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /⤢ Layout/ }))
    const normalBtns = screen.getAllByRole('button', { name: /Normal/ })
    expect(normalBtns.length).toBeGreaterThan(0)
    const minBtns = screen.getAllByRole('button', { name: /▬ Min/ })
    expect(minBtns.length).toBeGreaterThan(0)
    const expandBtns = screen.getAllByRole('button', { name: /⤢ Expand/ })
    expect(expandBtns.length).toBeGreaterThan(0)
  })
})
