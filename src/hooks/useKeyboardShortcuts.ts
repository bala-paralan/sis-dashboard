import { useEffect } from 'react'
import { useSystemStore } from '@/store/systemStore'

export const PANEL_ORDER = [
  'map', 'alerts', 'video', 'sensors', 'aiml', 'health',
  'counteruas', 'personnel', 'power',
]

export const KEYBOARD_SHORTCUTS = [
  { key: 'Alt+1 … Alt+9', description: 'Switch to panel 1–9' },
  { key: '?', description: 'Show this shortcuts list' },
  { key: 'Escape', description: 'Close shortcuts panel' },
]

const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function useKeyboardShortcuts(onToggleHelp: () => void) {
  const setActivePanel = useSystemStore.getState().setActivePanel

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (INPUT_TAGS.has(target.tagName)) return

      if (e.altKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1
        const panelId = PANEL_ORDER[index]
        if (panelId) {
          e.preventDefault()
          setActivePanel(panelId)
        }
        return
      }

      if (e.key === '?') {
        e.preventDefault()
        onToggleHelp()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onToggleHelp, setActivePanel])
}
