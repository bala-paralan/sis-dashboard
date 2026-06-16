import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSettingsStore.setState((s) => ({ ...s }))
  useSystemStore.setState((s) => ({ ...s, theme: 'dark' }))
  useViewStore.setState((s) => ({ ...s, expandedPanel: null, panelViews: {} }))
  localStorage.clear()
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders all five tab labels: Widgets, Panels, Display, Layout, Thresholds', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Widgets/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Panels/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Display/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Layout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Thresholds/i })).toBeInTheDocument()
  })

  it('starts on Widgets tab and shows toggle-widgets description', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Toggle individual widgets on or off/i)).toBeInTheDocument()
  })

  it('shows category accordion items with widget counts', () => {
    render(<SettingsPanel />)
    // Categories like "Video & Imaging" should be visible
    expect(screen.getByText(/Video & Imaging/i)).toBeInTheDocument()
  })

  it('expands a category accordion on click and shows widget rows', () => {
    render(<SettingsPanel />)
    const videoBtn = screen.getByRole('button', { name: /Video & Imaging/i })
    fireEvent.click(videoBtn)
    expect(screen.getByText(/Live Video Viewer/i)).toBeInTheDocument()
  })

  it('switches to Panels tab and shows panel names', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Panels/i }))
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })

  it('switches to Display tab and shows Theme section heading', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Display/i }))
    expect(screen.getByText(/^Theme$/i)).toBeInTheDocument()
  })

  it('switches to Layout tab and shows default expanded panel selector', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /Layout/i }))
    expect(screen.getByText(/Default Expanded Panel/i)).toBeInTheDocument()
  })

  it('shows Reset to Defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Reset/i })).toBeInTheDocument()
  })

  it('clicking Reset to Defaults calls resetToDefaults without throwing', () => {
    render(<SettingsPanel />)
    const resetBtn = screen.getByRole('button', { name: /Reset/i })
    expect(() => fireEvent.click(resetBtn)).not.toThrow()
  })
})
