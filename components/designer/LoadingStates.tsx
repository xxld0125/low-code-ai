import React from 'react'
import { Loader2, RefreshCw, Database, GitBranch, Users, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

/**
 * Loading types for different operations
 */
export type LoadingType =
  | 'table_creation'
  | 'table_deployment'
  | 'field_operation'
  | 'relationship_creation'
  | 'schema_validation'
  | 'data_loading'
  | 'lock_acquisition'
  | 'conflict_resolution'
  | 'api_generation'
  | 'general'

/**
 * Loading state interface
 */
export interface LoadingState {
  type: LoadingType
  message: string
  progress?: number
  showProgress?: boolean
  cancellable?: boolean
  onCancel?: () => void
}

/**
 * Loading spinner component
 */
export function LoadingSpinner({
  size = 'default',
  className,
}: {
  size?: 'sm' | 'default' | 'lg'
  className?: string
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return <Loader2 className={cn('animate-spin text-primary', sizeClasses[size], className)} />
}

/**
 * Get appropriate icon for loading type
 */
function getLoadingIcon(type: LoadingType, className = '') {
  switch (type) {
    case 'table_creation':
    case 'table_deployment':
      return <Database className={cn('h-4 w-4', className)} />
    case 'field_operation':
      return <RefreshCw className={cn('h-4 w-4', className)} />
    case 'relationship_creation':
      return <GitBranch className={cn('h-4 w-4', className)} />
    case 'lock_acquisition':
      return <Lock className={cn('h-4 w-4', className)} />
    case 'conflict_resolution':
      return <Users className={cn('h-4 w-4', className)} />
    case 'api_generation':
      return <GitBranch className={cn('h-4 w-4', className)} />
    default:
      return <Loader2 className={cn('h-4 w-4', className)} />
  }
}

/**
 * Get loading message based on type
 */
function getDefaultMessage(type: LoadingType): string {
  switch (type) {
    case 'table_creation':
      return 'Creating table...'
    case 'table_deployment':
      return 'Deploying table to database...'
    case 'field_operation':
      return 'Updating field...'
    case 'relationship_creation':
      return 'Creating relationship...'
    case 'schema_validation':
      return 'Validating schema...'
    case 'data_loading':
      return 'Loading data...'
    case 'lock_acquisition':
      return 'Acquiring table lock...'
    case 'conflict_resolution':
      return 'Resolving conflicts...'
    case 'api_generation':
      return 'Generating API endpoints...'
    default:
      return 'Loading...'
  }
}

/**
 * Get loading type color theme
 */
function getLoadingTheme(type: LoadingType) {
  switch (type) {
    case 'table_deployment':
    case 'api_generation':
      return 'blue'
    case 'conflict_resolution':
      return 'orange'
    case 'lock_acquisition':
      return 'green'
    default:
      return 'gray'
  }
}

/**
 * Loading overlay component
 */
export function LoadingOverlay({
  isLoading,
  type = 'general',
  message,
  progress,
  showProgress = false,
  cancellable = false,
  onCancel,
  className,
  children,
}: {
  isLoading: boolean
  type?: LoadingType
  message?: string
  progress?: number
  showProgress?: boolean
  cancellable?: boolean
  onCancel?: () => void
  className?: string
  children: React.ReactNode
}) {
  const theme = getLoadingTheme(type)
  const displayMessage = message || getDefaultMessage(type)

  return (
    <div className={cn('relative', className)}>
      {children}

      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg border bg-card p-6 shadow-lg">
            {/* Icon and spinner */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'animate-pulse',
                  theme === 'blue' && 'text-blue-500',
                  theme === 'orange' && 'text-orange-500',
                  theme === 'green' && 'text-green-500',
                  theme === 'gray' && 'text-gray-500'
                )}
              >
                {getLoadingIcon(type)}
              </div>
              <LoadingSpinner />
            </div>

            {/* Message */}
            <div className="text-center">
              <p className="text-sm font-medium">{displayMessage}</p>
            </div>

            {/* Progress bar */}
            {showProgress && typeof progress === 'number' && (
              <div className="w-full space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-xs text-muted-foreground">{Math.round(progress)}%</p>
              </div>
            )}

            {/* Cancel button */}
            {cancellable && onCancel && (
              <button
                onClick={onCancel}
                className="rounded-md border border-input bg-background px-3 py-1 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Inline loading indicator
 */
export function InlineLoading({
  isLoading,
  type = 'general',
  message,
  size = 'sm',
  className,
}: {
  isLoading: boolean
  type?: LoadingType
  message?: string
  size?: 'sm' | 'default'
  className?: string
}) {
  if (!isLoading) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <LoadingSpinner size={size} />
      <span className="text-sm text-muted-foreground">{message || getDefaultMessage(type)}</span>
    </div>
  )
}

/**
 * Loading button with spinner
 */
export function LoadingButton({
  isLoading,
  children,
  type = 'general',
  loadingText,
  disabled,
  className,
  buttonType = 'button', // HTML button type
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  isLoading: boolean
  type?: LoadingType
  loadingText?: string
  children: React.ReactNode
  buttonType?: React.ButtonHTMLAttributes<HTMLButtonElement>['type']
}) {
  return (
    <button
      {...props}
      type={buttonType}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-9 px-4 py-2',
        className
      )}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          {loadingText || getDefaultMessage(type)}
        </>
      ) : (
        children
      )}
    </button>
  )
}

