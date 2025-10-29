import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { PropSchema, ErrorResponse, HTTP_STATUS, ERROR_CODES } from '../../types'

// 组件ID验证模式
const ComponentIdSchema = z.string().min(1, '组件ID不能为空')

// 属性查询参数验证模式
const PropsQuerySchema = z.object({
  group: z.enum(['basic', 'style', 'layout', 'advanced']).optional(),
})

// 创建属性验证模式
const CreatePropSchema = z.object({
  name: z.string().min(1, '属性名称不能为空').max(50, '属性名称不能超过50个字符'),
  type: z.enum(['string', 'number', 'boolean', 'color', 'select', 'array', 'object']),
  label: z.string().min(1, '属性标签不能为空').max(100, '属性标签不能超过100个字符'),
  description: z.string().max(500, '属性描述不能超过500个字符').optional(),
  required: z.boolean().default(false),
  default_value: z.any().optional(),
  group: z.enum(['basic', 'style', 'layout', 'advanced']).default('basic'),
  order: z.number().int().min(0).default(0),
  options: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  validation: z
    .array(
      z.object({
        type: z.enum(['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom']),
        value: z.any(),
        message: z.string(),
      })
    )
    .optional(),
  editor_config: z
    .object({
      type: z.enum(['text', 'number', 'color', 'select', 'checkbox', 'radio', 'textarea', 'json']),
      placeholder: z.string().optional(),
      help: z.string().optional(),
      config: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
})

/**
 * GET /api/components/[id]/props - 获取组件属性定义
 *
 * 路径参数：
 * - id: 组件唯一标识
 *
 * 查询参数：
 * - group: 属性分组过滤 (可选)
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const { searchParams } = new URL(request.url)

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

    // 验证查询参数
    const queryResult = PropsQuerySchema.safeParse({
      group: searchParams.get('group'),
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

    const { group } = queryResult.data

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
    const { data: component, error: componentError } = await supabase
      .from('component_definitions')
      .select('id, name, status, props_schema')
      .eq('id', id)
      .single()

    if (componentError) {
      if (componentError.code === 'PGRST116') {
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

      console.error('检查组件失败:', componentError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '检查组件失败',
            details: componentError.message,
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
            message: `组件"${component.name}"已被归档，无法访问`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    // 获取属性定义
    let props: PropSchema[] = component.props_schema || []

    // 应用分组过滤
    if (group) {
      props = props.filter(prop => prop.group === group)
    }

    // 按order字段排序
    props.sort((a, b) => a.order - b.order)

    // 记录访问日志
    try {
      await supabase.from('component_access_logs').insert({
        component_id: id,
        user_id: user.id,
        action: 'view_props',
        ip_address:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        accessed_at: new Date().toISOString(),
        metadata: {
          group_filter: group,
          props_count: props.length,
        },
      })
    } catch (logError) {
      console.warn('记录访问日志失败:', logError)
    }

    return NextResponse.json({
      success: true,
      data: props,
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
 * POST /api/components/[id]/props - 添加组件属性
 *
 * 路径参数：
 * - id: 组件唯一标识
 *
 * 请求体：属性定义信息
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const validationResult = CreatePropSchema.safeParse(body)
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

    const propData = validationResult.data

    // 检查组件是否存在
    const { data: component, error: componentError } = await supabase
      .from('component_definitions')
      .select('id, name, status, props_schema')
      .eq('id', id)
      .single()

    if (componentError) {
      if (componentError.code === 'PGRST116') {
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

      console.error('检查组件失败:', componentError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '检查组件失败',
            details: componentError.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 检查组件状态是否允许修改
    if (component.status === 'archived') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.COMPONENT_DEPRECATED,
            message: `组件"${component.name}"已归档，无法添加属性`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    const existingProps = component.props_schema || []

    // 检查属性名称是否已存在
    const existingProp = existingProps.find((prop: PropSchema) => prop.name === propData.name)
    if (existingProp) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.PROP_ALREADY_EXISTS,
            message: `属性"${propData.name}"已存在`,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.CONFLICT }
      )
    }

    // 如果没有指定order，自动设置为当前最大order + 1
    if (propData.order === 0) {
      const maxOrder = existingProps.reduce(
        (max: number, prop: PropSchema) => Math.max(max, prop.order || 0),
        0
      )
      propData.order = maxOrder + 1
    }

    // 创建新属性
    const newProp: PropSchema = {
      id: `prop-${id}-${propData.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: propData.name,
      type: propData.type,
      label: propData.label,
      description: propData.description || '',
      required: propData.required,
      default_value: propData.default_value,
      group: propData.group,
      category:
        propData.group === 'style' || propData.group === 'layout' ? 'appearance' : 'content',
      order: propData.order,
      options: propData.options || [],
      validation: propData.validation || [],
      editor_config: propData.editor_config || {
        type:
          propData.type === 'boolean'
            ? 'checkbox'
            : propData.type === 'color'
              ? 'color'
              : propData.type === 'select'
                ? 'select'
                : 'text',
        placeholder: `请输入${propData.label}`,
      },
      responsive: false,
      dependencies: [],
    }

    // 更新组件的属性列表
    const updatedProps = [...existingProps, newProp]

    // 按order重新排序
    updatedProps.sort((a, b) => a.order - b.order)

    const { error: updateError } = await supabase
      .from('component_definitions')
      .update({
        props_schema: updatedProps,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('添加属性失败:', updateError)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: ERROR_CODES.INTERNAL_SERVER_ERROR,
            message: '添加属性失败',
            details: updateError.message,
          },
        } as ErrorResponse,
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      )
    }

    // 记录操作日志
    try {
      await supabase.from('component_access_logs').insert({
        component_id: id,
        user_id: user.id,
        action: 'add_prop',
        ip_address:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        accessed_at: new Date().toISOString(),
        metadata: {
          prop_name: propData.name,
          prop_type: propData.type,
          prop_group: propData.group,
        },
      })
    } catch (logError) {
      console.warn('记录操作日志失败:', logError)
    }

    return NextResponse.json(
      {
        success: true,
        data: newProp,
        message: `属性"${propData.label}"添加成功`,
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
 * PUT /api/components/[id]/props - 批量更新组件属性（预留接口）
 */
export async function PUT() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: '批量更新属性功能暂未实现，请使用单个属性操作接口',
      },
    } as ErrorResponse,
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}

/**
 * DELETE /api/components/[id]/props - 批量删除组件属性（预留接口）
 */
export async function DELETE() {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ERROR_CODES.BAD_REQUEST,
        message: '批量删除属性功能暂未实现，请使用单个属性删除接口',
      },
    } as ErrorResponse,
    { status: HTTP_STATUS.BAD_REQUEST }
  )
}
