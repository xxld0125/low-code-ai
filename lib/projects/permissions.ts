/**
 * Permission utilities for project management
 * Provides role-based access control and permission checking
 */

import type {
  ProjectRole,
  CollaboratorPermissions,
  Invitation,
  InvitationWithStatus,
} from '@/types/projects'

/**
 * Role hierarchy for permissions (higher number = more permissions)
 */
const ROLE_HIERARCHY: Record<ProjectRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
}

/**
 * Get permissions for a specific role
 */
export function getRolePermissions(role: ProjectRole): CollaboratorPermissions {
  const basePermissions = {
    canView: true,
    canEdit: false,
    canDelete: false,
    canManageCollaborators: false,
    canInviteCollaborators: false,
    canRemoveCollaborators: false,
    canChangeProjectSettings: false,
  }

  switch (role) {
    case 'owner':
      return {
        ...basePermissions,
        canEdit: true,
        canDelete: true,
        canManageCollaborators: true,
        canInviteCollaborators: true,
        canRemoveCollaborators: true,
        canChangeProjectSettings: true,
      }

    case 'editor':
      return {
        ...basePermissions,
        canEdit: true,
        canInviteCollaborators: true,
      }

    case 'viewer':
      return basePermissions

    default:
      return basePermissions
  }
}

/**
 * Check if a role has permission for a specific action
 */
export function hasPermission(
  userRole: ProjectRole,
  action: keyof CollaboratorPermissions
): boolean {
  const permissions = getRolePermissions(userRole)
  return permissions[action]
}

/**
 * Check if user can perform action based on role hierarchy
 */
