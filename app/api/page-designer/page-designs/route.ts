import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 页面设计数据验证模式
const PageDesignSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  config: z.object({
    title: z.string().min(1).max(255),
    meta: z
      .object({
        description: z.string().optional(),
        keywords: z.array(z.string()).optional(),
        author: z.string().optional(),
      })
      .optional(),
    styles: z
      .object({
        theme: z.enum(['light', 'dark', 'auto']).default('light'),
        backgroundColor: z.string().optional(),
        backgroundImage: z.string().optional(),
        spacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
      })
      .optional(),
    layout: z
      .object({
        maxWidth: z.number().optional(),
        padding: z.object({
          top: z.number().default(0),
          right: z.number().default(0),
          bottom: z.number().default(0),
          left: z.number().default(0),
        }),
        centered: z.boolean().default(false),
      })
      .optional(),
  }),
  tags: z.array(z.string()).default([]),
})

// 更新页面设计数据验证模式
const UpdatePageDesignSchema = PageDesignSchema.partial()

// 使用UpdatePageDesignSchema来验证更新请求
export { UpdatePageDesignSchema }

// GET - 获取页面设计列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // 获取查询参数
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const offset = (page - 1) * limit

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
      .from('page_designs')
      .select(
        `
        *,
        component_instances:component_instances(
          id,
          component_type,
          parent_id,
          position,
          props,
          styles,
          events,
          responsive,
          layout_props,
          meta
        )
      `,
        { count: 'exact' }
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // 添加状态过滤
    if (status) {
      query = query.eq('status', status)
    }

    // 添加搜索过滤
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: pageDesigns, error, count } = await query

    if (error) {
      console.error('获取页面设计列表失败:', error)
      return NextResponse.json({ error: '获取页面设计列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: pageDesigns || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// POST - 创建新的页面设计
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 验证请求数据
    const validationResult = PageDesignSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求数据无效',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    const pageDesignData = validationResult.data

    // 创建页面设计
    const { data: pageDesign, error } = await supabase
      .from('page_designs')
      .insert({
        ...pageDesignData,
        user_id: user.id,
        root_component_id: '', // 稍后创建根组件时更新
        component_tree: {
          version: '1.0',
          root_id: '',
          components: {},
          hierarchy: [],
        },
      })
      .select()
      .single()

    if (error) {
      console.error('创建页面设计失败:', error)
      return NextResponse.json({ error: '创建页面设计失败' }, { status: 500 })
    }

    // 创建根组件
    const { data: rootComponent, error: rootComponentError } = await supabase
      .from('component_instances')
      .insert({
        page_design_id: pageDesign.id,
        component_type: 'container',
        position: { z_index: 0, order: 0 },
        props: {
          direction: 'column',
          padding: 16,
          gap: 16,
        },
        styles: {
          width: '100%',
          minHeight: '100vh',
          padding: 16,
        },
        layout_props: {
          container: {
            direction: 'column',
            wrap: false,
            justify: 'start',
            align: 'stretch',
            gap: 16,
          },
        },
        meta: {
          locked: false,
          hidden: false,
          custom_name: '根容器',
        },
      })
      .select()
      .single()

    if (rootComponentError) {
      console.error('创建根组件失败:', rootComponentError)
      // 删除已创建的页面设计
      await supabase.from('page_designs').delete().eq('id', pageDesign.id)
      return NextResponse.json({ error: '创建根组件失败' }, { status: 500 })
    }

    // 更新页面设计的根组件ID
    const { data: updatedPageDesign, error: updateError } = await supabase
      .from('page_designs')
      .update({
        root_component_id: rootComponent.id,
        component_tree: {
          version: '1.0',
          root_id: rootComponent.id,
          components: {
            [rootComponent.id]: rootComponent,
          },
          hierarchy: [
            {
              component_id: rootComponent.id,
              parent_id: null,
              children: [],
              depth: 0,
              path: '0',
            },
          ],
        },
      })
      .eq('id', pageDesign.id)
      .select()
      .single()

    if (updateError) {
      console.error('更新页面设计失败:', updateError)
      return NextResponse.json({ error: '更新页面设计失败' }, { status: 500 })
    }

    return NextResponse.json(
      {
        data: updatedPageDesign,
        message: '页面设计创建成功',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
