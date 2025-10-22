/**
 * ProjectActivityLog Component
 * Displays a chronological log of project activities
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  type ProjectActivityLog,
  type GetActivityLogRequest,
  getActivityDisplayText,
  getActivityIcon,
} from '@/types/projects/activity-log'
import { formatRelativeTime } from '@/lib/utils/date'
import { cn } from '@/lib/utils'

interface ProjectActivityLogProps {
  projectId: string
  className?: string
  maxItems?: number
  showLoadMore?: boolean
}

interface ActivityLogResponse {
  activities: ProjectActivityLog[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function ProjectActivityLog({
  projectId,
  className,
  maxItems = 20,
  showLoadMore = true,
}: ProjectActivityLogProps) {
  const [activities, setActivities] = useState<ProjectActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: maxItems,
    offset: 0,
    hasMore: false,
  })

  // Fetch activities for the project
  const fetchActivities = useCallback(
    async (reset = false) => {
      try {
        setLoading(true)
        setError(null)

        const offset = reset ? 0 : pagination.offset
        const params: GetActivityLogRequest = {
          project_id: projectId,
          limit: maxItems,
          offset,
        }

        const searchParams = new URLSearchParams()
        searchParams.set('project_id', projectId)
        if (params.limit) searchParams.set('limit', params.limit.toString())
        if (params.offset) searchParams.set('offset', params.offset.toString())

        const response = await fetch(
          `/api/projects/${projectId}/activities?${searchParams.toString()}`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch activities')
        }

        const data: ActivityLogResponse = await response.json()

        if (reset) {
          setActivities(data.activities)
        } else {
          setActivities(prev => [...prev, ...data.activities])
        }

        setPagination(data.pagination)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    },
    [projectId, maxItems, pagination.offset]
  )

  // Load more activities
  const loadMore = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))
      fetchActivities(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (projectId) {
      fetchActivities(true)
    }
  }, [projectId, fetchActivities])

  // Get user initials for avatar fallback
  const getUserInitials = (user?: { name?: string | null; email?: string }) => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  // Get action color for badge
  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'updated':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'deleted':
      case 'collaborator_removed':
      case 'invitation_declined':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'archived':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'restored':
      case 'collaborator_added':
      case 'invitation_accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'collaborator_role_changed':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'invitation_sent':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading && activities.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Activity Log
          </CardTitle>
          <CardDescription>Recent project activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Activity Log
          </CardTitle>
          <CardDescription>Recent project activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="mb-2 text-red-600">Error loading activities</p>
            <p className="mb-4 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => fetchActivities(true)}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span>
            Activity Log
          </CardTitle>
          <CardDescription>Recent project activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No activities recorded yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Activities will appear here as team members interact with the project
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>📊</span>
          Activity Log
        </CardTitle>
        <CardDescription>Recent project activities ({pagination.total} total)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full overflow-y-auto rounded-md border">
          <div className="space-y-4 p-4">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50',
                  index === 0 && 'border-l-2 border-primary'
                )}
              >
                {/* Activity Icon */}
                <div className="flex-shrink-0 text-lg">{getActivityIcon(activity.action)}</div>

                {/* User Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  {activity.user?.avatar_url ? (
                    <AvatarImage
                      src={activity.user.avatar_url}
                      alt={activity.user.name || activity.user.email}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {getUserInitials(activity.user)}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Content */}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {getActivityDisplayText(
                        activity.action,
                        activity.user?.name || activity.user?.email,
                        activity.details
                      )}
                    </p>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', getActionColor(activity.action))}
                    >
                      {activity.action.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load More Button */}
        {showLoadMore && pagination.hasMore && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={loadMore} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Activities'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
