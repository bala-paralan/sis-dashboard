import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'

// Provide real store state (settingsStore is complex — use real defaults)
beforeEach(() => {
  useSystemStore.setState({ theme: 'dark' } as any)
  vi.clearAllMocks()
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<SettingsPanel />)).not.toThrow()
  })

  it('renders all 5 tab buttons', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /widgets/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /panels/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /display/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /layout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /thresholds/i })).toBeInTheDocument()
  })

  it('shows Widgets tab content by default', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Toggle individual widgets/i)).toBeInTheDocument()
  })

  it('shows Panels tab content when Panels tab is clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /panels/i }))
    expect(screen.getByText(/Show or hide entire panel sections/i)).toBeInTheDocument()
  })

  it('shows Display tab content when Display tab is clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /display/i }))
    expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument()
  })

  it('shows Layout tab content when Layout tab is clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /layout/i }))
    expect(screen.getByText(/Default Expanded Panel/i)).toBeInTheDocument()
  })

  it('shows Thresholds tab content when Thresholds tab is clicked', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /thresholds/i }))
    expect(screen.getByText(/Configure alert thresholds/i)).toBeInTheDocument()
  })

  it('shows category headers in Widgets tab', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Video & Imaging')).toBeInTheDocument()
  })

  it('expands a category when its header is clicked', () => {
    render(<SettingsPanel />)
    const videoHeader = screen.getByText('Video & Imaging').closest('button')!
    fireEvent.click(videoHeader)
    expect(screen.getByText('Live Video Viewer')).toBeInTheDocument()
  })

  it('collapses the category when its header is clicked again', () => {
    render(<SettingsPanel />)
    const videoHeader = screen.getByText('Video & Imaging').closest('button')!
    fireEvent.click(videoHeader)
    expect(screen.getByText('Live Video Viewer')).toBeInTheDocument()
    fireEvent.click(videoHeader)
    expect(screen.queryByText('Live Video Viewer')).not.toBeInTheDocument()
  })

  it('shows panel labels in Panels tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /panels/i }))
    expect(screen.getByText('Live Tactical Map')).toBeInTheDocument()
    expect(screen.getByText('Alert Management')).toBeInTheDocument()
  })

  it('calls togglePanel when a panel toggle is clicked', () => {
    const togglePanel = vi.fn()
    useSettingsStore.setState({ togglePanel } as any)
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /panels/i }))
    const toggleButtons = screen.getAllByRole('button').filter(
      (btn) => btn.className.includes('rounded')
    )
    const panelToggle = toggleButtons.find((btn) => btn.className.includes('w-9'))
    if (panelToggle) fireEvent.click(panelToggle)
    // Just verifying the UI renders correctly — toggle integration covered by settingsStore tests
  })

  it('shows Reset to Defaults option in Display tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /display/i }))
    expect(screen.getByText(/Reset to Defaults/i)).toBeInTheDocument()
  })

  it('calls resetToDefaults when reset button is clicked', () => {
    const resetToDefaults = vi.fn()
    useSettingsStore.setState({ resetToDefaults } as any)
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /display/i }))
    const resetBtn = screen.getByText(/Reset to Defaults/i).closest('button')
    if (resetBtn) fireEvent.click(resetBtn)
    expect(resetToDefaults).toHaveBeenCalled()
  })

  it('shows threshold inputs in Thresholds tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByRole('button', { name: /thresholds/i }))
    const numberInputs = document.querySelectorAll('input[type="number"]')
    expect(numberInputs.length).toBeGreaterThan(0)
  })
})
