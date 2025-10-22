/**
 * Project management types index
 * Exports all project-related types for easy importing
 */

export * from './project'
export * from './collaboration'
export * from './invitation'

// Common utility types used across project management
export interface BaseAPIResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    code?: string
    details?: Record<string, unknown>
  }
  status?: number
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginationResponse {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface APIError {
  message: string
  code?: string
  details?: Record<string, unknown> | string
  status?: number
}

export interface SuccessResponse<T = unknown> {
  success: true
  data: T
}

export interface ErrorResponse {
  success: false
  error: APIError
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse
