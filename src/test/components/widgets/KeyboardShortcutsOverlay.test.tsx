import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { KeyboardShortcutsOverlay } from '@/components/widgets/KeyboardShortcutsOverlay'

describe('KeyboardShortcutsOverlay', () => {
  it('renders without crashing', () => {
    const { container } = render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the "Keyboard Shortcuts" heading', () => {
    render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument()
  })

  it('renders all 8 shortcut rows', () => {
    render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    const kbdEls = document.querySelectorAll('kbd')
    expect(kbdEls.length).toBe(8)
  })

  it('renders keyboard key labels: M, A, V, S, I, H, ?, Esc', () => {
    render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    ;['M', 'A', 'V', 'S', 'I', 'H', '?', 'Esc'].forEach((key) => {
      expect(screen.getByText(key)).toBeInTheDocument()
    })
  })

  it('renders description for Live Map shortcut', () => {
    render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    expect(screen.getByText(/Live Map panel/i)).toBeInTheDocument()
  })

  it('calls onClose when the ✕ button is clicked', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsOverlay onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when clicking the backdrop', () => {
    const onClose = vi.fn()
    render(<KeyboardShortcutsOverlay onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    fireEvent.click(dialog)
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has role="dialog" and aria-modal="true"', () => {
    render(<KeyboardShortcutsOverlay onClose={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
