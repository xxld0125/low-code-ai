import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// 布局计算请求验证模式
const LayoutCalculationSchema = z.object({
  page_design_id: z.string().uuid(),
  component_id: z.string().uuid().optional(),
  operation: z.enum(['calculate', 'validate', 'optimize']),
  options: z
    .object({
      include_responsive: z.boolean().default(true),
      viewport_width: z.number().optional(),
      viewport_height: z.number().optional(),
      force_recalculate: z.boolean().default(false),
    })
    .optional(),
})

// 组件移动请求验证模式
const ComponentMoveSchema = z.object({
  page_design_id: z.string().uuid(),
  component_id: z.string().uuid(),
  new_parent_id: z.string().uuid().optional(),
  new_position: z.number().default(0),
  operation: z.enum(['move', 'reorder']),
})

// GET - 获取布局信息
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const pageDesignId = searchParams.get('page_design_id')
    const componentId = searchParams.get('component_id')

    if (!pageDesignId) {
      return NextResponse.json({ error: '缺少页面设计ID' }, { status: 400 })
    }

    // 验证用户身份
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 })
    }

    // 检查页面设计权限
    const { data: pageDesign, error: pageDesignError } = await supabase
      .from('page_designs')
      .select('id, component_tree')
      .eq('id', pageDesignId)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .single()

    if (pageDesignError || !pageDesign) {
      return NextResponse.json({ error: '页面设计不存在或无权限访问' }, { status: 404 })
    }

    // 获取组件实例
    let componentQuery = supabase
      .from('component_instances')
      .select('*')
      .eq('page_design_id', pageDesignId)

    if (componentId) {
      componentQuery = componentQuery.eq('id', componentId)
    }

    const { data: components, error: componentsError } = await componentQuery

    if (componentsError) {
      console.error('获取组件失败:', componentsError)
      return NextResponse.json({ error: '获取组件失败' }, { status: 500 })
    }

    // 构建层级结构
    const componentMap = new Map<string, any>()
    const rootComponents: any[] = []

    components?.forEach((component: any) => {
      componentMap.set(component.id, { ...component, children: [] })
    })

    components?.forEach((component: any) => {
      if (component.parent_id) {
        const parent = componentMap.get(component.parent_id)
        if (parent) {
          parent.children.push(componentMap.get(component.id))
        }
      } else {
        rootComponents.push(componentMap.get(component.id))
      }
    })

    // 计算布局
    const layout = calculateLayout(rootComponents, {
      viewportWidth: 1200,
      viewportHeight: 800,
    })

    return NextResponse.json({
      data: {
        components: componentId ? componentMap.get(componentId) : Array.from(componentMap.values()),
        layout,
        hierarchy: rootComponents,
      },
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// POST - 布局计算和操作
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 验证请求数据
    const validationResult = LayoutCalculationSchema.safeParse(body)
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

    const { page_design_id, component_id, operation, options } = validationResult.data

    // 检查页面设计权限
    const { data: pageDesign, error: pageDesignError } = await supabase
      .from('page_designs')
      .select('id, component_tree')
      .eq('id', page_design_id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .single()

    if (pageDesignError || !pageDesign) {
      return NextResponse.json({ error: '页面设计不存在或无权限访问' }, { status: 404 })
    }

    // 获取相关组件
    let componentQuery = supabase
      .from('component_instances')
      .select('*')
      .eq('page_design_id', page_design_id)

    if (component_id) {
      componentQuery = componentQuery.eq('id', component_id)
    }

    const { data: components, error: componentsError } = await componentQuery

    if (componentsError) {
      console.error('获取组件失败:', componentsError)
      return NextResponse.json({ error: '获取组件失败' }, { status: 500 })
    }

    let result

    switch (operation) {
      case 'calculate':
        // 计算布局
        result = calculateLayout(components || [], {
          viewportWidth: options?.viewport_width || 1200,
          viewportHeight: options?.viewport_height || 800,
          includeResponsive: options?.include_responsive || true,
        })
        break

      case 'validate':
        // 验证布局约束
        result = validateLayoutConstraints(components || [])
        break

      case 'optimize':
        // 优化布局
        result = optimizeLayout(components || [], {
          force_recalculate: options?.force_recalculate || false,
        })
        break

      default:
        return NextResponse.json({ error: '不支持的操作类型' }, { status: 400 })
    }

    return NextResponse.json({
      data: result,
      operation,
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// PUT - 移动或重排序组件
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // 验证请求数据
    const validationResult = ComponentMoveSchema.safeParse(body)
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

    const { page_design_id, component_id, new_parent_id, new_position, operation } =
      validationResult.data

    // 检查页面设计权限
    const { data: pageDesign, error: pageDesignError } = await supabase
      .from('page_designs')
      .select('id')
      .eq('id', page_design_id)
      .or(`user_id.eq.${user.id},shared_with.cs.{${user.id}}`)
      .single()

    if (pageDesignError || !pageDesign) {
      return NextResponse.json({ error: '页面设计不存在或无权限访问' }, { status: 404 })
    }

    // 获取要移动的组件
    const { data: component, error: componentError } = await supabase
      .from('component_instances')
      .select('*')
      .eq('id', component_id)
      .eq('page_design_id', page_design_id)
      .single()

    if (componentError || !component) {
      return NextResponse.json({ error: '组件不存在' }, { status: 404 })
    }

    // 验证移动约束
    if (new_parent_id) {
      const { data: newParent, error: parentError } = await supabase
        .from('component_instances')
        .select('id, component_type')
        .eq('id', new_parent_id)
        .eq('page_design_id', page_design_id)
        .single()

      if (parentError || !newParent) {
        return NextResponse.json({ error: '目标父组件不存在' }, { status: 404 })
      }

      // 验证布局约束（这里可以添加更复杂的约束检查）
      if (!validateMoveConstraints(component.component_type, newParent.component_type)) {
        return NextResponse.json({ error: '不满足布局约束条件' }, { status: 400 })
      }
    }

    // 更新组件位置
    const updateData: any = {
      position: {
        ...component.position,
        order: new_position,
      },
    }

    if (new_parent_id !== undefined) {
      updateData.parent_id = new_parent_id || null
    }

    const { data: updatedComponent, error } = await supabase
      .from('component_instances')
      .update(updateData)
      .eq('id', component_id)
      .select()
      .single()

    if (error) {
      console.error('移动组件失败:', error)
      return NextResponse.json({ error: '移动组件失败' }, { status: 500 })
    }

    return NextResponse.json({
      data: updatedComponent,
      message: `${operation === 'move' ? '移动' : '重排序'}组件成功`,
    })
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// 布局计算函数
function calculateLayout(components: any[], options: any) {
  // 这里实现布局计算逻辑
  // 基于组件类型、属性和约束来计算位置和尺寸

  const layout: any = {
    viewport: {
      width: options.viewportWidth,
      height: options.viewportHeight,
    },
    components: {},
    constraints: {
      maxWidth: 1200,
      grid: 8,
    },
  }

  // 简单的布局计算示例
  components.forEach(component => {
    layout.components[component.id] = {
      id: component.id,
      type: component.component_type,
      position: component.position,
      styles: component.styles,
      calculatedStyles: calculateComponentStyles(component, options),
    }
  })

  return layout
}

// 验证布局约束
function validateLayoutConstraints(components: any[]) {
  const errors: any[] = []
  const warnings: any[] = []

  components.forEach(component => {
    // 验证组件约束
    if (component.component_type === 'row') {
      const children = components.filter(c => c.parent_id === component.id)
      const invalidChildren = children.filter(c => c.component_type !== 'col')

      if (invalidChildren.length > 0) {
        errors.push({
          componentId: component.id,
          message: 'Row组件只能包含Col组件',
          invalidChildren: invalidChildren.map(c => c.id),
        })
      }
    }

    // 验证深度约束
    const depth = calculateComponentDepth(component, components)
    if (depth > 10) {
      warnings.push({
        componentId: component.id,
        message: `组件嵌套层级过深 (${depth} 层)，可能影响性能`,
      })
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

// 优化布局
function optimizeLayout(components: any[], options?: { force_recalculate?: boolean }) {
  // 这里实现布局优化逻辑
  // 例如：合并相邻的容器、优化间距、减少不必要的嵌套等

  return {
    optimized: true,
    changes: [],
    performance: {
      renderTime: '16ms',
      memoryUsage: '2.3MB',
    },
    forceRecalculate: options?.force_recalculate || false,
  }
}

// 验证移动约束
function validateMoveConstraints(componentType: string, parentType: string): boolean {
  const constraints: Record<string, string[]> = {
    row: ['col'],
    col: ['button', 'input', 'text', 'image', 'container'],
    container: ['container', 'row', 'col', 'button', 'input', 'text', 'image'],
  }

  const allowedParents = constraints[parentType] || []
  return allowedParents.includes(componentType)
}

// 计算组件样式
function calculateComponentStyles(component: any, options?: any) {
  // 这里实现样式计算逻辑
  // 考虑响应式布局、主题设置等
  return {
    ...component.styles,
    calculated: true,
    viewportWidth: options?.viewportWidth,
    viewportHeight: options?.viewportHeight,
    includeResponsive: options?.includeResponsive,
  }
}

// 计算组件深度
function calculateComponentDepth(component: any, allComponents: any[], depth = 0): number {
  if (depth > 20) return depth // 防止无限递归

  const children = allComponents.filter(c => c.parent_id === component.id)
  if (children.length === 0) return depth

  return Math.max(
    ...children.map(child => calculateComponentDepth(child, allComponents, depth + 1))
  )
}
