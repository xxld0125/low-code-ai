/**
 * 项目仪表板页面
 * 查看和管理所有项目的主页面
 */

import { Metadata } from 'next'
import { Suspense } from 'react'
import { ProjectList } from '@/components/projects/ProjectList'
import { ProjectsLoadingSkeleton } from '@/components/projects/ProjectsLoadingSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: '项目 | 低代码平台',
  description: '管理您的低代码开发项目',
}

export default function ProjectsPage() {
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <PageHeader title="项目" description="创建和管理您的低代码开发项目" />

      <Suspense fallback={<ProjectsLoadingSkeleton />}>
        <ProjectList />
      </Suspense>
    </div>
  )
}
