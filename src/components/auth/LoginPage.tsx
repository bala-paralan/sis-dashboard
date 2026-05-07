import { useState, useEffect, FormEvent } from 'react';
import { useAuthStore } from '@/store/authStore';

export function LoginPage() {
  const login    = useAuthStore((s) => s.login);
  const loading  = useAuthStore((s) => s.loading);
  const error    = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { clearError(); }, [clearError]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      style={{ background: 'var(--bg-primary)' }}
      data-testid="login-page"
    >
      <div
        className="w-full max-w-[380px] mx-4 rounded-xl p-8"
        style={{
          background:  'var(--panel-bg)',
          border:      '1px solid var(--panel-border)',
          boxShadow:   '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Logo */}
        <div className="flex items-baseline gap-2 mb-8 justify-center">
          <span className="text-[28px] font-black text-accent-blue tracking-[-0.03em]">SIS</span>
          <span className="text-[11px] text-text-muted tracking-[0.18em] font-bold uppercase">IINVSYS</span>
        </div>

        <h1 className="text-[15px] font-semibold text-text-primary mb-1 text-center">
          Sign in to continue
        </h1>
        <p className="text-[12px] text-text-muted text-center mb-6">
          Tactical Surveillance Dashboard
        </p>

        <form onSubmit={handleSubmit} noValidate aria-label="Login form">
          {/* Email */}
          <label className="block mb-4">
            <span className="block text-[11px] font-semibold text-text-secondary mb-1.5 tracking-[0.06em] uppercase">
              Email
            </span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@iinvsys.com"
              className="w-full h-[38px] px-3 rounded-lg text-[13px] text-text-primary outline-none transition-all"
              style={{
                background:   'var(--bg-tertiary)',
                border:       '1px solid var(--panel-border)',
                caretColor:   'var(--accent-blue)',
              }}
              data-testid="email-input"
            />
          </label>

          {/* Password */}
          <label className="block mb-6">
            <span className="block text-[11px] font-semibold text-text-secondary mb-1.5 tracking-[0.06em] uppercase">
              Password
            </span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-[38px] px-3 rounded-lg text-[13px] text-text-primary outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                border:     '1px solid var(--panel-border)',
              }}
              data-testid="password-input"
            />
          </label>

          {/* Error */}
          {error && (
            <div
              className="mb-4 px-3 py-2 rounded-lg text-[12px] font-medium"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border:     '1px solid rgba(239,68,68,0.3)',
                color:      'var(--alert-critical)',
              }}
              role="alert"
              data-testid="login-error"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-[40px] rounded-lg font-semibold text-[13px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--accent-blue)',
              color:      '#fff',
            }}
            data-testid="login-submit"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-text-muted">
          IINVSYS · Restricted access
        </p>
      </div>
    </div>
  );
}
