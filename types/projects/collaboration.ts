/**
 * Collaboration types for the project management feature
 */

export interface Collaborator {
  id: string
  project_id: string
  user_id: string
  role: CollaboratorRole
  invited_at: string
  joined_at?: string | null
  last_accessed_at?: string | null
  user?: CollaboratorUser
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer'

export interface CollaboratorUser {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
}

export interface CreateCollaboratorRequest {
  email: string
  role: Exclude<CollaboratorRole, 'owner'> // Can't invite owners
}

export interface CreateCollaboratorResponse {
  invitation: Invitation
}

export interface GetCollaboratorsRequest {
  project_id: string
  limit?: number
  offset?: number
}

export interface GetCollaboratorsResponse {
  collaborators: Collaborator[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface UpdateCollaboratorRoleRequest {
  role: CollaboratorRole
}

export interface UpdateCollaboratorRoleResponse {
  collaborator: Collaborator
}

export interface RemoveCollaboratorResponse {
  success: boolean
}

export interface CollaboratorListResponse {
  collaborators: Collaborator[]
  total: number
}

export interface CollaboratorPermissions {
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canManageCollaborators: boolean
  canInviteCollaborators: boolean
  canRemoveCollaborators: boolean
  canChangeProjectSettings: boolean
}

export function getCollaboratorPermissions(
  role: CollaboratorRole,
  isOwner: boolean = false
): CollaboratorPermissions {
  const basePermissions: CollaboratorPermissions = {
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
    case 'editor':
      return {
        ...basePermissions,
        canEdit: true,
        canInviteCollaborators: true,
        canChangeProjectSettings: isOwner, // Only true owners can change settings
      }

    case 'viewer':
      return basePermissions

    default:
      return basePermissions
  }
}

export interface CollaboratorActivity {
  id: string
  collaborator_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
}

export interface CollaboratorWithPermissions extends Collaborator {
  permissions: CollaboratorPermissions
}

export interface ProjectCollaboratorsState {
  collaborators: CollaboratorWithPermissions[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectCollaboratorsActions {
  fetchCollaborators: (projectId: string, params?: GetCollaboratorsRequest) => Promise<void>
  inviteCollaborator: (projectId: string, data: CreateCollaboratorRequest) => Promise<void>
  updateCollaboratorRole: (
    projectId: string,
    userId: string,
    role: CollaboratorRole
  ) => Promise<void>
  removeCollaborator: (projectId: string, userId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}
