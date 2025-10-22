/**
 * 项目设置客户端组件
 * 具有交互功能的项目设置客户端组件
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

  // 处理项目更新
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

      // 刷新页面以显示更新的数据
      router.refresh()
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }

  // 处理项目删除
  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to delete project')
      }

      // 成功删除后重定向到项目页面
      router.push('/protected/projects')
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/protected/projects" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Link>
          </Button>
        </div>
      </div>

      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">项目设置</h1>
        <p className="mt-2 text-muted-foreground">管理 &quot;{project.name}&quot; 的设置和配置</p>
      </div>

      {/* 设置组件 */}
      <ProjectSettings
        project={project}
        userRole={userRole}
        onUpdate={handleUpdateProject}
        onDelete={handleDeleteProject}
      />
    </div>
  )
}
