import type { Camera } from '@/api/cameras';
import { CameraStatusBadge } from './CameraStatusBadge';
import { RequiresRole } from '@/components/auth/RequiresRole';

interface Props {
  camera:    Camera;
  onSelect:  (id: string) => void;
  onEdit:    (cam: Camera) => void;
  onDelete:  (id: string) => void;
  onTest:    (id: string) => void;
  testResult?: { reachable: boolean; latency_ms: number | null; message: string };
}

export const CameraCard = ({ camera, onSelect, onEdit, onDelete, onTest, testResult }: Props) => (
  <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10">

    {/* Header */}
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">{camera.name}</p>
        {camera.location && (
          <p className="truncate text-xs text-gray-400">{camera.location}</p>
        )}
      </div>
      <CameraStatusBadge status={camera.status} />
    </div>

    {/* Meta */}
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-400">
      {camera.manufacturer && (
        <>
          <dt>Manufacturer</dt>
          <dd className="truncate text-gray-300">{camera.manufacturer}</dd>
        </>
      )}
      {camera.model && (
        <>
          <dt>Model</dt>
          <dd className="truncate text-gray-300">{camera.model}</dd>
        </>
      )}
      {camera.lastSeenAt && (
        <>
          <dt>Last seen</dt>
          <dd className="text-gray-300">{new Date(camera.lastSeenAt).toLocaleString()}</dd>
        </>
      )}
    </dl>

    {/* Test result */}
    {testResult && (
      <p className={`rounded px-2 py-1 text-xs ${testResult.reachable ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
        {testResult.reachable
          ? `✓ Reachable — ${testResult.latency_ms ?? '?'} ms`
          : `✗ ${testResult.message}`}
      </p>
    )}

    {/* Actions */}
    <div className="mt-auto flex flex-wrap gap-2 pt-1">
      <button
        onClick={() => onSelect(camera.id)}
        className="flex-1 rounded bg-indigo-600 px-2 py-1 text-xs font-medium text-white hover:bg-indigo-500"
      >
        ▶ Live
      </button>
      <button
        onClick={() => onTest(camera.id)}
        className="rounded border border-white/20 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
      >
        Test
      </button>
      <RequiresRole role="OPERATOR">
        <button
          onClick={() => onEdit(camera)}
          className="rounded border border-white/20 px-2 py-1 text-xs text-gray-300 hover:bg-white/10"
        >
          Edit
        </button>
        <button
          onClick={() => { if (confirm(`Delete camera "${camera.name}"?`)) onDelete(camera.id); }}
          className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-900/30"
        >
          Delete
        </button>
      </RequiresRole>
    </div>
  </div>
);
