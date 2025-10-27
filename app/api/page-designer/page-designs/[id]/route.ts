import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 更新页面设计数据验证模式
const UpdatePageDesignSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    config: z
      .object({
        title: z.string().min(1).max(255).optional(),
        meta: z
          .object({
            description: z.string().optional(),
            keywords: z.array(z.string()).optional(),
            author: z.string().optional(),
          })
          .optional(),
        styles: z
          .object({
            theme: z.enum(['light', 'dark', 'auto']).optional(),
            backgroundColor: z.string().optional(),
            backgroundImage: z.string().optional(),
            spacing: z.enum(['compact', 'normal', 'relaxed']).optional(),
          })
          .optional(),
        layout: z
          .object({
            maxWidth: z.number().optional(),
            padding: z
              .object({
                top: z.number(),
                right: z.number(),
                bottom: z.number(),
                left: z.number(),
              })
              .optional(),
            centered: z.boolean().optional(),
          })
          .optional(),
      })
      .optional(),
    status: z.enum(['draft', 'published', 'archived']).optional(),
    tags: z.array(z.string()).optional(),
  })
  .strict()

// GET - 获取单个页面设计
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 获取页面设计及其所有组件
    const { data: pageDesign, error } = await supabase
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
          created_at,
          updated_at,
          version,
          meta
        )
      `
      )
      .eq('id', id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .single()

    if (error) {
      console.error('获取页面设计失败:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '页面设计不存在' }, { status: 404 })
      }
      return NextResponse.json({ error: '获取页面设计失败' }, { status: 500 })
    }

    return NextResponse.json({ data: pageDesign })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// PUT - 更新页面设计
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { id } = await params
    const body = await request.json()

    // 验证请求数据
    const validationResult = UpdatePageDesignSchema.safeParse(body)
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

    // 检查页面设计是否存在且用户有权限
    const { data: existingDesign, error: checkError } = await supabase
      .from('page_designs')
      .select('id, user_id, version')
      .eq('id', id)
      .single()

    if (checkError || !existingDesign) {
      return NextResponse.json({ error: '页面设计不存在' }, { status: 404 })
    }

    if (existingDesign.user_id !== user.id) {
      return NextResponse.json({ error: '无权限修改此页面设计' }, { status: 403 })
    }

    const updateData = validationResult.data

    // 更新页面设计
    const { data: updatedDesign, error } = await supabase
      .from('page_designs')
      .update({
        ...updateData,
        version: existingDesign.version + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新页面设计失败:', error)
      return NextResponse.json({ error: '更新页面设计失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedDesign,
      message: '页面设计更新成功',
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// DELETE - 删除页面设计
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查页面设计是否存在且用户有权限
    const { data: existingDesign, error: checkError } = await supabase
      .from('page_designs')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (checkError || !existingDesign) {
      return NextResponse.json({ error: '页面设计不存在' }, { status: 404 })
    }

    if (existingDesign.user_id !== user.id) {
      return NextResponse.json({ error: '无权限删除此页面设计' }, { status: 403 })
    }

    // 删除页面设计（级联删除相关组件和历史记录）
    const { error } = await supabase.from('page_designs').delete().eq('id', id)

    if (error) {
      console.error('删除页面设计失败:', error)
      return NextResponse.json({ error: '删除页面设计失败' }, { status: 500 })
    }

    return NextResponse.json({
      message: '页面设计删除成功',
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}
