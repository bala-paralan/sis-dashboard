import { useState } from 'react'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

const DEMO_MODE = import.meta.env['VITE_DEMO_MODE'] === 'true'

const DEMO_USER = {
  id: 'demo-001',
  email: 'operator@iinvsys.local',
  displayName: 'Demo Operator',
  role: 'OPERATOR' as const,
  createdAt: new Date().toISOString(),
}

export function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser)
  const setAuthStatus = useAuthStore((s) => s.setAuthStatus)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) { setError('Email is required.'); return }
    if (!password) { setError('Password is required.'); return }

    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      setUser(user)
      setAuthStatus('authenticated')
      toast.success(`Welcome, ${user.displayName ?? user.email}`)
    } catch (err: unknown) {
      if (DEMO_MODE) {
        // No backend available — accept any credentials in demo mode
        const demoUser = { ...DEMO_USER, email: email.trim() }
        setUser(demoUser)
        setAuthStatus('authenticated')
        toast.info('Signed in as demo operator')
      } else {
        const msg = err instanceof Error ? err.message : 'Login failed.'
        setError(msg)
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8 shadow-2xl"
        style={{
          background: 'var(--panel-header-bg)',
          borderColor: 'var(--panel-border)',
        }}
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="flex items-baseline gap-2 justify-center mb-1">
            <span className="text-3xl font-black text-accent-blue tracking-[-0.02em]">SIS</span>
            <span className="text-xs text-text-muted tracking-[0.14em] font-bold uppercase">IINVSYS</span>
          </div>
          <p className="text-xs text-text-secondary mt-1">Surveillance Intelligence System</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-primary)',
              }}
              placeholder="operator@example.com"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-text-secondary mb-1 uppercase tracking-wide"
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
              className="w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--panel-border)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-md border px-3 py-2 text-xs"
              style={{
                background: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.4)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md py-2 text-sm font-bold transition-opacity"
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          {DEMO_MODE && (
            <p className="mt-4 text-center text-[10px] text-text-muted">
              Demo mode — any credentials accepted
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
