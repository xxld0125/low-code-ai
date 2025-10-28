import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PermissionChecker } from '@/lib/page-designer/permissions'

// 分享页面设计的请求体验证
const SharePageDesignSchema = z.object({
  page_design_id: z.string().uuid(),
  shared_with: z.array(z.string().uuid()),
  permissions: z
    .object({
      can_edit: z.boolean().default(false),
      can_comment: z.boolean().default(true),
      can_view: z.boolean().default(true),
    })
    .default({
      can_edit: false,
      can_comment: true,
      can_view: true,
    }),
})

/**
 * POST /api/page-designer/share
 *
 * 分享页面设计给其他用户
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validationResult = SharePageDesignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求参数错误',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { page_design_id, shared_with, permissions } = validationResult.data

    // 统一权限检查（需要share权限）
    const permissionResult = await PermissionChecker.checkApiPermission(
      request,
      page_design_id,
      'share'
    )

    if (!permissionResult.hasPermission) {
      return NextResponse.json({ error: permissionResult.error || '权限不足' }, { status: 401 })
    }

    const { user, pageDesign } = permissionResult

    // 验证被分享的用户是否存在
    if (shared_with.length > 0) {
      const userValidation = await PermissionChecker.validateUsers(shared_with)

      if (!userValidation.valid) {
        return NextResponse.json(
          {
            error: '部分用户不存在',
            invalid_users: userValidation.invalidUsers,
          },
          { status: 400 }
        )
      }
    }

    // 更新共享设置
    const newSharedWith = [...new Set([...(pageDesign.shared_with || []), ...shared_with])]

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: updatedDesign, error } = await supabase
      .from('page_designs')
      .update({
        shared_with: newSharedWith,
        // 这里可以添加权限信息的存储，比如在一个单独的表中
        updated_at: new Date().toISOString(),
      })
      .eq('id', page_design_id)
      .select()
      .single()

    if (error) {
      console.error('分享页面设计失败:', error)
      return NextResponse.json({ error: '分享失败' }, { status: 500 })
    }

    // 记录分享日志
    const { error: logError } = await supabase.from('share_logs').insert({
      page_design_id,
      shared_by: user.id,
      shared_with,
      permissions,
      created_at: new Date().toISOString(),
    })

    if (logError) {
      console.error('记录分享日志失败:', logError)
      // 不影响主流程，只记录日志
    }

    return NextResponse.json({
      message: '分享成功',
      data: updatedDesign,
    })
  } catch (error) {
    console.error('分享页面设计异常:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

/**
 * DELETE /api/page-designer/share
 *
 * 取消分享页面设计
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page_design_id = searchParams.get('page_design_id')
    const user_id = searchParams.get('user_id')

    if (!page_design_id || !user_id) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 })
    }

    // 统一权限检查（需要share权限来取消分享）
    const permissionResult = await PermissionChecker.checkApiPermission(
      request,
      page_design_id,
      'share'
    )

    if (!permissionResult.hasPermission) {
      return NextResponse.json({ error: permissionResult.error || '权限不足' }, { status: 401 })
    }

    const { pageDesign } = permissionResult

    // 从共享列表中移除用户
    const newSharedWith = (pageDesign.shared_with || []).filter((id: string) => id !== user_id)

    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const { data: updatedDesign, error } = await supabase
      .from('page_designs')
      .update({
        shared_with: newSharedWith,
        updated_at: new Date().toISOString(),
      })
      .eq('id', page_design_id)
      .select()
      .single()

    if (error) {
      console.error('取消分享失败:', error)
      return NextResponse.json({ error: '取消分享失败' }, { status: 500 })
    }

    return NextResponse.json({
      message: '取消分享成功',
      data: updatedDesign,
    })
  } catch (error) {
    console.error('取消分享异常:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
