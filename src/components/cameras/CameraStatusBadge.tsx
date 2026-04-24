import type { CameraStatus } from '@/api/cameras';

const palette: Record<CameraStatus, string> = {
  ONLINE:      'bg-green-500/20  text-green-300  border-green-500/40',
  OFFLINE:     'bg-gray-500/20   text-gray-400   border-gray-500/40',
  DEGRADED:    'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  ERROR:       'bg-red-500/20    text-red-300    border-red-500/40',
  MAINTENANCE: 'bg-blue-500/20   text-blue-300   border-blue-500/40',
};

interface Props { status: CameraStatus }

export const CameraStatusBadge = ({ status }: Props) => (
  <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium ${palette[status]}`}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />
    {status}
  </span>
);
