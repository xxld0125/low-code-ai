import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageDesignerErrorBoundary from '@/components/page-designer/PageDesignerErrorBoundary'
import { PermissionChecker } from '@/lib/page-designer/permissions'

interface PageDesignLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageDesignLayoutProps): Promise<Metadata> {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: pageDesign } = await supabase
      .from('page_designs')
      .select('name, description')
      .eq('id', id)
      .single()

    if (!pageDesign) {
      return {
        title: '页面设计未找到',
        description: '请求的页面设计不存在或您没有访问权限',
      }
    }

    return {
      title: `编辑 ${pageDesign.name} - 页面设计器`,
      description: pageDesign.description || `使用可视化编辑器编辑 ${pageDesign.name} 页面`,
    }
  } catch {
    return {
      title: '页面设计器',
      description: '可视化页面设计编辑器',
    }
  }
}

export default async function PageDesignLayout({ children, params }: PageDesignLayoutProps) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 获取用户信息
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">请先登录</h1>
            <p className="text-muted-foreground">您需要登录才能访问页面设计器</p>
          </div>
        </div>
      )
    }

    // 使用统一的权限检查
    const permissionResult = await PermissionChecker.checkPageDesignAccess(id, user.id, 'view')

    if (!permissionResult.hasPermission) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h1 className="mb-2 text-2xl font-bold">访问被拒绝</h1>
            <p className="text-muted-foreground">
              {permissionResult.error || '您没有权限访问此页面设计'}
            </p>
          </div>
        </div>
      )
    }

    return (
      <PageDesignerErrorBoundary>
        <div className="min-h-screen bg-gray-50">{children}</div>
      </PageDesignerErrorBoundary>
    )
  } catch (error) {
    console.error('页面设计布局错误:', error)
    notFound()
  }
}
