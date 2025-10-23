/**
 * Shared API client utilities for project management
 * Reduces code duplication across components
 */

export interface APIError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface APIResponse<T = unknown> {
  data?: T
  error?: APIError
  success: boolean
}

/**
 * Generic API wrapper with consistent error handling
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: {
          message: data.error?.message || data.message || 'Request failed',
          code: data.error?.code || response.status.toString(),
          details: data.error?.details,
        },
      }
    }

    return {
      success: true,
      data: data as T,
    }
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR',
      },
    }
  }
}

/**
 * Project-specific API methods
 */
export const projectAPI = {
  /**
   * Create a new project
   */
  async create(data: { name: string; description?: string }) {
    return apiRequest('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  /**
   * Get all projects for the current user
   */
  async getProjects(params?: { limit?: number; offset?: number; include_archived?: boolean }) {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())
    if (params?.include_archived)
      searchParams.set('include_archived', params.include_archived.toString())

    return apiRequest(`/api/projects?${searchParams.toString()}`)
  },

  /**
   * Get a single project by ID
   */
  async getProject(id: string) {
    return apiRequest(`/api/projects/${id}`)
  },

  /**
   * Update a project
   */
  async update(id: string, data: { name?: string; description?: string; status?: string }) {
    return apiRequest(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Delete a project
   */
  async delete(id: string) {
    return apiRequest(`/api/projects/${id}`, {
      method: 'DELETE',
    })
  },

  /**
   * Archive a project
   */
  async archive(id: string) {
    return apiRequest(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'archived' }),
    })
  },
}

/**
 * Error logging utility
 */
export const logError = (context: string, error: unknown, details?: Record<string, unknown>) => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error'
  console.error(`[${context}] Error:`, errorMessage, error, details || {})

  // In a real application, you might send this to a logging service
  // Example: sendToSentry(context, error, details)
}

/**
 * React hook for API operations with loading states
 */
export function useAPIOperation<T = unknown>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async (
    operation: () => Promise<APIResponse<T>>,
    context: string
  ): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const result = await operation()

      if (!result.success) {
        const errorMessage = result.error?.message || 'Operation failed'
        setError(errorMessage)
        logError(context, result.error)
        return null
      }

      return result.data as T
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error'
      setError(errorMessage)
      logError(context, error)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { execute, loading, error, clearError: () => setError(null) }
}

// Import useState for the hook
import { useState } from 'react'
