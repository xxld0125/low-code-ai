/**
 * 页面设计器布局拖拽系统
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import {
  ComponentInstance,
  ComponentType,
  DragItem,
  DragState,
  ComponentRendererProps,
} from '@/types/page-designer/component'
import { LayoutComponentType } from '@/types/page-designer/layout'
import { layoutConstraintsValidator } from './constraints'
import { hierarchyManager } from './hierarchy-manager'

// 拖拽区域类型
export type DropZoneType = 'canvas' | 'component' | 'panel'

// 拖拽区域
export interface DropZone {
  id: string
  type: DropZoneType
  componentId?: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  isValid: boolean
  insertIndex?: number
}

// 拖拽配置
export interface LayoutDragConfig {
  enableSnapToGrid: boolean
  gridSize: number
  enableAlignmentGuides: boolean
  enableDropValidation: boolean
  showDropZones: boolean
  autoScroll: boolean
  dragThreshold: number // 拖拽激活阈值（像素）
}

// 拖拽事件
export interface LayoutDragEvent {
  type: 'drag_start' | 'drag_move' | 'drag_end' | 'drop'
  dragItem: DragItem
  dropZone?: DropZone
  position?: { x: number; y: number }
  timestamp: number
}

// 布局拖拽系统类
export class LayoutDragSystem {
  private config: LayoutDragConfig
  private dragState: DragState
  private dropZones: DropZone[]
  private eventListeners: Map<string, ((event: LayoutDragEvent) => void)[]>

  constructor(config: Partial<LayoutDragConfig> = {}) {
    this.config = {
      enableSnapToGrid: true,
      gridSize: 8,
      enableAlignmentGuides: true,
      enableDropValidation: true,
      showDropZones: true,
      autoScroll: true,
      dragThreshold: 8,
      ...config,
    }

    this.dragState = {
      isDragging: false,
      activeId: null,
      draggedComponentType: null,
      dropZoneId: null,
    }

    this.dropZones = []
    this.eventListeners = new Map()
  }

  // 更新配置
  public updateConfig(config: Partial<LayoutDragConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // 获取拖拽状态
  public getDragState(): DragState {
    return { ...this.dragState }
  }

  // 开始拖拽
  public startDrag(dragItem: DragItem, startPosition: { x: number; y: number }): void {
    this.dragState = {
      isDragging: true,
      activeId: dragItem.id,
      draggedComponentType: dragItem.type,
      dropZoneId: null,
      position: startPosition,
    }

    this.emitEvent({
      type: 'drag_start',
      dragItem,
      position: startPosition,
      timestamp: Date.now(),
    })
  }

  // 移动拖拽
  public moveDrag(
    position: { x: number; y: number },
    components: Record<string, ComponentInstance>
  ): void {
    if (!this.dragState.isDragging) return

    // 应用网格对齐
    let alignedPosition = position
    if (this.config.enableSnapToGrid) {
      alignedPosition = this.snapToGrid(position)
    }

    this.dragState.position = alignedPosition

    // 更新拖拽区域
    this.updateDropZones(components, alignedPosition)

    // 查找最佳拖拽区域
    const bestDropZone = this.findBestDropZone(alignedPosition)

    this.emitEvent({
      type: 'drag_move',
      dragItem: {
        type: this.dragState.draggedComponentType!,
        id: this.dragState.activeId!,
        isFromPanel: this.isFromPanel(this.dragState.activeId!),
      },
      dropZone: bestDropZone,
      position: alignedPosition,
      timestamp: Date.now(),
    })
  }

  // 结束拖拽
  public endDrag(components: Record<string, ComponentInstance>): {
    success: boolean
    dropZone?: DropZone
    updatedComponents?: Record<string, ComponentInstance>
    error?: string
  } {
    if (!this.dragState.isDragging) {
      return { success: false, error: '没有正在进行的拖拽操作' }
    }

    const dropZone = this.findBestDropZone(this.dragState.position!)

    // 验证拖拽区域
    if (this.config.enableDropValidation && dropZone && !dropZone.isValid) {
      this.resetDragState()
      return { success: false, error: '拖拽区域无效' }
    }

    // 执行拖拽操作
    let result: {
      success: boolean
      updatedComponents?: Record<string, ComponentInstance>
      error?: string
    }

    if (this.isFromPanel(this.dragState.activeId!)) {
      // 从组件面板拖拽新组件
      result = this.handleNewComponentDrop(dropZone, components)
    } else {
      // 移动现有组件
      result = this.handleExistingComponentDrop(dropZone, components)
    }

    // 发送拖拽结束事件
    this.emitEvent({
      type: result.success ? 'drop' : 'drag_end',
      dragItem: {
        type: this.dragState.draggedComponentType!,
        id: this.dragState.activeId!,
        isFromPanel: this.isFromPanel(this.dragState.activeId!),
      },
      dropZone: result.success ? dropZone : undefined,
      timestamp: Date.now(),
    })

    this.resetDragState()
    return result
  }

  // 取消拖拽
  public cancelDrag(): void {
    if (this.dragState.isDragging) {
      this.emitEvent({
        type: 'drag_end',
        dragItem: {
          type: this.dragState.draggedComponentType!,
          id: this.dragState.activeId!,
          isFromPanel: this.isFromPanel(this.dragState.activeId!),
        },
        timestamp: Date.now(),
      })

      this.resetDragState()
    }
  }

  // 网格对齐
  private snapToGrid(position: { x: number; y: number }): { x: number; y: number } {
    const gridSize = this.config.gridSize

    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    }
  }

  // 更新拖拽区域
  private updateDropZones(
    components: Record<string, ComponentInstance>,
    position: { x: number; y: number }
  ): void {
    this.dropZones = []

    // 添加画布拖拽区域
    this.dropZones.push({
      id: 'canvas',
      type: 'canvas',
      position: { x: 0, y: 0, width: 1200, height: 800 }, // 画布尺寸
      isValid: true,
    })

    // 为每个布局组件添加拖拽区域
    Object.values(components).forEach(component => {
      if (this.isLayoutComponent(component.component_type)) {
        this.dropZones.push(...this.createComponentDropZones(component, components))
      }
    })

    // 验证拖拽区域
    if (this.config.enableDropValidation) {
      this.validateDropZones(components)
    }
  }

  // 创建组件拖拽区域
  private createComponentDropZones(
    component: ComponentInstance,
    allComponents: Record<string, ComponentInstance>
  ): DropZone[] {
    const zones: DropZone[] = []

    // 获取组件的位置和尺寸（这里需要从布局引擎获取实际位置）
    const componentPosition = this.getComponentPosition(component, allComponents)

    if (!componentPosition) return zones

    // 为组件的内部区域创建拖拽区域
    zones.push({
      id: `${component.id}-inside`,
      type: 'component',
      componentId: component.id,
      position: {
        x: componentPosition.x + 10,
        y: componentPosition.y + 10,
        width: componentPosition.width - 20,
        height: componentPosition.height - 20,
      },
      isValid: false, // 将在验证阶段更新
      insertIndex: -1, // 插入到末尾
    })

    // 为组件之间的间隔创建拖拽区域
    const children = this.getChildComponents(component, allComponents)
    children.forEach((child, index) => {
      const childPosition = this.getComponentPosition(child, allComponents)
      if (childPosition) {
        zones.push({
          id: `${component.id}-before-${child.id}`,
          type: 'component',
          componentId: component.id,
          position: {
            x: childPosition.x - 5,
            y: childPosition.y,
            width: 10,
            height: childPosition.height,
          },
          isValid: false,
          insertIndex: index,
        })
      }
    })

    return zones
  }

  // 获取组件位置（简化实现，实际应从布局引擎获取）
  private getComponentPosition(
    component: ComponentInstance,
    allComponents: Record<string, ComponentInstance>
  ): { x: number; y: number; width: number; height: number } | null {
    // 这里是简化实现，实际应该从布局引擎获取计算后的位置
    // 返回一个默认位置用于演示
    return {
      x: typeof component.styles.left === 'number' ? component.styles.left : 0,
      y: typeof component.styles.top === 'number' ? component.styles.top : 0,
      width: typeof component.styles.width === 'number' ? component.styles.width : 200,
      height: typeof component.styles.height === 'number' ? component.styles.height : 100,
    }
  }

  // 获取子组件
  private getChildComponents(
    component: ComponentInstance,
    allComponents: Record<string, ComponentInstance>
  ): ComponentInstance[] {
    return Object.values(allComponents)
      .filter(child => child.parent_id === component.id)
      .sort((a, b) => a.position.order - b.position.order)
  }

  // 验证拖拽区域
  private validateDropZones(components: Record<string, ComponentInstance>): void {
    this.dropZones.forEach(zone => {
      if (zone.type === 'component' && zone.componentId) {
        const parentComponent = components[zone.componentId]
        if (parentComponent) {
          // 检查是否可以拖拽到此组件中
          zone.isValid = this.canDropInComponent(
            this.dragState.draggedComponentType!,
            parentComponent,
            components
          )
        }
      } else if (zone.type === 'canvas') {
        // 画布拖拽区域只允许布局组件
        zone.isValid = this.isLayoutComponent(this.dragState.draggedComponentType!)
      }
    })
  }

  // 检查是否可以拖拽到组件中
  private canDropInComponent(
    draggedType: ComponentType | LayoutComponentType,
    targetComponent: ComponentInstance,
    allComponents: Record<string, ComponentInstance>
  ): boolean {
    // 使用约束验证器检查
    const validation = layoutConstraintsValidator.validateComponent(
      { component_type: draggedType } as ComponentInstance,
      targetComponent
    )

    return validation.errors.length === 0
  }

  // 查找最佳拖拽区域
  private findBestDropZone(position: { x: number; y: number }): DropZone | undefined {
    const validZones = this.dropZones.filter(zone => zone.isValid)

    if (validZones.length === 0) return undefined

    // 找到位置最接近的有效拖拽区域
    let bestZone: DropZone | undefined
    let minDistance = Infinity

    validZones.forEach(zone => {
      const center = {
        x: zone.position.x + zone.position.width / 2,
        y: zone.position.y + zone.position.height / 2,
      }

      const distance = Math.sqrt(
        Math.pow(position.x - center.x, 2) + Math.pow(position.y - center.y, 2)
      )

      if (distance < minDistance) {
        minDistance = distance
        bestZone = zone
      }
    })

    return bestZone
  }

  // 处理新组件拖拽
  private handleNewComponentDrop(
    dropZone: DropZone | undefined,
    components: Record<string, ComponentInstance>
  ): { success: boolean; updatedComponents?: Record<string, ComponentInstance>; error?: string } {
    if (!dropZone) {
      return { success: false, error: '没有找到有效的拖拽区域' }
    }

    // 生成新组件ID
    const newComponentId = this.generateComponentId()

    // 创建新组件
    const newComponent = this.createNewComponent(
      this.dragState.draggedComponentType!,
      newComponentId,
      dropZone
    )

    // 验证新组件
    const validation = layoutConstraintsValidator.validateComponent(
      newComponent,
      dropZone.componentId ? components[dropZone.componentId] : undefined,
      dropZone.componentId
        ? this.getChildComponents(components[dropZone.componentId], components)
        : []
    )

    if (!validation.isValid) {
      return { success: false, error: '组件验证失败' }
    }

    // 添加到组件列表
    const updatedComponents = {
      ...components,
      [newComponentId]: newComponent,
    }

    return { success: true, updatedComponents }
  }

  // 处理现有组件拖拽
  private handleExistingComponentDrop(
    dropZone: DropZone | undefined,
    components: Record<string, ComponentInstance>
  ): { success: boolean; updatedComponents?: Record<string, ComponentInstance>; error?: string } {
    if (!dropZone) {
      return { success: false, error: '没有找到有效的拖拽区域' }
    }

    const component = components[this.dragState.activeId!]
    if (!component) {
      return { success: false, error: '拖拽的组件不存在' }
    }

    // 使用层级管理器移动组件
    const moveResult = hierarchyManager.moveComponent(
      this.dragState.activeId!,
      dropZone.componentId,
      dropZone.insertIndex !== undefined ? dropZone.insertIndex : -1,
      components
    )

    if (!moveResult.success) {
      return { success: false, error: moveResult.reason }
    }

    return { success: true, updatedComponents: moveResult.updatedComponents }
  }

  // 创建新组件
  private createNewComponent(
    componentType: ComponentType | LayoutComponentType,
    componentId: string,
    dropZone: DropZone
  ): ComponentInstance {
    const now = new Date().toISOString()

    return {
      id: componentId,
      page_design_id: 'current-page', // 实际应从上下文获取
      component_type: componentType as ComponentType,
      parent_id: dropZone.componentId,
      position: {
        z_index: 1,
        order: dropZone.insertIndex !== undefined ? dropZone.insertIndex : 0,
      },
      props: this.getDefaultProps(componentType),
      styles: this.getDefaultStyles(componentType),
      events: {},
      responsive: {},
      layout_props: this.getDefaultLayoutProps(componentType),
      created_at: now,
      updated_at: now,
      version: 1,
      meta: {
        locked: false,
        hidden: false,
      },
    }
  }

  // 获取组件默认属性
  private getDefaultProps(componentType: ComponentType | LayoutComponentType): any {
    switch (componentType) {
      case 'container':
        return {
          container: {
            direction: 'column',
            gap: 0,
            padding: { x: 16, y: 16 },
          },
        }
      case 'row':
        return {
          row: {
            gap: 16,
            justify: 'start',
            align: 'start',
          },
        }
      case 'col':
        return {
          col: {
            span: 12,
            padding: { x: 8, y: 8 },
          },
        }
      default:
        return {}
    }
  }

  // 获取组件默认样式
  private getDefaultStyles(componentType: ComponentType | LayoutComponentType): any {
    switch (componentType) {
      case 'container':
        return {
          width: '100%',
          minHeight: '100px',
        }
      case 'row':
        return {
          width: '100%',
          minHeight: '50px',
        }
      case 'col':
        return {
          minHeight: '50px',
        }
      default:
        return {}
    }
  }

  // 获取组件默认布局属性
  private getDefaultLayoutProps(componentType: ComponentType | LayoutComponentType): any {
    if (['container', 'row', 'col'].includes(componentType)) {
      return this.getDefaultProps(componentType)
    }
    return undefined
  }

  // 检查是否为布局组件
  private isLayoutComponent(componentType: ComponentType | LayoutComponentType): boolean {
    return ['container', 'row', 'col'].includes(componentType)
  }

  // 检查是否来自组件面板
  private isFromPanel(componentId: string): boolean {
    // 组件面板的组件ID通常以 'panel-' 开头
    return componentId.startsWith('panel-')
  }

  // 生成组件ID
  private generateComponentId(): string {
    return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 重置拖拽状态
  private resetDragState(): void {
    this.dragState = {
      isDragging: false,
      activeId: null,
      draggedComponentType: null,
      dropZoneId: null,
    }
    this.dropZones = []
  }

  // 事件监听器管理
  public addEventListener(eventType: string, listener: (event: LayoutDragEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  public removeEventListener(eventType: string, listener: (event: LayoutDragEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  // 发送事件
  private emitEvent(event: LayoutDragEvent): void {
    const listeners = this.eventListeners.get(event.type)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          console.error('Error in drag event listener:', error)
        }
      })
    }
  }

  // 获取当前拖拽区域
  public getDropZones(): DropZone[] {
    return [...this.dropZones]
  }
}

// 导出单例实例
export const layoutDragSystem = new LayoutDragSystem()

// 导出工具函数
export const startLayoutDrag = (dragItem: DragItem, position: { x: number; y: number }) => {
  layoutDragSystem.startDrag(dragItem, position)
}

export const moveLayoutDrag = (
  position: { x: number; y: number },
  components: Record<string, ComponentInstance>
) => {
  layoutDragSystem.moveDrag(position, components)
}

export const endLayoutDrag = (components: Record<string, ComponentInstance>) => {
  return layoutDragSystem.endDrag(components)
}

export const cancelLayoutDrag = () => {
  layoutDragSystem.cancelDrag()
}