/**
 * Loading skeleton component
 */
export function LoadingSkeleton({
  className,
  lines = 3,
  type = 'text',
}: {
  className?: string
  lines?: number
  type?: 'text' | 'card' | 'table' | 'field'
}) {
  if (type === 'card') {
    return (
      <div className={cn('space-y-4 rounded-lg border p-4', className)}>
        <div className="space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (type === 'table') {
    return (
      <div className={cn('space-y-3', className)}>
        <div className="h-8 w-1/4 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-6 w-full animate-pulse rounded bg-muted" />
          <div className="h-6 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-6 w-4/6 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  if (type === 'field') {
    return (
      <div className={cn('flex items-center gap-3 rounded-lg border p-3', className)}>
        <div className="h-4 w-4 animate-pulse rounded bg-muted" />
        <div className="flex-1 space-y-1">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  // Default text skeleton
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-4 animate-pulse rounded bg-muted',
            i === lines - 1 && 'w-3/4' // Last line is shorter
          )}
        />
      ))}
    </div>
  )
}

/**
 * Loading card component
 */
export function LoadingCard({
  title,
  type = 'general',
  className,
}: {
  title?: string
  type?: LoadingType
  className?: string
}) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="mb-4 flex items-center gap-3">
        <LoadingSpinner />
        <h3 className="text-lg font-semibold">{title || getDefaultMessage(type)}</h3>
      </div>
      <LoadingSkeleton lines={3} />
    </div>
  )
}

/**
 * Loading status badge
 */
export function LoadingStatusBadge({
  type,
  message,
  progress,
  className,
}: {
  type: LoadingType
  message?: string
  progress?: number
  className?: string
}) {
  const theme = getLoadingTheme(type)
  const displayMessage = message || getDefaultMessage(type)

  return (
    <Badge
      variant="secondary"
      className={cn(
        'flex items-center gap-2',
        theme === 'blue' && 'bg-blue-100 text-blue-800',
        theme === 'orange' && 'bg-orange-100 text-orange-800',
        theme === 'green' && 'bg-green-100 text-green-800',
        className
      )}
    >
      <LoadingSpinner size="sm" />
      <span className="text-xs">
        {progress ? `${displayMessage} (${Math.round(progress)}%)` : displayMessage}
      </span>
    </Badge>
  )
}

/**
 * Progress indicator for multi-step operations
 */
export function StepProgress({
  currentStep,
  totalSteps,
  steps,
  className,
}: {
  currentStep: number
  totalSteps: number
  steps?: string[]
  className?: string
}) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step labels */}
      {steps && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                'text-center',
                index + 1 <= currentStep && 'font-medium text-foreground'
              )}
            >
              <div
                className={cn(
                  'mx-auto mb-1 h-2 w-2 rounded-full',
                  index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
              {step}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Hook for managing loading states
 */
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, LoadingState>>({})

  const setLoading = React.useCallback((key: string, loading: Partial<LoadingState> | false) => {
    setLoadingStates(prev => {
      if (loading === false) {
        const newStates = { ...prev }
        delete newStates[key]
        return newStates
      }
      return {
        ...prev,
        [key]: {
          ...prev[key],
          type: 'general',
          message: 'Loading...',
          ...loading,
        },
      }
    })
  }, [])

  const isLoading = React.useCallback(
    (key?: string) => {
      if (key) {
        return !!loadingStates[key]
      }
      return Object.keys(loadingStates).length > 0
    },
    [loadingStates]
  )

  const getLoadingState = React.useCallback(
    (key: string) => {
      return loadingStates[key]
    },
    [loadingStates]
  )

  const clearAllLoading = React.useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    loadingStates,
    setLoading,
    isLoading,
    getLoadingState,
    clearAllLoading,
  }
}
