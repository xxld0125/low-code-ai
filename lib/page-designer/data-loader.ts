import { createClient } from '@/lib/supabase/client'
import type { PageDesign, ComponentInstance } from '@/types/page-designer'

/**
 * 页面设计数据加载器
 * 负责从数据库加载页面设计和组件数据
 */
export class DataLoader {
  private supabase = createClient()

  /**
   * 加载页面设计详情
   */
  async loadPageDesign(id: string): Promise<{
    data: PageDesign | null
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase
        .from('page_designs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('加载页面设计失败:', error)
        return {
          data: null,
          error: error.message || '加载页面设计失败',
        }
      }

      return {
        data,
        error: null,
      }
    } catch (error) {
      console.error('加载页面设计异常:', error)
      return {
        data: null,
        error: error instanceof Error ? error.message : '加载页面设计失败',
      }
    }
  }

  /**
   * 加载页面的所有组件实例
   */
  async loadPageComponents(pageDesignId: string): Promise<{
    data: ComponentInstance[]
    error: string | null
  }> {
    try {
      const { data, error } = await this.supabase
        .from('component_instances')
        .select('*')
        .eq('page_design_id', pageDesignId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('加载组件实例失败:', error)
        return {
          data: [],
          error: error.message || '加载组件实例失败',
        }
      }

      return {
        data: data || [],
        error: null,
      }
    } catch (error) {
      console.error('加载组件实例异常:', error)
      return {
        data: [],
        error: error instanceof Error ? error.message : '加载组件实例失败',
      }
    }
  }

  /**
   * 加载完整的设计数据（页面设计 + 组件实例）
   */
  async loadFullDesignData(pageDesignId: string): Promise<{
    pageDesign: PageDesign | null
    components: ComponentInstance[]
    componentTree: any
    error: string | null
  }> {
    try {
      const [pageDesignResult, componentsResult] = await Promise.all([
        this.loadPageDesign(pageDesignId),
        this.loadPageComponents(pageDesignId),
      ])

      // 如果页面设计加载失败，返回错误
      if (pageDesignResult.error) {
        return {
          pageDesign: null,
          components: [],
          componentTree: null,
          error: pageDesignResult.error,
        }
      }

      const pageDesign = pageDesignResult.data
      if (!pageDesign) {
        return {
          pageDesign: null,
          components: [],
          componentTree: null,
          error: '页面设计不存在',
        }
      }

      let components: ComponentInstance[] = []
      let componentTree: any = null

      // 优先从 component_tree 中加载组件数据
      if (pageDesign.component_tree) {
        const result = this.extractComponentsFromTree(pageDesign.component_tree, pageDesignId)
        components = result.components
        componentTree = pageDesign.component_tree
      } else {
        // 回退到从 component_instances 表加载
        if (componentsResult.error) {
          return {
            pageDesign: pageDesign,
            components: [],
            componentTree: null,
            error: componentsResult.error,
          }
        }
        components = componentsResult.data
        componentTree = this.buildComponentTree(components)
      }

      return {
        pageDesign,
        components,
        componentTree,
        error: null,
      }
    } catch (error) {
      console.error('加载完整设计数据异常:', error)
      return {
        pageDesign: null,
        components: [],
        componentTree: null,
        error: error instanceof Error ? error.message : '加载设计数据失败',
      }
    }
  }

  /**
   * 从 component_tree 中提取组件数据
   */
  private extractComponentsFromTree(
    componentTree: any,
    pageDesignId: string
  ): {
    components: ComponentInstance[]
  } {
    const components: ComponentInstance[] = []

    if (!componentTree || !componentTree.components) {
      console.warn('component_tree 结构不完整')
      return { components }
    }

    try {
      // 首先处理层级关系
      const hierarchyMap = new Map<string, string | null>()

      // 从 hierarchy 中建立父子关系映射
      if (componentTree.hierarchy && Array.isArray(componentTree.hierarchy)) {
        componentTree.hierarchy.forEach((node: any) => {
          // hierarchy 中的节点表示顶级组件，它们没有父组件
          if (node && node.id) {
            hierarchyMap.set(node.id, null)
          }
        })
      }

      // 处理根组件
      if (componentTree.root_id) {
        hierarchyMap.set(componentTree.root_id, null)
      }

      // 遍历 component_tree.components 中的所有组件
      Object.values(componentTree.components).forEach((componentData: any) => {
        if (this.isValidComponentData(componentData)) {
          const componentInstance: ComponentInstance = {
            id: componentData.id,
            page_design_id: pageDesignId,
            component_type: componentData.component_type,
            parent_id: hierarchyMap.get(componentData.id) || null,
            position: componentData.position || { order: 0, z_index: 0 },
            props: componentData.props || {},
            events: componentData.events || {},
            styles: componentData.styles || {},
            responsive: componentData.responsive || {},
            layout_props: componentData.layout_props || {},
            created_at: componentData.created_at || new Date().toISOString(),
            updated_at: componentData.updated_at || new Date().toISOString(),
            version: componentData.version || 1,
            meta: componentData.meta || { hidden: false, locked: false },
          }
          components.push(componentInstance)
        } else {
          console.warn('跳过无效的组件数据:', componentData)
        }
      })

      return { components }
    } catch (error) {
      console.error('提取组件数据时发生错误:', error)
      return { components }
    }
  }

  /**
   * 验证组件数据是否有效
   */
  private isValidComponentData(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      data.id &&
      data.component_type &&
      typeof data.id === 'string' &&
      typeof data.component_type === 'string'
    )
  }

  /**
   * 构建组件树结构
   */
  private buildComponentTree(components: ComponentInstance[]): any {
    if (components.length === 0) {
      return {
        version: '1.0',
        root_id: null,
        components: {},
        hierarchy: [],
      }
    }

    const componentMap = new Map<string, ComponentInstance>()
    const hierarchy: any[] = []
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    // 创建组件映射
    components.forEach(component => {
      componentMap.set(component.id, component)
    })

    // 检测循环引用
    const detectCycle = (componentId: string): boolean => {
      if (recursionStack.has(componentId)) {
        console.error('检测到组件循环引用:', componentId)
        return true
      }
      if (visited.has(componentId)) {
        return false
      }

      visited.add(componentId)
      recursionStack.add(componentId)

      const component = componentMap.get(componentId)
      if (component && component.parent_id) {
        if (detectCycle(component.parent_id)) {
          return true
        }
      }

      recursionStack.delete(componentId)
      return false
    }

    // 检查所有组件是否有循环引用
    for (const component of components) {
      if (detectCycle(component.id)) {
        console.error('组件树存在循环引用，跳过组件:', component.id)
        continue
      }
    }

    // 清空visited和recursionStack，重新用于构建层级结构
    visited.clear()
    recursionStack.clear()

    // 构建层级结构
    components.forEach(component => {
      if (detectCycle(component.id)) {
        // 跳过有循环引用的组件
        return
      }

      const node = {
        component_id: component.id,
        parent_id: component.parent_id,
        children: this.getChildIds(component.id, components),
        depth: this.calculateDepth(component, components),
        path: this.calculatePath(component, components),
      }
      hierarchy.push(node)
    })

    return {
      version: '1.0',
      root_id: this.findRootComponentId(components),
      components: Object.fromEntries(componentMap),
      hierarchy,
    }
  }

  /**
   * 获取组件的子组件ID列表
   */
  private getChildIds(componentId: string, components: ComponentInstance[]): string[] {
    return components
      .filter(c => c.parent_id === componentId)
      .sort((a, b) => (a.position?.order || 0) - (b.position?.order || 0))
      .map(c => c.id)
  }

  /**
   * 计算组件深度
   */
  private calculateDepth(component: ComponentInstance, components: ComponentInstance[]): number {
    if (!component.parent_id) return 0

    const parent = components.find(c => c.id === component.parent_id)
    if (!parent) return 0

    return this.calculateDepth(parent, components) + 1
  }

  /**
   * 计算组件路径
   */
  private calculatePath(component: ComponentInstance, components: ComponentInstance[]): string {
    if (!component.parent_id) return component.id

    const parent = components.find(c => c.id === component.parent_id)
    if (!parent) return component.id

    const parentPath = this.calculatePath(parent, components)
    return `${parentPath}.${component.id}`
  }

  /**
   * 找到根组件ID
   */
  private findRootComponentId(components: ComponentInstance[]): string | null {
    const rootComponent = components.find(c => !c.parent_id)
    return rootComponent?.id || null
  }
}

// 创建全局数据加载器实例
export const dataLoader = new DataLoader()
