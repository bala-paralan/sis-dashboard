// ============================================================
// IINVSYS SIS — LiveMapPanel.tsx
// Live tactical map with sensor overlays, tracks, and alert zones
// ============================================================

import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({ iconUrl, shadowUrl: iconShadow })

import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Polygon,
  ScaleControl,
  useMapEvents,
} from 'react-leaflet'
import { useSensorStore } from '@/store/sensorStore'
import { useAlertStore } from '@/store/alertStore'
import { useGeofenceStore } from '@/store/geofenceStore'
import { SensorMarker } from '@/components/map/SensorMarker'
import { TrackMarker } from '@/components/map/TrackMarker'
import { ZoneDrawer } from '@/components/map/ZoneDrawer'
import { GeofenceOverlay } from '@/components/map/GeofenceOverlay'

const MAP_LAYER_KEY = 'sis-map-layer'

function LayerPersist({ onLayerChange }: { onLayerChange: (name: string) => void }) {
  useMapEvents({
    baselayerchange: (e) => {
      localStorage.setItem(MAP_LAYER_KEY, e.name)
      onLayerChange(e.name)
    },
  })
  return null
}

// ── Hardcoded alert zones ────────────────────────────────────
const ZONE_A: [number, number][] = [
  [21.95, 88.11],
  [21.95, 88.13],
  [21.93, 88.13],
  [21.93, 88.11],
]

const ZONE_B: [number, number][] = [
  [21.96, 88.15],
  [21.96, 88.17],
  [21.94, 88.17],
  [21.94, 88.15],
]

const badgeCls = 'text-[10px] font-bold py-[1px] px-[7px] rounded-full border'

// ── Inner component that reads stores (must be inside MapContainer tree sibling) ──
function MapOverlays() {
  const sensors = useSensorStore((s) => s.sensors)
  const tracks = useSensorStore((s) => s.tracks)
  const threatAssessment = useAlertStore((s) => s.threatAssessment)

  const sensorList = Array.from(sensors.values())

  // Zone A turns red if threat is CRITICAL
  const zoneAColor =
    threatAssessment?.threat_level === 'CRITICAL' ? '#EF4444' : '#10B981'

  return (
    <>
      {/* Alert zones */}
      <Polygon
        positions={ZONE_A}
        pathOptions={{
          color: zoneAColor,
          fillColor: zoneAColor,
          fillOpacity: 0.12,
          weight: 2,
          dashArray: '6 4',
        }}
      />
      <Polygon
        positions={ZONE_B}
        pathOptions={{
          color: '#F59E0B',
          fillColor: '#F59E0B',
          fillOpacity: 0.1,
          weight: 2,
          dashArray: '6 4',
        }}
      />

      {/* Sensor markers */}
      {sensorList.map((sensor) => (
        <SensorMarker key={sensor.sensor_id} sensor={sensor} />
      ))}

      {/* Track markers */}
      {tracks.map((track) => (
        <TrackMarker key={track.track_id} track={track} />
      ))}
    </>
  )
}

// ── Zone list sidebar ─────────────────────────────────────────
function ZoneList({ onClose }: { onClose: () => void }) {
  const zones = useGeofenceStore((s) => s.zones)
  const deleteZone = useGeofenceStore((s) => s.deleteZone)

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-48 z-[400] flex flex-col"
      style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--panel-border)', boxShadow: '-4px 0 12px rgba(0,0,0,0.3)' }}
    >
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border-color">
        <span className="text-[11px] font-bold text-text-primary">Geofence Zones</span>
        <button onClick={onClose} className="text-[12px] text-text-muted cursor-pointer bg-transparent border-none">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {zones.length === 0 && (
          <div className="text-[10px] text-text-muted text-center mt-4">
            No zones defined.<br />Click "Draw Zone" to add one.
          </div>
        )}
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-md"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--panel-border)' }}
          >
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: zone.color }} />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-text-primary truncate">{zone.name}</div>
              <div className="text-[9px] text-text-muted uppercase tracking-wide">{zone.type}</div>
            </div>
            <button
              onClick={() => deleteZone(zone.id)}
              title="Delete zone"
              className="text-[10px] text-alert-critical cursor-pointer bg-transparent border-none shrink-0"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main panel component ─────────────────────────────────────
