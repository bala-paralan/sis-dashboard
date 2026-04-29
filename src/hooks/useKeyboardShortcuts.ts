import { useEffect } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANEL_ORDER = [
  'map', 'alerts', 'video', 'sensors', 'aiml', 'health',
  'counteruas', 'personnel', 'power',
]

function isInputFocused(): boolean {
  const tag = (document.activeElement?.tagName ?? '').toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select'
}

export function useKeyboardShortcuts(onHelp: () => void) {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return

      if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const digit = parseInt(e.key, 10)
        if (digit >= 1 && digit <= 9) {
          const panel = PANEL_ORDER[digit - 1]
          if (panel) {
            e.preventDefault()
            setActivePanel(panel)
          }
        }
        return
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey && e.key === '?') {
        e.preventDefault()
        onHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setActivePanel, onHelp])
}
