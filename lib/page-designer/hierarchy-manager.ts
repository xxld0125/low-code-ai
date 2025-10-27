/**
 * 页面设计器层级管理器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import {
  ComponentInstance,
  ComponentType,
  HierarchyNode,
  ComponentTree,
} from '@/types/page-designer/component'
import { LayoutComponentType } from '@/types/page-designer/layout'

// 层级操作类型
export type HierarchyOperationType = 'add' | 'remove' | 'move' | 'reorder' | 'reparent'

// 层级操作事件
export interface HierarchyOperation {
  type: HierarchyOperationType
  componentId: string
  parentId?: string
  oldParentId?: string
  position?: number
  oldPosition?: number
  timestamp: number
}

// 层级管理器类
export class HierarchyManager {
  private hierarchy: Map<string, HierarchyNode>
  private operationHistory: HierarchyOperation[]
  private maxHistorySize: number

  constructor(maxHistorySize: number = 100) {
    this.hierarchy = new Map()
    this.operationHistory = []
    this.maxHistorySize = maxHistorySize
  }

  // 构建层级结构
  public buildHierarchy(
    components: Record<string, ComponentInstance>,
    rootId: string
  ): ComponentTree {
    this.hierarchy.clear()

    const rootComponent = components[rootId]
    if (!rootComponent) {
      throw new Error(`Root component with id ${rootId} not found`)
    }

    // 构建层级节点
    const hierarchyNodes: HierarchyNode[] = []
    const visited = new Set<string>()

    const buildNode = (
      component: ComponentInstance,
      depth: number = 0,
      path: string = ''
    ): HierarchyNode => {
      if (visited.has(component.id)) {
        throw new Error(`Circular reference detected for component ${component.id}`)
      }

      visited.add(component.id)

      const children = Object.values(components)
        .filter(child => child.parent_id === component.id)
        .sort((a, b) => a.position.order - b.position.order)

      const childIds = children.map(child => child.id)
      const currentPath = path ? `${path}/${component.id}` : component.id

      const node: HierarchyNode = {
        component_id: component.id,
        parent_id: component.parent_id,
        children: childIds,
        depth,
        path: currentPath,
      }

      this.hierarchy.set(component.id, node)
      hierarchyNodes.push(node)

      // 递归构建子节点
      children.forEach(child => {
        buildNode(child, depth + 1, currentPath)
      })

      visited.delete(component.id)
      return node
    }

    // 从根节点开始构建
    buildNode(rootComponent)

    return {
      version: '1.0.0',
      root_id: rootId,
      components,
      hierarchy: hierarchyNodes,
    }
  }

  // 验证嵌套规则
  public validateNestingRules(
    component: ComponentInstance,
    targetParentId: string | undefined,
    components: Record<string, ComponentInstance>
  ): { isValid: boolean; reason?: string } {
    // 如果目标是根级别，检查是否允许作为根组件
    if (!targetParentId) {
      const canBeRoot = ['container'].includes(component.component_type)
      if (!canBeRoot) {
        return {
          isValid: false,
          reason: `组件类型 ${component.component_type} 不能作为根组件`,
        }
      }
      return { isValid: true }
    }

    const targetParent = components[targetParentId]
    if (!targetParent) {
      return {
        isValid: false,
        reason: `目标父组件 ${targetParentId} 不存在`,
      }
    }

    // 检查是否会创建循环引用
    if (this.wouldCreateCircularReference(component.id, targetParentId, components)) {
      return {
        isValid: false,
        reason: '此操作会创建循环引用',
      }
    }

    // 检查父组件类型是否允许包含此子组件
    const parentType = targetParent.component_type
    const childType = component.component_type

    // Row只能包含Col
    if (parentType === 'row' && childType !== 'col') {
      return {
        isValid: false,
        reason: 'Row组件只能包含Col组件',
      }
    }

    // 检查嵌套深度
    const currentDepth = this.getComponentDepth(targetParentId, components)
    if (currentDepth >= 8) {
      return {
        isValid: false,
        reason: '嵌套深度超过限制（最大8层）',
      }
    }

    return { isValid: true }
  }

  // 检查是否会创建循环引用
  private wouldCreateCircularReference(
    componentId: string,
    targetParentId: string,
    components: Record<string, ComponentInstance>
  ): boolean {
    let currentId = targetParentId

    while (currentId) {
      if (currentId === componentId) {
        return true
      }

      const currentComponent = components[currentId]
      if (!currentComponent) break

      currentId = currentComponent.parent_id || ''
    }

    return false
  }

  // 获取组件深度
  private getComponentDepth(
    componentId: string,
    components: Record<string, ComponentInstance>
  ): number {
    let depth = 0
    let currentId = componentId

    while (currentId) {
      const currentComponent = components[currentId]
      if (!currentComponent) break

      depth++
      currentId = currentComponent.parent_id || ''
    }

    return depth
  }

  // 获取组件路径
  public getComponentPath(componentId: string): string | null {
    const node = this.hierarchy.get(componentId)
    return node ? node.path : null
  }

  // 获取组件的父级路径
  public getParentPath(componentId: string): string[] {
    const node = this.hierarchy.get(componentId)
    if (!node || !node.parent_id) return []

    const parentNode = this.hierarchy.get(node.parent_id)
    if (!parentNode) return []

    return parentNode.path.split('/').slice(1)
  }

  // 获取组件的子组件
  public getChildren(componentId: string): string[] {
    const node = this.hierarchy.get(componentId)
    return node ? [...node.children] : []
  }

  // 获取组件的所有后代
  public getDescendants(componentId: string): string[] {
    const descendants: string[] = []
    const children = this.getChildren(componentId)

    children.forEach(childId => {
      descendants.push(childId)
      descendants.push(...this.getDescendants(childId))
    })

    return descendants
  }

  // 移动组件到新位置
  public moveComponent(
    componentId: string,
    newParentId: string | undefined,
    newPosition: number,
    components: Record<string, ComponentInstance>
  ): { success: boolean; reason?: string; updatedComponents?: Record<string, ComponentInstance> } {
    const component = components[componentId]
    if (!component) {
      return { success: false, reason: '组件不存在' }
    }

    // 验证嵌套规则
    const validation = this.validateNestingRules(component, newParentId, components)
    if (!validation.isValid) {
      return { success: false, reason: validation.reason }
    }

    const updatedComponents = { ...components }
    const oldParentId = component.parent_id
    const oldPosition = component.position.order

    // 记录操作
    this.recordOperation({
      type: 'move',
      componentId,
      parentId: newParentId,
      oldParentId,
      position: newPosition,
      oldPosition,
      timestamp: Date.now(),
    })

    // 更新组件的父级和位置
    updatedComponents[componentId] = {
      ...component,
      parent_id: newParentId,
      position: {
        ...component.position,
        order: newPosition,
      },
    }

    // 重新排序兄弟组件
    this.reorderSiblings(newParentId, componentId, newPosition, updatedComponents)

    return { success: true, updatedComponents }
  }

  // 重新排序兄弟组件
  private reorderSiblings(
    parentId: string | undefined,
    movedComponentId: string,
    newPosition: number,
    components: Record<string, ComponentInstance>
  ): void {
    const siblings = Object.values(components)
      .filter(component => component.parent_id === parentId && component.id !== movedComponentId)
      .sort((a, b) => a.position.order - b.position.order)

    let currentOrder = 0
    siblings.forEach((sibling, index) => {
      if (index === newPosition) {
        currentOrder++ // 跳过移动组件的位置
      }

      components[sibling.id] = {
        ...sibling,
        position: {
          ...sibling.position,
          order: currentOrder++,
        },
      }
    })
  }

  // 复制组件及其子组件
  public duplicateComponent(
    componentId: string,
    components: Record<string, ComponentInstance>,
    generateId: () => string
  ): { success: boolean; newComponents?: Record<string, ComponentInstance> } {
    const component = components[componentId]
    if (!component) {
      return { success: false }
    }

    const newComponents: Record<string, ComponentInstance> = {}
    const componentMap = new Map<string, string>() // 旧ID -> 新ID

    // 复制主组件
    const newComponentId = generateId()
    componentMap.set(componentId, newComponentId)

    newComponents[newComponentId] = {
      ...component,
      id: newComponentId,
      position: {
        ...component.position,
        order: component.position.order + 1, // 放在原组件后面
        z_index: component.position.z_index + 1, // 提高层级
      },
    }

    // 递归复制所有子组件
    const copyChildren = (parentId: string, newParentId: string) => {
      const children = Object.values(components)
        .filter(child => child.parent_id === parentId)
        .sort((a, b) => a.position.order - b.position.order)

      children.forEach(child => {
        const newChildId = generateId()
        componentMap.set(child.id, newChildId)

        newComponents[newChildId] = {
          ...child,
          id: newChildId,
          parent_id: newParentId,
        }

        // 递归复制子组件的子组件
        copyChildren(child.id, newChildId)
      })
    }

    copyChildren(componentId, newComponentId)

    return { success: true, newComponents }
  }

  // 记录操作历史
  private recordOperation(operation: HierarchyOperation): void {
    this.operationHistory.push(operation)

    // 限制历史记录大小
    if (this.operationHistory.length > this.maxHistorySize) {
      this.operationHistory.shift()
    }
  }

  // 获取操作历史
  public getOperationHistory(): HierarchyOperation[] {
    return [...this.operationHistory]
  }

  // 清除历史记录
  public clearHistory(): void {
    this.operationHistory = []
  }

  // 获取组件统计信息
  public getStatistics(components: Record<string, ComponentInstance>): {
    totalComponents: number
    maxDepth: number
    componentTypes: Record<string, number>
    orphanedComponents: string[]
  } {
    const componentTypes: Record<string, number> = {}
    let maxDepth = 0
    const orphanedComponents: string[] = []

    Object.values(components).forEach(component => {
      // 统计组件类型
      componentTypes[component.component_type] = (componentTypes[component.component_type] || 0) + 1

      // 计算深度
      const depth = this.getComponentDepth(component.id, components)
      maxDepth = Math.max(maxDepth, depth)

      // 检查孤立组件
      if (component.parent_id && !components[component.parent_id]) {
        orphanedComponents.push(component.id)
      }
    })

    return {
      totalComponents: Object.keys(components).length,
      maxDepth,
      componentTypes,
      orphanedComponents,
    }
  }
}

// 导出单例实例
export const hierarchyManager = new HierarchyManager()

// 导出工具函数
export const buildComponentHierarchy = (
  components: Record<string, ComponentInstance>,
  rootId: string
): ComponentTree => {
  return hierarchyManager.buildHierarchy(components, rootId)
}

export const validateComponentNesting = (
  component: ComponentInstance,
  targetParentId: string | undefined,
  components: Record<string, ComponentInstance>
) => {
  return hierarchyManager.validateNestingRules(component, targetParentId, components)
}

export const moveComponentInHierarchy = (
  componentId: string,
  newParentId: string | undefined,
  newPosition: number,
  components: Record<string, ComponentInstance>
) => {
  return hierarchyManager.moveComponent(componentId, newParentId, newPosition, components)
}
