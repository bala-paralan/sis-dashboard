import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows FAR avg stat in header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg:/i)).toBeInTheDocument()
  })

  it('shows Rejected stat in header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected:/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) stat in header bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\):/i)).toBeInTheDocument()
  })

  it('renders SVG elements for heatmap', () => {
    render(<AdvancedAIPanel />)
    const svgs = document.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })

  it('shows heatmap tab content with time window buttons', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText('1h')).toBeInTheDocument()
    expect(screen.getByText('6h')).toBeInTheDocument()
    expect(screen.getByText('24h')).toBeInTheDocument()
  })

  it('shows Activity density heatmap label', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Activity density heatmap/i)).toBeInTheDocument()
  })

  it('shows High-activity zones section', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/High-activity zones/i)).toBeInTheDocument()
  })
})
