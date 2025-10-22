/**
 * Activity Log types for the project management feature
 */

export interface ProjectActivityLog {
  id: string
  project_id: string
  user_id: string
  action: ProjectActivityAction
  details: Record<string, unknown>
  created_at: string
  user?: ActivityUser
}

export type ProjectActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'archived'
  | 'restored'
  | 'collaborator_added'
  | 'collaborator_removed'
  | 'collaborator_role_changed'
  | 'invitation_sent'
  | 'invitation_accepted'
  | 'invitation_declined'

export interface ActivityUser {
  id: string
  email: string
  name?: string | null
  avatar_url?: string | null
}

export interface GetActivityLogRequest {
  project_id: string
  limit?: number
  offset?: number
}

export interface GetActivityLogResponse {
  activities: ProjectActivityLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectActivityLogState {
  activities: ProjectActivityLog[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface ProjectActivityLogActions {
  fetchActivities: (projectId: string, params?: GetActivityLogRequest) => Promise<void>
  clearError: () => void
  reset: () => void
}

// Helper function to get activity display text
export function getActivityDisplayText(
  action: ProjectActivityAction,
  userName?: string,
  details?: Record<string, unknown>
): string {
  const actor = userName || 'Someone'

  switch (action) {
    case 'created':
      return `${actor} created this project`
    case 'updated':
      return `${actor} updated this project`
    case 'deleted':
      return `${actor} deleted this project`
    case 'archived':
      return `${actor} archived this project`
    case 'restored':
      return `${actor} restored this project`
    case 'collaborator_added':
      return `${actor} added ${details?.email || 'a collaborator'} to the project`
    case 'collaborator_removed':
      return `${actor} removed ${details?.email || 'a collaborator'} from the project`
    case 'collaborator_role_changed':
      return `${actor} changed ${details?.email || "collaborator's"} role to ${details?.role || 'unknown'}`
    case 'invitation_sent':
      return `${actor} invited ${details?.email || 'someone'} to the project`
    case 'invitation_accepted':
      return `${details?.email || 'Someone'} accepted the project invitation`
    case 'invitation_declined':
      return `${details?.email || 'Someone'} declined the project invitation`
    default:
      return `${actor} performed an action`
  }
}

// Helper function to get activity icon
export function getActivityIcon(action: ProjectActivityAction): string {
  switch (action) {
    case 'created':
      return '✨'
    case 'updated':
      return '✏️'
    case 'deleted':
      return '🗑️'
    case 'archived':
      return '📦'
    case 'restored':
      return '♻️'
    case 'collaborator_added':
      return '👥'
    case 'collaborator_removed':
      return '👋'
    case 'collaborator_role_changed':
      return '🔄'
    case 'invitation_sent':
      return '📧'
    case 'invitation_accepted':
      return '✅'
    case 'invitation_declined':
      return '❌'
    default:
      return '📝'
  }
}
