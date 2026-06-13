import { useEffect } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANEL_ORDER = [
  'map', 'alerts', 'video', 'sensors', 'aiml',
  'health', 'counteruas', 'personnel', 'power',
]

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null
      const tag = target?.tagName?.toLowerCase() ?? ''
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return

      if (e.key === '?') {
        e.preventDefault()
        onShowHelp()
        return
      }

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        e.preventDefault()
        const idx = parseInt(e.key, 10) - 1
        const panelId = PANEL_ORDER[idx]
        if (panelId) setActivePanel(panelId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActivePanel, onShowHelp])
}

export const KEYBOARD_SHORTCUTS = PANEL_ORDER.map((id, i) => ({
  key: `Alt+${i + 1}`,
  description: `Switch to panel: ${id}`,
  panelId: id,
}))
