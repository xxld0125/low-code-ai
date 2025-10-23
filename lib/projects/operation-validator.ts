/**
 * Project Operation Validator
 * Comprehensive validation and permission checking for project operations
 */

import type {
  Project,
  ProjectRole,
  ProjectStatus,
  UpdateProjectData,
  CreateProjectData,
  APIError,
} from '@/types/projects'
import { hasPermission, canAccessFeature } from './permissions'
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
} from './error-handling'

/**
 * Operation types for projects
 */
export type ProjectOperation =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'rename'
  | 'change_settings'
  | 'manage_collaborators'
  | 'invite_collaborators'
  | 'remove_collaborators'

/**
 * Context for project operations
 */
export interface ProjectOperationContext {
  userId: string
  projectId?: string
  userRole?: ProjectRole
  project?: Project
  operation: ProjectOperation
  data?: Record<string, unknown>
}

/**
 * Result of operation validation
 */
export interface ValidationResult {
  isValid: boolean
  error?: APIError
  warnings?: string[]
}

/**
 * Comprehensive validator for project operations
 */
export class ProjectOperationValidator {
  /**
   * Validate a project operation
   */
  static async validateOperation(context: ProjectOperationContext): Promise<ValidationResult> {
    try {
      // Check basic authentication
      if (!context.userId) {
        throw new AuthenticationError('User ID is required')
      }

      // Validate based on operation type
      switch (context.operation) {
        case 'read':
          return this.validateReadOperation(context)
        case 'create':
          return this.validateCreateOperation(context)
        case 'update':
          return this.validateUpdateOperation(context)
        case 'delete':
          return this.validateDeleteOperation(context)
        case 'archive':
          return this.validateArchiveOperation(context)
        case 'rename':
          return this.validateRenameOperation(context)
        case 'change_settings':
          return this.validateSettingsOperation(context)
        case 'manage_collaborators':
          return this.validateCollaboratorManagementOperation(context)
        case 'invite_collaborators':
          return this.validateInviteOperation(context)
        case 'remove_collaborators':
          return this.validateRemoveCollaboratorOperation(context)
        default:
          return {
            isValid: false,
            error: {
              message: 'Invalid operation type',
              code: 'INVALID_OPERATION',
            },
          }
      }
    } catch (error) {
      if (
        error instanceof ValidationError ||
        error instanceof AuthorizationError ||
        error instanceof NotFoundError ||
        error instanceof ConflictError ||
        error instanceof AuthenticationError
      ) {
        return {
          isValid: false,
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
          },
        }
      }

      // Handle unexpected errors
      return {
        isValid: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: { originalError: error instanceof Error ? error.message : String(error) },
        },
      }
    }
  }

  /**
   * Validate read operation
   */
  private static validateReadOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for read operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    // All authenticated users with any role can read projects they have access to
    const canRead = hasPermission(context.userRole, 'canView')
    if (!canRead) {
      throw new AuthorizationError('Insufficient permissions to read project')
    }

    return { isValid: true }
  }

  /**
   * Validate create operation
   */
  private static validateCreateOperation(context: ProjectOperationContext): ValidationResult {
    const data = context.data as unknown as CreateProjectData

    // Validate project data
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Project data is required', 'data')
    }

    // Validate name
    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new ValidationError('Project name is required', 'name')
    }

    if (data.name.trim().length > 100) {
      throw new ValidationError('Project name must be 100 characters or less', 'name')
    }

    // Validate description (optional)
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        throw new ValidationError('Description must be a string', 'description')
      }

      if (data.description.trim().length > 500) {
        throw new ValidationError('Description must be 500 characters or less', 'description')
      }
    }

    return { isValid: true }
  }

  /**
   * Validate update operation
   */
  private static validateUpdateOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for update operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    const data = context.data as UpdateProjectData

    // Validate update data
    if (!data || typeof data !== 'object') {
      throw new ValidationError('Update data is required', 'data')
    }

    // Check if user has edit permissions
    const canEdit = hasPermission(context.userRole, 'canEdit')
    if (!canEdit) {
      throw new AuthorizationError('Insufficient permissions to update project')
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new ValidationError('Project name cannot be empty', 'name')
      }

      if (data.name.trim().length > 100) {
        throw new ValidationError('Project name must be 100 characters or less', 'name')
      }
    }

    // Validate description if provided
    if (data.description !== undefined) {
      if (typeof data.description !== 'string') {
        throw new ValidationError('Description must be a string', 'description')
      }

      if (data.description.trim().length > 500) {
        throw new ValidationError('Description must be 500 characters or less', 'description')
      }
    }

    // Validate status if provided
    if (data.status !== undefined) {
      const validStatuses: ProjectStatus[] = ['active', 'archived', 'suspended']
      if (!validStatuses.includes(data.status)) {
        throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')}`, 'status')
      }

      // Only owners can change project status
      const canChangeStatus = hasPermission(context.userRole, 'canChangeProjectSettings')
      if (!canChangeStatus) {
        throw new AuthorizationError('Only project owners can change project status')
      }
    }

    return { isValid: true }
  }

  /**
   * Validate delete operation
   */
  private static validateDeleteOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for delete operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    // Only owners can delete projects
    const canDelete = hasPermission(context.userRole, 'canDelete')
    if (!canDelete) {
      throw new AuthorizationError('Only project owners can delete projects')
    }

    // Check if project is already deleted
    if (context.project.is_deleted) {
      throw new ConflictError('Project is already deleted')
    }

    return { isValid: true }
  }

  /**
   * Validate archive operation
   */
  private static validateArchiveOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for archive operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    // Only owners can archive projects
    const canArchive = hasPermission(context.userRole, 'canChangeProjectSettings')
    if (!canArchive) {
      throw new AuthorizationError('Only project owners can archive projects')
    }

    return { isValid: true }
  }

  /**
   * Validate rename operation
   */
  private static validateRenameOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for rename operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    const newName = context.data?.newName as string

    // Validate new name
    if (!newName || typeof newName !== 'string' || newName.trim().length === 0) {
      throw new ValidationError('New project name is required', 'newName')
    }

    if (newName.trim().length > 100) {
      throw new ValidationError('Project name must be 100 characters or less', 'newName')
    }

    // Check if name is actually different
    if (newName.trim() === context.project.name) {
      throw new ValidationError('New name must be different from current name', 'newName')
    }

    // Check edit permissions
    const canRename = hasPermission(context.userRole, 'canEdit')
    if (!canRename) {
      throw new AuthorizationError('Insufficient permissions to rename project')
    }

    return { isValid: true }
  }

  /**
   * Validate settings operation
   */
  private static validateSettingsOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for settings operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    // Only owners can access project settings
    const canAccessSettings = canAccessFeature(context.userRole, 'project_settings')
    if (!canAccessSettings) {
      throw new AuthorizationError('Only project owners can access project settings')
    }

    return { isValid: true }
  }

  /**
   * Validate collaborator management operation
   */
  private static validateCollaboratorManagementOperation(
    context: ProjectOperationContext
  ): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for collaborator management')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    // Only owners can manage collaborators
    const canManageCollaborators = hasPermission(context.userRole, 'canManageCollaborators')
    if (!canManageCollaborators) {
      throw new AuthorizationError('Only project owners can manage collaborators')
    }

    return { isValid: true }
  }

  /**
   * Validate invite operation
   */
  private static validateInviteOperation(context: ProjectOperationContext): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for invite operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    const inviteData = context.data

    // Validate invite data
    if (!inviteData || typeof inviteData !== 'object') {
      throw new ValidationError('Invite data is required', 'data')
    }

    // Validate email
    if (!inviteData.email || typeof inviteData.email !== 'string') {
      throw new ValidationError('Email is required', 'email')
    }

    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    if (!emailRegex.test(inviteData.email.trim())) {
      throw new ValidationError('Invalid email address', 'email')
    }

    // Validate role
    if (!inviteData.role || typeof inviteData.role !== 'string') {
      throw new ValidationError('Role is required', 'role')
    }

    const validRoles: ProjectRole[] = ['editor', 'viewer']
    if (!validRoles.includes(inviteData.role as ProjectRole)) {
      throw new ValidationError(`Role must be one of: ${validRoles.join(', ')}`, 'role')
    }

    // Check invite permissions
    const canInvite = hasPermission(context.userRole, 'canInviteCollaborators')
    if (!canInvite) {
      throw new AuthorizationError('Insufficient permissions to invite collaborators')
    }

    return { isValid: true }
  }

  /**
   * Validate remove collaborator operation
   */
  private static validateRemoveCollaboratorOperation(
    context: ProjectOperationContext
  ): ValidationResult {
    if (!context.projectId) {
      throw new ValidationError('Project ID is required for remove collaborator operation')
    }

    if (!context.project) {
      throw new NotFoundError('Project')
    }

    if (!context.userRole) {
      throw new AuthorizationError('Access denied to project')
    }

    const targetUserId = context.data?.targetUserId as string

    // Validate target user ID
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new ValidationError('Target user ID is required', 'targetUserId')
    }

    // Cannot remove the project owner
    if (targetUserId === context.project.owner_id) {
      throw new ValidationError('Cannot remove the project owner', 'targetUserId')
    }

    // Cannot remove yourself unless you're the owner
    if (targetUserId === context.userId && context.userRole !== 'owner') {
      throw new ValidationError('You cannot remove yourself from the project', 'targetUserId')
    }

    // Check remove permissions
    const canRemove = hasPermission(context.userRole, 'canRemoveCollaborators')
    if (!canRemove) {
      throw new AuthorizationError('Insufficient permissions to remove collaborators')
    }

    return { isValid: true }
  }

  /**
   * Get user-friendly error message for validation errors
   */
  static getErrorMessage(error: APIError): string {
    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      AUTHENTICATION_ERROR: 'You must be logged in to perform this action',
      AUTHORIZATION_ERROR: "You don't have permission to perform this action",
      VALIDATION_ERROR: 'Please check your input and try again',
      NOT_FOUND: 'The requested resource was not found',
      CONFLICT: 'The action conflicts with the current state',
      INVALID_OPERATION: 'Invalid operation',
      PERMISSION_DENIED: 'Access denied',
      DUPLICATE_RESOURCE: 'This resource already exists',
      CONSTRAINT_VIOLATION: 'The operation violates database constraints',
      DATABASE_ERROR: 'A database error occurred',
      RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
      NETWORK_ERROR: 'Network error occurred',
      TIMEOUT: 'The operation timed out',
    }

    return errorMessages[error.code || 'UNKNOWN_ERROR'] || error.message || 'An error occurred'
  }

  /**
   * Get suggested actions for error recovery
   */
  static getSuggestedActions(error: APIError): string[] {
    const suggestions: Record<string, string[]> = {
      AUTHENTICATION_ERROR: [
        'Please log in to your account',
        'Check if your session has expired',
        'Try refreshing the page',
      ],
      AUTHORIZATION_ERROR: [
        'Contact the project owner for access',
        'Check if you have the correct role',
        'Request necessary permissions',
      ],
      VALIDATION_ERROR: [
        'Review the highlighted fields',
        'Check character limits',
        'Ensure all required fields are filled',
      ],
      NOT_FOUND: [
        'Verify the project ID is correct',
        'Check if the project has been deleted',
        'Try searching for the project',
      ],
      CONFLICT: [
        'The resource may have been modified',
        'Refresh the page and try again',
        'Contact support if the issue persists',
      ],
      PERMISSION_DENIED: [
        'Ensure you have the correct project role',
        'Contact the project owner',
        'Request appropriate permissions',
      ],
      DUPLICATE_RESOURCE: [
        'Choose a different name',
        'Check for existing resources',
        'Use a unique identifier',
      ],
      DATABASE_ERROR: [
        'Try again in a few moments',
        'Check your internet connection',
        'Contact support if the issue persists',
      ],
    }

    return (
      suggestions[error.code || 'UNKNOWN_ERROR'] || [
        'Try refreshing the page',
        'Check your internet connection',
        'Contact support if the issue persists',
      ]
    )
  }
}
