import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Bug, FileText, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  userDescription: string
  showDetails: boolean
  reported: boolean
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void
  showRetry?: boolean
  showDetails?: boolean
  enableReporting?: boolean
  component?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Error boundary component for catching and handling React errors in designer components
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0
  private maxRetries = 3

  constructor(props: ErrorBoundaryProps) {
    super(props)

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      userDescription: '',
      showDetails: props.showDetails || false,
      reported: false,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, this.state.errorId!)
    }

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      component: this.props.component,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    })

    // Report to monitoring service (if available)
    if (this.props.enableReporting !== false) {
      this.reportError(error, errorInfo)
    }
  }

  /**
   * Report error to monitoring service
   */
  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        component: this.props.component,
        severity: this.props.severity || 'medium',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        buildInfo:
          process.env.NODE_ENV === 'development'
            ? {
                version: process.env.npm_package_version,
                buildTime: process.env.BUILD_TIME,
              }
            : undefined,
      }

      // In a real implementation, you would send this to a monitoring service
      // For now, we'll just log it and store it locally
      console.error('Error reported:', errorData)

      // Store error in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('designer_errors') || '[]')
      existingErrors.push(errorData)

      // Keep only last 10 errors
      if (existingErrors.length > 10) {
        existingErrors.splice(0, existingErrors.length - 10)
      }

      localStorage.setItem('designer_errors', JSON.stringify(existingErrors))
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError)
    }
  }

  /**
   * Handle retry action
   */
  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null,
        userDescription: '',
        reported: false,
      })
    }
  }

  /**
   * Handle user description change
   */
  private handleDescriptionChange = (value: string) => {
    this.setState({ userDescription: value })
  }

  /**
   * Handle manual error report
   */
  private handleReportError = async () => {
    if (this.state.error && this.state.errorInfo) {
      const reportData = {
        ...this.state,
        userDescription: this.state.userDescription,
        reportedAt: new Date().toISOString(),
      }

      try {
        // Send user report
        console.log('User error report:', reportData)

        this.setState({ reported: true })
      } catch (error) {
        console.error('Failed to send user report:', error)
      }
    }
  }

  /**
   * Toggle error details visibility
   */
  private toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }))
  }

  /**
   * Get severity color
   */
  private getSeverityColor(severity?: string) {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback
    }

    const { error, errorInfo, errorId, userDescription, showDetails, reported } = this.state
    const { component, showRetry = true, enableReporting = true, severity = 'medium' } = this.props

    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2">
              Something went wrong
              <Badge variant={this.getSeverityColor(severity)} className="text-xs">
                {severity?.toUpperCase()}
              </Badge>
            </CardTitle>
            <CardDescription>
              {component && `An error occurred in the ${component} component. `}
              The designer encountered an unexpected error and was unable to continue.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Summary */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <h4 className="mb-2 font-medium">Error Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Error ID:</span>
                  <code className="rounded bg-muted px-2 py-1 text-xs">{errorId}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Component:</span>
                  <span className="font-mono text-xs">{component || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="text-xs">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* User Description */}
            {enableReporting && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  What were you doing when this error occurred?
                </label>
                <Textarea
                  placeholder="Please describe what you were trying to do..."
                  value={userDescription}
                  onChange={e => this.handleDescriptionChange(e.target.value)}
                  className="min-h-20 resize-none"
                />
              </div>
            )}

            {/* Error Details */}
            <div>
              <Button variant="ghost" size="sm" onClick={this.toggleDetails} className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>

              {showDetails && error && (
                <div className="mt-3 space-y-3">
                  <div className="rounded-lg border bg-red-50 p-3">
                    <h5 className="mb-2 text-sm font-medium text-red-800">Error Message</h5>
                    <pre className="whitespace-pre-wrap font-mono text-xs text-red-700">
                      {error.message}
                    </pre>
                  </div>

                  {error.stack && (
                    <div className="rounded-lg border bg-orange-50 p-3">
                      <h5 className="mb-2 text-sm font-medium text-orange-800">Stack Trace</h5>
                      <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-orange-700">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {errorInfo?.componentStack && (
                    <div className="rounded-lg border bg-blue-50 p-3">
                      <h5 className="mb-2 text-sm font-medium text-blue-800">Component Stack</h5>
                      <pre className="max-h-32 overflow-auto whitespace-pre-wrap font-mono text-xs text-blue-700">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              {showRetry && this.retryCount < this.maxRetries && (
                <Button onClick={this.handleRetry} className="flex-1" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again {this.retryCount > 0 && `(${this.retryCount}/${this.maxRetries})`}
                </Button>
              )}

              {enableReporting && (
                <Button
                  onClick={this.handleReportError}
                  disabled={reported || !userDescription.trim()}
                  variant="outline"
                  className="flex-1"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {reported ? 'Report Sent' : 'Send Report'}
                </Button>
              )}

              <Button onClick={() => window.location.reload()} variant="ghost" className="flex-1">
                Reload Page
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <span>Error ID: {errorId}</span>
                {process.env.NODE_ENV === 'development' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => console.error(error, errorInfo)}
                    className="h-6 px-2 text-xs"
                  >
                    <Bug className="mr-1 h-3 w-3" />
                    Debug
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
}

/**
 * Fallback component for specific designer sections
 */
export function DesignerSectionFallback({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <Card className="m-4">
      <CardContent className="flex flex-col items-center justify-center py-8">
        <AlertTriangle className="mb-4 h-12 w-12 text-muted-foreground" />
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-4 text-center text-sm text-muted-foreground">{description}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Hook for using error boundaries in functional components
 */
export function useErrorHandler() {
  const handleError = React.useCallback(
    (
      error: Error,
      errorInfo?: {
        componentStack?: string
        additionalInfo?: Record<string, unknown>
      }
    ) => {
      console.error('Error caught by error handler:', {
        error,
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      })

      // In a real implementation, you might send this to a monitoring service
      // or show a user-friendly error message
    },
    []
  )

  return { handleError }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
