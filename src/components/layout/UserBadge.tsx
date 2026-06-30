import { useAuthStore } from '@/store/authStore'

export function UserBadge() {
  const { user, isAuthenticated, logout } = useAuthStore()

  const label = isAuthenticated && user ? user.email : 'Operator'

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className="flex items-center gap-1.5 py-1 px-[10px] rounded-[6px] bg-bg-tertiary border border-border-color">
        <span
          className="w-[7px] h-[7px] rounded-full bg-sensor-acoustic shrink-0"
          style={{ boxShadow: '0 0 5px var(--sensor-acoustic)' }}
        />
        <span className="topbar-user-label text-[11px] text-text-primary font-semibold truncate max-w-[120px]">
          {label}
        </span>
      </div>
      {isAuthenticated && (
        <button
          onClick={() => void logout()}
          title="Sign out"
          className="py-1 px-2 rounded-[6px] text-[11px] font-semibold text-text-secondary hover:text-alert-critical border border-border-color bg-bg-tertiary transition-colors"
          aria-label="Sign out"
        >
          ⏻
        </button>
      )}
    </div>
  )
}
