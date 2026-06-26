import { useState, type FormEvent } from 'react'
import { useAuthStore } from '@/store/authStore'

export function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error } = useAuthStore()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await login(email.trim(), password)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'var(--panel-bg)',
          border: '1px solid var(--panel-border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-panel)',
          padding: '32px 28px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-blue)', letterSpacing: '-0.02em' }}>
              SIS
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.14em', fontWeight: 700, textTransform: 'uppercase' }}>
              IINVSYS
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
            Integrated Intelligence &amp; Surveillance System
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="login-email"
              style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              placeholder="operator@sis.gov"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '13px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="login-password"
              style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '9px 12px',
                fontSize: '13px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: '14px',
                padding: '9px 12px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)',
                fontSize: '12px',
                color: 'var(--alert-critical)',
              }}
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 700,
              background: loading || !email || !password ? 'var(--bg-tertiary)' : 'var(--accent-blue)',
              color: loading || !email || !password ? 'var(--text-muted)' : '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              cursor: loading || !email || !password ? 'not-allowed' : 'pointer',
              letterSpacing: '0.04em',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Authorised access only — all activity is monitored
        </p>
      </div>
    </div>
  )
}
