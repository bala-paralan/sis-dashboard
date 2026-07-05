import { create } from 'zustand'

export type ViewMode = 'minimized' | 'normal' | 'expanded'

const STORAGE_KEY = 'sis-view-state'

const VALID_MODES = new Set<ViewMode>(['minimized', 'normal', 'expanded'])

function loadPanelViews(): Record<string, ViewMode> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const result: Record<string, ViewMode> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (VALID_MODES.has(v as ViewMode)) {
        result[k] = v as ViewMode
      }
    }
    return result
  } catch {
    return {}
  }
}

function persistPanelViews(panelViews: Record<string, ViewMode>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(panelViews))
  } catch {
    // storage quota exceeded — silently ignore
  }
}

export function clearViewState() {
  localStorage.removeItem(STORAGE_KEY)
}

interface ViewState {
  panelViews: Record<string, ViewMode>
  expandedPanel: string | null
  setPanelView: (panelId: string, mode: ViewMode) => void
  toggleExpand: (panelId: string) => void
  toggleMinimize: (panelId: string) => void
  getView: (panelId: string) => ViewMode
}

function deriveExpandedPanel(panelViews: Record<string, ViewMode>): string | null {
  const entry = Object.entries(panelViews).find(([, m]) => m === 'expanded')
  return entry ? entry[0] : null
}

const initialViews = loadPanelViews()

export const useViewStore = create<ViewState>()((set, get) => ({
  panelViews: initialViews,
  expandedPanel: deriveExpandedPanel(initialViews),

  setPanelView: (panelId, mode) =>
    set((s) => {
      const panelViews = { ...s.panelViews, [panelId]: mode }
      persistPanelViews(panelViews)
      return {
        panelViews,
        expandedPanel:
          mode === 'expanded'
            ? panelId
            : s.expandedPanel === panelId
            ? null
            : s.expandedPanel,
      }
    }),

  // Toggle expanded — only one panel can be expanded at a time.
  // Expanding a new panel while another is expanded replaces it.
  toggleExpand: (panelId) =>
    set((s) => {
      const current = s.panelViews[panelId] ?? 'normal'
      const newMode: ViewMode = current === 'expanded' ? 'normal' : 'expanded'
      const panelViews = { ...s.panelViews, [panelId]: newMode }
      persistPanelViews(panelViews)
      return {
        panelViews,
        expandedPanel: newMode === 'expanded' ? panelId : null,
      }
    }),

  // Toggle minimized — independent of expanded state
  toggleMinimize: (panelId) =>
    set((s) => {
      const current = s.panelViews[panelId] ?? 'normal'
      const newMode: ViewMode = current === 'minimized' ? 'normal' : 'minimized'
      const panelViews = { ...s.panelViews, [panelId]: newMode }
      persistPanelViews(panelViews)
      return {
        panelViews,
        // If the panel being toggled was the expanded panel, clear expanded
        expandedPanel:
          s.expandedPanel === panelId
            ? null
            : s.expandedPanel,
      }
    }),

  getView: (panelId) => get().panelViews[panelId] ?? 'normal',
}))
