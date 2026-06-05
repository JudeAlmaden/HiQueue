import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RegisterPage from './page'
import { registerUser } from '@/server/actions/auth.action'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the dependencies
vi.mock('@/server/actions/auth.action', () => ({
  registerUser: vi.fn(),
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}))

vi.mock('@/components/Logo', () => ({
  Logo: () => <div>Logo</div>,
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show spinner when form is submitted', async () => {
    // Mock registerUser to delay response
    const mockRegisterUser = registerUser as any
    mockRegisterUser.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Test error' }), 100)))

    render(<RegisterPage />)

    // Find the submit button
    const submitButton = screen.getByRole('button', { name: /create account/i })
    
    // Initially, button should show "Create Account"
    expect(submitButton).toHaveTextContent('Create Account')
    expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument()

    // Fill in the form
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })

    // Click submit
    fireEvent.click(submitButton)

    // CRITICAL: Spinner should appear immediately
    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    }, { timeout: 100 })

    // Verify the spinner icon is present (Loader2 component)
    const spinner = screen.getByText(/creating account/i).querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')

    // Button should be disabled
    expect(submitButton).toBeDisabled()

    // Wait for the registration to complete
    await waitFor(() => {
      expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument()
    })
  })

  it('should stop spinner and show error when registration fails', async () => {
    const mockRegisterUser = registerUser as any
    mockRegisterUser.mockResolvedValue({ success: false, error: 'Email already exists' })

    render(<RegisterPage />)

    const submitButton = screen.getByRole('button', { name: /create account/i })
    const nameInput = screen.getByLabelText(/full name/i)
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i)
    
    fireEvent.change(nameInput, { target: { value: 'Test User' } })
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    // Spinner should show
    await waitFor(() => {
      expect(screen.getByText(/creating account/i)).toBeInTheDocument()
    })

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument()
    })

    // Spinner should be gone
    expect(screen.queryByText(/creating account/i)).not.toBeInTheDocument()
    
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled()
  })
})
