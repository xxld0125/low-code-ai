import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 组件实例数据验证模式
const ComponentInstanceSchema = z.object({
  page_design_id: z.string().uuid(),
  component_type: z.enum([
    'button',
    'input',
    'text',
    'image',
    'link',
    'heading',
    'paragraph',
    'divider',
    'spacer',
    'container',
    'row',
    'col',
    'form',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'navbar',
    'sidebar',
    'breadcrumb',
    'tabs',
    'list',
    'table',
    'card',
    'grid',
  ]),
  parent_id: z.string().uuid().optional(),
  position: z.object({
    z_index: z.number().default(0),
    order: z.number().default(0),
  }),
  props: z.record(z.string(), z.any()).default(() => ({})),
  styles: z.record(z.string(), z.any()).default(() => ({})),
  events: z.record(z.string(), z.any()).default(() => ({})),
  responsive: z.record(z.string(), z.any()).default(() => ({})),
  layout_props: z.record(z.string(), z.any()).optional(),
  meta: z
    .object({
      locked: z.boolean().default(false),
      hidden: z.boolean().default(false),
      custom_name: z.string().optional(),
      notes: z.string().optional(),
    })
    .default({
      locked: false,
      hidden: false,
    }),
})

// 更新组件实例数据验证模式
const UpdateComponentInstanceSchema = ComponentInstanceSchema.partial().omit({
  page_design_id: true,
  id: true,
  created_at: true,
  updated_at: true,
  version: true,
})

// GET - 获取组件列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 获取查询参数
    const pageDesignId = searchParams.get('page_design_id')
    const componentType = searchParams.get('component_type')
    const parentId = searchParams.get('parent_id')

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 构建查询
    let query = supabase
      .from('component_instances')
      .select('*')
      .order('created_at', { ascending: true })

    // 按页面设计过滤
    if (pageDesignId) {
      query = query.eq('page_design_id', pageDesignId)
    }

    // 按组件类型过滤
    if (componentType) {
      query = query.eq('component_type', componentType)
    }

    // 按父组件过滤
    if (parentId) {
      query = query.eq('parent_id', parentId)
    } else if (parentId === '') {
      query = query.is('parent_id', null)
    }

    // 检查用户权限（通过页面设计）
    if (pageDesignId) {
      const { data: pageDesign } = await supabase
        .from('page_designs')
        .select('id')
        .eq('id', pageDesignId)
        .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
        .single()

      if (!pageDesign) {
        return NextResponse.json({ error: '无权限访问此页面设计的组件' }, { status: 403 })
      }
    }

    const { data: components, error } = await query

    if (error) {
      console.error('获取组件列表失败:', error)
      return NextResponse.json({ error: '获取组件列表失败' }, { status: 500 })
    }

    return NextResponse.json({ data: components || [] })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// POST - 创建新组件
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 验证请求数据
    const validationResult = ComponentInstanceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求数据无效',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const componentData = validationResult.data

    // 检查页面设计权限
    const { data: pageDesign, error: pageDesignError } = await supabase
      .from('page_designs')
      .select('id, user_id')
      .eq('id', componentData.page_design_id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .single()

    if (pageDesignError || !pageDesign) {
      return NextResponse.json({ error: '无权限访问此页面设计' }, { status: 403 })
    }

    // 如果有父组件，检查父组件是否存在
    if (componentData.parent_id) {
      const { data: parentComponent, error: parentError } = await supabase
        .from('component_instances')
        .select('id')
        .eq('id', componentData.parent_id)
        .eq('page_design_id', componentData.page_design_id)
        .single()

      if (parentError || !parentComponent) {
        return NextResponse.json({ error: '父组件不存在' }, { status: 404 })
      }
    }

    // 创建组件实例
    const { data: component, error } = await supabase
      .from('component_instances')
      .insert(componentData)
      .select()
      .single()

    if (error) {
      console.error('创建组件失败:', error)
      return NextResponse.json({ error: '创建组件失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: component,
        message: '组件创建成功',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// PUT - 更新组件
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: '缺少组件ID' }, { status: 400 })
    }

    // 验证请求数据
    const validationResult = UpdateComponentInstanceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求数据无效',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const { id } = body
    const updateData = validationResult.data

    // 检查组件权限
    const { data: existingComponent, error: checkError } = await supabase
      .from('component_instances')
      .select(
        `
        id,
        page_design_id,
        page_design:page_designs(
          id,
          user_id,
          shared_with
        )
      `
      )
      .eq('id', id)
      .single()

    if (checkError || !existingComponent) {
      return NextResponse.json({ error: '组件不存在' }, { status: 404 })
    }

    const pageDesign = Array.isArray(existingComponent.page_design)
      ? existingComponent.page_design[0]
      : existingComponent.page_design
    const hasAccess =
      pageDesign.user_id === user.id ||
      (pageDesign.shared_with && pageDesign.shared_with.includes(user.id))

    if (!hasAccess) {
      return NextResponse.json({ error: '无权限修改此组件' }, { status: 403 })
    }

    // 更新组件
    const { data: component, error } = await supabase
      .from('component_instances')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
        version: await getNextVersion(supabase, id),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新组件失败:', error)
      return NextResponse.json({ error: '更新组件失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: component,
      message: '组件更新成功',
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// DELETE - 删除组件
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: '缺少组件ID' }, { status: 400 })
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查组件权限
    const { data: existingComponent, error: checkError } = await supabase
      .from('component_instances')
      .select(
        `
        id,
        page_design_id,
        page_design:page_designs(
          id,
          user_id,
          shared_with
        )
      `
      )
      .eq('id', id)
      .single()

    if (checkError || !existingComponent) {
      return NextResponse.json({ error: '组件不存在' }, { status: 404 })
    }

    const pageDesign = Array.isArray(existingComponent.page_design)
      ? existingComponent.page_design[0]
      : existingComponent.page_design
    const hasAccess =
      pageDesign.user_id === user.id ||
      (pageDesign.shared_with && pageDesign.shared_with.includes(user.id))

    if (!hasAccess) {
      return NextResponse.json({ error: '无权限删除此组件' }, { status: 403 })
    }

    // 删除组件（级联删除子组件）
    const { error } = await supabase.from('component_instances').delete().eq('id', id)

    if (error) {
      console.error('删除组件失败:', error)
      return NextResponse.json({ error: '删除组件失败' }, { status: 500 })
    }

    return NextResponse.json({
      message: '组件删除成功',
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// 辅助函数：获取下一个版本号
async function getNextVersion(supabase: any, componentId: string): Promise<number> {
  const { data } = await supabase
    .from('component_instances')
    .select('version')
    .eq('id', componentId)
    .single()

  return (data?.version || 0) + 1
}
