import { useState, FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const clearError = useAuthStore((s) => s.clearError)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password || isSubmitting) return
    setIsSubmitting(true)
    clearError()
    try {
      await login(email, password)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div
        className="w-full max-w-[380px] mx-4 rounded-xl border"
        style={{
          background: 'var(--panel-bg)',
          borderColor: 'var(--panel-border)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="px-8 pt-8 pb-6 border-b"
          style={{ borderColor: 'var(--panel-border)' }}
        >
          <div className="flex items-baseline gap-2 mb-1">
            <span
              className="text-[28px] font-black tracking-[-0.03em]"
              style={{ color: 'var(--accent-blue)' }}
            >
              SIS
            </span>
            <span
              className="text-[10px] font-bold tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              IINVSYS
            </span>
          </div>
          <p
            className="text-[12px] tracking-[0.05em]"
            style={{ color: 'var(--text-secondary)' }}
          >
            Surveillance Intelligent System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sis-email"
              className="text-[11px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              Email
            </label>
            <input
              id="sis-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 px-3 rounded-lg text-[13px] border outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: error ? 'var(--alert-critical)' : 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="operator@site.mil"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="sis-password"
              className="text-[11px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: 'var(--text-secondary)' }}
            >
              Password
            </label>
            <input
              id="sis-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 px-3 rounded-lg text-[13px] border outline-none transition-colors"
              style={{
                background: 'var(--bg-tertiary)',
                borderColor: error ? 'var(--alert-critical)' : 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className="text-[12px] px-3 py-2 rounded-lg border"
              style={{
                color: 'var(--alert-critical)',
                background: 'rgba(239,68,68,0.08)',
                borderColor: 'rgba(239,68,68,0.25)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email || !password}
            className="h-10 rounded-lg text-[13px] font-bold tracking-[0.04em] transition-all mt-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent-blue)',
              color: '#fff',
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div
          className="px-8 pb-6 text-center text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Authorised personnel only · IINVSYS RESTRICTED
        </div>
      </div>
    </div>
  )
}
