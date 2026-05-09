import { useEffect, useCallback } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANEL_KEYS: Record<string, string> = {
  m: 'map',
  a: 'alerts',
  v: 'video',
  s: 'sensors',
  i: 'aiml',
  h: 'health',
}

function isFocusedOnInput(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || el.getAttribute('contenteditable') === 'true'
}

export function useKeyboardShortcuts(
  onToggleHelp: () => void,
  onCloseOverlay: () => void,
) {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isFocusedOnInput()) return

      const key = e.key.toLowerCase()

      if (key === 'escape') {
        onCloseOverlay()
        return
      }

      if (e.key === '?') {
        onToggleHelp()
        return
      }

      const panelId = PANEL_KEYS[key]
      if (panelId) {
        setActivePanel(panelId)
      }
    },
    [setActivePanel, onToggleHelp, onCloseOverlay],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

export const SHORTCUT_DEFINITIONS = [
  { key: 'M', description: 'Switch to Live Map panel' },
  { key: 'A', description: 'Switch to Alerts panel' },
  { key: 'V', description: 'Switch to Video panel' },
  { key: 'S', description: 'Switch to Sensors panel' },
  { key: 'I', description: 'Switch to AI/ML Intelligence panel' },
  { key: 'H', description: 'Switch to System Health panel' },
  { key: '?', description: 'Toggle this keyboard shortcut help' },
  { key: 'Esc', description: 'Close any open overlay or modal' },
]
