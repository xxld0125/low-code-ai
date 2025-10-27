/**
 * Error Handling for Dynamic API Operations
 *
 * Purpose: Centralized error handling for dynamically generated API endpoints
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { NextResponse } from 'next/server'

// Helper type guard function
function hasProperty<T extends string>(obj: unknown, prop: T): obj is { [K in T]: unknown } {
  return obj !== null && typeof obj === 'object' && prop in obj
}

// Error Types
export class APIError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly details?: Record<string, unknown>
  public readonly requestId?: string
  public readonly timestamp: string

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, unknown>,
    requestId?: string
  ) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
    this.requestId = requestId
    this.timestamp = new Date().toISOString()
  }
}

export class ValidationError extends APIError {
  public readonly fieldErrors: Array<{
    field: string
    message: string
    code: string
  }>

  constructor(
    message: string,
    fieldErrors: Array<{ field: string; message: string; code: string }>,
    requestId?: string
  ) {
    super(message, 422, 'VALIDATION_ERROR', { fieldErrors }, requestId)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, identifier?: string, requestId?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND', { resource, identifier }, requestId)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string, details?: Record<string, unknown>, requestId?: string) {
    super(message, 409, 'CONFLICT', details, requestId)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends APIError {
  constructor(message: string = 'Unauthorized', requestId?: string) {
    super(message, 401, 'UNAUTHORIZED', undefined, requestId)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends APIError {
  constructor(message: string = 'Forbidden', requestId?: string) {
    super(message, 403, 'FORBIDDEN', undefined, requestId)
    this.name = 'ForbiddenError'
  }
}

export class RateLimitError extends APIError {
  constructor(limit: number, window: number, requestId?: string) {
    super(
      `Rate limit exceeded. Maximum ${limit} requests per ${window} seconds.`,
      429,
      'RATE_LIMIT_EXCEEDED',
      { limit, window },
      requestId
    )
    this.name = 'RateLimitError'
  }
}

// Error Handler Class
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorCallbacks: Map<string, (error: APIError) => void> = new Map()

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Handle API errors and return appropriate response
   */
  handle(error: Error, requestId?: string): NextResponse {
    // Log the error
    this.logError(error, requestId)

    // Handle different error types
    if (error instanceof APIError) {
      return this.handleAPIError(error)
    }

    // Handle database errors
    if (this.isDatabaseError(error)) {
      return this.handleDatabaseError(error as unknown as Record<string, unknown>, requestId)
    }

    // Handle validation errors
    if (this.isValidationError(error)) {
      // Convert to ValidationError if it's not already one
      if (error instanceof ValidationError) {
        return this.handleValidationError(error)
      } else {
        const fieldErrors = this.extractFieldErrors(error)
        const validationError = new ValidationError(
          error.message || 'Validation failed',
          fieldErrors,
          requestId
        )
        return this.handleValidationError(validationError)
      }
    }

    // Handle unknown errors
    return this.handleUnknownError(error, requestId)
  }

  /**
   * Handle APIError instances
   */
  private handleAPIError(error: APIError): NextResponse {
    const responseBody: {
      success: boolean
      error: string
      code: string
      timestamp: string
      requestId?: string
      details?: Record<string, unknown>
    } = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: error.timestamp,
      requestId: error.requestId,
    }

    if (error.details) {
      responseBody.details = error.details
    }

    return NextResponse.json(responseBody, { status: error.statusCode })
  }

  /**
   * Handle ValidationError instances
   */
  private handleValidationError(error: ValidationError): NextResponse {
    const responseBody = {
      success: false,
      error: error.message,
      code: error.code,
      timestamp: error.timestamp,
      requestId: error.requestId,
      fieldErrors: error.fieldErrors,
    }

    return NextResponse.json(responseBody, { status: error.statusCode })
  }

  /**
   * Handle database errors
   */
  private handleDatabaseError(error: Record<string, unknown>, requestId?: string): NextResponse {
    const errorCode = (error.code as string) || 'UNKNOWN_DB_ERROR'
    const errorMessage = this.getDatabaseErrorMessage(error)
    const statusCode = this.getDatabaseErrorStatusCode(error)

    const responseBody = {
      success: false,
      error: errorMessage,
      code: errorCode,
      timestamp: new Date().toISOString(),
      requestId,
      details: {
        constraint: error.constraint,
        table: error.table,
        detail: error.detail,
        hint: error.hint,
      },
    }

    return NextResponse.json(responseBody, { status: statusCode })
  }

  /**
   * Handle unknown errors
   */
  private handleUnknownError(error: Error, requestId?: string): NextResponse {
    const responseBody: {
      success: boolean
      error: string
      code: string
      timestamp: string
      requestId?: string
      stack?: string
    } = {
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId,
    }

    if (process.env.NODE_ENV === 'development') {
      responseBody.stack = error.stack
    }

    return NextResponse.json(responseBody, { status: 500 })
  }

  /**
   * Check if error is a database error
   */
  private isDatabaseError(error: unknown): boolean {
    return (
      error !== null &&
      typeof error === 'object' &&
      ('code' in error || // PostgreSQL error code
        'severity' in error || // PostgreSQL severity
        'constraint' in error || // Constraint violation
        'table' in error) // Table reference
    )
  }

  /**
   * Check if error is a validation error
   */
  private isValidationError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.name === 'ZodError' ||
        error.name === 'ValidationError' ||
        (hasProperty(error, 'errors') &&
          Array.isArray((error as unknown as Record<string, unknown>).errors))
      )
    }
    return false
  }

  /**
   * Get database error status code
   */
  private getDatabaseErrorStatusCode(error: Record<string, unknown>): number {
    const errorCode = error.code as string
    switch (errorCode) {
      // PostgreSQL error codes
      case '23514': // foreign_key_violation
      case '23503': // foreign_key_violation
        return 409
      case '23505': // unique_violation
        return 409
      case '23502': // not_null_violation
        return 422
      case '23513': // exclusion_violation
        return 409
      case '42P01': // undefined_table
        return 404
      case '42703': // undefined_column
        return 400
      case '42501': // insufficient_privilege
        return 403
      case '28P01': // invalid_password
        return 401
      case '08006': // connection_failure
      case '08001': // sqlclient_unable_to_establish_sqlconnection
      case '08004': // sqlserver_rejected_establishment_of_sqlconnection
        return 503
      case '54000': // program_limit_exceeded
      case '53100': // disk_full
      case '53200': // out_of_memory
      case '53300': // too_many_connections
        return 503
      case '40001': // serialization_failure
      case '40P01': // deadlock_detected
        return 409
      default:
        return 500
    }
  }

  /**
   * Get database error message
   */
  private getDatabaseErrorMessage(error: Record<string, unknown>): string {
    // Use PostgreSQL error message if available
    if (typeof error.message === 'string') {
      return error.message
    }

    // Fallback to error code based messages
    const errorCode = error.code as string
    switch (errorCode) {
      case '23514':
      case '23503':
        return 'Foreign key constraint violation'
      case '23505':
        return 'Unique constraint violation'
      case '23502':
        return 'Required field cannot be null'
      case '42P01':
        return 'Table not found'
      case '42703':
        return 'Column not found'
      case '42501':
        return 'Insufficient privileges'
      case '28P01':
        return 'Invalid password or authentication failed'
      default:
        return 'Database operation failed'
    }
  }

  /**
   * Extract field errors from validation errors
   */
  private extractFieldErrors(
    error: unknown
  ): Array<{ field: string; message: string; code: string }> {
    if (hasProperty(error, 'errors') && Array.isArray(error.errors)) {
      return (error.errors as Array<Record<string, unknown>>).map(
        (err: Record<string, unknown>) => ({
          field: Array.isArray(err.path) ? err.path.join('.') : (err.path as string) || 'unknown',
          message: err.message as string,
          code: (err.code as string) || 'VALIDATION_ERROR',
        })
      )
    }

    if (hasProperty(error, 'issues') && Array.isArray(error.issues)) {
      return (error.issues as Array<Record<string, unknown>>).map(
        (issue: Record<string, unknown>) => ({
          field: Array.isArray(issue.path)
            ? issue.path.join('.')
            : (issue.path as string) || 'unknown',
          message: issue.message as string,
          code: (issue.code as string) || 'VALIDATION_ERROR',
        })
      )
    }

    return []
  }

  /**
   * Log errors
   */
  private logError(error: Error, requestId?: string): void {
    const logData = {
      message: error.message,
      name: error.name,
      stack: error.stack,
      requestId,
      timestamp: new Date().toISOString(),
    }

    if (error instanceof APIError) {
      console.error('API Error:', {
        ...logData,
        statusCode: error.statusCode,
        code: error.code,
        details: error.details,
      })
    } else {
      console.error('Unhandled Error:', logData)
    }

    // Call error callbacks
    this.errorCallbacks.forEach((callback, code) => {
      if (error instanceof APIError && error.code === code) {
        try {
          callback(error as APIError)
        } catch (callbackError) {
          console.error('Error in error callback:', callbackError)
        }
      }
    })
  }

  /**
   * Register error callback
   */
  onError(code: string, callback: (error: APIError) => void): void {
    this.errorCallbacks.set(code, callback)
  }

  /**
   * Remove error callback
   */
  removeErrorCallback(code: string): void {
    this.errorCallbacks.delete(code)
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Export convenience functions
export const handleError = (error: Error, requestId?: string) =>
  errorHandler.handle(error, requestId)

export const createAPIError = (
  message: string,
  statusCode?: number,
  code?: string,
  details?: Record<string, unknown>,
  requestId?: string
) => new APIError(message, statusCode, code, details, requestId)

export const createValidationError = (
  message: string,
  fieldErrors: Array<{ field: string; message: string; code: string }>,
  requestId?: string
) => new ValidationError(message, fieldErrors, requestId)

export const createNotFoundError = (resource: string, identifier?: string, requestId?: string) =>
  new NotFoundError(resource, identifier, requestId)

export const createConflictError = (
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
) => new ConflictError(message, details, requestId)

export const createUnauthorizedError = (message?: string, requestId?: string) =>
  new UnauthorizedError(message, requestId)

export const createForbiddenError = (message?: string, requestId?: string) =>
  new ForbiddenError(message, requestId)

export const createRateLimitError = (limit: number, window: number, requestId?: string) =>
  new RateLimitError(limit, window, requestId)

// Export error boundary utility
export const withErrorHandling = (
  handler: (request: Request, context?: unknown) => Promise<Response>
) => {
  return async (request: Request, context?: unknown): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (error) {
      if (error instanceof Error) {
        const response = handleError(error)
        return response as Response
      }

      const response = handleError(new Error('Unknown error'))
      return response as Response
    }
  }
}

export default errorHandler
