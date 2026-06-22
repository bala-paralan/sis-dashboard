import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import { useSystemStore } from '@/store/systemStore'
import { useViewStore } from '@/store/viewStore'
import { useAlertRulesStore, type AlertRule, type RuleField, type RuleOperator } from '@/store/alertRulesStore'
import type { ThreatLevel } from '@/types/sensors'

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

type Tab = 'widgets' | 'panels' | 'display' | 'layout' | 'thresholds' | 'rules'

const BLANK_RULE: Omit<AlertRule, 'id' | 'createdAt'> = {
  name: '',
  enabled: true,
  field: 'quality_score',
  operator: '<',
  value: 0.3,
  severity: 'HIGH',
  messageTemplate: 'Sensor {sensor_id} triggered rule: {value}',
}

function RuleBuilderTab() {
  const rules = useAlertRulesStore((s) => s.rules)
  const addRule = useAlertRulesStore((s) => s.addRule)
  const toggleRule = useAlertRulesStore((s) => s.toggleRule)
  const deleteRule = useAlertRulesStore((s) => s.deleteRule)
  const resetRules = useAlertRulesStore((s) => s.resetToDefaults)
  const [form, setForm] = useState<Omit<AlertRule, 'id' | 'createdAt'>>(BLANK_RULE)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = () => {
    if (!form.name.trim()) return
    addRule(form)
    setForm(BLANK_RULE)
    setShowForm(false)
  }

  const fieldLabels: Record<RuleField, string> = {
    quality_score: 'Quality Score (0–1)',
    sensor_status: 'Sensor Status',
  }

  const inputCls = 'bg-bg-tertiary border border-border-color rounded text-text-primary text-[11px] px-2 h-7 outline-none'

  const SEVERITY_COLORS: Record<ThreatLevel, string> = {
    CRITICAL: 'var(--alert-critical)',
    HIGH: 'var(--alert-high)',
    MEDIUM: 'var(--alert-medium)',
    LOW: 'var(--alert-low)',
    CLEAR: 'var(--sensor-acoustic)',
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-text-secondary">
          Custom rules trigger alerts when sensor conditions are met.
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-[10px] font-bold px-2 py-1 rounded border cursor-pointer"
          style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none' }}
        >
          + New Rule
        </button>
      </div>

      {/* Rule form */}
      {showForm && (
        <div
          className="flex flex-col gap-2 p-3 rounded-lg"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--accent-blue)' }}
        >
          <div className="text-[11px] font-bold text-text-primary">New Alert Rule</div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text-secondary">Rule Name</label>
            <input className={inputCls} placeholder="e.g. Low Quality Alert" value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-text-secondary">Field</label>
              <select className={inputCls} value={form.field}
                onChange={(e) => setForm((f) => ({ ...f, field: e.target.value as RuleField, value: e.target.value === 'quality_score' ? 0.3 : 'OFFLINE' }))}>
                {(Object.keys(fieldLabels) as RuleField[]).map((f) => (
                  <option key={f} value={f}>{fieldLabels[f]}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary">Operator</label>
              <select className={inputCls} value={form.operator}
                onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value as RuleOperator }))}>
                {(['<', '<=', '>', '>=', '=='] as RuleOperator[]).map((op) => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary">Value</label>
              <input className={`${inputCls} w-20`}
                type={form.field === 'quality_score' ? 'number' : 'text'}
                step={form.field === 'quality_score' ? 0.05 : undefined}
                min={form.field === 'quality_score' ? 0 : undefined}
                max={form.field === 'quality_score' ? 1 : undefined}
                value={String(form.value)}
                onChange={(e) => setForm((f) => ({ ...f, value: form.field === 'quality_score' ? Number(e.target.value) : e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[10px] text-text-secondary">Severity</label>
              <select className={inputCls} value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value as ThreatLevel }))}>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as ThreatLevel[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-text-secondary">Message template ({'{sensor_id}'}, {'{value}'}, {'{status}'})</label>
            <input className={inputCls} value={form.messageTemplate}
              onChange={(e) => setForm((f) => ({ ...f, messageTemplate: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleAdd}
              disabled={!form.name.trim()}
              className="flex-1 py-1.5 rounded text-[11px] font-bold border-none cursor-pointer"
              style={{ background: form.name.trim() ? 'var(--accent-blue)' : 'var(--bg-tertiary)', color: form.name.trim() ? '#fff' : 'var(--text-muted)' }}
            >
              Save Rule
            </button>
            <button onClick={() => { setForm(BLANK_RULE); setShowForm(false) }}
              className="px-3 py-1.5 rounded text-[11px] cursor-pointer"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {rules.length === 0 && (
        <div className="text-center text-[11px] text-text-muted py-6">No rules defined. Click "+ New Rule" to add one.</div>
      )}
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-start gap-2 p-2.5 rounded-lg"
          style={{ background: 'var(--bg-secondary)', border: `1px solid ${rule.enabled ? 'var(--panel-border)' : 'var(--border-subtle)'}`, opacity: rule.enabled ? 1 : 0.6 }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[11px] font-bold text-text-primary truncate">{rule.name}</span>
              <span className="text-[9px] font-bold px-1 rounded" style={{ background: 'rgba(0,0,0,0.2)', color: SEVERITY_COLORS[rule.severity] }}>
                {rule.severity}
              </span>
            </div>
            <div className="text-[10px] text-text-secondary">
              {rule.field} {rule.operator} {String(rule.value)}
            </div>
            <div className="text-[10px] text-text-muted italic mt-0.5 truncate">{rule.messageTemplate}</div>
          </div>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <button
              onClick={() => toggleRule(rule.id)}
              className="text-[9px] px-1.5 py-0.5 rounded border cursor-pointer"
              style={{
                background: rule.enabled ? 'rgba(34,197,94,0.1)' : 'var(--bg-tertiary)',
                color: rule.enabled ? 'var(--sensor-acoustic)' : 'var(--text-muted)',
                borderColor: rule.enabled ? 'rgba(34,197,94,0.3)' : 'var(--border-subtle)',
              }}
            >
              {rule.enabled ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => deleteRule(rule.id)}
              className="text-[9px] text-alert-critical bg-transparent border-none cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      ))}

      <div className="flex justify-end mt-1">
        <button
          onClick={resetRules}
          className="text-[10px] text-text-muted cursor-pointer bg-transparent border border-border-subtle rounded px-2 py-1"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}

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
    { id: 'rules',      label: 'Rules',      icon: '⚠' },
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

        {/* ── RULES TAB ── */}
        {activeTab === 'rules' && <RuleBuilderTab />}

      </div>

      {/* Footer actions */}
      <div className="py-[10px] px-4 border-t border-border-color bg-bg-secondary flex justify-between items-center shrink-0">
        <span className="text-[10px] text-text-secondary">
          Settings saved automatically to localStorage
        </span>
        <button
          onClick={resetToDefaults}
          className="py-[5px] px-3 bg-transparent border border-border-color rounded text-text-secondary cursor-pointer text-[11px]"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  )
}
