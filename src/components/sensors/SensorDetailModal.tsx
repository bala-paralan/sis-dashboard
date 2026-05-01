import React, { useEffect, useState } from 'react'
import { useSensorStore } from '@/store/sensorStore'
import type { SensorConfig, SensorThresholds, UpdateSensorConfigInput } from '@/api/sensors'

interface Props {
  sensor: SensorConfig
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  ONLINE:      'var(--status-online, #22c55e)',
  DEGRADED:    'var(--alert-medium, #f59e0b)',
  OFFLINE:     'var(--text-muted, #6b7280)',
  MAINTENANCE: 'var(--accent-blue, #3b82f6)',
}

export function SensorDetailModal({ sensor, onClose }: Props) {
  const updateConfig  = useSensorStore((s) => s.updateConfig)
  const setThresholds = useSensorStore((s) => s.setThresholds)
  const toggleActive  = useSensorStore((s) => s.toggleActive)
  const registryError = useSensorStore((s) => s.registryError)
  const registryLoading = useSensorStore((s) => s.registryLoading)

  // Form fields
  const [name, setName]     = useState(sensor.name)
  const [location, setLoc]  = useState(sensor.location ?? '')

  // Threshold fields
  const [qualityMin, setQualityMin]           = useState(sensor.thresholds.qualityMin ?? 0.5)
  const [alertOnOffline, setAlertOnOffline]   = useState(sensor.thresholds.alertOnOffline ?? true)
  const [alertOnDegraded, setAlertOnDegraded] = useState(sensor.thresholds.alertOnDegraded ?? true)

  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved]         = useState(false)

  // Sync form if sensor prop changes (e.g. store update after save)
  useEffect(() => {
    setName(sensor.name)
    setLoc(sensor.location ?? '')
    setQualityMin(sensor.thresholds.qualityMin ?? 0.5)
    setAlertOnOffline(sensor.thresholds.alertOnOffline ?? true)
    setAlertOnDegraded(sensor.thresholds.alertOnDegraded ?? true)
  }, [sensor])

  const handleSave = async () => {
    setSaveError(null)
    setSaved(false)
    try {
      const configInput: UpdateSensorConfigInput = { name: name.trim(), location: location.trim() || undefined }
      const threshInput: SensorThresholds = { qualityMin, alertOnOffline, alertOnDegraded }
      await updateConfig(sensor.sensor_id, configInput)
      await setThresholds(sensor.sensor_id, threshInput)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  const handleToggleActive = async () => {
    await toggleActive(sensor.sensor_id, !sensor.active)
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const statusColor = STATUS_COLORS[sensor.status] ?? 'var(--text-secondary)'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.55)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      data-testid="sensor-detail-modal"
    >
      <div
        className="rounded-lg shadow-2xl flex flex-col"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          width: 480,
          maxWidth: '95vw',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border-color)', background: 'var(--panel-header-bg)' }}
        >
          <div>
            <span className="text-[13px] font-semibold text-text-primary">{sensor.name}</span>
            <span className="ml-2 text-[11px] text-text-muted font-mono">{sensor.sensor_id}</span>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary bg-transparent border-none cursor-pointer text-lg leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Status + active row */}
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: `${statusColor}22`,
                color: statusColor,
                border: `1px solid ${statusColor}55`,
              }}
              data-testid="sensor-status-badge"
            >
              {sensor.status}
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-[12px] text-text-secondary">
              Active
              <input
                type="checkbox"
                checked={sensor.active}
                onChange={handleToggleActive}
                className="w-4 h-4 cursor-pointer"
                data-testid="sensor-active-toggle"
                aria-label="Toggle sensor active"
              />
            </label>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <span className="text-text-muted">Modality</span>
            <span className="text-text-primary font-mono">{sensor.modality}</span>
            <span className="text-text-muted">Site</span>
            <span className="text-text-primary">{sensor.site_id}</span>
            <span className="text-text-muted">BOP</span>
            <span className="text-text-primary font-mono">{sensor.bop_id}</span>
            <span className="text-text-muted">Firmware</span>
            <span className="text-text-primary font-mono">{sensor.firmware_ver ?? '—'}</span>
            <span className="text-text-muted">Last seen</span>
            <span className="text-text-primary">
              {sensor.last_seen_at
                ? new Date(sensor.last_seen_at).toLocaleString()
                : '—'}
            </span>
          </div>

          {/* Editable config */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black tracking-[0.1em] text-text-muted uppercase">Configuration</p>

            <label className="flex flex-col gap-0.5 text-[11px] text-text-secondary">
              Display Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-2 h-7 rounded text-[12px] text-text-primary"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                data-testid="sensor-name-input"
              />
            </label>

            <label className="flex flex-col gap-0.5 text-[11px] text-text-secondary">
              Location Description
              <input
                type="text"
                value={location}
                onChange={(e) => setLoc(e.target.value)}
                placeholder="e.g. North perimeter, post 3"
                className="px-2 h-7 rounded text-[12px] text-text-primary"
                style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
                data-testid="sensor-location-input"
              />
            </label>
          </div>

          {/* Threshold config */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black tracking-[0.1em] text-text-muted uppercase">Alert Thresholds</p>

            <label className="flex flex-col gap-0.5 text-[11px] text-text-secondary">
              Min quality score ({qualityMin.toFixed(2)})
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={qualityMin}
                onChange={(e) => setQualityMin(parseFloat(e.target.value))}
                className="w-full"
                data-testid="quality-min-slider"
                aria-label="Minimum quality score"
              />
            </label>

            <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnOffline}
                onChange={(e) => setAlertOnOffline(e.target.checked)}
                className="w-3 h-3"
                data-testid="alert-offline-checkbox"
              />
              Alert when sensor goes offline
            </label>

            <label className="flex items-center gap-2 text-[11px] text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={alertOnDegraded}
                onChange={(e) => setAlertOnDegraded(e.target.checked)}
                className="w-3 h-3"
                data-testid="alert-degraded-checkbox"
              />
              Alert on degraded signal quality
            </label>
          </div>

          {/* Errors */}
          {(saveError ?? registryError) && (
            <p
              className="text-[11px] text-[var(--alert-high)]"
              data-testid="modal-error"
            >
              {saveError ?? registryError}
            </p>
          )}

          {saved && (
            <p className="text-[11px] text-[var(--status-online,#22c55e)]" data-testid="modal-saved">
              Saved successfully
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex justify-end gap-2 px-4 py-3 border-t shrink-0"
          style={{ borderColor: 'var(--border-color)', background: 'var(--panel-header-bg)' }}
        >
          <button
            onClick={onClose}
            className="text-[12px] px-3 h-7 border border-border-color rounded bg-transparent text-text-secondary cursor-pointer hover:bg-bg-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={registryLoading || !name.trim()}
            data-testid="save-btn"
            className="text-[12px] px-3 h-7 rounded bg-accent-blue text-white border-none cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40"
          >
            {registryLoading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
