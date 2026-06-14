export function DemoModeBanner() {
  return (
    <div
      className="mx-[10px] mt-[6px] px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider flex items-center gap-2"
      style={{
        background: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.4)',
        color: 'var(--alert-medium)',
      }}
      data-testid="demo-mode-banner"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--alert-medium)] shrink-0" />
      DEMO MODE — Live backend not connected. Showing static data.
    </div>
  )
}
