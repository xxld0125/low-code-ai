'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Copy, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'
// import { useRouter } from 'next/navigation' // 暂时未使用，后续可能会用到
import Link from 'next/link'
import Image from 'next/image'
import { useDebounce } from '@/hooks/use-debounce'

interface PageDesign {
  id: string
  name: string
  description?: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
  updated_at: string
  thumbnail_url?: string
  tags: string[]
  config: {
    title: string
  }
}

export default function PageDesignerList() {
  // 暂时未使用，后续可能会用到
  // const router = useRouter()
  const [pageDesigns, setPageDesigns] = useState<PageDesign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDesign, setSelectedDesign] = useState<PageDesign | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })

  // 防抖搜索查询，延迟500ms
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // 检查是否正在搜索（用于显示加载状态）
  const isSearching = debouncedSearchQuery !== searchQuery

  // 加载页面设计列表
  const loadPageDesigns = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearchQuery,
        ...(statusFilter !== 'all' && { status: statusFilter }),
      })

      const response = await fetch(`/api/page-designer/page-designs?${params}`)
      if (!response.ok) throw new Error('加载失败')

      const data = await response.json()
      setPageDesigns(data.data || [])
      setPagination(data.pagination || pagination)
    } catch (error) {
      console.error('加载页面设计列表失败:', error)
      toast({
        title: '加载失败',
        description: '无法加载页面设计列表，请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearchQuery, statusFilter, pagination])

  // 删除页面设计
  const deletePageDesign = async (id: string) => {
    try {
      const response = await fetch(`/api/page-designer/page-designs/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('删除失败')

      toast({
        title: '删除成功',
        description: '页面设计已成功删除',
      })

      setDeleteDialogOpen(false)
      setSelectedDesign(null)
      loadPageDesigns()
    } catch (error) {
      console.error('删除页面设计失败:', error)
      toast({
        title: '删除失败',
        description: '无法删除页面设计，请稍后重试',
        variant: 'destructive',
      })
    }
  }

  // 复制页面设计
  const duplicatePageDesign = async (design: PageDesign) => {
    try {
      const response = await fetch(`/api/page-designer/page-designs/${design.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${design.name} (副本)`,
          description: design.description,
        }),
      })

      if (!response.ok) throw new Error('复制失败')

      await response.json() // newDesign 暂时未使用
      toast({
        title: '复制成功',
        description: '页面设计已成功复制',
      })

      loadPageDesigns()
    } catch (error) {
      console.error('复制页面设计失败:', error)
      toast({
        title: '复制失败',
        description: '无法复制页面设计，请稍后重试',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadPageDesigns()
  }, [debouncedSearchQuery, statusFilter, pagination.page, loadPageDesigns])

  // 当搜索查询改变时重置页码为第一页
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      setPagination(prev => ({ ...prev, page: 1 }))
    }
  }, [searchQuery, debouncedSearchQuery])

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      published: 'default',
      archived: 'outline',
    } as const

    const labels = {
      draft: '草稿',
      published: '已发布',
      archived: '已归档',
    }

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">页面设计</h1>
          <p className="text-muted-foreground">管理和编辑您的页面设计</p>
        </div>
        <Link href="/protected/designer/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新建页面
          </Button>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            placeholder="搜索页面设计..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === 'all'
                ? '全部状态'
                : statusFilter === 'draft'
                  ? '草稿'
                  : statusFilter === 'published'
                    ? '已发布'
                    : '已归档'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>全部状态</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('draft')}>草稿</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('published')}>已发布</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('archived')}>已归档</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 页面设计列表 */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-4 h-32 w-full" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : pageDesigns.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-medium">暂无页面设计</h3>
          <p className="mb-6 text-muted-foreground">创建您的第一个页面设计开始使用可视化编辑器</p>
          <Link href="/protected/designer/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              创建页面设计
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageDesigns.map(design => (
              <Card key={design.id} className="group transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="truncate text-lg">{design.name}</CardTitle>
                      {design.description && (
                        <CardDescription className="mt-1 line-clamp-2">
                          {design.description}
                        </CardDescription>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/protected/designer/page/${design.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/protected/designer/preview/${design.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            预览
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => duplicatePageDesign(design)}>
                          <Copy className="mr-2 h-4 w-4" />
                          复制
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedDesign(design)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* 缩略图 */}
                  <div className="mb-4 flex aspect-video items-center justify-center rounded-md bg-muted">
                    {design.thumbnail_url ? (
                      <Image
                        src={design.thumbnail_url}
                        alt={design.name}
                        width={400}
                        height={225}
                        className="h-full w-full rounded-md object-cover"
                      />
                    ) : (
                      <div className="text-sm text-muted-foreground">无预览图</div>
                    )}
                  </div>

                  {/* 元信息 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(design.status)}
                      <span className="text-sm text-muted-foreground">
                        {formatDate(design.updated_at)}
                      </span>
                    </div>

                    {/* 标签 */}
                    {design.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {design.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {design.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{design.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Link href={`/protected/designer/page/${design.id}`} className="flex-1">
                        <Button size="sm" className="w-full">
                          编辑
                        </Button>
                      </Link>
                      <Link href={`/protected/designer/preview/${design.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 分页 */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {pagination.page} 页，共 {pagination.totalPages} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除页面设计 &quot;{selectedDesign?.name}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedDesign && deletePageDesign(selectedDesign.id)}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
