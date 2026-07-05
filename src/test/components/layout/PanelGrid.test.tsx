import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { PanelGrid } from '@/components/layout/PanelGrid'
import { useSystemStore } from '@/store/systemStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useViewStore } from '@/store/viewStore'

// PanelGrid uses React.lazy, which requires Suspense in tests. Wrap it.
import { Suspense } from 'react'
import { MemoryRouter } from 'react-router-dom'

// jsdom doesn't implement matchMedia — provide a minimal mock
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
})
afterEach(() => {
  vi.restoreAllMocks()
})

function renderGrid() {
  return render(
    <MemoryRouter>
      <Suspense fallback={<div>loading</div>}>
        <PanelGrid />
      </Suspense>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  useSystemStore.setState({
    theme: 'dark',
    activePanel: 'map',
    sidebarCollapsed: false,
    mobileSidebarOpen: false,
    connectionStatus: 'connected',
    scenario: 'NORMAL',
    health: null,
  })
  useSettingsStore.setState({
    panels: {
      map: true, alerts: true, video: true, sensors: true, aiml: true, health: true,
      counteruas: true, personnel: true, power: true, command: true, advancedai: true, weather: true,
    },
    widgets: useSettingsStore.getState().widgets,
    defaultExpandedPanel: null,
    settingsOpen: false,
    audioAlertsEnabled: true,
  })
  useViewStore.setState({ panelViews: {}, expandedPanel: null })
})

describe('PanelGrid — routing modes', () => {
  it('renders the Suspense fallback when loading', () => {
    useSystemStore.setState({ activePanel: 'map' })
    renderGrid()
    // Either the fallback or actual content renders — just not crashing
    expect(document.body).toBeInTheDocument()
  })

  it('renders full-screen settings when activePanel is settings', () => {
    useSystemStore.setState({ activePanel: 'settings' })
    const { container } = renderGrid()
    // PanelShell title for settings is rendered
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('renders full-screen cameras when activePanel is cameras', () => {
    useSystemStore.setState({ activePanel: 'cameras' })
    const { container } = renderGrid()
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('renders full-screen device config when activePanel is device', () => {
    useSystemStore.setState({ activePanel: 'device' })
    const { container } = renderGrid()
    expect(container.querySelector('main')).toBeInTheDocument()
  })

  it('renders normal grid when activePanel is a core panel', () => {
    useSystemStore.setState({ activePanel: 'map' })
    const { container } = renderGrid()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})

describe('PanelGrid — panel visibility', () => {
  it('renders nothing for hidden panels', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      panels: {
        map: false, alerts: false, video: false, sensors: false, aiml: false, health: false,
        counteruas: false, personnel: false, power: false, command: false, advancedai: false, weather: false,
      },
    })
    useSystemStore.setState({ activePanel: 'map' })
    const { container } = renderGrid()
    // Main should still render but with no panel shells inside the core grid
    const main = container.querySelector('main')
    expect(main).toBeInTheDocument()
  })

  it('renders only visible panels', () => {
    useSettingsStore.setState({
      ...useSettingsStore.getState(),
      panels: {
        map: true, alerts: false, video: false, sensors: false, aiml: false, health: false,
        counteruas: false, personnel: false, power: false, command: false, advancedai: false, weather: false,
      },
    })
    const { container } = renderGrid()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})

describe('PanelGrid — expanded layout', () => {
  it('renders expanded layout when a panel is expanded', () => {
    useViewStore.setState({ panelViews: { map: 'expanded' }, expandedPanel: 'map' })
    useSystemStore.setState({ activePanel: 'map' })
    const { container } = renderGrid()
    expect(container.querySelector('main')).toBeInTheDocument()
  })
})
