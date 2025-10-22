/**
 * Error handling and UX improvements for project management
 * Centralized error handling with user-friendly messages and toast notifications
 */

import { toast } from '@/hooks/use-toast'
import { useState, useCallback } from 'react'

type ErrorType = 'network' | 'validation' | 'permission' | 'notfound' | 'server' | 'unknown'

export interface ErrorContext {
  operation: string
  projectId?: string
  projectName?: string
  userId?: string
  additionalData?: Record<string, unknown>
}

/**
 * Enhanced error handling with UX improvements
 */
export class UXErrorHandler {
  private static instance: UXErrorHandler
  private errorCounts: Map<string, number> = new Map()

  static getInstance(): UXErrorHandler {
    if (!UXErrorHandler.instance) {
      UXErrorHandler.instance = new UXErrorHandler()
    }
    return UXErrorHandler.instance
  }

  /**
   * Handle errors with user-friendly messages and appropriate UX responses
   */
  handleError(
    error: unknown,
    context: ErrorContext,
    options: { showToast?: boolean; logToConsole?: boolean; fallbackMessage?: string } = {}
  ): void {
    const {
      showToast = true,
      logToConsole = true,
      fallbackMessage = 'Something went wrong',
    } = options

    const errorKey = `${context.operation}-${context.projectId || 'global'}`
    const errorCount = (this.errorCounts.get(errorKey) || 0) + 1
    this.errorCounts.set(errorKey, errorCount)

    const errorInfo = this.parseError(error)
    const userMessage = this.getUserFriendlyMessage(errorInfo, context, fallbackMessage)

    // Log to console for debugging
    if (logToConsole) {
      console.group(`🚨 ${context.operation} Error`)
      console.error('Error:', error)
      console.error('Context:', context)
      console.error('Error Info:', errorInfo)
      console.error('Error Count:', errorCount)
      console.groupEnd()
    }

    // Show toast notification
    if (showToast) {
      toast({
        title: 'Error',
        description: userMessage,
        variant: errorInfo.type === 'validation' ? 'default' : 'destructive',
      })
    }
  }

  /**
   * Parse different error types and extract relevant information
   */
  private parseError(error: unknown): {
    type: ErrorType
    message: string
    code?: string
    details?: Record<string, unknown>
  } {
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      if (message.includes('network') || message.includes('fetch')) {
        return { type: 'network', message: error.message }
      }

      if (
        message.includes('validation') ||
        message.includes('required') ||
        message.includes('invalid')
      ) {
        return { type: 'validation', message: error.message }
      }

      if (
        message.includes('permission') ||
        message.includes('unauthorized') ||
        message.includes('access denied')
      ) {
        return { type: 'permission', message: error.message }
      }

      if (message.includes('not found') || message.includes('404')) {
        return { type: 'notfound', message: error.message }
      }

      if (message.includes('500') || message.includes('server error')) {
        return { type: 'server', message: error.message }
      }

      return { type: 'unknown', message: error.message }
    }

    if (typeof error === 'object' && error !== null) {
      const apiError = error as {
        code?: string
        message?: string
        error?: { message?: string }
        details?: Record<string, unknown>
      }
      return {
        type: this.getErrorTypeFromCode(apiError.code),
        message: apiError.message || apiError.error?.message || 'Unknown error',
        code: apiError.code,
        details: apiError.details,
      }
    }

    return { type: 'unknown', message: 'An unexpected error occurred' }
  }

  /**
   * Get error type from error code
   */
  private getErrorTypeFromCode(code?: string): ErrorType {
    if (!code) return 'unknown'

    const codeMap: Record<string, ErrorType> = {
      NETWORK_ERROR: 'network',
      VALIDATION_ERROR: 'validation',
      AUTH_REQUIRED: 'permission',
      AUTH_ERROR: 'permission',
      PERMISSION_DENIED: 'permission',
      NOT_FOUND: 'notfound',
      SERVER_ERROR: 'server',
    }

    return codeMap[code] || 'unknown'
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(
    errorInfo: { type: ErrorType; message: string },
    context: ErrorContext,
    fallbackMessage: string
  ): string {
    const { operation, projectName } = context

    switch (errorInfo.type) {
      case 'network':
        return 'Unable to connect. Please check your internet connection and try again.'
      case 'validation':
        if (errorInfo.message.includes('name')) {
          return 'Please check the project name and try again.'
        }
        if (errorInfo.message.includes('email')) {
          return 'Please check the email address and try again.'
        }
        return 'Please check your input and try again.'
      case 'permission':
        if (operation.includes('delete')) {
          return "You don't have permission to delete this project."
        }
        if (operation.includes('edit')) {
          return "You don't have permission to edit this project."
        }
        return "You don't have permission to perform this action."
      case 'notfound':
        return projectName
          ? `Project "${projectName}" could not be found.`
          : 'The requested project could not be found.'
      case 'server':
        return 'Something went wrong on our end. Please try again in a moment.'
      default:
        return fallbackMessage
    }
  }

  /**
   * Reset error counts for a specific context
   */
  resetErrorCount(operation: string, projectId?: string): void {
    const errorKey = `${operation}-${projectId || 'global'}`
    this.errorCounts.delete(errorKey)
  }

  /**
   * Reset all error counts
   */
  resetAllErrorCounts(): void {
    this.errorCounts.clear()
  }
}

/**
 * React hook for error handling with UX improvements
 */
export function useErrorHandler() {
  const errorHandler = UXErrorHandler.getInstance()

  const handleError = useCallback(
    (
      error: unknown,
      context: ErrorContext,
      options?: { showToast?: boolean; fallbackMessage?: string }
    ) => {
      errorHandler.handleError(error, context, options)
    },
    [errorHandler]
  )

  const resetErrorCount = useCallback(
    (operation: string, projectId?: string) => {
      errorHandler.resetErrorCount(operation, projectId)
    },
    [errorHandler]
  )

  return {
    handleError,
    resetErrorCount,
  }
}

/**
 * Success message handler with consistent UX
 */
export function showSuccessMessage(operation: string, target?: string): void {
  const targetText = target ? ` "${target}"` : ''

  const messageMap: Record<string, string> = {
    create: `Project${targetText} created successfully`,
    update: `Project${targetText} updated successfully`,
    delete: `Project${targetText} deleted successfully`,
    archive: `Project${targetText} archived successfully`,
    invite: `Invitation sent to${targetText}`,
    remove: 'User removed from project',
  }

  const message = messageMap[operation.toLowerCase()] || 'Operation completed successfully'
  toast({
    title: 'Success',
    description: message,
  })
}

/**
 * Loading state manager with optimistic updates
 */
export class LoadingStateManager {
  private static loadingStates: Set<string> = new Set()

  static setLoading(operation: string, loading: boolean): void {
    if (loading) {
      this.loadingStates.add(operation)
    } else {
      this.loadingStates.delete(operation)
    }
  }

  static isLoading(operation: string): boolean {
    return this.loadingStates.has(operation)
  }

  static getLoadingOperations(): string[] {
    return Array.from(this.loadingStates)
  }

  static clearAll(): void {
    this.loadingStates.clear()
  }
}

/**
 * React hook for loading state management
 */
export function useLoadingState(operation: string) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = useCallback(
    (loading: boolean) => {
      setIsLoading(loading)
      LoadingStateManager.setLoading(operation, loading)
    },
    [operation]
  )

  return {
    isLoading,
    setLoading,
  }
}
