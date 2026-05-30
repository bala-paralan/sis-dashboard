import { useEffect, useRef, useState } from 'react'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'

const CORE_PANELS = ['map', 'alerts', 'video', 'sensors', 'aiml', 'health']

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    (el as HTMLElement).isContentEditable
  )
}

export function useKeyboardShortcuts() {
  const setActivePanel = useSystemStore((s) => s.setActivePanel)
  const activePanel = useSystemStore((s) => s.activePanel)
  const expandedPanel = useViewStore((s) => s.expandedPanel)
  const setPanelView = useViewStore((s) => s.setPanelView)
  const [helpOpen, setHelpOpen] = useState(false)

  // Use refs so the listener doesn't need re-registration on every render
  const activePanelRef = useRef(activePanel)
  activePanelRef.current = activePanel
  const expandedPanelRef = useRef(expandedPanel)
  expandedPanelRef.current = expandedPanel

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isInputFocused()) return

      if (e.altKey && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key, 10)
        if (num >= 1 && num <= 6) {
          e.preventDefault()
          const panelId = CORE_PANELS[num - 1]
          setActivePanel(panelId)
          document.getElementById(`panel-${panelId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault()
          setActivePanel(activePanelRef.current === 'settings' ? 'map' : 'settings')
          return
        }
        if (e.key === 'c' || e.key === 'C') {
          e.preventDefault()
          setActivePanel(activePanelRef.current === 'cameras' ? 'map' : 'cameras')
          return
        }
      }

      if (e.key === 'Escape' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const ep = expandedPanelRef.current
        if (ep) {
          e.preventDefault()
          setPanelView(ep, 'normal')
        }
        return
      }

      // ? = Shift+/ on most keyboards, but key value is '?'
      if (e.key === '?' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setHelpOpen((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  // setActivePanel and setPanelView are stable Zustand dispatch functions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActivePanel, setPanelView])

  return { helpOpen, setHelpOpen }
}
