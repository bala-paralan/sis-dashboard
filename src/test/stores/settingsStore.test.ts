import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/store/settingsStore'

beforeEach(() => {
  useSettingsStore.setState(useSettingsStore.getInitialState())
})

describe('settingsStore', () => {
  it('initialises with default widgets', () => {
    const state = useSettingsStore.getState()
    expect(state.widgets.length).toBeGreaterThan(0)
  })

  it('isWidgetVisible returns true for a visible widget', () => {
    const { isWidgetVisible } = useSettingsStore.getState()
    expect(isWidgetVisible('liveVideoViewer')).toBe(true)
  })

  it('isWidgetVisible returns false for a hidden widget (terrainView3D)', () => {
    const { isWidgetVisible } = useSettingsStore.getState()
    expect(isWidgetVisible('terrainView3D')).toBe(false)
  })

  it('toggleWidget flips visibility', () => {
    useSettingsStore.getState().toggleWidget('liveVideoViewer')
    expect(useSettingsStore.getState().isWidgetVisible('liveVideoViewer')).toBe(false)
  })

  it('toggleWidget re-enables after second toggle', () => {
    useSettingsStore.getState().toggleWidget('liveVideoViewer')
    useSettingsStore.getState().toggleWidget('liveVideoViewer')
    expect(useSettingsStore.getState().isWidgetVisible('liveVideoViewer')).toBe(true)
  })

  it('widgetsByCategory returns grouped widgets', () => {
    const grouped = useSettingsStore.getState().widgetsByCategory()
    expect(typeof grouped).toBe('object')
    expect(Object.keys(grouped).length).toBeGreaterThan(0)
    expect(grouped['Video & Imaging']).toBeDefined()
  })

  it('togglePanel sets a panel to false', () => {
    useSettingsStore.getState().togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(false)
  })

  it('togglePanel re-enables after second toggle', () => {
    useSettingsStore.getState().togglePanel('map')
    useSettingsStore.getState().togglePanel('map')
    expect(useSettingsStore.getState().panels['map']).toBe(true)
  })

  it('setDefaultExpandedPanel updates the value', () => {
    useSettingsStore.getState().setDefaultExpandedPanel('alerts')
    expect(useSettingsStore.getState().defaultExpandedPanel).toBe('alerts')
  })

  it('resetToDefaults restores initial widget visibilities', () => {
    useSettingsStore.getState().toggleWidget('liveVideoViewer')
    useSettingsStore.getState().resetToDefaults()
    expect(useSettingsStore.getState().isWidgetVisible('liveVideoViewer')).toBe(true)
  })
})
