import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const setUser    = useAuthStore((s) => s.setUser)
  const navigate   = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      setUser(user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
      data-theme="dark"
    >
      <div
        className="w-full max-w-sm rounded-xl border p-8 flex flex-col gap-6"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-1 mb-2">
          <span className="text-[32px] font-black text-accent-blue tracking-[-0.03em] leading-none">
            SIS
          </span>
          <span className="text-[10px] text-text-muted tracking-[0.18em] font-bold uppercase">
            IINVSYS
          </span>
          <span className="text-[12px] text-text-secondary mt-2">
            Tactical Dashboard — Secure Login
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.08em]"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@iinvsys.mil"
              className="h-10 rounded-[6px] border px-3 text-[13px] outline-none transition-[border-color,box-shadow] duration-150"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-password"
              className="text-[11px] font-semibold text-text-secondary uppercase tracking-[0.08em]"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 rounded-[6px] border px-3 text-[13px] outline-none transition-[border-color] duration-150"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent-blue)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-[12px] rounded-[6px] px-3 py-2"
              style={{
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--alert-critical)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-[6px] text-[13px] font-bold tracking-[0.04em] transition-opacity duration-150 mt-1"
            style={{
              background: loading ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
              color: loading ? 'var(--text-secondary)' : '#fff',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-[10px] text-text-muted">
          IINVSYS Classification: RESTRICTED
        </p>
      </div>
    </div>
  )
}
