import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      setUser(user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-xl"
        style={{ background: 'var(--panel-bg)', border: '1px solid var(--panel-border)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black text-accent-blue tracking-[-0.02em]">SIS</div>
          <div className="text-xs text-text-muted tracking-[0.14em] font-bold uppercase mt-1">
            IINVSYS Secure Login
          </div>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-[0.05em]">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-[9px] px-3 rounded-[6px] border border-border-color bg-bg-tertiary text-text-primary text-[13px] outline-none"
              style={{ transition: 'border-color 0.15s' }}
              placeholder="operator@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-semibold text-text-secondary uppercase tracking-[0.05em]">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-[9px] px-3 rounded-[6px] border border-border-color bg-bg-tertiary text-text-primary text-[13px] outline-none"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div
              className="text-[12px] px-3 py-2 rounded-[6px]"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--alert-critical)' }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-[10px] rounded-[6px] font-bold text-[13px] text-white border-none cursor-pointer mt-2"
            style={{
              background: loading ? 'rgba(59,130,246,0.5)' : 'var(--accent-blue)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6 text-[11px] text-text-muted">
          Integrated Intelligence Network &amp; Video Surveillance System
        </div>
      </div>
    </div>
  )
}
