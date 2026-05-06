/**
 * Camera management page — grid of camera cards + CRUD modals.
 * TASK-003: Camera grid UI.
 */
import { useEffect, useState } from 'react';
import { useCameraStore } from '@/store/cameraStore';
import { useToast } from '@/hooks/useToast';
import type { Camera, CreateCameraInput, CameraStatus } from '@/api/cameras';
import { CameraCard } from './CameraCard';
import { CameraFormModal } from './CameraFormModal';
import { CameraPlayer } from './CameraPlayer';

const STATUSES: Array<CameraStatus | ''> = ['', 'ONLINE', 'OFFLINE', 'DEGRADED', 'ERROR', 'MAINTENANCE'];

export const CameraGrid = () => {
  const {
    cameras, total, page, loading, error,
    selectedId, testResults,
    filterStatus, filterSiteId,
    loadCameras, addCamera, editCamera, removeCamera,
    testCamera, selectCamera,
    setFilterStatus, setFilterSiteId,
  } = useCameraStore();

  const [showAdd,  setShowAdd]  = useState(false);
  const [editing,  setEditing]  = useState<Camera | null>(null);
  const toast = useToast();

  useEffect(() => { void loadCameras(); }, []);

  const handleAdd = async (input: CreateCameraInput) => {
    await addCamera(input);
    toast.success('Camera added successfully');
  };
  const handleEdit = async (input: CreateCameraInput) => {
    if (!editing) return;
    await editCamera(editing.id, input);
    setEditing(null);
    toast.success('Camera updated successfully');
  };

  const handleDelete = (id: string) => {
    void removeCamera(id).then(() => {
      toast.success('Camera deleted');
    }).catch((e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Failed to delete camera');
    });
  };

  const handleFilter = (status: CameraStatus | '') => {
    setFilterStatus(status);
    void loadCameras(1);
  };

  return (
    <div className="flex flex-col gap-4 p-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">Cameras <span className="text-sm font-normal text-gray-400">({total})</span></h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => handleFilter(e.target.value as CameraStatus | '')}
            className="rounded border border-white/20 bg-gray-800 px-2 py-1 text-sm text-gray-300"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>

          {/* Site filter */}
          <input
            type="text"
            placeholder="Site ID…"
            value={filterSiteId}
            onChange={(e) => { setFilterSiteId(e.target.value); void loadCameras(1); }}
            className="w-32 rounded border border-white/20 bg-gray-800 px-2 py-1 text-sm text-gray-300 placeholder-gray-500"
          />

          <button
            onClick={() => void loadCameras(page)}
            className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 hover:bg-white/10"
          >
            ↺ Refresh
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="rounded bg-indigo-600 px-3 py-1 text-sm font-medium text-white hover:bg-indigo-500"
          >
            + Add Camera
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded bg-red-900/40 px-4 py-2 text-sm text-red-300">{error}</p>
      )}

      {/* Loading skeleton */}
      {loading && cameras.length === 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      )}

      {/* Grid */}
      {!loading && cameras.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <p className="text-lg">No cameras found</p>
          <p className="text-sm">Add your first camera to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cameras.map((cam) => (
          <CameraCard
            key={cam.id}
            camera={cam}
            testResult={testResults[cam.id]}
            onSelect={selectCamera}
            onEdit={setEditing}
            onDelete={handleDelete}
            onTest={(id) => void testCamera(id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {total > 24 && (
        <div className="flex justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => void loadCameras(page - 1)}
            className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 disabled:opacity-40 hover:bg-white/10"
          >
            ← Prev
          </button>
          <span className="self-center text-sm text-gray-400">Page {page}</span>
          <button
            disabled={page * 24 >= total}
            onClick={() => void loadCameras(page + 1)}
            className="rounded border border-white/20 px-3 py-1 text-sm text-gray-300 disabled:opacity-40 hover:bg-white/10"
          >
            Next →
          </button>
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <CameraFormModal
          mode="add"
          onSubmit={handleAdd}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <CameraFormModal
          mode="edit"
          initial={editing}
          onSubmit={handleEdit}
          onClose={() => setEditing(null)}
        />
      )}
      {selectedId && (
        <CameraPlayer
          cameraId={selectedId}
          onClose={() => selectCamera(null)}
        />
      )}
    </div>
  );
};
