import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PermissionChecker } from '@/lib/page-designer/permissions'

interface PreviewPageLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PreviewPageLayoutProps): Promise<Metadata> {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: pageDesign } = await supabase
      .from('page_designs')
      .select('name, description, config')
      .eq('id', id)
      .single()

    if (!pageDesign) {
      return {
        title: '页面设计未找到',
        description: '请求的页面设计不存在或您没有访问权限',
      }
    }

    const title = pageDesign.config?.title || pageDesign.name
    const description = pageDesign.config?.meta?.description || pageDesign.description

    return {
      title: `预览 ${title} - 页面设计器`,
      description: description || `预览 ${title} 页面设计`,
      keywords: pageDesign.config?.meta?.keywords?.join(', '),
      robots: 'noindex, nofollow', // 预览页面不应该被搜索引擎索引
    }
  } catch {
    return {
      title: '页面预览',
      description: '页面设计预览',
    }
  }
}

export default async function PreviewPageLayout({ children, params }: PreviewPageLayoutProps) {
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
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900">请先登录</h1>
            <p className="mb-6 text-gray-600">您需要登录才能预览页面设计</p>
            <a
              href="/auth/login"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              前往登录
            </a>
          </div>
        </div>
      )
    }

    // 使用统一的权限检查（只需要view权限）
    const permissionResult = await PermissionChecker.checkPageDesignAccess(id, user.id, 'view')

    if (!permissionResult.hasPermission) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="p-8 text-center">
            <h1 className="mb-4 text-2xl font-bold text-red-600">访问被拒绝</h1>
            <p className="mb-6 text-gray-600">
              {permissionResult.error || '您没有权限预览此页面设计'}
            </p>
            <Link
              href="/protected/designer/list"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              返回列表
            </Link>
          </div>
        </div>
      )
    }

    // 预览模式添加顶部提示栏
    return (
      <div className="min-h-screen bg-gray-50">
        {/* 预览提示栏 */}
        <div className="bg-blue-600 px-4 py-2 text-sm text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>预览模式 - 这是页面设计的预览版本</span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href={`/protected/designer/page/${id}`}
                className="text-white underline hover:text-blue-200"
              >
                返回编辑
              </a>
              <button onClick={() => window.close()} className="text-white hover:text-blue-200">
                关闭窗口
              </button>
            </div>
          </div>
        </div>

        {/* 预览内容 */}
        <div className="relative">{children}</div>
      </div>
    )
  } catch (error) {
    console.error('预览页面布局错误:', error)
    notFound()
  }
}
