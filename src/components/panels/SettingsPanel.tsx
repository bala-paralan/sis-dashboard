import { useState, useRef } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'
import { useNotificationStore } from '@/store/notificationStore'
import { useHasRole } from '@/hooks/useRole'
import {
  loadPresets,
  addPreset,
  deletePreset,
  exportPresetJson,
  importPresetJson,
  type DashboardPreset,
} from '@/utils/presetUtils'

const CATEGORY_ICONS: Record<string, string> = {
  'Video & Imaging':            '📹',
  'Mapping & Geospatial':       '🗺',
  'Alerts & Prioritisation':    '🔔',
  'Radar, LiDAR & Active':      '📡',
  'Acoustic & Seismic':         '〰',
  'Sensor & System Health':     '🖥',
  'AI Analytics & Prediction':  '🤖',
  'Specialist Detection':       '🔬',
  'Utility & Configuration':    '🔧',
  'Counter-UAS':                '🛸',
  'Subsurface Detection':       '⛏',
  'Communications & Personnel': '👥',
  'Vehicle & Power Management': '🚗',
  'Command & Reporting':        '📋',
  'Advanced AI Monitoring':     '🧠',
  'Weather & Terrain':          '🌤',
  'Interoperability':           '🔗',
}

type Tab = 'widgets' | 'panels' | 'display' | 'layout' | 'thresholds' | 'presets'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="w-9 h-5 rounded-[10px] border-none cursor-pointer relative shrink-0 transition-colors duration-200"
      style={{ background: checked ? 'var(--accent-blue)' : 'var(--bg-tertiary)' }}
    >
      <span
        className="absolute top-[2px] w-4 h-4 rounded-full bg-white transition-[left] duration-200 block"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  )
}

