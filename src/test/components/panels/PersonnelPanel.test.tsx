import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PersonnelPanel } from '@/components/panels/PersonnelPanel'
import { useSettingsStore } from '@/store/settingsStore'

vi.mock('@/store/settingsStore', () => ({
  useSettingsStore: vi.fn(),
}))

function setupMocks(overrides: Record<string, boolean> = {}) {
  const defaults: Record<string, boolean> = {
    navicGpsBoard: true,
    personnelTracker: true,
    gprScanViewer: true,
    madFieldStrengthMap: true,
    emergencyAlertDispatcher: true,
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

describe('PersonnelPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<PersonnelPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Personnel: count in the stats bar', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Personnel:/i)).toBeInTheDocument()
  })

  it('renders known patrol member names', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Cpl\. Sharma/i)).toBeInTheDocument()
    expect(screen.getByText(/Sgt\. Verma/i)).toBeInTheDocument()
  })

  it('shows the Emergency Broadcast button when widget is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /Emergency Broadcast/i })).toBeInTheDocument()
  })

  it('shows personnel tab button', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /Personnel/i })).toBeInTheDocument()
  })

  it('shows GPR tab button when gprScanViewer is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /GPR/i })).toBeInTheDocument()
  })

  it('shows MAD tab button when madFieldStrengthMap is enabled', () => {
    render(<PersonnelPanel />)
    expect(screen.getByRole('button', { name: /MAD/i })).toBeInTheDocument()
  })

  it('shows Geofence boundary in the map SVG', () => {
    render(<PersonnelPanel />)
    expect(screen.getByText(/Geofence boundary/i)).toBeInTheDocument()
  })
})
