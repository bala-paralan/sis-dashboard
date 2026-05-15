import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SettingsPanel } from '@/components/panels/SettingsPanel'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

vi.mock('@/store/systemStore', () => ({
  useSystemStore: vi.fn(),
}))

vi.mock('@/store/viewStore', () => ({
  useViewStore: vi.fn(),
}))

function setupMocks() {
  ;(useSystemStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { theme: string; toggleTheme: () => void }) => unknown) =>
    selector({ theme: 'dark', toggleTheme: vi.fn() })
  )
  ;(useViewStore as unknown as ReturnType<typeof vi.fn>).mockImplementation((selector: (s: { toggleExpand: () => void; setPanelView: () => void; expandedPanel: null }) => unknown) =>
    selector({ toggleExpand: vi.fn(), setPanelView: vi.fn(), expandedPanel: null })
  )
}

beforeEach(() => {
  setupMocks()
  // Reset the real settings store to defaults before each test
  useSettingsStore.getState().resetToDefaults()
})

describe('SettingsPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(<SettingsPanel />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('shows Widgets tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Widgets/i })).toBeInTheDocument()
  })

  it('shows Panels tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Panels/i })).toBeInTheDocument()
  })

  it('shows Display tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Display/i })).toBeInTheDocument()
  })

  it('shows Layout tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Layout/i })).toBeInTheDocument()
  })

  it('shows Thresholds tab button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Thresholds/i })).toBeInTheDocument()
  })

  it('clicking Panels tab shows panel list content', () => {
    render(<SettingsPanel />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /Panels/i }))
    })
    expect(screen.getByText(/Live Tactical Map/i)).toBeInTheDocument()
    expect(screen.getByText(/Alert Management/i)).toBeInTheDocument()
  })

  it('shows Reset to defaults button', () => {
    render(<SettingsPanel />)
    expect(screen.getByRole('button', { name: /Reset to defaults/i })).toBeInTheDocument()
  })
})
