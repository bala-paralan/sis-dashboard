import { Polygon, Tooltip } from 'react-leaflet'
import { useGeofenceStore } from '@/store/geofenceStore'

export function GeofenceOverlay() {
  const zones = useGeofenceStore((s) => s.zones)

  return (
    <>
      {zones.map((zone) => (
        <Polygon
          key={zone.id}
          positions={zone.vertices}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '8 5',
          }}
        >
          <Tooltip sticky>{zone.name} ({zone.type})</Tooltip>
        </Polygon>
      ))}
    </>
  )
}
