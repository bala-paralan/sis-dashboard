import { FormEvent, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const login   = useAuthStore((s) => s.login)
  const loading = useAuthStore((s) => s.loading)
  const error   = useAuthStore((s) => s.error)

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    await login(email, password)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
      <div
        className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 shadow-lg"
        data-testid="login-page"
      >
        {/* Logo / brand */}
        <div className="mb-6 text-center">
          <div className="text-[var(--accent-teal)] font-mono font-bold text-xl tracking-widest mb-1">
            IINVSYS
          </div>
          <div className="text-[var(--text-secondary)] text-xs tracking-wider">
            SITUATIONAL INTELLIGENCE SYSTEM
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="
                w-full rounded-md border border-[var(--border-color)]
                bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                px-3 py-2 text-sm
                focus:outline-none focus:border-[var(--accent-blue)]
                disabled:opacity-50
              "
              placeholder="operator@example.com"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="
                w-full rounded-md border border-[var(--border-color)]
                bg-[var(--bg-tertiary)] text-[var(--text-primary)]
                px-3 py-2 text-sm
                focus:outline-none focus:border-[var(--accent-blue)]
                disabled:opacity-50
              "
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border border-[var(--alert-high)] bg-[var(--alert-high)]/10 px-3 py-2 text-[12px] text-[var(--alert-high)]"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="
              w-full rounded-md py-2 text-sm font-semibold tracking-wide
              bg-[var(--accent-blue)] text-white
              hover:opacity-90 active:opacity-75
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-opacity
            "
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-[var(--text-secondary)]">
          Authorised personnel only — all access is monitored and logged.
        </p>
      </div>
    </div>
  )
}
