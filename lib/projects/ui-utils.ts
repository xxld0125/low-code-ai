/**
 * Shared UI utilities for project management components
 * Common formatting, styling, and UI helper functions
 */

import type { ProjectStatus, ProjectRole } from '@/types/projects'

/**
 * Get status color classes for badges and indicators
 */
export function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'archived':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'suspended':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get role color classes for badges and indicators
 */
export function getRoleColor(role: ProjectRole): string {
  switch (role) {
    case 'owner':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'editor':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'viewer':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get user initials for avatar fallback
 */
export function getUserInitials(name?: string | null, email?: string): string {
  if (name) {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  if (email) {
    return email[0].toUpperCase()
  }
  return 'U'
}

/**
 * Get status icon based on project status
 */
export function getStatusIcon(status: ProjectStatus): string {
  switch (status) {
    case 'active':
      return '🟢'
    case 'archived':
      return '📦'
    case 'suspended':
      return '⏸️'
    default:
      return '❓'
  }
}

/**
 * Get role icon based on user role
 */
export function getRoleIcon(role: ProjectRole): string {
  switch (role) {
    case 'owner':
      return '👑'
    case 'editor':
      return '✏️'
    case 'viewer':
      return '👁️'
    default:
      return '❓'
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get project description for display
 */
export function getProjectDescription(description?: string | null): string {
  if (!description) return 'No description provided'
  return truncateText(description, 100)
}

/**
 * Get project name for display
 */
export function getProjectDisplayName(name: string): string {
  return truncateText(name, 50)
}

/**
 * Get project URL for navigation
 */
export function getProjectUrl(projectId: string, basePath: string = '/protected/projects'): string {
  return `${basePath}/${projectId}`
}

/**
 * Get project settings URL
 */
export function getProjectSettingsUrl(
  projectId: string,
  basePath: string = '/protected/projects'
): string {
  return `${basePath}/${projectId}/settings`
}

/**
 * Get project collaborator URL
 */
export function getProjectCollaboratorsUrl(
  projectId: string,
  basePath: string = '/protected/projects'
): string {
  return `${basePath}/${projectId}/collaborate`
}

/**
 * Check if user can perform specific action based on role
 */
export function canUserPerformAction(
  userRole: ProjectRole,
  action: 'view' | 'edit' | 'delete' | 'manage_collaborators' | 'change_settings'
): boolean {
  switch (action) {
    case 'view':
      return true // All roles can view
    case 'edit':
      return userRole === 'owner' || userRole === 'editor'
    case 'delete':
    case 'manage_collaborators':
    case 'change_settings':
      return userRole === 'owner'
    default:
      return false
  }
}

/**
 * Get action confirmation message
 */
export function getActionConfirmationMessage(
  action: 'delete' | 'archive' | 'remove_collaborator',
  projectName?: string,
  targetName?: string
): string {
  switch (action) {
    case 'delete':
      return projectName
        ? `Are you sure you want to delete "${projectName}"? This action cannot be undone.`
        : 'Are you sure you want to delete this item? This action cannot be undone.'
    case 'archive':
      return projectName
        ? `Are you sure you want to archive "${projectName}"? You can restore it later.`
        : 'Are you sure you want to archive this item? You can restore it later.'
    case 'remove_collaborator':
      return targetName
        ? `Are you sure you want to remove ${targetName} from the project?`
        : 'Are you sure you want to remove this collaborator?'
    default:
      return 'Are you sure you want to perform this action?'
  }
}

/**
 * Get loading text for various operations
 */
export function getLoadingText(operation: string): string {
  const loadingTexts: Record<string, string> = {
    create: 'Creating...',
    update: 'Updating...',
    delete: 'Deleting...',
    archive: 'Archiving...',
    invite: 'Sending invitation...',
    remove: 'Removing...',
    save: 'Saving...',
    load: 'Loading...',
  }
  return loadingTexts[operation.toLowerCase()] || 'Processing...'
}

/**
 * Get success message for various operations
 */
export function getSuccessMessage(operation: string, target?: string): string {
  const successMessages: Record<string, string> = {
    create: target ? `${target} created successfully` : 'Created successfully',
    update: target ? `${target} updated successfully` : 'Updated successfully',
    delete: target ? `${target} deleted successfully` : 'Deleted successfully',
    archive: target ? `${target} archived successfully` : 'Archived successfully',
    invite: target ? `Invitation sent to ${target}` : 'Invitation sent',
    remove: target ? `${target} removed successfully` : 'Removed successfully',
  }
  return successMessages[operation.toLowerCase()] || 'Operation completed successfully'
}

/**
 * Get error message for various operations
 */
export function getErrorMessage(operation: string, error?: string): string {
  const baseMessage = `Failed to ${operation.toLowerCase()}`
  return error ? `${baseMessage}: ${error}` : baseMessage
}
