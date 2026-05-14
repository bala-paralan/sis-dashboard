import { useSystemStore } from '@/store/systemStore'

export function DemoModeBanner() {
  const status = useSystemStore((s) => s.connectionStatus)
  if (status === 'connected') return null
  return (
    <div
      className="mx-[10px] mt-[6px] px-3 py-1.5 rounded text-[10px] font-semibold flex items-center gap-2"
      style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: 'var(--alert-medium)' }}
    >
      <span>⚠</span>
      <span>DEMO MODE — backend not connected, showing simulated data</span>
      <span className="ml-auto opacity-60 font-normal capitalize">{status}</span>
    </div>
  )
}
