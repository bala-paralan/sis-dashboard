import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { AdvancedAIPanel } from '@/components/panels/AdvancedAIPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useAlertStore } from '@/store/alertStore'
import { useSensorStore } from '@/store/sensorStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

vi.mock('@/store/alertStore', () => ({
  useAlertStore: vi.fn(),
}))

vi.mock('@/store/sensorStore', () => ({
  useSensorStore: vi.fn(),
}))

function setupMocks() {
  const isWidgetVisible = (id: string) => {
    const visible: Record<string, boolean> = {
      behaviouralPatternHeatmap: true,
      falseAlarmRateTracker: true,
      aiModelConfidenceMonitor: true,
    }
    return visible[id] ?? true
  }
  ;(useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { isWidgetVisible: typeof isWidgetVisible }) => unknown) =>
    selector({ isWidgetVisible })
  )
  ;(useAlertStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { alerts: unknown[] }) => unknown) =>
    selector({ alerts: [] })
  )
  ;(useSensorStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { sensors: Map<string, unknown> }) => unknown) =>
    selector({ sensors: new Map() })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('AdvancedAIPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdvancedAIPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows FAR avg in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/FAR avg:/i)).toBeInTheDocument()
  })

  it('shows Rejected count in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Rejected:/i)).toBeInTheDocument()
  })

  it('shows Alerts (7d) in the stats bar', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByText(/Alerts \(7d\):/i)).toBeInTheDocument()
  })

  it('shows Heatmap tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Heatmap/i })).toBeInTheDocument()
  })

  it('shows False Alarm tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /False Alarm/i })).toBeInTheDocument()
  })

  it('shows Confidence tab button', () => {
    render(<AdvancedAIPanel />)
    expect(screen.getByRole('button', { name: /Confidence/i })).toBeInTheDocument()
  })

  it('clicking False Alarm tab switches content', () => {
    render(<AdvancedAIPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /False Alarm/i }))
    })
    expect(screen.getByText(/Per-sensor false alarm rate/i)).toBeInTheDocument()
  })
})
