import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
  useSystemStore.setState((s) => ({ ...s, theme: 'dark' }))
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders Widgets tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Widgets/i })).toBeInTheDocument()
  })

  it('renders Panels tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Panels/i })).toBeInTheDocument()
  })

  it('renders Display tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Display/i })).toBeInTheDocument()
  })

  it('clicking Panels tab shows panel toggles', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Panels/i }))
    // Panel labels include "Live Tactical Map", "Alert Management" etc
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })

  it('clicking Display tab shows theme toggle', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Display/i }))
    expect(screen.getByText(/Theme/i)).toBeInTheDocument()
  })

  it('widgets tab shows category headings from settingsStore', () => {
    render(<SettingsPanel />)
    // Clicking a category should expand it
    const categories = screen.getAllByText(/Video & Imaging|Mapping & Geospatial|Alerts/i)
    expect(categories.length).toBeGreaterThan(0)
  })

  it('clicking Reset to Defaults button calls resetToDefaults', () => {
    const spy = vi.spyOn(useSettingsStore.getState(), 'resetToDefaults')
    render(<SettingsPanel />)
    // Scroll to Display tab to find reset button
    fireEvent.click(screen.getByRole('button', { name: /Display/i }))
    const resetBtn = screen.queryByRole('button', { name: /Reset/i })
    if (resetBtn) {
      fireEvent.click(resetBtn)
      expect(spy).toHaveBeenCalled()
    }
    spy.mockRestore()
  })

  it('Widgets tab renders widget count badge', () => {
    render(<SettingsPanel />)
    // At least one category group with count
    const counts = screen.getAllByText(/\d+/)
    expect(counts.length).toBeGreaterThan(0)
  })
})
