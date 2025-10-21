/**
 * Invitation types for the project management feature
 */

import { Project } from './project'

export interface Invitation {
  id: string
  project_id: string
  invited_by: string
  invited_email: string
  role: InvitationRole
  token: string
  expires_at: string
  accepted_at?: string | null
  declined_at?: string | null
  created_at: string
  project?: Project
  inviter?: InvitationUser
}

export type InvitationRole = 'editor' | 'viewer'

export interface InvitationUser {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
}

export interface InvitationStatus {
  isPending: boolean
  isAccepted: boolean
  isDeclined: boolean
  isExpired: boolean
}

export function getInvitationStatus(invitation: Invitation): InvitationStatus {
  const now = new Date()
  const expiresAt = new Date(invitation.expires_at)

  return {
    isPending: !invitation.accepted_at && !invitation.declined_at && expiresAt > now,
    isAccepted: !!invitation.accepted_at,
    isDeclined: !!invitation.declined_at,
    isExpired: expiresAt <= now,
  }
}

export interface CreateInvitationRequest {
  project_id: string
  invited_email: string
  role: InvitationRole
}

export interface CreateInvitationResponse {
  invitation: Invitation
}

export interface GetInvitationsRequest {
  project_id?: string
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
  limit?: number
  offset?: number
}

export interface GetInvitationsResponse {
  invitations: Invitation[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface GetUserInvitationsRequest {
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
  limit?: number
  offset?: number
}

export interface GetUserInvitationsResponse {
  invitations: Invitation[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface AcceptInvitationRequest {
  token: string
}

export interface AcceptInvitationResponse {
  project: Project
  collaboration: {
    project_id: string
    user_id: string
    role: InvitationRole
  }
}

export interface DeclineInvitationRequest {
  token: string
}

export interface DeclineInvitationResponse {
  success: boolean
}

export interface ResendInvitationRequest {
  invitation_id: string
}

export interface ResendInvitationResponse {
  invitation: Invitation
}

export interface CancelInvitationRequest {
  invitation_id: string
}

export interface CancelInvitationResponse {
  success: boolean
}

export interface InvitationListResponse {
  invitations: Invitation[]
  total: number
}

export interface InvitationWithStatus extends Invitation {
  status: InvitationStatus
  canAccept: boolean
  canDecline: boolean
  canCancel: boolean
  canResend: boolean
}

export function getInvitationPermissions(
  invitation: Invitation,
  currentUserId: string,
  isProjectOwner: boolean = false
) {
  const status = getInvitationStatus(invitation)
  const isExpired = status.isExpired
  const isPending = status.isPending
  const isInviter = invitation.invited_by === currentUserId
  const isInvitedUser = invitation.invited_email === (getCurrentUserEmail(currentUserId) || '')

  return {
    canAccept: isPending && !isExpired && isInvitedUser,
    canDecline: isPending && !isExpired && isInvitedUser,
    canCancel: isPending && (isInviter || isProjectOwner),
    canResend: isPending && (isInviter || isProjectOwner),
    canView: isInviter || isProjectOwner || isInvitedUser,
  }
}

// Helper function to get current user email (this would typically come from auth context)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCurrentUserEmail(userId: string): string | null {
  // This would be implemented based on your auth system
  // For now, returning null as a placeholder
  return null
}

export interface ProjectInvitationsState {
  invitations: InvitationWithStatus[]
  userInvitations: InvitationWithStatus[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectInvitationsActions {
  fetchInvitations: (projectId: string, params?: GetInvitationsRequest) => Promise<void>
  fetchUserInvitations: (params?: GetUserInvitationsRequest) => Promise<void>
  createInvitation: (data: CreateInvitationRequest) => Promise<void>
  acceptInvitation: (token: string) => Promise<void>
  declineInvitation: (token: string) => Promise<void>
  cancelInvitation: (invitationId: string) => Promise<void>
  resendInvitation: (invitationId: string) => Promise<void>
  clearError: () => void
  reset: () => void
}
