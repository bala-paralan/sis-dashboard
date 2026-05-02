import { useEffect } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANEL_ORDER = [
  'map', 'alerts', 'video', 'sensors', 'aiml', 'health',
  'counteruas', 'personnel', 'power',
]

export function useKeyboardShortcuts(onShowHelp: () => void) {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return

      if (e.key === '?') {
        onShowHelp()
        return
      }

      if (e.altKey) {
        const digit = parseInt(e.key, 10)
        if (digit >= 1 && digit <= 9) {
          const panelId = PANEL_ORDER[digit - 1]
          if (panelId) {
            e.preventDefault()
            setActivePanel(panelId)
          }
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActivePanel, onShowHelp])
}

export const KEYBOARD_SHORTCUTS = PANEL_ORDER.map((id, i) => ({
  key: `Alt+${i + 1}`,
  description: `Switch to ${id} panel`,
  panelId: id,
}))
