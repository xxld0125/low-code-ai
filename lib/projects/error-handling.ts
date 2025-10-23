/**
 * Error handling utilities for project management APIs
 * Provides consistent error responses and logging
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from 'next/server'
import type { APIError } from '@/types/projects'

/**
 * Custom error classes for different types of errors
 */
export class ProjectError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: Record<string, unknown>

  constructor(
    message: string,
    code: string = 'PROJECT_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ProjectError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}

export class ValidationError extends ProjectError {
  constructor(message: string, field?: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details ? { ...details, field } : { field })
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ProjectError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ProjectError {
  constructor(message: string = 'Access denied') {
    super(message, 'AUTHORIZATION_ERROR', 403)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ProjectError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ProjectError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
    this.name = 'ConflictError'
  }
}

export class DatabaseError extends ProjectError {
  constructor(message: string, originalError?: { message?: string }) {
    super(message, 'DATABASE_ERROR', 500, { originalError: originalError?.message })
    this.name = 'DatabaseError'
  }
}

/**
 * Handle API errors and return consistent response format
 */
export function handleAPIError(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse {
  console.error('API Error:', error)

  // If it's already a ProjectError, use it directly
  if (error instanceof ProjectError) {
    const apiError: APIError = {
      message: error.message,
      code: error.code,
      details: error.details,
    }

    return NextResponse.json(
      {
        success: false,
        error: apiError,
      },
      { status: error.statusCode }
    )
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as any
    return handleSupabaseError(supabaseError)
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    const apiError: APIError = {
      message: error.message || defaultMessage,
      code: 'UNKNOWN_ERROR',
    }

    return NextResponse.json(
      {
        success: false,
        error: apiError,
      },
      { status: 500 }
    )
  }

  // Handle unknown errors
  const apiError: APIError = {
    message: defaultMessage,
    code: 'UNKNOWN_ERROR',
  }

  return NextResponse.json(
    {
      success: false,
      error: apiError,
    },
    { status: 500 }
  )
}

/**
 * Handle Supabase-specific errors
 */

function handleSupabaseError(error: any): NextResponse {
  const errorMap: Record<string, { message: string; statusCode: number; code?: string }> = {
    PGRST116: { message: 'Resource not found', statusCode: 404, code: 'NOT_FOUND' },
    PGRST301: { message: 'Resource not found', statusCode: 404, code: 'NOT_FOUND' },
    '42501': { message: 'Access denied', statusCode: 403, code: 'PERMISSION_DENIED' },
    '23505': { message: 'Resource already exists', statusCode: 409, code: 'DUPLICATE_RESOURCE' },
    '23503': {
      message: 'Referenced resource not found',
      statusCode: 400,
      code: 'REFERENCE_NOT_FOUND',
    },
    '23514': { message: 'Constraint violation', statusCode: 400, code: 'CONSTRAINT_VIOLATION' },
    '28P01': {
      message: 'Database connection error',
      statusCode: 503,
      code: 'DATABASE_CONNECTION_ERROR',
    },
  }

  const mappedError = (error.code && errorMap[error.code]) || {
    message: error.message || 'Database operation failed',
    statusCode: 500,
    code: 'DATABASE_ERROR',
  }

  const apiError: APIError = {
    message: mappedError.message,
    code: mappedError.code || 'DATABASE_ERROR',
    details: {
      originalCode: error.code,
      originalMessage: error.message,
      hint: error.hint,
    },
  }

  return NextResponse.json(
    {
      success: false,
      error: apiError,
    },
    { status: mappedError.statusCode }
  )
}

/**
 * Validate request data and throw ValidationError if invalid
 */
export function validateRequired(data: any, field: string, fieldName?: string): asserts data {
  if (!data || (typeof data === 'string' && data.trim().length === 0)) {
    throw new ValidationError(`${fieldName || field} is required`, field)
  }
}

export function validateEmail(email: string, field: string = 'email'): void {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email address', field)
  }
}

export function validateLength(
  value: string,
  min: number,
  max: number,
  field: string,
  fieldName?: string
): void {
  if (value.length < min || value.length > max) {
    throw new ValidationError(
      `${fieldName || field} must be between ${min} and ${max} characters`,
      field
    )
  }
}

export function validateEnum<T extends string>(
  value: any,
  allowedValues: T[],
  field: string,
  fieldName?: string
): void {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName || field} must be one of: ${allowedValues.join(', ')}`,
      field
    )
  }
}

export function validateUUID(uuid: any, field: string, fieldName?: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(uuid)) {
    throw new ValidationError(`${fieldName || field} must be a valid UUID`, field)
  }
}

export function validatePaginationParams(
  limit?: number,
  offset?: number
): { limit: number; offset: number } {
  const validatedLimit = Math.min(Math.max(limit || 50, 1), 100)
  const validatedOffset = Math.max(offset || 0, 0)

  if (limit !== undefined && (limit < 1 || limit > 100)) {
    throw new ValidationError('Limit must be between 1 and 100', 'limit')
  }

  if (offset !== undefined && offset < 0) {
    throw new ValidationError('Offset must be non-negative', 'offset')
  }

  return { limit: validatedLimit, offset: validatedOffset }
}

/**
 * Create success response with consistent format
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: any
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(meta && { meta }),
    },
    { status: statusCode }
  )
}

/**
 * Create error response with consistent format
 */
export function createErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,

  details?: any
): NextResponse {
  const apiError: APIError = {
    message,
    ...(code && { code }),
    ...(details && { details }),
  }

  return NextResponse.json(
    {
      success: false,
      error: apiError,
    },
    { status: statusCode }
  )
}

/**
 * Middleware to check authentication
 */

export async function requireAuth(
  request: Request
): Promise<{ userId: string; user: { id: string } }> {
  // This would typically use your auth middleware or Supabase auth
  // For now, this is a placeholder that should be implemented based on your auth system
  throw new Error('Auth middleware not implemented')
}

/**
 * Middleware to check project access
 */

export async function requireProjectAccess(
  projectId: string,
  userId: string,
  requiredRole?: string
): Promise<void> {
  // This would typically check if user has access to the project
  // For now, this is a placeholder that should be implemented
  throw new Error('Project access middleware not implemented')
}

/**
 * Log API errors for monitoring
 */
export function logAPIError(
  error: Error,
  context: {
    endpoint: string
    method: string
    userId?: string
    projectId?: string
    userAgent?: string
    ip?: string
  }
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      code: (error as any).code,
      stack: error.stack,
    },
    context,
    severity: (error as any).statusCode >= 500 ? 'error' : 'warning',
  }

  // Log to console for now, but in production you'd use a proper logging service
  console.error('API Error:', JSON.stringify(logData, null, 2))

  // TODO: Send to monitoring service (e.g., Sentry, DataDog, etc.)
}

/**
 * Rate limiting helper (placeholder)
 */

export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  // This is a placeholder - implement actual rate limiting based on your requirements
  // You might use Redis, in-memory store, or a service like Cloudflare
  return {
    allowed: true,
    remaining: limit - 1,
    resetTime: Date.now() + windowMs,
  }
}

/**
 * Request validation helper
 */
export function validateRequestBody<T>(
  body: Record<string, unknown>,
  requiredFields: (keyof T)[]
): T {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('Request body is required and must be an object')
  }

  for (const field of requiredFields) {
    if (!(field in body)) {
      throw new ValidationError(`Missing required field: ${String(field)}`, String(field))
    }
  }

  return body as T
}
