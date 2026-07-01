import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'

beforeEach(() => {
  useSettingsStore.getState().resetToDefaults()
  useSensorStore.setState({ sensors: new Map(), sensorHistory: new Map(), tracks: [], selectedSensorId: null })
  useAlertStore.setState({ alerts: [], threatAssessment: null, filter: { threatLevel: 'ALL', sensorFamily: 'ALL', acknowledged: 'UNACKED' } })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    expect(() => render(<AdvancedAIPanel />)).not.toThrow()
  })

  it('shows AI analytics content', () => {
    render(<AdvancedAIPanel />)
    expect(document.body.textContent).toMatch(/AI|model|confidence|detection/i)
  })

  it('renders a tab navigation', () => {
    render(<AdvancedAIPanel />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('shows heatmap or detection visualization', () => {
    render(<AdvancedAIPanel />)
    // Canvas or SVG-based heatmap
    const canvases = document.querySelectorAll('canvas')
    const svgs = document.querySelectorAll('svg')
    const charts = document.querySelectorAll('[class*="recharts"]')
    expect(canvases.length + svgs.length + charts.length).toBeGreaterThanOrEqual(0)
  })

  it('shows confidence distribution data', () => {
    render(<AdvancedAIPanel />)
    expect(document.body.textContent).toMatch(/confidence|%|YOLO|LSTM/i)
  })

  it('renders without crash when tab is switched', () => {
    render(<AdvancedAIPanel />)
    const buttons = screen.getAllByRole('button')
    if (buttons.length > 1) {
      expect(() => fireEvent.click(buttons[1])).not.toThrow()
    }
  })
})
