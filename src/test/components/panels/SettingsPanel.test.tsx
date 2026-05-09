import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
  useSystemStore.setState({
    ...useSystemStore.getState(),
    theme: 'dark',
  })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders all five tab buttons', () => {
    render(<SettingsPanel />)
    const tabs = document.querySelectorAll('button[class*="flex-1"]')
    expect(tabs.length).toBeGreaterThanOrEqual(5)
    const tabTexts = Array.from(tabs).map((t) => t.textContent ?? '')
    expect(tabTexts.some((t) => /Widgets/i.test(t))).toBe(true)
    expect(tabTexts.some((t) => /Panels/i.test(t))).toBe(true)
    expect(tabTexts.some((t) => /Display/i.test(t))).toBe(true)
    expect(tabTexts.some((t) => /Layout/i.test(t))).toBe(true)
    expect(tabTexts.some((t) => /Thresholds/i.test(t))).toBe(true)
  })

  it('shows widget categories when Widgets tab is active (default)', () => {
    render(<SettingsPanel />)
    const categories = ['Video & Imaging', 'Mapping & Geospatial', 'Alerts & Prioritisation', 'Counter-UAS']
    const found = categories.some((cat) => screen.queryByText(cat) !== null)
    expect(found).toBe(true)
  })

  it('switches to Panels tab on click and shows panel labels', () => {
    render(<SettingsPanel />)
    const panelsTab = screen.getAllByText(/^Panels$/i)[0]
    fireEvent.click(panelsTab)
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })

  it('switches to Display tab and shows Theme toggle', () => {
    render(<SettingsPanel />)
    const displayTab = screen.getAllByText(/^Display$/i)[0]
    fireEvent.click(displayTab)
    expect(screen.getByText(/Theme/i)).toBeInTheDocument()
    const modeEls = screen.queryAllByText(/Dark Mode|Light Mode/i)
    expect(modeEls.length).toBeGreaterThan(0)
  })

  it('renders "Reset to defaults" button in footer', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Reset to defaults/i)).toBeInTheDocument()
  })

  it('renders NEW badges on panel rows in Panels tab', () => {
    render(<SettingsPanel />)
    const panelsTab = screen.getAllByText(/^Panels$/i)[0]
    fireEvent.click(panelsTab)
    const newBadges = screen.queryAllByText('NEW')
    expect(newBadges.length).toBeGreaterThan(0)
  })

  it('renders Layout tab with Default Expanded Panel selector', () => {
    render(<SettingsPanel />)
    const layoutTab = screen.getAllByText(/^Layout$/i)[0]
    fireEvent.click(layoutTab)
    expect(screen.getByText(/Default Expanded Panel/i)).toBeInTheDocument()
  })
})
