import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MemoryRouter } from 'react-router-dom'

const mockLogin = vi.fn()
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const mockStore = {
  login: mockLogin,
  loading: false,
  error: null as string | null,
  user: null as { displayName: string; email: string } | null,
}

vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn((sel: (s: typeof mockStore) => unknown) => sel(mockStore)),
}))

const { LoginPage } = await import('@/pages/LoginPage')

beforeEach(() => {
  vi.clearAllMocks()
  mockStore.loading = false
  mockStore.error = null
  mockStore.user = null
  mockLogin.mockResolvedValue(undefined)
})

describe('LoginPage', () => {
  it('renders without crashing', () => {
    const { container } = render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders SIS brand heading', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByText('SIS')).toBeInTheDocument()
  })

  it('renders email input', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it('renders password input', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('renders Sign In button', () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('calls login with email and password on submit', async () => {
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'secret')
    })
  })

  it('shows error alert when error state is set', () => {
    mockStore.error = 'Invalid credentials'
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid credentials/i)
  })

  it('shows loading text on Sign In button when loading', () => {
    mockStore.loading = true
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('button')).toHaveTextContent(/Signing in/i)
  })

  it('disables submit button while loading', () => {
    mockStore.loading = true
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('navigates to / when user is already set', () => {
    mockStore.user = { displayName: 'Admin', email: 'admin@example.com' }
    render(<MemoryRouter><LoginPage /></MemoryRouter>)
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true })
  })
})
