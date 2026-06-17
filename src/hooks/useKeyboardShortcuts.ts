import { useEffect, useCallback, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANEL_SHORTCUTS: Record<string, string> = {
  '1': 'map',
  '2': 'alerts',
  '3': 'video',
  '4': 'sensors',
  '5': 'aiml',
  '6': 'health',
}

export const SHORTCUT_DESCRIPTIONS: Array<{ keys: string; description: string }> = [
  { keys: 'Alt + 1', description: 'Live Map' },
  { keys: 'Alt + 2', description: 'Alerts' },
  { keys: 'Alt + 3', description: 'Video Feed' },
  { keys: 'Alt + 4', description: 'Sensors' },
  { keys: 'Alt + 5', description: 'AI / ML' },
  { keys: 'Alt + 6', description: 'System Health' },
  { keys: '?', description: 'Toggle shortcut help' },
  { keys: 'Esc', description: 'Close shortcut help' },
]

export function useKeyboardShortcuts() {
  const [helpOpen, setHelpOpen] = useState(false)
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable

      if (e.key === 'Escape') {
        setHelpOpen(false)
        return
      }

      if (isTyping) return

      if (e.key === '?') {
        setHelpOpen((prev) => !prev)
        return
      }

      if (e.altKey && PANEL_SHORTCUTS[e.key]) {
        e.preventDefault()
        setActivePanel(PANEL_SHORTCUTS[e.key])
      }
    },
    [setActivePanel],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { helpOpen, setHelpOpen }
}
