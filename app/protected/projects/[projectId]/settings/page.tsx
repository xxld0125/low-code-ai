/**
 * 项目设置页面
 * 具有全面项目管理选项的单个项目设置页面
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
        title: '访问被拒绝 | 低代码平台',
        description: '您必须登录才能访问项目设置',
      }
    }

    const project = await getProjectDetails(projectId, user.id)

    if (!project) {
      return {
        title: '项目未找到 | 低代码平台',
        description: '找不到请求的项目',
      }
    }

    return {
      title: `${project.name} - Settings | Low-Code Platform`,
      description: `Manage settings for ${project.name}`,
    }
  } catch {
    return {
      title: '项目设置 | 低代码平台',
      description: '管理项目设置',
    }
  }
}

export default async function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const { projectId } = await params
  const supabase = await createClient()

  // 获取认证用户
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="mb-2 text-xl font-semibold">需要身份验证</h2>
          <p className="mb-4 text-muted-foreground">您必须登录才能访问项目设置</p>
        </div>
      </div>
    )
  }

  // 获取项目详情
  let project
  let userRole

  try {
    project = await getProjectDetails(projectId, user.id)

    if (!project) {
      notFound()
    }

    // 确定用户角色（所有者获得特殊权限）
    userRole = (project.owner_id === user.id ? 'owner' : 'editor') as ProjectRole
  } catch (error) {
    console.error('Error fetching project:', error)

    return (
      <div className="container mx-auto space-y-8 px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="mb-2 text-xl font-semibold">加载项目出错</h2>
          <p className="mb-4 text-muted-foreground">我们无法加载项目设置。请重试。</p>
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
