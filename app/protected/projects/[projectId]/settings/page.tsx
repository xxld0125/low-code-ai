/**
 * Project Settings Page
 * Individual project settings page with comprehensive project management options
 */

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProjectDetails } from '@/lib/projects/queries'
import { ProjectSettingsClient } from './project-settings-client'
import type { ProjectRole } from '@/types/projects'

interface ProjectSettingsPageProps {
  params: Promise<{
    projectId: string
  }>
}

export async function generateMetadata({ params }: ProjectSettingsPageProps): Promise<Metadata> {
  const { projectId } = await params

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        title: 'Access Denied | Low-Code Platform',
        description: 'You must be logged in to access project settings',
      }
    }

    const project = await getProjectDetails(projectId, user.id)

    if (!project) {
      return {
        title: 'Project Not Found | Low-Code Platform',
        description: 'The requested project could not be found',
      }
    }

    return {
      title: `${project.name} - Settings | Low-Code Platform`,
      description: `Manage settings for ${project.name}`,
    }
  } catch {
    return {
      title: 'Project Settings | Low-Code Platform',
      description: 'Manage project settings',
    }
  }
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="mb-2 text-xl font-semibold">Authentication Required</h2>
          <p className="mb-4 text-muted-foreground">
            You must be logged in to access project settings
          </p>
        </div>
      </div>
    )
  }

  // Get project details
  let project
  let userRole

  try {
    project = await getProjectDetails(projectId, user.id)

    if (!project) {
      notFound()
    }

    // Determine user role (owner gets special privileges)
    userRole = (project.owner_id === user.id ? 'owner' : 'editor') as ProjectRole
  } catch (error) {
    console.error('Error fetching project:', error)

    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="mb-2 text-xl font-semibold">Error Loading Project</h2>
          <p className="mb-4 text-muted-foreground">
            We couldn&apos;t load the project settings. Please try again.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <ProjectSettingsClient project={project} userRole={userRole} userId={user.id} />
    </div>
  )
}
