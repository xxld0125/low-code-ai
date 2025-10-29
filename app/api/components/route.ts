import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  ComponentsListResponse,
  ErrorResponse,
  HTTP_STATUS,
  ERROR_CODES,
  ComponentDefinition,
} from './types'

// 请求参数验证模式
const ComponentsQuerySchema = z.object({
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).default('active'),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
})

const CreateComponentSchema = z.object({
  name: z.string().min(1, '组件名称不能为空').max(50, '组件名称不能超过50个字符'),
  description: z.string().max(500, '组件描述不能超过500个字符').optional(),
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']),
  subcategory: z.string().max(50, '子分类名称不能超过50个字符').optional(),
  tags: z
    .array(z.string().max(30, '标签长度不能超过30个字符'))
    .max(10, '标签数量不能超过10个')
    .optional(),
  component_path: z.string().min(1, '组件路径不能为空'),
  preview_path: z.string().min(1, '预览路径不能为空'),
  icon_path: z.string().min(1, '图标路径不能为空'),
  props_schema: z.array(z.any()).optional().default([]),
  default_props: z.record(z.string(), z.any()).optional().default({}),
  default_styles: z.record(z.string(), z.any()).optional().default({}),
})

/**
 * GET /api/components - 获取组件列表
 *
 * 支持的查询参数：
 * - category: 组件分类过滤
 * - status: 组件状态过滤 (默认: active)
 * - search: 搜索关键词
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 20, 最大: 100)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 验证查询参数
    const queryResult = ComponentsQuerySchema.safeParse({
      category: searchParams.get('category'),
      status: searchParams.get('status'),
      search: searchParams.get('search'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    })

    if (!queryResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.VALIDATION_ERROR,
            message: '查询参数无效',
            details: queryResult.error.issues,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.BAD_REQUEST }
      )
    }

    const { category, status, search, page, limit } = queryResult.data
    const offset = (page - 1) * limit

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

    // 构建查询
    let query = supabase
      .from('component_definitions')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })

    // 应用分类过滤
    if (category) {
      query = query.eq('category', category)
    }

    // 应用搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`)
    }

    // 应用分页
    query = query.range(offset, offset + limit - 1)

    // 执行查询
    const { data: components, error, count } = await query

    if (error) {
      console.error('获取组件列表失败:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '获取组件列表失败',
            details: error.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 构建分页信息
    const totalItems = count || 0
    const totalPages = Math.ceil(totalItems / limit)

    const pagination = {
      current_page: page,
      total_pages: totalPages,
      total_items: totalItems,
      per_page: limit,
      has_next: page < totalPages,
      has_prev: page > 1,
    }

    // 返回结果
    return NextResponse.json({
      success: true,
      data: {
        components: components || [],
        pagination,
      },
    } as ComponentsListResponse)
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
 * POST /api/components - 创建新组件
 *
 * 请求体需要包含组件的基本信息和配置
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 验证请求数据
    const validationResult = CreateComponentSchema.safeParse(body)

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

    const componentData = validationResult.data

    // 检查组件名称是否已存在
    const { data: existingComponent } = await supabase
      .from('component_definitions')
      .select('id')
      .eq('name', componentData.name)
      .eq('category', componentData.category)
      .single()

    if (existingComponent) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_ALREADY_EXISTS,
            message: `组件"${componentData.name}"在"${componentData.category}"分类中已存在`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // 构建组件定义数据
    const newComponent: Partial<ComponentDefinition> = {
      ...componentData,
      id: `component-${componentData.category}-${componentData.name.toLowerCase().replace(/\s+/g, '-')}`,
      author: user.email || 'unknown',
      version: '1.0.0',
      props_schema: componentData.props_schema || [],
      default_props: componentData.default_props || {},
      default_styles: componentData.default_styles || {},
      constraints: {
        resizable: true,
        draggable: true,
      },
      validation_rules: [],
      status: 'draft',
      deprecated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 创建组件
    const { data: component, error } = await supabase
      .from('component_definitions')
      .insert(newComponent)
      .select()
      .single()

    if (error) {
      console.error('创建组件失败:', error)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '创建组件失败',
            details: error.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: component,
      },
      { status: HTTP_STATUS.CREATED }
    )
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
 * PUT /api/components - 批量更新组件（预留接口）
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: '批量更新功能暂未实现，请使用单个组件更新接口',
      },
    } as ErrorResponse,
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}

/**
 * DELETE /api/components - 批量删除组件（预留接口）
 */
export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: '批量删除功能暂未实现，请使用单个组件删除接口',
      },
    } as ErrorResponse,
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}
