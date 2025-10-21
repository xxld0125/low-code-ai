/**
 * Projects Dashboard Page
 * Main page for viewing and managing all projects
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectsLoadingSkeleton } from '@/components/projects/ProjectsLoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'Projects | Low-Code Platform',
  description: 'Manage your low-code development projects',
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <PageHeader
        title="Projects"
        description="Create and manage your low-code development projects"
      />

      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectList />
      </Suspense>
    </div>
  )
}
