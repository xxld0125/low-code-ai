/**
 * 项目概览客户端组件
 * 具有交互功能的项目概览客户端组件
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

  // 获取状态颜色
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

  // 获取用户头像首字母
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

  // 处理项目操作
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

      // 刷新页面以显示更新的数据
      window.location.reload()
    } catch (error) {
      console.error(`Failed to ${action} project:`, error)
      // 您可以在这里添加 toast 通知
    }
  }

  return (
    <div className="space-y-8">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/protected/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回项目列表
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">
              创建于 {createdAt} • 最后更新于 {updatedAt}
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
                    设置
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleProjectAction('archive')}>
                  <Archive className="mr-2 h-4 w-4" />
                  归档项目
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* 项目信息卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 项目状态卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{project.status}</div>
            <p className="text-xs text-muted-foreground">最后活跃于 {lastActivity}</p>
          </CardContent>
        </Card>

        {/* 协作者卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">协作者</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.collaborators_count}</div>
            <p className="text-xs text-muted-foreground">包括所有者</p>
          </CardContent>
        </Card>

        {/* 创建日期卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建时间</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(project.created_at).toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <p className="text-xs text-muted-foreground">{createdAt}</p>
          </CardContent>
        </Card>

        {/* 角色卡片 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">您的角色</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{userRole}</div>
            <p className="text-xs text-muted-foreground">
              {userRole === 'owner' ? '完全访问' : '有限访问'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 描述和详细信息 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 项目描述 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📝</span>
              项目描述
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.description ? (
              <p className="leading-relaxed text-muted-foreground">{project.description}</p>
            ) : (
              <p className="italic text-muted-foreground">未提供描述。点击设置添加一个。</p>
            )}
          </CardContent>
        </Card>

        {/* 项目所有者 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>👤</span>
              项目所有者
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
                <p className="font-medium">{project.owner_name || '未知'}</p>
                <p className="text-sm text-muted-foreground">{project.owner_email || '无邮箱'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>此项目的常用操作和导航</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href={`/protected/projects/${project.id}/settings`}>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                项目设置
              </Button>
            </Link>

            <Button variant="outline" disabled>
              <Users className="mr-2 h-4 w-4" />
              管理协作者
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">即将推出</span>
            </Button>

            <Button variant="outline" disabled>
              <ExternalLink className="mr-2 h-4 w-4" />
              在设计器中打开
              <span className="ml-2 rounded bg-muted px-2 py-1 text-xs">即将推出</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 活动日志 */}
      <ProjectActivityLog
        projectId={project.id}
        className="w-full"
        maxItems={10}
        showLoadMore={true}
      />
    </div>
  )
}