export function LiveMapPanel() {
  const sensors = useSensorStore((s) => s.sensors)
  const tracks = useSensorStore((s) => s.tracks)
  const userZones = useGeofenceStore((s) => s.zones)
  const [isDrawing, setIsDrawing] = useState(false)
  const [showZoneList, setShowZoneList] = useState(false)
  const [activeLayer, setActiveLayer] = useState(() => localStorage.getItem(MAP_LAYER_KEY) ?? 'OpenStreetMap')
  const [showScale, setShowScale] = useState(true)
  const [showCompass, setShowCompass] = useState(true)

  const savedLayer = localStorage.getItem(MAP_LAYER_KEY) ?? 'OpenStreetMap'

  const sensorCount = sensors.size
  const trackCount = tracks.length

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      <span className="sr-only">Live Tactical Map</span>
      {/* Stats bar */}
      <div className="py-1 px-3 border-b border-border-color flex items-center justify-between shrink-0 bg-panel-header-bg">
        <span className="flex items-center gap-1.5">
          <span
            className={badgeCls}
            style={{ color: 'var(--sensor-optical)', borderColor: 'var(--sensor-optical)', background: 'rgba(14,165,233,0.1)' }}
          >
            {sensorCount} sensors
          </span>
          <span
            className={badgeCls}
            style={{ color: 'var(--alert-high)', borderColor: 'var(--alert-high)', background: 'rgba(249,115,22,0.1)' }}
          >
            {trackCount} tracks
          </span>
        </span>
        <div className="flex items-center gap-2">
          <div className="flex gap-2 text-[10px] text-text-secondary">
            <span className="text-[#10B981]">■ Zone A</span>
            <span className="text-[#F59E0B]">■ Zone B</span>
          </div>
          {/* Zone tools */}
          <button
            onClick={() => { setIsDrawing(true); setShowZoneList(false) }}
            disabled={isDrawing}
            className="text-[10px] font-semibold px-2 py-[2px] rounded border cursor-pointer"
            style={{
              background: isDrawing ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
              color: isDrawing ? '#fff' : 'var(--text-secondary)',
              borderColor: 'var(--panel-border)',
              opacity: isDrawing ? 0.7 : 1,
            }}
          >
            {isDrawing ? '✏ Drawing…' : '+ Draw Zone'}
          </button>
          <button
            onClick={() => setShowZoneList((v) => !v)}
            className="text-[10px] font-semibold px-2 py-[2px] rounded border cursor-pointer"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderColor: 'var(--panel-border)' }}
          >
            Zones ({userZones.length})
          </button>
          <button
            onClick={() => setShowScale((v) => !v)}
            title="Toggle scale bar"
            className="text-[10px] px-2 py-[2px] rounded border cursor-pointer"
            style={{
              background: showScale ? 'rgba(59,130,246,0.15)' : 'var(--bg-tertiary)',
              color: showScale ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderColor: showScale ? 'var(--accent-blue)' : 'var(--panel-border)',
            }}
          >
            ⊕ Scale
          </button>
          <button
            onClick={() => setShowCompass((v) => !v)}
            title="Toggle compass rose"
            className="text-[10px] px-2 py-[2px] rounded border cursor-pointer"
            style={{
              background: showCompass ? 'rgba(59,130,246,0.15)' : 'var(--bg-tertiary)',
              color: showCompass ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderColor: showCompass ? 'var(--accent-blue)' : 'var(--panel-border)',
            }}
          >
            🧭
          </button>
        </div>
      </div>

      {/* Map body */}
      <div className="flex-1 relative overflow-hidden">
        <MapContainer
          center={[21.9452, 88.1234]}
          zoom={12}
          className="h-full w-full"
          zoomControl
          attributionControl={false}
          style={{ cursor: isDrawing ? 'crosshair' : undefined }}
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={savedLayer === 'OpenStreetMap'} name="OpenStreetMap">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={savedLayer === 'Esri Satellite'} name="Esri Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                maxZoom={18}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={savedLayer === 'Terrain'} name="Terrain">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>, SRTM | Style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                maxZoom={17}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={savedLayer === 'Hybrid'} name="Hybrid">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri + OSM"
                maxZoom={18}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {showScale && <ScaleControl position="bottomleft" imperial={false} />}
          <LayerPersist onLayerChange={setActiveLayer} />
          <MapOverlays />
          <GeofenceOverlay />
          <ZoneDrawer
            isDrawing={isDrawing}
            onFinish={() => setIsDrawing(false)}
            onCancel={() => setIsDrawing(false)}
          />
        </MapContainer>

        {/* Compass rose */}
        {showCompass && (
          <div
            className="absolute bottom-8 right-2 z-[400] pointer-events-none select-none"
            style={{ width: 48, height: 48 }}
            aria-label="Compass"
          >
            <svg viewBox="0 0 48 48" width={48} height={48}>
              <circle cx="24" cy="24" r="22" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <polygon points="24,4 20,24 24,20 28,24" fill="#EF4444" />
              <polygon points="24,44 20,24 24,28 28,24" fill="rgba(255,255,255,0.6)" />
              <polygon points="4,24 24,20 20,24 24,28" fill="rgba(255,255,255,0.4)" />
              <polygon points="44,24 24,20 28,24 24,28" fill="rgba(255,255,255,0.4)" />
              <text x="24" y="11" textAnchor="middle" fontSize="7" fill="#EF4444" fontWeight="bold">N</text>
              <text x="24" y="43" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.6)">S</text>
              <text x="7" y="27" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.5)">W</text>
              <text x="41" y="27" textAnchor="middle" fontSize="6" fill="rgba(255,255,255,0.5)">E</text>
            </svg>
          </div>
        )}

        {/* Active layer badge */}
        <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
            style={{ background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.7)' }}
          >
            {activeLayer}
          </span>
        </div>

        {/* Zone list sidebar */}
        {showZoneList && <ZoneList onClose={() => setShowZoneList(false)} />}

        {/* Draw mode hint */}
        {isDrawing && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 z-[400] pointer-events-none px-3 py-1.5 rounded-lg text-[11px] font-semibold"
            style={{ background: 'rgba(37,99,235,0.9)', color: '#fff' }}
          >
            Click on the map to add vertices · 3+ points to close polygon
          </div>
        )}
      </div>
    </div>
  )
}
