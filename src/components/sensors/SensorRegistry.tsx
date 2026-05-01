import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSensorStore } from '@/store/sensorStore'
import { SensorDetailModal } from './SensorDetailModal'
import type { SensorConfig } from '@/api/sensors'
import type { SensorModality, SensorStatus } from '@/types/sensors'

const MODALITIES: (SensorModality | '')[] = [
  '', 'SEISMIC', 'ACOUSTIC', 'GPR', 'MAD', 'FIBRE_OPTIC', 'EOTS',
  'THERMAL', 'PTZ', 'VIBRATION', 'CCTV', 'MICROWAVE', 'PIR_IR',
  'LIDAR', 'MAGNETOMETER', 'THERMAL_NV', 'NIR_VISIBLE', 'MMWAVE',
  'GMTI_RADAR', 'EMI', 'CHEMICAL',
]

const STATUSES: (SensorStatus | '')[] = ['', 'ONLINE', 'DEGRADED', 'OFFLINE', 'MAINTENANCE']

const STATUS_COLORS: Record<string, string> = {
  ONLINE:      '#22c55e',
  DEGRADED:    '#f59e0b',
  OFFLINE:     '#6b7280',
  MAINTENANCE: '#3b82f6',
}

function StatusBadge({ status }: { status: SensorStatus }) {
  const color = STATUS_COLORS[status] ?? '#6b7280'
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {status}
    </span>
  )
}

