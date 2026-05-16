import { useEffect } from 'react'
import { useViewStore } from '@/store/viewStore'
import { useSystemStore } from '@/store/systemStore'

// Panel ids in left-sidebar order (Alt+1 … Alt+9)
export const SHORTCUT_PANELS = [
  'map', 'alerts', 'video', 'sensors', 'aiml',
  'health', 'counteruas', 'personnel', 'power',
]

export const SHORTCUT_DESCRIPTIONS = [
  { keys: 'Alt+1 … Alt+9', description: 'Toggle-expand panel 1–9' },
  { keys: 'Escape',         description: 'Collapse expanded panel' },
  { keys: 'Alt+M',          description: 'Mute / unmute alert beeps' },
  { keys: 'Alt+?',          description: 'Show keyboard shortcut legend' },
]

interface Options {
  onShowLegend?: () => void
}

export function useKeyboardShortcuts({ onShowLegend }: Options = {}) {
  const toggleExpand      = useViewStore((s) => s.toggleExpand)
  const expandedPanel     = useViewStore((s) => s.expandedPanel)
  const setPanelView      = useViewStore((s) => s.setPanelView)
  const toggleMutedAlerts = useSystemStore((s) => s.toggleMutedAlerts)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      // Don't steal shortcuts when user is typing in an input/textarea/select
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        // Alt+1 … Alt+9 → toggle-expand panel
        const digit = parseInt(e.key, 10)
        if (digit >= 1 && digit <= 9) {
          const panelId = SHORTCUT_PANELS[digit - 1]
          if (panelId) {
            e.preventDefault()
            toggleExpand(panelId)
          }
          return
        }

        // Alt+M → mute/unmute
        if (e.key === 'm' || e.key === 'M') {
          e.preventDefault()
          toggleMutedAlerts()
          return
        }

        // Alt+? → show shortcut legend
        if (e.key === '?' || e.key === '/') {
          e.preventDefault()
          onShowLegend?.()
          return
        }
      }

      // Escape → collapse expanded panel
      if (e.key === 'Escape' && expandedPanel) {
        e.preventDefault()
        setPanelView(expandedPanel, 'normal')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleExpand, expandedPanel, setPanelView, toggleMutedAlerts, onShowLegend])
}