export function canPerformAction(userRole: ProjectRole, requiredRole: ProjectRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

/**
 * Get the minimum role required for an action
 */
export function getMinimumRoleForAction(action: keyof CollaboratorPermissions): ProjectRole {
  const actionRequirements: Record<keyof CollaboratorPermissions, ProjectRole> = {
    canView: 'viewer',
    canEdit: 'editor',
    canDelete: 'owner',
    canManageCollaborators: 'owner',
    canInviteCollaborators: 'editor',
    canRemoveCollaborators: 'owner',
    canChangeProjectSettings: 'owner',
  }

  return actionRequirements[action] || 'viewer'
}

/**
 * Check if user can access a specific feature
 */
export function canAccessFeature(
  userRole: ProjectRole,
  feature:
    | 'project_settings'
    | 'collaborator_management'
    | 'invitation_management'
    | 'content_editing'
    | 'view_only'
): boolean {
  const featurePermissions: Record<string, ProjectRole[]> = {
    project_settings: ['owner'],
    collaborator_management: ['owner'],
    invitation_management: ['owner', 'editor'],
    content_editing: ['owner', 'editor'],
    view_only: ['owner', 'editor', 'viewer'],
  }

  return featurePermissions[feature]?.includes(userRole) || false
}

/**
 * Get available actions for a role
 */
export function getAvailableActions(userRole: ProjectRole): (keyof CollaboratorPermissions)[] {
  const permissions = getRolePermissions(userRole)
  return (Object.keys(permissions) as (keyof CollaboratorPermissions)[]).filter(
    action => permissions[action]
  )
}

/**
 * Check if user can manage a specific collaborator
 */
export function canManageCollaborator(
  userRole: ProjectRole,
  targetRole: ProjectRole,
  isOwner: boolean = false
): boolean {
  // Owners can manage anyone except themselves (in some contexts)
  if (userRole === 'owner' && !isOwner) {
    return true
  }

  // Editors can only manage viewers
  if (userRole === 'editor' && targetRole === 'viewer') {
    return true
  }

  // Viewers cannot manage anyone
  if (userRole === 'viewer') {
    return false
  }

  // Users cannot manage others with equal or higher role (except owner managing everyone)
  if (ROLE_HIERARCHY[userRole] <= ROLE_HIERARCHY[targetRole]) {
    return false
  }

  return false
}

/**
 * Get invitation permissions
 */
export function getInvitationPermissions(
  invitation: Invitation,
  currentUserId: string,
  userRole?: ProjectRole,
  isProjectOwner: boolean = false
) {
  const now = new Date()
  const expiresAt = new Date(invitation.expires_at)
  const isExpired = expiresAt <= now
  const isPending = !invitation.accepted_at && !invitation.declined_at
  const isInviter = invitation.invited_by === currentUserId

  // This would need to be implemented based on your auth system
  const isInvitedUser = false // This would check if current user's email matches invited_email

  return {
    canAccept: isPending && !isExpired && isInvitedUser,
    canDecline: isPending && !isExpired && isInvitedUser,
    canCancel: isPending && (isInviter || isProjectOwner),
    canResend: isPending && (isInviter || isProjectOwner),
    canView: isInviter || isProjectOwner || isInvitedUser,
  }
}

/**
 * Enrich invitation with status and permissions
 */
export function enrichInvitation(
  invitation: Invitation,
  currentUserId: string,
  userRole?: ProjectRole,
  isProjectOwner: boolean = false
): InvitationWithStatus {
  const now = new Date()
  const expiresAt = new Date(invitation.expires_at)

  const status = {
    isPending: !invitation.accepted_at && !invitation.declined_at && expiresAt > now,
    isAccepted: !!invitation.accepted_at,
    isDeclined: !!invitation.declined_at,
    isExpired: expiresAt <= now,
  }

  const permissions = getInvitationPermissions(invitation, currentUserId, userRole, isProjectOwner)

  return {
    ...invitation,
    status,
    ...permissions,
  }
}

/**
 * Validate role transition
 */
export function canChangeRole(
  currentRole: ProjectRole,
  newRole: ProjectRole,
  userRole: ProjectRole
): { canChange: boolean; reason?: string } {
  // Only owners can change roles
  if (userRole !== 'owner') {
    return { canChange: false, reason: 'Only project owners can change roles' }
  }

  // Cannot change owner role through this function (ownership transfer should be separate)
  if (currentRole === 'owner' || newRole === 'owner') {
    return { canChange: false, reason: 'Cannot change owner role through role change' }
  }

  // Can change to any valid role
  if (!['editor', 'viewer'].includes(newRole)) {
    return { canChange: false, reason: 'Invalid role' }
  }

  return { canChange: true }
}

/**
 * Check if user can perform bulk operations
 */
export function canPerformBulkOperation(
  userRole: ProjectRole,
  operation: 'invite_multiple' | 'remove_multiple' | 'change_role_multiple'
): boolean {
  const bulkPermissions: Record<string, ProjectRole[]> = {
    invite_multiple: ['owner', 'editor'],
    remove_multiple: ['owner'],
    change_role_multiple: ['owner'],
  }

  return bulkPermissions[operation]?.includes(userRole) || false
}

/**
 * Get project access level for UI rendering
 */
export function getAccessLevel(userRole: ProjectRole): 'full' | 'limited' | 'read-only' {
  switch (userRole) {
    case 'owner':
      return 'full'
    case 'editor':
      return 'limited'
    case 'viewer':
      return 'read-only'
    default:
      return 'read-only'
  }
}

/**
 * Check if feature should be visible in UI based on role
 */
export function isFeatureVisible(userRole: ProjectRole, feature: string): boolean {
  const featureVisibility: Record<string, ProjectRole[]> = {
    create_project: ['owner', 'editor', 'viewer'], // All authenticated users
    delete_project: ['owner'],
    archive_project: ['owner'],
    invite_collaborator: ['owner', 'editor'],
    remove_collaborator: ['owner'],
    change_project_settings: ['owner'],
    view_activity_log: ['owner', 'editor', 'viewer'],
    export_project_data: ['owner', 'editor'],
    manage_integrations: ['owner'],
  }

  return featureVisibility[feature]?.includes(userRole) || false
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: ProjectRole): string {
  const roleNames: Record<ProjectRole, string> = {
    owner: 'Owner',
    editor: 'Editor',
    viewer: 'Viewer',
  }

  return roleNames[role] || role
}

/**
 * Get role description
 */
export function getRoleDescription(role: ProjectRole): string {
  const roleDescriptions: Record<ProjectRole, string> = {
    owner: 'Full control over the project including settings and team management',
    editor: 'Can edit project content and invite new collaborators',
    viewer: 'Can view project content but cannot make changes',
  }

  return roleDescriptions[role] || 'Unknown role'
}

/**
 * Sort roles by hierarchy (highest first)
 */
export function sortRolesByHierarchy(roles: ProjectRole[]): ProjectRole[] {
  return roles.sort((a, b) => ROLE_HIERARCHY[b] - ROLE_HIERARCHY[a])
}

/**
 * Get role color for UI
 */
export function getRoleColor(role: ProjectRole): string {
  const roleColors: Record<ProjectRole, string> = {
    owner: 'bg-purple-100 text-purple-800 border-purple-200',
    editor: 'bg-blue-100 text-blue-800 border-blue-200',
    viewer: 'bg-gray-100 text-gray-800 border-gray-200',
  }

  return roleColors[role] || roleColors['viewer']
}