// Skeleton row used while loading
function SkeletonRows({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr key={i} className="border-b border-border-color animate-pulse">
          {Array.from({ length: 7 }).map((__, j) => (
            <td key={j} className="px-3 py-2">
              <div className="h-3 rounded bg-bg-tertiary" style={{ width: `${60 + (j * 10) % 40}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export function SensorRegistry() {
  const registryList    = useSensorStore((s) => s.registryList)
  const registryTotal   = useSensorStore((s) => s.registryTotal)
  const registryPage    = useSensorStore((s) => s.registryPage)
  const registryLimit   = useSensorStore((s) => s.registryLimit)
  const registryLoading = useSensorStore((s) => s.registryLoading)
  const registryError   = useSensorStore((s) => s.registryError)
  const loadSensors     = useSensorStore((s) => s.loadSensors)
  const toggleActive    = useSensorStore((s) => s.toggleActive)

  const [filterModality, setFilterModality] = useState<SensorModality | ''>('')
  const [filterStatus, setFilterStatus]     = useState<SensorStatus | ''>('')
  const [filterSite, setFilterSite]         = useState('')
  const [search, setSearch]                 = useState('')
  const [selectedSensor, setSelectedSensor] = useState<SensorConfig | null>(null)

  const totalPages = Math.max(1, Math.ceil(registryTotal / registryLimit))

  const load = useCallback((page = 1) => {
    void loadSensors({
      page,
      limit:    registryLimit,
      modality: filterModality || undefined,
      status:   filterStatus || undefined,
      siteId:   filterSite || undefined,
      search:   search || undefined,
    })
  }, [loadSensors, registryLimit, filterModality, filterStatus, filterSite, search])

  useEffect(() => {
    load(1)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModality, filterStatus, filterSite])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    load(1)
  }

  // Keep selected sensor in sync when store updates after edit
  const updatedSelected = useMemo(() => {
    if (!selectedSensor) return null
    return registryList.find((s) => s.sensor_id === selectedSensor.sensor_id) ?? selectedSensor
  }, [selectedSensor, registryList])

  return (
    <div className="h-full flex flex-col overflow-hidden text-text-primary" data-testid="sensor-registry">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b shrink-0"
        style={{ background: 'var(--panel-header-bg)', borderColor: 'var(--border-color)' }}
      >
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sensor ID or name…"
            className="px-2 h-7 rounded text-[12px] w-52"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            data-testid="search-input"
          />
          <button
            type="submit"
            className="text-[11px] px-2 h-7 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors"
          >
            Search
          </button>
        </form>

        {/* Modality filter */}
        <select
          value={filterModality}
          onChange={(e) => setFilterModality(e.target.value as SensorModality | '')}
          className="text-[11px] px-1.5 h-7"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          data-testid="modality-filter"
          aria-label="Filter by modality"
        >
          <option value="">All modalities</option>
          {MODALITIES.filter(Boolean).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as SensorStatus | '')}
          className="text-[11px] px-1.5 h-7"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          data-testid="status-filter"
          aria-label="Filter by status"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All statuses'}</option>
          ))}
        </select>

        {/* Site filter */}
        <input
          type="text"
          value={filterSite}
          onChange={(e) => setFilterSite(e.target.value)}
          placeholder="Site ID…"
          className="text-[11px] px-1.5 h-7 rounded w-28"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
          data-testid="site-filter"
        />

        {/* Refresh */}
        <button
          onClick={() => load(registryPage)}
          disabled={registryLoading}
          className="text-[11px] px-2 h-7 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40 ml-auto"
          title="Refresh"
        >
          {registryLoading ? '…' : '↻ Refresh'}
        </button>
      </div>

      {/* Error banner */}
      {registryError && (
        <div
          className="text-[11px] px-4 py-1.5 border-b shrink-0"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'var(--border-color)', color: 'var(--alert-high)' }}
          data-testid="registry-error"
        >
          {registryError}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-[12px] border-collapse">
          <thead className="sticky top-0" style={{ background: 'var(--panel-header-bg)' }}>
            <tr>
              {['Sensor ID', 'Name', 'Modality', 'Site', 'Status', 'Last Seen', 'Active'].map((h) => (
                <th
                  key={h}
                  className="text-left px-3 py-2 text-[10px] font-black tracking-[0.08em] text-text-muted uppercase border-b border-border-color whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registryLoading && registryList.length === 0 ? (
              <SkeletonRows />
            ) : registryList.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div
                    className="flex flex-col items-center justify-center py-16 gap-2 text-text-secondary text-[13px]"
                    data-testid="empty-state"
                  >
                    <span className="text-3xl">📡</span>
                    <span>No sensors match your filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              registryList.map((sensor) => (
                <tr
                  key={sensor.sensor_id}
                  className="border-b border-border-color cursor-pointer transition-colors hover:bg-bg-hover"
                  onClick={() => setSelectedSensor(sensor)}
                  data-testid={`sensor-row-${sensor.sensor_id}`}
                >
                  <td className="px-3 py-2 font-mono text-[11px] text-text-muted">{sensor.sensor_id}</td>
                  <td className="px-3 py-2 text-text-primary font-medium">{sensor.name}</td>
                  <td className="px-3 py-2 font-mono text-[11px]">{sensor.modality}</td>
                  <td className="px-3 py-2 text-text-secondary">{sensor.site_id}</td>
                  <td className="px-3 py-2">
                    <StatusBadge status={sensor.status} />
                  </td>
                  <td className="px-3 py-2 text-text-muted text-[11px]">
                    {sensor.last_seen_at
                      ? new Date(sensor.last_seen_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      checked={sensor.active}
                      onChange={(e) => {
                        e.stopPropagation()
                        void toggleActive(sensor.sensor_id, e.target.checked)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-3.5 h-3.5 cursor-pointer"
                      aria-label={`Toggle active for ${sensor.name}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      <div
        className="flex items-center justify-between px-4 py-2 border-t shrink-0 text-[11px] text-text-secondary"
        style={{ background: 'var(--panel-header-bg)', borderColor: 'var(--border-color)' }}
        data-testid="pagination"
      >
        <span>{registryTotal} sensor{registryTotal !== 1 ? 's' : ''} total</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(registryPage - 1)}
            disabled={registryPage <= 1 || registryLoading}
            className="px-2 h-6 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40"
          >
            ‹
          </button>
          <span>Page {registryPage} / {totalPages}</span>
          <button
            onClick={() => load(registryPage + 1)}
            disabled={registryPage >= totalPages || registryLoading}
            className="px-2 h-6 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>

      {/* Detail modal */}
      {updatedSelected && (
        <SensorDetailModal
          sensor={updatedSelected}
          onClose={() => setSelectedSensor(null)}
        />
      )}
    </div>
  )
}
