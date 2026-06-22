import { useState } from 'react'
import { useMapEvents, Polygon, Polyline, CircleMarker } from 'react-leaflet'
import { useGeofenceStore, type ZoneType } from '@/store/geofenceStore'

const ZONE_COLORS: Record<ZoneType, string> = {
  exclusion: '#EF4444',
  inclusion: '#10B981',
  alert: '#F59E0B',
}

interface ZoneNameModalProps {
  vertices: [number, number][]
  onSave: (name: string, type: ZoneType, color: string) => void
  onCancel: () => void
}

function ZoneNameModal({ onSave, onCancel }: ZoneNameModalProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ZoneType>('alert')

  const handleSave = () => {
    if (!name.trim()) return
    onSave(name.trim(), type, ZONE_COLORS[type])
  }

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-auto"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    >
      <div
        className="rounded-xl p-5 flex flex-col gap-4 w-64"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--panel-border)' }}
      >
        <div className="text-[13px] font-bold text-text-primary">Save Geofence Zone</div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Zone Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. North Perimeter"
            autoFocus
            className="h-8 px-2 rounded text-[12px] outline-none"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Zone Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ZoneType)}
            className="h-8 px-2 rounded text-[12px] outline-none"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)', color: 'var(--text-primary)' }}
          >
            <option value="alert">Alert Zone (amber)</option>
            <option value="exclusion">Exclusion Zone (red)</option>
            <option value="inclusion">Inclusion Zone (green)</option>
          </select>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 h-8 rounded text-[12px] font-bold border-none"
            style={{
              background: name.trim() ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: name.trim() ? '#fff' : 'var(--text-muted)',
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
          >
            Save Zone
          </button>
          <button
            onClick={onCancel}
            className="px-3 h-8 rounded text-[12px] cursor-pointer"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

interface ZoneDrawerProps {
  isDrawing: boolean
  onFinish: () => void
  onCancel: () => void
}

export function ZoneDrawer({ isDrawing, onFinish, onCancel }: ZoneDrawerProps) {
  const [vertices, setVertices] = useState<[number, number][]>([])
  const [showModal, setShowModal] = useState(false)
  const addZone = useGeofenceStore((s) => s.addZone)

  useMapEvents({
    click(e) {
      if (!isDrawing || showModal) return
      setVertices((prev) => [...prev, [e.latlng.lat, e.latlng.lng]])
    },
  })

  const handleClose = () => {
    if (vertices.length < 3) return
    setShowModal(true)
  }

  const handleSave = (name: string, type: ZoneType, color: string) => {
    addZone({ name, type, color, vertices })
    setVertices([])
    setShowModal(false)
    onFinish()
  }

  const handleCancel = () => {
    setVertices([])
    setShowModal(false)
    onCancel()
  }

  if (!isDrawing) return null

  return (
    <>
      {/* Draw progress line */}
      {vertices.length >= 2 && (
        <Polyline
          positions={vertices}
          pathOptions={{ color: '#60A5FA', weight: 2, dashArray: '6 4' }}
        />
      )}

      {/* Preview polygon */}
      {vertices.length >= 3 && (
        <Polygon
          positions={vertices}
          pathOptions={{ color: '#60A5FA', fillColor: '#60A5FA', fillOpacity: 0.12, weight: 2, dashArray: '6 4' }}
        />
      )}

      {/* Vertex dots */}
      {vertices.map((v, i) => (
        <CircleMarker
          key={i}
          center={v}
          radius={5}
          pathOptions={{ color: '#60A5FA', fillColor: '#fff', fillOpacity: 1, weight: 2 }}
        />
      ))}

      {/* Close polygon button overlay */}
      {vertices.length >= 3 && !showModal && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] flex gap-2 pointer-events-auto">
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white cursor-pointer border-none"
            style={{ background: '#2563EB', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            ✓ Close Polygon ({vertices.length} pts)
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg text-[12px] cursor-pointer border-none"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
          >
            Cancel
          </button>
        </div>
      )}

      {vertices.length > 0 && vertices.length < 3 && !showModal && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500] pointer-events-auto">
          <div
            className="px-3 py-1.5 rounded-lg text-[11px]"
            style={{ background: 'rgba(0,0,0,0.7)', color: '#ddd' }}
          >
            Click to add vertices ({vertices.length}/3 min) · <button onClick={handleCancel} className="text-red-400 cursor-pointer bg-transparent border-none">Cancel</button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 z-[600]">
          <ZoneNameModal vertices={vertices} onSave={handleSave} onCancel={handleCancel} />
        </div>
      )}
    </>
  )
}
