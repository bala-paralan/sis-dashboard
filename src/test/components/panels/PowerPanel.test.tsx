import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PowerPanel } from '@/components/panels/PowerPanel'
import { useSettingsStore } from '@/store/settingsStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

function setupMocks(overrides: Record<string, boolean> = {}) {
  const defaults: Record<string, boolean> = {
    powerEnergyMonitor: true,
    vehicleHealthMonitor: true,
    ...overrides,
  }
  const isWidgetVisible = (id: string) => defaults[id] ?? true
  ;(useSettingsStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { isWidgetVisible: typeof isWidgetVisible }) => unknown) =>
    selector({ isWidgetVisible })
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  setupMocks()
})

describe('PowerPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PowerPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Nodes: count in the stats bar', () => {
    render(<PowerPanel />)
    expect(screen.getByText(/Nodes:/i)).toBeInTheDocument()
  })

  it('shows Power & Energy tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Power & Energy/i })).toBeInTheDocument()
  })

  it('shows Vehicle Health tab button', () => {
    render(<PowerPanel />)
    expect(screen.getByRole('button', { name: /Vehicle Health/i })).toBeInTheDocument()
  })

  it('shows BOP node IDs in power tab', () => {
    render(<PowerPanel />)
    expect(screen.getByText('BOP-ALPHA-01')).toBeInTheDocument()
    expect(screen.getByText('BOP-DELTA-01')).toBeInTheDocument()
  })

  it('clicking Vehicle Health tab shows vehicle callsigns', () => {
    render(<PowerPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Vehicle Health/i }))
    })
    expect(screen.getByText('Gypsy Alpha')).toBeInTheDocument()
    expect(screen.getByText('Stallion Bravo')).toBeInTheDocument()
  })

  it('vehicle Stallion Bravo shows WARNING status', () => {
    render(<PowerPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Vehicle Health/i }))
    })
    expect(screen.getByText('WARNING')).toBeInTheDocument()
  })
})