export function SettingsPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('widgets')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const widgetsByCategory = useSettingsStore((s) => s.widgetsByCategory())
  const toggleWidget = useSettingsStore((s) => s.toggleWidget)
  const setWidgetOption = useSettingsStore((s) => s.setWidgetOption)
  const panels = useSettingsStore((s) => s.panels)
  const togglePanel = useSettingsStore((s) => s.togglePanel)
  const resetToDefaults = useSettingsStore((s) => s.resetToDefaults)

  const theme = useSystemStore((s) => s.theme)
  const toggleTheme = useSystemStore((s) => s.toggleTheme)
  const soundEnabled = useNotificationStore((s) => s.soundEnabled)
  const toggleSound = useNotificationStore((s) => s.toggleSound)
  const isAdmin = useHasRole('ADMIN')

  const [presets, setPresets] = useState<DashboardPreset[]>(() => loadPresets())
  const [presetName, setPresetName] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  const handleSavePreset = () => {
    const name = presetName.trim()
    if (!name) return
    const widgets = useSettingsStore.getState().widgets
    const panels = useSettingsStore.getState().panels
    const defaultExpandedPanel = useSettingsStore.getState().defaultExpandedPanel
    const updated = addPreset(name, widgets, panels, defaultExpandedPanel)
    setPresets(updated)
    setPresetName('')
  }

  const handleLoadPreset = (preset: DashboardPreset) => {
    const { widgets, panels, defaultExpandedPanel } = useSettingsStore.getState()
    const newWidgets = widgets.map((w) => ({
      ...w,
      ...(preset.widgets[w.id] ?? {}),
    }))
    useSettingsStore.setState({ widgets: newWidgets, panels: { ...panels, ...preset.panels }, defaultExpandedPanel: preset.defaultExpandedPanel })
    try {
      localStorage.setItem('sis-settings', JSON.stringify({
        widgets: preset.widgets,
        panels: preset.panels,
        defaultExpandedPanel: preset.defaultExpandedPanel,
      }))
    } catch { /* noop */ }
  }

  const handleDeletePreset = (name: string) => {
    setPresets(deletePreset(name))
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const preset = await importPresetJson(file)
      const updated = addPreset(preset.name, [], preset.panels, preset.defaultExpandedPanel)
      // Merge widgets from the file directly
      const existing = loadPresets().find((p) => p.name === preset.name)
      if (existing) {
        existing.widgets = preset.widgets
        const { addPreset: _a, ...rest } = { addPreset: null } // just use loadPresets
        void rest
      }
      setPresets(updated)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Import failed')
    }
    if (importRef.current) importRef.current.value = ''
  }

  const defaultExpandedPanel    = useSettingsStore((s) => s.defaultExpandedPanel)
  const setDefaultExpandedPanel = useSettingsStore((s) => s.setDefaultExpandedPanel)
  const toggleExpand            = useViewStore((s) => s.toggleExpand)
  const setPanelView            = useViewStore((s) => s.setPanelView)
  const expandedPanel           = useViewStore((s) => s.expandedPanel)

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'widgets',    label: 'Widgets',    icon: '⊞' },
    { id: 'panels',     label: 'Panels',     icon: '▣' },
    { id: 'display',    label: 'Display',    icon: '🎨' },
    { id: 'layout',     label: 'Layout',     icon: '⤢' },
    { id: 'thresholds', label: 'Thresholds', icon: '⚡' },
    { id: 'presets',    label: 'Presets',    icon: '💾' },
  ]

  const PANEL_LABELS: Record<string, { label: string; icon: string; isNew?: boolean }> = {
    map:        { label: 'Live Tactical Map',         icon: '🗺'  },
    alerts:     { label: 'Alert Management',          icon: '🔔'  },
    video:      { label: 'Video / Imaging',           icon: '📹'  },
    sensors:    { label: 'Sensor Families',           icon: '📡'  },
    aiml:       { label: 'AI / ML Intelligence',      icon: '🤖'  },
    health:     { label: 'System Health',             icon: '🖥'  },
    counteruas: { label: 'Counter-UAS',               icon: '🛸',  isNew: true },
    personnel:  { label: 'Personnel & NavIC',         icon: '👥',  isNew: true },
    power:      { label: 'Power & Vehicle Health',    icon: '⚡',  isNew: true },
    command:    { label: 'Command & Reporting',       icon: '📋',  isNew: true },
    advancedai: { label: 'Advanced AI Monitoring',    icon: '🧠',  isNew: true },
    weather:    { label: 'Weather & Terrain',         icon: '🌤',  isNew: true },
  }

  const newBadgeCls = 'text-[10px] font-bold bg-[rgba(34,197,94,0.15)] text-sensor-acoustic border border-[rgba(34,197,94,0.3)] rounded px-1 tracking-[0.05em]'
  const ctrlBtnBase = 'py-[3px] px-2 bg-bg-tertiary border border-border-color rounded text-text-secondary cursor-pointer text-[10px]'

  const categories = Object.keys(widgetsByCategory)

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-border-color bg-bg-secondary shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'flex-1 py-[10px] px-1 border-none bg-transparent cursor-pointer text-[11px] flex items-center justify-center gap-1',
              activeTab === tab.id
                ? 'border-b-2 border-accent-blue text-accent-blue font-bold'
                : 'border-b-2 border-transparent text-text-secondary font-normal',
            ].join(' ')}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">

        {/* ── WIDGETS TAB ── */}
        {activeTab === 'widgets' && (
          <div>
            <div className="text-[11px] text-text-secondary mb-4 leading-relaxed">
              Toggle individual widgets on or off. Changes take effect immediately. Disabled widgets stop rendering but retain their data connections.
            </div>

            {categories.map((cat) => {
              const widgets = widgetsByCategory[cat]
              const icon = CATEGORY_ICONS[cat] ?? '■'
              const isExpanded = expandedCategory === cat
              const allVisible = widgets.every((w) => w.visible)
              const someVisible = widgets.some((w) => w.visible)
              const statusDot = allVisible
                ? 'var(--sensor-acoustic)'
                : someVisible
                ? 'var(--alert-medium)'
                : 'var(--alert-critical)'

              return (
                <div key={cat} className="mb-2">
                  {/* Category header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat)}
                    className={[
                      'w-full flex items-center gap-2 py-2 px-[10px] bg-bg-secondary border border-border-color cursor-pointer text-text-primary text-[12px] font-semibold',
                      isExpanded ? 'rounded-t-[6px]' : 'rounded-[6px]',
                    ].join(' ')}
                  >
                    <span>{icon}</span>
                    <span className="flex-1 text-left">{cat}</span>
                    <span className="text-[10px] text-text-secondary bg-bg-tertiary rounded-[10px] py-[1px] px-1.5">
                      {widgets.filter((w) => w.visible).length}/{widgets.length}
                    </span>
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: statusDot }}
                    />
                    <span className="text-text-secondary text-[10px]">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Widget rows */}
                  {isExpanded && (
                    <div className="border border-border-color border-t-0 rounded-b-[6px] overflow-hidden">
                      {widgets.map((widget, i) => (
                        <div
                          key={widget.id}
                          className={`flex items-center gap-[10px] py-2 px-3 bg-panel-bg${i > 0 ? ' border-t border-border-color' : ''}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-1.5 text-[12px]">
                              <span style={{ color: widget.visible ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {widget.label}
                              </span>
                              {widget.isNew && (
                                <span className={newBadgeCls}>NEW</span>
                              )}
                            </div>
                          </div>
                          <Toggle checked={widget.visible} onChange={() => toggleWidget(widget.id)} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── PANELS TAB ── */}
        {activeTab === 'panels' && (
          <div>
            <div className="text-[11px] text-text-secondary mb-4 leading-relaxed">
              Show or hide entire panel sections from the dashboard grid. Hidden panels are removed from the layout to reclaim screen space.
            </div>

            <div className="flex flex-col gap-1.5">
              {Object.entries(PANEL_LABELS).map(([id, meta]) => (
                <div
                  key={id}
                  className="flex items-center gap-[10px] py-[10px] px-[14px] bg-bg-secondary border border-border-color rounded-[6px]"
                >
                  <span className="text-[16px]">{meta.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[12px] font-semibold"
                        style={{ color: panels[id] ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                      >
                        {meta.label}
                      </span>
                      {meta.isNew && (
                        <span className={newBadgeCls}>NEW</span>
                      )}
                    </div>
                  </div>
                  <Toggle checked={panels[id] ?? true} onChange={() => togglePanel(id)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DISPLAY TAB ── */}
        {activeTab === 'display' && (
          <div className="flex flex-col gap-4">
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">
                Theme
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px]">
                    {theme === 'dark' ? '🌙 Dark Mode' : '☀ Light Mode'}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-[2px]">
                    Switch between dark tactical view and light operational view
                  </div>
                </div>
                <Toggle checked={theme === 'dark'} onChange={toggleTheme} />
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">
                Notifications
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px]">
                    {soundEnabled ? '🔔 Alert sounds on' : '🔕 Alert sounds off'}
                  </div>
                  <div className="text-[11px] text-text-secondary mt-[2px]">
                    Play a tone when new CRITICAL or HIGH alerts arrive
                  </div>
                </div>
                <Toggle checked={soundEnabled} onChange={toggleSound} />
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">
                Widget Catalogue Info
              </div>
              <div className="text-[11px] text-text-secondary leading-[1.7]">
                {[
                  { label: 'Total widgets',     value: '37',              color: 'var(--text-primary)' },
                  { label: 'Original catalogue',value: '20',              color: 'var(--text-primary)' },
                  { label: 'New additions',      value: '17',              color: 'var(--sensor-acoustic)' },
                  { label: 'Categories',         value: '17',              color: 'var(--text-primary)' },
                  { label: 'Catalogue version',  value: 'Section 9.3 (Updated)', color: 'var(--text-primary)' },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex justify-between py-1${i < arr.length - 1 ? ' border-b border-border-color' : ''}`}
                  >
                    <span>{row.label}</span>
                    <strong style={{ color: row.color }}>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-1 text-text-primary">
                New Widget Categories
              </div>
              <div className="text-[11px] text-text-secondary leading-[1.7]">
                {['Counter-UAS', 'Subsurface Detection', 'Communications & Personnel', 'Vehicle & Power Management', 'Command & Reporting', 'Advanced AI Monitoring', 'Weather & Terrain', 'Interoperability'].map((cat) => (
                  <div key={cat} className="flex gap-1.5 items-center py-[2px]">
                    <span className="text-sensor-acoustic text-[10px]">✓</span>
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── LAYOUT TAB ── */}
        {activeTab === 'layout' && (
          <div className="flex flex-col gap-4">
            <div className="text-[11px] text-text-secondary leading-relaxed">
              Configure how panels are displayed. Each panel supports three view modes:
              <ul className="mt-2 pl-4 flex flex-col gap-1">
                <li><strong className="text-text-primary">Normal</strong> — default, shows full panel content</li>
                <li><strong className="text-text-primary">Minimized ▬</strong> — compact strip showing only priority data</li>
                <li><strong className="text-text-primary">Expanded ⤢</strong> — panel fills entire view, others collapse to strip</li>
              </ul>
            </div>

            {/* Default expanded panel */}
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-1 text-text-primary">
                Default Expanded Panel
              </div>
              <div className="text-[11px] text-text-secondary mb-3 leading-relaxed">
                This panel opens in expanded view automatically when the dashboard loads. All other panels collapse to a compact strip below it.
              </div>
              <select
                value={defaultExpandedPanel ?? ''}
                onChange={(e) => {
                  const val = e.target.value || null
                  setDefaultExpandedPanel(val)
                  // Apply immediately: collapse current then expand new
                  if (expandedPanel) setPanelView(expandedPanel, 'normal')
                  if (val) toggleExpand(val)
                }}
                className="w-full py-[7px] px-[10px] bg-bg-tertiary border border-border-color rounded-[6px] text-text-primary text-[12px] cursor-pointer"
              >
                <option value="">— None (grid layout on load) —</option>
                {Object.entries(PANEL_LABELS).map(([id, meta]) => (
                  <option key={id} value={id}>
                    {meta.icon} {meta.label}
                  </option>
                ))}
              </select>
              {defaultExpandedPanel && (
                <div className="mt-2 text-[11px] text-sensor-acoustic">
                  ✓ On next load: <strong>{PANEL_LABELS[defaultExpandedPanel]?.icon} {PANEL_LABELS[defaultExpandedPanel]?.label}</strong> will open expanded
                </div>
              )}
            </div>

            {/* Live view controls */}
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">
                Quick View Controls
              </div>
              <div className="flex flex-col gap-1.5">
                {Object.entries(PANEL_LABELS).map(([id, meta]) => (
                  <div key={id} className="flex items-center gap-[10px] py-2 px-[10px] bg-panel-bg border border-border-color rounded-[6px]">
                    <span className="text-[14px]">{meta.icon}</span>
                    <span className="flex-1 text-[12px] text-text-primary">{meta.label}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setPanelView(id, 'normal')}
                        title="Restore to normal"
                        className={ctrlBtnBase}
                      >
                        Normal
                      </button>
                      <button
                        onClick={() => setPanelView(id, 'minimized')}
                        title="Minimize"
                        className={ctrlBtnBase}
                      >
                        ▬ Min
                      </button>
                      <button
                        onClick={() => {
                          if (expandedPanel) setPanelView(expandedPanel, 'normal')
                          toggleExpand(id)
                        }}
                        title="Expand"
                        className="py-[3px] px-2 rounded cursor-pointer text-[10px] border"
                        style={{
                          background: expandedPanel === id ? 'rgba(59,130,246,0.2)' : 'var(--bg-tertiary)',
                          borderColor: expandedPanel === id ? 'var(--accent-blue)' : 'var(--border-color)',
                          color: expandedPanel === id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                          fontWeight: expandedPanel === id ? 700 : 400,
                        }}
                      >
                        ⤢ Expand
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How-to tip */}
            <div className="bg-[rgba(59,130,246,0.05)] border border-[rgba(59,130,246,0.2)] rounded-lg p-3">
              <div className="text-[11px] text-accent-blue font-bold mb-1">💡 Usage Tips</div>
              <div className="text-[11px] text-text-secondary leading-[1.7]">
                • Click <strong>⤢</strong> on any panel header to expand it<br />
                • Click <strong>▬</strong> on any panel header to minimize it to a strip<br />
                • When expanded, all other panels collapse to a compact strip at the bottom<br />
                • Click <strong>⊡</strong> on the expanded panel (or the ✕ Collapse button) to return to grid view<br />
                • Minimized panels show only priority metrics — click to restore
              </div>
            </div>
          </div>
        )}

        {/* ── THRESHOLDS TAB ── */}
        {activeTab === 'thresholds' && (
          <div className="flex flex-col gap-3">
            <div className="text-[11px] text-text-secondary mb-1 leading-relaxed">
              Configure alert thresholds and update rates per widget. Higher update rates consume more bandwidth.
            </div>

            {(['Acoustic & Seismic', 'AI Analytics & Prediction', 'Sensor & System Health', 'Counter-UAS', 'Advanced AI Monitoring'] as const).map((cat) => {
              const widgets = widgetsByCategory[cat] ?? []
              return (
                <div key={cat}>
                  <div className="text-[10px] font-bold tracking-[0.1em] text-text-secondary uppercase mb-1.5">
                    {CATEGORY_ICONS[cat]} {cat}
                  </div>
                  {widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="bg-bg-secondary border border-border-color rounded-[6px] px-3 py-[10px] mb-1.5"
                    >
                      <div className="text-[11px] font-semibold mb-2">{widget.label}</div>
                      <div className="flex gap-3 flex-wrap">
                        <label className="text-[11px] text-text-secondary flex flex-col gap-1">
                          Update rate (Hz)
                          <input
                            type="number"
                            min={0.1}
                            max={25}
                            step={0.5}
                            value={widget.updateRateHz ?? 1}
                            onChange={(e) => setWidgetOption(widget.id, 'updateRateHz', Number(e.target.value))}
                            className="w-20 py-[3px] px-1.5 bg-bg-tertiary border border-border-color rounded text-text-primary text-[11px]"
                          />
                        </label>
                        <label className="text-[11px] text-text-secondary flex flex-col gap-1">
                          Alert threshold
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={widget.threshold ?? 50}
                            onChange={(e) => setWidgetOption(widget.id, 'threshold', Number(e.target.value))}
                            className="w-20 py-[3px] px-1.5 bg-bg-tertiary border border-border-color rounded text-text-primary text-[11px]"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}

        {/* ── PRESETS TAB ── */}
        {activeTab === 'presets' && (
          <div className="flex flex-col gap-4">
            <div className="text-[11px] text-text-secondary leading-relaxed">
              Save the current panel and widget configuration as a named preset. Up to 5 presets are stored in localStorage.
            </div>

            {/* Save preset */}
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">Save Current Layout</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="Preset name…"
                  maxLength={32}
                  className="flex-1 text-[12px] px-2 py-[5px] bg-bg-tertiary border border-border-color rounded text-text-primary outline-none"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSavePreset() }}
                />
                <button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim()}
                  className="py-[5px] px-3 bg-accent-blue border-none rounded text-white cursor-pointer text-[11px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
            </div>

            {/* Import */}
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">Import / Export</div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => importRef.current?.click()}
                  className="py-[5px] px-3 bg-bg-tertiary border border-border-color rounded text-text-secondary cursor-pointer text-[11px]"
                >
                  ⬆ Import JSON
                </button>
                {presets[0] && (
                  <button
                    onClick={() => exportPresetJson(presets[0])}
                    className="py-[5px] px-3 bg-bg-tertiary border border-border-color rounded text-text-secondary cursor-pointer text-[11px]"
                  >
                    ⬇ Export latest
                  </button>
                )}
                <input
                  ref={importRef}
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </div>
            </div>

            {/* Preset list */}
            <div className="bg-bg-secondary border border-border-color rounded-lg p-4">
              <div className="text-[12px] font-bold mb-3 text-text-primary">
                Saved Presets ({presets.length}/5)
              </div>
              {presets.length === 0 ? (
                <p className="text-[11px] text-text-muted">No presets saved yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {presets.map((preset) => (
                    <div
                      key={preset.name}
                      className="flex items-center justify-between gap-2 py-2 px-3 bg-bg-tertiary rounded border border-border-color"
                    >
                      <div>
                        <p className="text-[12px] font-semibold text-text-primary">{preset.name}</p>
                        <p className="text-[10px] text-text-muted">
                          {new Date(preset.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleLoadPreset(preset)}
                          className="py-[3px] px-2 bg-accent-blue border-none rounded text-white cursor-pointer text-[10px] font-semibold"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => exportPresetJson(preset)}
                          className="py-[3px] px-2 bg-bg-tertiary border border-border-color rounded text-text-secondary cursor-pointer text-[10px]"
                          title="Export as JSON"
                        >
                          ⬇
                        </button>
                        <button
                          onClick={() => handleDeletePreset(preset.name)}
                          className="py-[3px] px-2 bg-transparent border border-[rgba(239,68,68,0.3)] rounded text-alert-critical cursor-pointer text-[10px]"
                          title="Delete preset"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Footer actions */}
      <div className="py-[10px] px-4 border-t border-border-color bg-bg-secondary flex justify-between items-center shrink-0">
        <span className="text-[10px] text-text-secondary">
          Settings saved automatically to localStorage
        </span>
        {isAdmin && (
          <button
            onClick={resetToDefaults}
            className="py-[5px] px-3 bg-transparent border border-border-color rounded text-text-secondary cursor-pointer text-[11px]"
          >
            Reset to defaults
          </button>
        )}
      </div>
    </div>
  )
}
