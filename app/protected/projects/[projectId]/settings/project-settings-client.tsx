/**
 * Project Settings Client Component
 * Client-side component for project settings with interactive features
 */

'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ProjectSettings } from '@/components/projects/ProjectSettings'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ProjectDetails, ProjectRole, UpdateProjectData } from '@/types/projects'

interface ProjectSettingsClientProps {
  project: ProjectDetails
  userRole: ProjectRole
  userId: string
}

export function ProjectSettingsClient({ project, userRole }: ProjectSettingsClientProps) {
  const router = useRouter()

  // Handle project update
  const handleUpdateProject = async (projectId: string, updateData: UpdateProjectData) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to update project')
      }

      // Refresh the page to show updated data
      router.refresh()
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to delete project')
      }

      // Redirect to projects page after successful deletion
      router.push('/protected/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/projects" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage settings and configuration for &quot;{project.name}&quot;
        </p>
      </div>

      {/* Settings Component */}
      <ProjectSettings
        project={project}
        userRole={userRole}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />
    </div>
  )
}
