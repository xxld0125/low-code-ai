'use client'

import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ErrorDisplayProps {
  error: string | null
  onDismiss?: () => void
  title?: string
  variant?: 'default' | 'destructive'
}

export function ErrorDisplay({
  error,
  onDismiss,
  title = 'Error',
  variant = 'destructive',
}: ErrorDisplayProps) {
  if (!error) return null

  return (
    <Alert variant={variant} className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="pr-8">{error}</AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      )}
    </Alert>
  )
}

interface FormFieldErrorProps {
  error?: string
  className?: string
}

export function FormFieldError({ error, className }: FormFieldErrorProps) {
  if (!error) return null

  return <p className={cn('mt-1 text-sm text-destructive', className)}>{error}</p>
}

import { cn } from '@/lib/utils'
