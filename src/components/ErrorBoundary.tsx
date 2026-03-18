'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
  context?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console in dev — replace with Sentry in production
    console.error(`[EETRA ErrorBoundary${this.props.context ? ` — ${this.props.context}` : ''}]`, error, info)
  }

  reset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div
          style={{
            padding: '20px 24px',
            borderRadius: 10,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)' }}>
            Une erreur est survenue dans ce composant
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <pre style={{ fontSize: 11, color: 'var(--text4)', overflow: 'auto', maxHeight: 120 }}>
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.reset}
            style={{
              alignSelf: 'flex-start',
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border2)',
              background: 'transparent',
              color: 'var(--text2)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Simpler functional wrapper for non-critical sections
export function SafeBlock({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <ErrorBoundary context={label}>
      {children}
    </ErrorBoundary>
  )
}
