import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSystemStore.setState({ theme: 'dark', scenario: 'NORMAL', connectionStatus: 'connected', health: null, sidebarCollapsed: false, activePanel: 'map' })
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows all 5 tab labels', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Widgets')).toBeInTheDocument()
    expect(screen.getByText('Panels')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Thresholds')).toBeInTheDocument()
  })

  it('shows widget categories on widgets tab by default', () => {
    render(<SettingsPanel />)
    // At least one category header should be visible
    expect(screen.getByText(/Video & Imaging/i)).toBeInTheDocument()
  })

  it('expands a category on click', () => {
    render(<SettingsPanel />)
    const categoryBtn = screen.getByText(/Video & Imaging/i)
    fireEvent.click(categoryBtn)
    // Widget labels visible after expansion
    expect(screen.getByText(/Live Video Viewer/i)).toBeInTheDocument()
  })

  it('switches to Panels tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })

  it('shows all panels on panels tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    expect(screen.getByText(/Alert Management/i)).toBeInTheDocument()
    expect(screen.getByText(/Video \/ Imaging/i)).toBeInTheDocument()
    expect(screen.getByText(/Counter-UAS/i)).toBeInTheDocument()
  })

  it('switches to Display tab and shows theme options', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Display'))
    expect(screen.getByText(/Theme/i)).toBeInTheDocument()
    // theme='dark' renders "🌙 Dark Mode"
    expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument()
  })

  it('switches to Layout tab and shows Quick View Controls', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Layout'))
    expect(screen.getByText(/Quick View Controls/i)).toBeInTheDocument()
  })

  it('switches to Thresholds tab and shows update rate label', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Thresholds'))
    // Multiple "Update rate" labels appear (one per widget) — check at least one exists
    const labels = screen.getAllByText(/Update rate/i)
    expect(labels.length).toBeGreaterThan(0)
  })

  it('shows Reset to Defaults button on widgets tab', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Reset/i)).toBeInTheDocument()
  })

  it('shows NEW badges for new panels', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    // NEW badge is rendered for new panels
    const newBadges = screen.getAllByText('NEW')
    expect(newBadges.length).toBeGreaterThan(0)
  })
})
