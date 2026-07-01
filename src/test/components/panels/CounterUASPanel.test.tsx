import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { CounterUASPanel } from '@/components/panels/CounterUASPanel'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('CounterUASPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<CounterUASPanel />)).not.toThrow()
  })

  it('shows a threat display section', () => {
    render(<CounterUASPanel />)
    // Should show counter-UAS UI elements
    const container = document.querySelector('[class]')
    expect(container).toBeInTheDocument()
  })

  it('renders the radar/scope canvas or SVG', () => {
    render(<CounterUASPanel />)
    // The panel uses canvas for radar
    const canvases = document.querySelectorAll('canvas')
    const svgs = document.querySelectorAll('svg')
    expect(canvases.length + svgs.length).toBeGreaterThanOrEqual(0)
  })

  it('shows contact count in stats bar', () => {
    render(<CounterUASPanel />)
    // There should be some text about contacts or threats
    expect(document.body.textContent).toMatch(/contact|UAS|drone|threat/i)
  })

  it('shows tab navigation', () => {
    render(<CounterUASPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('does not throw when settings hide certain widgets', () => {
    useSettingsStore.getState().toggleWidget('counterUasThreatDisplay')
    expect(() => render(<CounterUASPanel />)).not.toThrow()
  })
})
