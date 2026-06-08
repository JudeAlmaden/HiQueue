import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from './LoginForm'
import { loginUser } from '@/server/actions/auth.action'
import { useSearchParams } from 'next/navigation'
import { vi, describe, it, expect, beforeEach } from 'vitest'

// Mock the dependencies
vi.mock('@/server/actions/auth.action', () => ({
  loginUser: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}))

vi.mock('@/components/Logo', () => ({
  Logo: () => <div>Logo</div>,
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchParams).mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    } as unknown as ReturnType<typeof useSearchParams>)
  })

  it('should show spinner when form is submitted', async () => {
    // Mock loginUser to delay response
    const mockLoginUser = vi.mocked(loginUser)
    mockLoginUser.mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({ success: false, error: 'Test error' }), 100)))

    render(<LoginForm />)

    // Find the submit button
    const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
    
    // Initially, button should show "Sign in to dashboard"
    expect(submitButton).toHaveTextContent('Sign in to dashboard')
    expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()

    // Fill in the form
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })

    // Click submit
    fireEvent.click(submitButton)

    // CRITICAL: Spinner should appear immediately
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    }, { timeout: 100 })

    // Verify the spinner icon is present (Loader2 component)
    const spinner = screen.getByText(/signing in/i).querySelector('svg')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('animate-spin')

    // Button should be disabled
    expect(submitButton).toBeDisabled()

    // Wait for the login to complete
    await waitFor(() => {
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })

  it('should stop spinner and show error when login fails', async () => {
    const mockLoginUser = vi.mocked(loginUser)
    mockLoginUser.mockResolvedValue({ success: false, error: 'Invalid credentials' })

    render(<LoginForm />)

    const submitButton = screen.getByRole('button', { name: /sign in to dashboard/i })
    const emailInput = screen.getByLabelText(/email address/i)
    const passwordInput = screen.getByLabelText(/^password$/i)
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } })
    fireEvent.click(submitButton)

    // Spinner should show
    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    })

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    // Spinner should be gone
    expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    
    // Button should be enabled again
    expect(submitButton).not.toBeDisabled()
  })
})
