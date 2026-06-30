import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Widgets tab', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Widgets')).toBeInTheDocument()
  })

  it('shows Panels tab', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Panels')).toBeInTheDocument()
  })

  it('shows widget category names in Widgets tab', () => {
    render(<SettingsPanel />)
    // Widget categories like "Video & Imaging" should appear
    const body = document.body.textContent
    expect(body).toMatch(/Video|Mapping|Alerts|Radar|Acoustic/i)
  })

  it('shows reset to defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Reset to defaults/i)).toBeInTheDocument()
  })

  it('resets to defaults when reset button is clicked', () => {
    // First toggle a widget off
    act(() => {
      useSettingsStore.getState().togglePanel('map')
    })
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText(/Reset to defaults/i))
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('switches to Panels tab and shows panel-level visibility text', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    const body = document.body.textContent
    // Panels tab lists panel names
    expect(body).toMatch(/Map|Alert|Video|Sensor|AI|Health/i)
  })

  it('shows widget count fractions like "X/Y" in categories', () => {
    render(<SettingsPanel />)
    // category headers show "visible/total" like "2/4"
    const fractions = screen.queryAllByText(/\d+\/\d+/)
    expect(fractions.length).toBeGreaterThan(0)
  })
})

// Import act for store manipulation outside React component
import { act } from '@testing-library/react'
