import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
  useSystemStore.setState({ theme: 'dark', toggleTheme: useSystemStore.getState().toggleTheme })
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows all five tab labels', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Widgets')).toBeInTheDocument()
    expect(screen.getByText('Panels')).toBeInTheDocument()
    expect(screen.getByText('Display')).toBeInTheDocument()
    expect(screen.getByText('Layout')).toBeInTheDocument()
    expect(screen.getByText('Thresholds')).toBeInTheDocument()
  })

  it('switches to Panels tab on click', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
  })

  it('switches to Display tab on click', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Display'))
    expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument()
  })

  it('shows widget categories in Widgets tab', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Video & Imaging/i)).toBeInTheDocument()
  })

  it('shows Reset to Defaults button in Layout tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Layout'))
    expect(screen.getByText(/Reset to Defaults/i)).toBeInTheDocument()
  })

  it('toggles category expansion on click', () => {
    render(<SettingsPanel />)
    const categoryBtn = screen.getByText(/Video & Imaging/i).closest('button')
    if (categoryBtn) {
      fireEvent.click(categoryBtn)
      expect(screen.getByText('Live Video Viewer')).toBeInTheDocument()
    }
  })
})
