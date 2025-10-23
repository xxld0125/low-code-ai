/**
 * React Hook for Project Validation
 * Provides client-side validation and error handling for project operations
 */

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  ProjectOperationValidator,
  type ProjectOperation,
  type ValidationResult,
} from '@/lib/projects/operation-validator'
import { hasPermission } from '@/lib/projects/permissions'
import type { ProjectRole, APIError, Project, CollaboratorPermissions } from '@/types/projects'

interface UseProjectValidationOptions {
  showToast?: boolean
  onError?: (error: APIError) => void
  onSuccess?: () => void
}

interface ValidationState {
  isValidating: boolean
  lastError: APIError | null
  warnings: string[]
}

/**
 * Hook for validating project operations with user-friendly error handling
 */
export function useProjectValidation(options: UseProjectValidationOptions = {}) {
  const { showToast = true, onError, onSuccess } = options
  const { toast } = useToast()

  const [validationState, setValidationState] = useState<ValidationState>({
    isValidating: false,
    lastError: null,
    warnings: [],
  })

  /**
   * Handle errors with user-friendly messages
   */
  const handleError = useCallback(
    (error: APIError) => {
      if (!showToast) return

      const userMessage = ProjectOperationValidator.getErrorMessage(error)
      const suggestions = ProjectOperationValidator.getSuggestedActions(error)

      toast({
        title: 'Validation Error',
        description: userMessage,
        variant: 'destructive',
        ...(suggestions.length > 0 && {
          action: (
            <div className="mt-2 text-sm">
              <p className="font-medium">Suggestions:</p>
              <ul className="list-inside list-disc space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          ),
        }),
      })
    },
    [showToast, toast]
  )

  /**
   * Validate a project operation
   */
  const validateOperation = useCallback(
    async (
      operation: ProjectOperation,
      context: {
        userId: string
        projectId?: string
        userRole?: ProjectRole
        project?: Record<string, unknown>
        data?: Record<string, unknown>
      }
    ): Promise<{ isValid: boolean; error?: APIError; warnings?: string[] }> => {
      setValidationState(prev => ({ ...prev, isValidating: true, lastError: null }))

      try {
        const result = await ProjectOperationValidator.validateOperation({
          operation,
          ...context,
          project: context.project as Project | undefined,
        })

        setValidationState({
          isValidating: false,
          lastError: result.error || null,
          warnings: result.warnings || [],
        })

        if (result.isValid) {
          onSuccess?.()
        } else if (result.error) {
          handleError(result.error)
          onError?.(result.error)
        }

        return result
      } catch (error) {
        const apiError: APIError = {
          message: error instanceof Error ? error.message : 'Validation failed',
          code: 'VALIDATION_ERROR',
        }

        setValidationState({
          isValidating: false,
          lastError: apiError,
          warnings: [],
        })

        handleError(apiError)
        onError?.(apiError)

        return { isValid: false, error: apiError }
      }
    },
    [onError, onSuccess, handleError]
  )

  /**
   * Clear the last error
   */
  const clearError = useCallback(() => {
    setValidationState(prev => ({ ...prev, lastError: null }))
  }, [])

  /**
   * Check if a specific action is allowed for the user's role
   */
  const canPerformAction = useCallback((role: ProjectRole, action: string): boolean => {
    return hasPermission(role, action as keyof CollaboratorPermissions)
  }, [])

  /**
   * Get user-friendly error message for a specific error
   */
  const getErrorMessage = useCallback((error: APIError): string => {
    return ProjectOperationValidator.getErrorMessage(error)
  }, [])

  /**
   * Get suggested actions for error recovery
   */
  const getSuggestedActions = useCallback((error: APIError): string[] => {
    return ProjectOperationValidator.getSuggestedActions(error)
  }, [])

  return {
    validateOperation,
    canPerformAction,
    getErrorMessage,
    getSuggestedActions,
    clearError,
    ...validationState,
  }
}

/**
 * Hook for project-specific validation
 */
export function useProjectSpecificValidation(projectId?: string, userRole?: ProjectRole) {
  const baseValidation = useProjectValidation()

  /**
   * Validate project read access
   */
  const canReadProject = useCallback(async (): Promise<boolean> => {
    if (!projectId || !userRole) return false

    const result = await baseValidation.validateOperation('read', {
      userId: 'current-user', // This would come from auth context
      projectId,
      userRole,
      project: {}, // This would be fetched from API
    })

    return result.isValid
  }, [projectId, userRole, baseValidation])

  /**
   * Validate project edit access
   */
  const canEditProject = useCallback(async (): Promise<boolean> => {
    if (!projectId || !userRole) return false

    const result = await baseValidation.validateOperation('update', {
      userId: 'current-user', // This would come from auth context
      projectId,
      userRole,
      project: {}, // This would be fetched from API
    })

    return result.isValid
  }, [projectId, userRole, baseValidation])

  /**
   * Validate project delete access
   */
  const canDeleteProject = useCallback(async (): Promise<boolean> => {
    if (!projectId || !userRole) return false

    const result = await baseValidation.validateOperation('delete', {
      userId: 'current-user', // This would come from auth context
      projectId,
      userRole,
      project: {}, // This would be fetched from API
    })

    return result.isValid
  }, [projectId, userRole, baseValidation])

  /**
   * Validate project rename
   */
  const canRenameProject = useCallback(
    async (newName: string): Promise<ValidationResult> => {
      if (!projectId || !userRole) {
        return {
          isValid: false,
          error: {
            message: 'Project ID and user role are required',
            code: 'VALIDATION_ERROR',
          },
        }
      }

      return await baseValidation.validateOperation('rename', {
        userId: 'current-user', // This would come from auth context
        projectId,
        userRole,
        project: {}, // This would be fetched from API
        data: { newName },
      })
    },
    [projectId, userRole, baseValidation]
  )

  /**
   * Validate project archive
   */
  const canArchiveProject = useCallback(async (): Promise<boolean> => {
    if (!projectId || !userRole) return false

    const result = await baseValidation.validateOperation('archive', {
      userId: 'current-user', // This would come from auth context
      projectId,
      userRole,
      project: {}, // This would be fetched from API
    })

    return result.isValid
  }, [projectId, userRole, baseValidation])

  /**
   * Validate collaborator management
   */
  const canManageCollaborators = useCallback(async (): Promise<boolean> => {
    if (!projectId || !userRole) return false

    const result = await baseValidation.validateOperation('manage_collaborators', {
      userId: 'current-user', // This would come from auth context
      projectId,
      userRole,
      project: {}, // This would be fetched from API
    })

    return result.isValid
  }, [projectId, userRole, baseValidation])

  return {
    ...baseValidation,
    canReadProject,
    canEditProject,
    canDeleteProject,
    canRenameProject,
    canArchiveProject,
    canManageCollaborators,
  }
}

export default useProjectValidation
