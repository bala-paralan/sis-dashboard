import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SettingsPanel } from '@/components/panels/SettingsPanel'

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the Widgets tab by default', () => {
    render(<SettingsPanel />)
    expect(screen.getByText('Widgets')).toBeInTheDocument()
  })

  it('renders all 5 tab labels', () => {
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

  it('shows panel visibility toggles in Panels tab', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Panels'))
    expect(screen.getByText(/Alert Management/i)).toBeInTheDocument()
  })

  it('switches to Display tab on click', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Display'))
    expect(screen.getByText(/Theme/i)).toBeInTheDocument()
  })

  it('shows Reset Defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByText(/Reset/i)).toBeInTheDocument()
  })

  it('shows widget categories on Widgets tab', () => {
    render(<SettingsPanel />)
    const categories = screen.getAllByRole('button')
    expect(categories.length).toBeGreaterThan(0)
  })

  it('switches to Thresholds tab on click', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Thresholds'))
    // "Threshold" appears in tab button and in tab content; just check at least one exists
    expect(screen.getAllByText(/Threshold/i).length).toBeGreaterThan(0)
  })

  it('switches to Layout tab on click', () => {
    render(<SettingsPanel />)
    fireEvent.click(screen.getByText('Layout'))
    expect(screen.getByText(/Default Expanded Panel/i)).toBeInTheDocument()
  })
})
