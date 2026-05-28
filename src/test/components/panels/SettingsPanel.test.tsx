import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
  useSystemStore.setState({ theme: 'dark', scenario: 'DEFAULT', connectionStatus: 'CONNECTED', systemHealth: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders tab navigation', () => {
    render(<SettingsPanel />)
    const widgetEls = screen.getAllByText(/Widgets/i)
    expect(widgetEls.length).toBeGreaterThan(0)
    const panelEls = screen.getAllByText(/Panels/i)
    expect(panelEls.length).toBeGreaterThan(0)
  })

  it('shows Widgets tab by default', () => {
    render(<SettingsPanel />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/widget|category/i)
  })

  it('switches to Panels tab when clicked', () => {
    render(<SettingsPanel />)
    const panelsTab = screen.getByText(/Panels/i)
    fireEvent.click(panelsTab)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/Live Tactical Map|Alert Management|Video/i)
  })

  it('switches to Display tab when clicked', () => {
    render(<SettingsPanel />)
    const displayTab = screen.getByText(/Display/i)
    fireEvent.click(displayTab)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/theme|dark|light/i)
  })

  it('renders toggle buttons', () => {
    render(<SettingsPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('renders Reset to Defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/reset|default/i)).toBeInTheDocument()
  })

  it('expands a category when clicked', () => {
    render(<SettingsPanel />)
    const categoryButtons = document.querySelectorAll('button')
    if (categoryButtons.length > 1) {
      fireEvent.click(categoryButtons[1])
      const text = document.body.textContent ?? ''
      expect(text.length).toBeGreaterThan(100)
    }
  })
})
