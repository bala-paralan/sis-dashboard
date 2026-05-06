import { useEffect, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'

const PANELS = ['map', 'alerts', 'video', 'sensors', 'aiml', 'health', 'cameras', 'settings', 'device']

export function useKeyboardShortcuts() {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as Node
      const inInput =
        target instanceof Element &&
        target.closest('input, textarea, select') !== null
      if (inInput) return

      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const digit = parseInt(e.key, 10)
        if (digit >= 1 && digit <= 9) {
          const panel = PANELS[digit - 1]
          if (panel) {
            e.preventDefault()
            setActivePanel(panel)
          }
        }
        return
      }

      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        if (e.key === '?') {
          e.preventDefault()
          setHelpOpen(true)
          return
        }
        if (e.key === 'Escape') {
          setHelpOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setActivePanel])

  return { helpOpen, setHelpOpen, panels: PANELS }
}

export const SHORTCUT_LIST = PANELS.map((id, i) => ({
  key: `Alt+${i + 1}`,
  description: `Switch to ${id} panel`,
  panelId: id,
}))
