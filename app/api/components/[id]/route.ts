import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ErrorResponse, HTTP_STATUS, ERROR_CODES } from '../types'

// 组件ID验证模式
const ComponentIdSchema = z.string().min(1, '组件ID不能为空')

// 更新组件验证模式
const UpdateComponentSchema = z.object({
  name: z.string().min(1, '组件名称不能为空').max(50, '组件名称不能超过50个字符').optional(),
  description: z.string().max(500, '组件描述不能超过500个字符').optional(),
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']).optional(),
  tags: z
    .array(z.string().max(30, '标签长度不能超过30个字符'))
    .max(10, '标签数量不能超过10个')
    .optional(),
  props_schema: z.array(z.any()).optional(),
  default_props: z.record(z.string(), z.any()).optional(),
  default_styles: z.record(z.string(), z.any()).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).optional(),
})

/**
 * GET /api/components/[id] - 获取组件详情
 *
 * 路径参数：
 * - id: 组件唯一标识
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 验证组件ID
    const idValidation = ComponentIdSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_COMPONENT_ID,
            message: '组件ID无效',
            details: idValidation.error.issues,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: '未授权访问，请先登录',
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // 查询组件详情
    const { data: component, error } = await supabase
      .from('component_definitions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // PostgreSQL 错误码：记录不存在
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.COMPONENT_NOT_FOUND,
              message: `组件"${id}"不存在`,
            },
          } as ErrorResponse,
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }

      console.error('获取组件详情失败:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '获取组件详情失败',
            details: error.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 检查组件状态
    if (component.status === 'archived') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_NOT_FOUND,
            message: `组件"${id}"已被归档，无法访问`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    // 记录访问日志（可选）
    try {
      await supabase.from('component_access_logs').insert({
        component_id: id,
        user_id: user.id,
        action: 'view',
        ip_address:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        accessed_at: new Date().toISOString(),
      })
    } catch (logError) {
      // 日志记录失败不影响主流程
      console.warn('记录访问日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      data: component,
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误',
          details: error instanceof Error ? error.message : '未知错误',
        },
      } as ErrorResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

/**
 * PUT /api/components/[id] - 更新组件
 *
 * 路径参数：
 * - id: 组件唯一标识
 *
 * 请求体：包含要更新的组件信息
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // 验证组件ID
    const idValidation = ComponentIdSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_COMPONENT_ID,
            message: '组件ID无效',
            details: idValidation.error.issues,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 验证请求数据
    const validationResult = UpdateComponentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '请求数据无效',
            details: validationResult.error.issues,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: '未授权访问，请先登录',
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    const updateData = validationResult.data

    // 检查组件是否存在
    const { data: existingComponent, error: checkError } = await supabase
      .from('component_definitions')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.COMPONENT_NOT_FOUND,
              message: `组件"${id}"不存在`,
            },
          } as ErrorResponse,
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }

      console.error('检查组件存在性失败:', checkError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '检查组件失败',
            details: checkError.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 检查组件是否已废弃
    if (existingComponent.deprecated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_DEPRECATED,
            message: `组件"${existingComponent.name}"已废弃，无法更新`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // 如果更新名称，检查是否与现有组件冲突
    if (updateData.name && updateData.name !== existingComponent.name) {
      const { data: conflictComponent } = await supabase
        .from('component_definitions')
        .select('id')
        .eq('name', updateData.name)
        .eq('category', updateData.category || existingComponent.category)
        .neq('id', id)
        .single()

      if (conflictComponent) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.COMPONENT_ALREADY_EXISTS,
              message: `组件名称"${updateData.name}"在"${updateData.category || existingComponent.category}"分类中已存在`,
            },
          } as ErrorResponse,
          { status: HTTP_STATUS.CONFLICT }
        )
      }
    }

    // 更新组件
    const updatedComponent = {
      ...updateData,
      ...(updateData.name && updateData.name !== existingComponent.name
        ? {
            id: `component-${updateData.category || existingComponent.category}-${updateData.name.toLowerCase().replace(/\s+/g, '-')}`,
          }
        : {}),
      updated_at: new Date().toISOString(),
    }

    const { data: component, error } = await supabase
      .from('component_definitions')
      .update(updatedComponent)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新组件失败:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '更新组件失败',
            details: error.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 记录更新日志
    try {
      await supabase.from('component_access_logs').insert({
        component_id: id,
        user_id: user.id,
        action: 'update',
        ip_address:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        accessed_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.warn('记录更新日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      data: component,
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误',
          details: error instanceof Error ? error.message : '未知错误',
        },
      } as ErrorResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}

/**
 * DELETE /api/components/[id] - 删除组件
 *
 * 路径参数：
 * - id: 组件唯一标识
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 验证组件ID
    const idValidation = ComponentIdSchema.safeParse(id)
    if (!idValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INVALID_COMPONENT_ID,
            message: '组件ID无效',
            details: idValidation.error.issues,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.UNAUTHORIZED,
            message: '未授权访问，请先登录',
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.UNAUTHORIZED }
      )
    }

    // 检查组件是否存在
    const { data: existingComponent, error: checkError } = await supabase
      .from('component_definitions')
      .select('*')
      .eq('id', id)
      .single()

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: ERROR_CODES.COMPONENT_NOT_FOUND,
              message: `组件"${id}"不存在`,
            },
          } as ErrorResponse,
          { status: HTTP_STATUS.NOT_FOUND }
        )
      }

      console.error('检查组件存在性失败:', checkError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '检查组件失败',
            details: checkError.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 检查组件是否正在被使用
    // 这里需要根据实际的业务逻辑来检查组件使用情况
    // 例如检查页面设计中是否使用了此组件
    const { data: usageCount } = await supabase
      .from('page_design_components') // 假设存在这个表来跟踪组件使用情况
      .select('id', { count: 'exact' })
      .eq('component_id', id)

    if (usageCount && usageCount.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_IN_USE,
            message: `组件"${existingComponent.name}"正在被使用，无法删除。请先移除所有使用此组件的页面设计。`,
            details: {
              usage_count: usageCount.length,
            },
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // 检查组件是否已废弃
    if (existingComponent.deprecated) {
      // 已废弃的组件可以直接删除
    } else if (existingComponent.status === 'active') {
      // 活跃状态的组件需要先标记为废弃才能删除
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_DEPRECATED,
            message: `活跃状态的组件"${existingComponent.name}"需要先标记为废弃才能删除`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // 删除组件（软删除：标记为archived）
    const { error: deleteError } = await supabase
      .from('component_definitions')
      .update({
        status: 'archived',
        deprecated: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (deleteError) {
      console.error('删除组件失败:', deleteError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '删除组件失败',
            details: deleteError.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 记录删除日志
    try {
      await supabase.from('component_access_logs').insert({
        component_id: id,
        user_id: user.id,
        action: 'delete',
        ip_address:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        accessed_at: new Date().toISOString(),
      })
    } catch (logError) {
      console.warn('记录删除日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      message: `组件"${existingComponent.name}"删除成功`,
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES.INTERNAL_SERVER_ERROR,
          message: '服务器内部错误',
          details: error instanceof Error ? error.message : '未知错误',
        },
      } as ErrorResponse,
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    )
  }
}
