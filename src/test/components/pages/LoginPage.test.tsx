import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import '@testing-library/jest-dom'
import { LoginPage } from '@/components/pages/LoginPage'

vi.mock('@/api/auth', () => ({
  login:  vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
  getMe:  vi.fn(),
}))

import * as authApi from '@/api/auth'

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<div data-testid="dashboard">Dashboard</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => vi.clearAllMocks())

describe('LoginPage', () => {
  it('renders without crashing', () => {
    expect(() => renderLogin()).not.toThrow()
  })

  it('shows the IINVSYS heading', () => {
    renderLogin()
    expect(screen.getByText('IINVSYS')).toBeInTheDocument()
  })

  it('shows an email input', () => {
    renderLogin()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('shows a password input', () => {
    renderLogin()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('shows a Sign In button', () => {
    renderLogin()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('calls login() with email and password on submit', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(authApi.login).toHaveBeenCalledWith('op@test.com', 'secret123'))
  })

  it('navigates to "/" on successful login', async () => {
    vi.mocked(authApi.login).mockResolvedValue({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByTestId('dashboard')).toBeInTheDocument())
  })

  it('shows error message on login failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'))
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument())
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
  })

  it('shows "Signing in…" while submitting', async () => {
    let resolve!: (v: any) => void
    vi.mocked(authApi.login).mockReturnValue(new Promise((r) => { resolve = r }))
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByText(/signing in/i)).toBeInTheDocument())
    resolve({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })
  })

  it('disables the submit button while submitting', async () => {
    let resolve!: (v: any) => void
    vi.mocked(authApi.login).mockReturnValue(new Promise((r) => { resolve = r }))
    renderLogin()
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'op@test.com' } })
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled())
    resolve({ id: '1', email: 'op@test.com', displayName: null, role: 'OPERATOR', createdAt: '' })
  })

  it('shows authorized-access disclaimer', () => {
    renderLogin()
    expect(screen.getByText(/Authorised access only/i)).toBeInTheDocument()
  })
})
