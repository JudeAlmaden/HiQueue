"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import { AlertTriangle, RotateCcw } from "lucide-react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground transition-colors duration-200">
          <div className="w-full max-w-md text-center space-y-6">
            <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-error-container text-on-error-container shadow-md border border-error/10">
              <AlertTriangle className="h-8 w-8 text-error" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">Something went wrong</h1>
              <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
                An unexpected error occurred in this section of HiQueue. The issue has been logged.
              </p>
            </div>

            {this.state.error && (
              <pre className="text-left text-xs bg-surface-container text-on-surface-variant p-4 rounded-xl border border-outline-variant/30 overflow-auto max-h-40 font-mono">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full font-semibold text-sm transition-all hover:opacity-90 bg-primary text-on-primary shadow-md"
            >
              <RotateCcw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
export default ErrorBoundary
