/**
 * Project Overview Client Component
 * Client-side component for project overview with interactive features
 */

'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ProjectActivityLog } from '@/components/projects/ProjectActivityLog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ArrowLeft,
  Settings,
  Users,
  Activity,
  Calendar,
  MoreHorizontal,
  Edit,
  Archive,
  ExternalLink,
} from 'lucide-react'
import { useRelativeTime } from '@/hooks/useRelativeTime'
import type { ProjectDetails, ProjectRole } from '@/types/projects'

interface ProjectOverviewClientProps {
  project: ProjectDetails
  userRole: ProjectRole
  userId: string
}

export function ProjectOverviewClient({ project, userRole }: ProjectOverviewClientProps) {
  // Use the safe relative time hook for date formatting
  const createdAt = useRelativeTime(project.created_at)
  const updatedAt = useRelativeTime(project.updated_at)
  const lastActivity = useRelativeTime(project.last_activity)

  // Get status color
  const getStatusColor = (status: string) => {
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

  // Get user initials for avatar fallback
  const getUserInitials = (name?: string | null, email?: string) => {
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

  // Handle project actions
  const handleProjectAction = async (action: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || `Failed to ${action} project`)
      }

      // Refresh the page to show updated data
      window.location.reload()
    } catch (error) {
      console.error(`Failed to ${action} project:`, error)
      // You could add toast notifications here
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/protected/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              Created {createdAt} • Last updated {updatedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>

          {userRole === 'owner' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={`/protected/projects/${project.id}/settings`}>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProjectAction('archive')}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Project Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{project.status}</div>
            <p className="text-xs text-muted-foreground">Last active {lastActivity}</p>
          </CardContent>
        </Card>

        {/* Collaborators Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collaborators</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.collaborators_count}</div>
            <p className="text-xs text-muted-foreground">Including owner</p>
          </CardContent>
        </Card>

        {/* Created Date Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </CardContent>
        </Card>

        {/* Role Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'owner' ? 'Full access' : 'Limited access'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Description and Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Project Description */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝</span>
              Project Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.description ? (
              <p className="leading-relaxed text-muted-foreground">{project.description}</p>
            ) : (
              <p className="italic text-muted-foreground">
                No description provided. Click Settings to add one.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Project Owner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>👤</span>
              Project Owner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                {project.owner_email ? (
                  <AvatarFallback className="text-sm">
                    {getUserInitials(project.owner_name, project.owner_email)}
                  </AvatarFallback>
                ) : null}
              </Avatar>
              <div>
                <p className="font-medium">{project.owner_name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground">{project.owner_email || 'No email'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common actions and navigation for this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href={`/protected/projects/${project.id}/settings`}>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Project Settings
              </Button>
            </Link>

            <Button variant="outline" disabled>
              <Users className="mr-2 h-4 w-4" />
              Manage Collaborators
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">Coming Soon</span>
            </Button>

            <Button variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in Designer
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">Coming Soon</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <ProjectActivityLog
        projectId={project.id}
        className="w-full"
        maxItems={10}
        showLoadMore={true}
      />
    </div>
  )
}
