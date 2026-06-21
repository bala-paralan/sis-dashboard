import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useAlertStore } from '@/store/alertStore'
import { useCameraStore } from '@/store/cameraStore'
import { useSystemStore } from '@/store/systemStore'

const ALL_PANEL_DEFS = [
  { id: 'map',        title: 'Live Tactical Map',      icon: '🗺' },
  { id: 'alerts',     title: 'Alert Management',       icon: '🔔' },
  { id: 'video',      title: 'Video / Imaging',        icon: '📹' },
  { id: 'sensors',    title: 'Sensor Families',        icon: '📡' },
  { id: 'aiml',       title: 'AI / ML Intelligence',   icon: '🤖' },
  { id: 'health',     title: 'System Health',          icon: '🖥' },
  { id: 'counteruas', title: 'Counter-UAS',            icon: '🛸' },
  { id: 'personnel',  title: 'Personnel & NavIC',      icon: '👥' },
  { id: 'power',      title: 'Power & Vehicle Health', icon: '⚡' },
  { id: 'command',    title: 'Command & Reporting',    icon: '📋' },
  { id: 'advancedai', title: 'Advanced AI Monitoring', icon: '🧠' },
  { id: 'weather',    title: 'Weather & Terrain',      icon: '🌤' },
  { id: 'alertstats', title: 'Alert Statistics',       icon: '📊' },
  { id: 'settings',   title: 'Dashboard Settings',     icon: '⚙' },
  { id: 'cameras',    title: 'IP Camera Management',   icon: '📷' },
  { id: 'device',     title: 'Device Configuration',   icon: '🔌' },
]

type SearchKind = 'panel' | 'alert' | 'camera'

interface SearchResult {
  kind: SearchKind
  id: string
  title: string
  icon: string
  subtitle?: string
}

interface ResultGroup {
  label: string
  items: Array<{ result: SearchResult; globalIdx: number }>
}

export interface SearchModalProps {
  onClose: () => void
}

export function SearchModal({ onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const alerts = useAlertStore((s) => s.alerts)
  const cameras = useCameraStore((s) => s.cameras)
  const setActivePanel = useSystemStore((s) => s.setActivePanel)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const q = query.toLowerCase().trim()

  const panelResults: SearchResult[] = q === ''
    ? ALL_PANEL_DEFS.slice(0, 6).map((p) => ({ kind: 'panel', id: p.id, title: p.title, icon: p.icon }))
    : ALL_PANEL_DEFS
        .filter((p) => p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
        .map((p) => ({ kind: 'panel', id: p.id, title: p.title, icon: p.icon }))

  const alertResults: SearchResult[] = q === ''
    ? []
    : alerts
        .filter(
          (a) =>
            !a.acknowledged &&
            (a.description?.toLowerCase().includes(q) ||
              a.sensor_family?.toLowerCase().includes(q) ||
              a.threat_level?.toLowerCase().includes(q))
        )
        .slice(0, 5)
        .map((a) => ({
          kind: 'alert',
          id: a.id,
          title: `[${a.threat_level}] ${a.description ?? a.sensor_family}`,
          icon: a.threat_level === 'CRITICAL' ? '🔴' : a.threat_level === 'HIGH' ? '🟠' : a.threat_level === 'MEDIUM' ? '🟡' : '🟢',
          subtitle: a.sensor_family ?? '',
        }))

  const cameraResults: SearchResult[] = q === ''
    ? []
    : cameras
        .filter(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.siteId?.toLowerCase().includes(q) ||
            c.location?.toLowerCase().includes(q)
        )
        .slice(0, 5)
        .map((c) => ({
          kind: 'camera',
          id: c.id,
          title: c.name,
          icon: '📷',
          subtitle: c.siteId ?? c.location ?? '',
        }))

  // Build flat results + grouped view
  const allResults: SearchResult[] = [...panelResults, ...alertResults, ...cameraResults]

  const groups: ResultGroup[] = []
  let gi = 0
  if (panelResults.length > 0) {
    groups.push({
      label: q ? 'Panels' : 'Quick Navigation',
      items: panelResults.map((r) => ({ result: r, globalIdx: gi++ })),
    })
  }
  if (alertResults.length > 0) {
    groups.push({
      label: 'Alerts',
      items: alertResults.map((r) => ({ result: r, globalIdx: gi++ })),
    })
  }
  if (cameraResults.length > 0) {
    groups.push({
      label: 'Cameras',
      items: cameraResults.map((r) => ({ result: r, globalIdx: gi++ })),
    })
  }

  useEffect(() => {
    setActiveIdx(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIdx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIdx])

  function handleSelect(result: SearchResult) {
    if (result.kind === 'panel') {
      setActivePanel(result.id)
    } else if (result.kind === 'alert') {
      setActivePanel('alerts')
    } else {
      setActivePanel('cameras')
    }
    onClose()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, allResults.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const selected = allResults[activeIdx]
      if (selected) handleSelect(selected)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center"
      style={{ background: 'rgba(0,0,0,0.6)', paddingTop: '12vh' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-label="Command search"
      aria-modal="true"
    >
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: 'var(--panel-header-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Search input row */}
        <div
          style={{
            padding: '10px 14px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: 14, flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search panels, alerts, cameras…"
            aria-label="Search"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 15,
              fontFamily: 'inherit',
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              color: 'var(--text-muted)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: 4,
              padding: '2px 5px',
              flexShrink: 0,
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} style={{ maxHeight: 380, overflowY: 'auto' }}>
          {allResults.length === 0 ? (
            <div
              style={{
                padding: '20px 14px',
                color: 'var(--text-muted)',
                fontSize: 13,
                textAlign: 'center',
              }}
            >
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            groups.map(({ label, items }) => (
              <div key={label}>
                <div
                  style={{
                    padding: '8px 14px 4px',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    color: 'var(--text-muted)',
                  }}
                >
                  {label}
                </div>
                {items.map(({ result, globalIdx }) => {
                  const isActive = globalIdx === activeIdx
                  return (
                    <button
                      key={result.id}
                      data-idx={globalIdx}
                      data-testid={`search-result-${result.id}`}
                      onClick={() => handleSelect(result)}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 14px',
                        background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                        border: 'none',
                        borderLeft: `2px solid ${isActive ? 'var(--accent-blue)' : 'transparent'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontSize: 13,
                        transition: 'background 0.1s',
                      }}
                    >
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{result.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: isActive ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      {result.kind === 'panel' && (
                        <kbd
                          style={{
                            marginLeft: 'auto',
                            fontSize: 9,
                            color: 'var(--text-muted)',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 4,
                            padding: '1px 4px',
                            flexShrink: 0,
                          }}
                        >
                          Navigate
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        {allResults.length > 0 && (
          <div
            style={{
              padding: '6px 14px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: 12,
              fontSize: 10,
              color: 'var(--text-muted)',
            }}
          >
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>ESC close</span>
          </div>
        )}
      </div>
    </div>
  )
}
