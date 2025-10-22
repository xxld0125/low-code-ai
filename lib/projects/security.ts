/**
 * Security utilities for project management
 * Authentication, authorization, input validation, and security middleware
 */

import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ProjectRole } from '@/types/projects'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
}

export interface SecurityContext {
  user: AuthenticatedUser
  requestIP?: string
  userAgent?: string
}

/**
 * Rate limiting interface for API endpoints
 */
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore: RateLimitStore = {}

/**
 * Validate and authenticate user from request
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function authenticateRequest(_request: NextRequest): Promise<{
  user: AuthenticatedUser | null
  error?: { message: string; code: string }
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      return {
        user: null,
        error: {
          message: 'Authentication failed',
          code: 'AUTH_ERROR',
        },
      }
    }

    if (!user) {
      return {
        user: null,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED',
        },
      }
    }

    return {
      user: {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.user_metadata?.full_name,
      },
    }
  } catch (_error) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    return {
      user: null,
      error: {
        message: 'Authentication service unavailable',
        code: 'AUTH_SERVICE_ERROR',
      },
    }
  }
}

/**
 * Rate limiting for API endpoints
 */
export function rateLimit(
  identifier: string,
  limit: number,
  windowMs: number = 60000 // 1 minute default
): { allowed: boolean; resetTime?: number; remaining?: number } {
  const now = Date.now()
  const key = identifier

  // Clean up expired entries
  if (rateLimitStore[key] && rateLimitStore[key].resetTime < now) {
    delete rateLimitStore[key]
  }

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return { allowed: true, resetTime: rateLimitStore[key].resetTime, remaining: limit - 1 }
  }

  const record = rateLimitStore[key]

  if (record.count >= limit) {
    return {
      allowed: false,
      resetTime: record.resetTime,
      remaining: 0,
    }
  }

  record.count++
  return {
    allowed: true,
    resetTime: record.resetTime,
    remaining: limit - record.count,
  }
}

/**
 * Input validation and sanitization
 */
export class InputValidator {
  /**
   * Validate and sanitize project name
   */
  static validateProjectName(name: unknown): {
    valid: boolean
    sanitized?: string
    error?: string
  } {
    if (typeof name !== 'string') {
      return { valid: false, error: 'Project name must be a string' }
    }

    const trimmed = name.trim()

    if (trimmed.length === 0) {
      return { valid: false, error: 'Project name is required' }
    }

    if (trimmed.length > 100) {
      return { valid: false, error: 'Project name must be 100 characters or less' }
    }

    // Check for potentially dangerous characters
    const dangerousPatterns = /[<>\"'&]/
    if (dangerousPatterns.test(trimmed)) {
      return { valid: false, error: 'Project name contains invalid characters' }
    }

    return { valid: true, sanitized: trimmed }
  }

  /**
   * Validate and sanitize project description
   */
  static validateProjectDescription(description: unknown): {
    valid: boolean
    sanitized?: string
    error?: string
  } {
    if (description === null || description === undefined) {
      return { valid: true, sanitized: '' }
    }

    if (typeof description !== 'string') {
      return { valid: false, error: 'Project description must be a string' }
    }

    const trimmed = description.trim()

    if (trimmed.length > 500) {
      return { valid: false, error: 'Project description must be 500 characters or less' }
    }

    // Basic sanitization - remove script tags and dangerous attributes
    const sanitized = trimmed
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')

    return { valid: true, sanitized }
  }

  /**
   * Validate email address
   */
  static validateEmail(email: unknown): { valid: boolean; error?: string } {
    if (typeof email !== 'string') {
      return { valid: false, error: 'Email must be a string' }
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

    if (!emailRegex.test(email.trim())) {
      return { valid: false, error: 'Invalid email address' }
    }

    return { valid: true }
  }

  /**
   * Validate pagination parameters
   */
  static validatePaginationParams(
    limit: unknown,
    offset: unknown
  ): {
    valid: boolean
    limit?: number
    offset?: number
    error?: string
  } {
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit
    const parsedOffset = typeof offset === 'string' ? parseInt(offset, 10) : offset

    if (
      parsedLimit !== undefined &&
      (typeof parsedLimit !== 'number' || parsedLimit < 1 || parsedLimit > 100)
    ) {
      return { valid: false, error: 'Limit must be between 1 and 100' }
    }

    if (parsedOffset !== undefined && (typeof parsedOffset !== 'number' || parsedOffset < 0)) {
      return { valid: false, error: 'Offset must be non-negative' }
    }

    return {
      valid: true,
      limit: parsedLimit || 50,
      offset: parsedOffset || 0,
    }
  }

  /**
   * Validate UUID
   */
  static validateUUID(uuid: unknown): { valid: boolean; error?: string } {
    if (typeof uuid !== 'string') {
      return { valid: false, error: 'ID must be a string' }
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

    if (!uuidRegex.test(uuid)) {
      return { valid: false, error: 'Invalid ID format' }
    }

    return { valid: true }
  }

  /**
   * Validate project role
   */
  static validateRole(role: unknown): { valid: boolean; role?: ProjectRole; error?: string } {
    if (typeof role !== 'string') {
      return { valid: false, error: 'Role must be a string' }
    }

    const validRoles: ProjectRole[] = ['owner', 'editor', 'viewer']

    if (!validRoles.includes(role as ProjectRole)) {
      return { valid: false, error: 'Invalid role' }
    }

    return { valid: true, role: role as ProjectRole }
  }
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  }
}

/**
 * Content Security Policy header
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

/**
 * Check if user has permission for specific action on project
 */
export async function checkProjectPermission(
  userId: string,
  projectId: string,
  action: 'view' | 'edit' | 'delete' | 'manage_collaborators'
): Promise<{ allowed: boolean; userRole?: ProjectRole; error?: string }> {
  try {
    const supabase = await createClient()

    // Check if user is owner
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('owner_id, status')
      .eq('id', projectId)
      .eq('is_deleted', false)
      .single()

    if (projectError || !project) {
      return { allowed: false, error: 'Project not found' }
    }

    // Owner has all permissions
    if (project.owner_id === userId) {
      return { allowed: true, userRole: 'owner' }
    }

    // Check collaborator permissions
    const { data: collaborator, error: collaboratorError } = await supabase
      .from('project_collaborators')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('joined_at', 'not null')
      .single()

    if (collaboratorError || !collaborator) {
      return { allowed: false, error: 'Access denied' }
    }

    // Check permissions based on role
    const permissions: Record<string, string[]> = {
      owner: ['view', 'edit', 'delete', 'manage_collaborators'],
      editor: ['view', 'edit'],
      viewer: ['view'],
    }

    if (!permissions[collaborator.role]?.includes(action)) {
      return { allowed: false, error: 'Insufficient permissions' }
    }

    return { allowed: true, userRole: collaborator.role }
  } catch (_error) {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    return { allowed: false, error: 'Permission check failed' }
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const clientIP = forwarded ? forwarded.split(',')[0].trim() : realIP

  return clientIP || 'unknown'
}

/**
 * Get user agent from request
 */
export function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown'
}

/**
 * Create security context from request
 */
export async function createSecurityContext(request: NextRequest): Promise<{
  context: SecurityContext | null
  error?: { message: string; code: string }
}> {
  const authResult = await authenticateRequest(request)

  if (!authResult.user) {
    return { context: null, error: authResult.error }
  }

  return {
    context: {
      user: authResult.user,
      requestIP: getClientIP(request),
      userAgent: getUserAgent(request),
    },
  }
}
