import { create } from 'zustand'

export type ZoneType = 'exclusion' | 'inclusion' | 'alert'

export interface GeofenceZone {
  id: string
  name: string
  type: ZoneType
  color: string
  vertices: [number, number][]
  createdAt: string
}

const STORAGE_KEY = 'sis-geofences'

function loadFromStorage(): GeofenceZone[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as GeofenceZone[]
  } catch {
    return []
  }
}

function saveToStorage(zones: GeofenceZone[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(zones))
}

interface GeofenceState {
  zones: GeofenceZone[]
  addZone: (zone: Omit<GeofenceZone, 'id' | 'createdAt'>) => GeofenceZone
  deleteZone: (id: string) => void
  updateZone: (id: string, updates: Partial<Omit<GeofenceZone, 'id' | 'createdAt'>>) => void
}

export const useGeofenceStore = create<GeofenceState>()((set, get) => ({
  zones: loadFromStorage(),

  addZone: (zone) => {
    const newZone: GeofenceZone = {
      ...zone,
      id: `zone-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
    }
    const zones = [...get().zones, newZone]
    saveToStorage(zones)
    set({ zones })
    return newZone
  },

  deleteZone: (id) => {
    const zones = get().zones.filter((z) => z.id !== id)
    saveToStorage(zones)
    set({ zones })
  },

  updateZone: (id, updates) => {
    const zones = get().zones.map((z) => (z.id === id ? { ...z, ...updates } : z))
    saveToStorage(zones)
    set({ zones })
  },
}))
