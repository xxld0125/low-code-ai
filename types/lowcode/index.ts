/**
 * 低代码组件库类型定义主导出文件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

// 导出所有组件相关类型
export * from './component'
export * from './property'
export * from './style'

// 导入特定类型用于此文件
import { ComponentProps } from './component'
import { StyleValue, Theme, Breakpoint } from './style'
import { ComponentDefinition } from './property'
import type { ReactNode } from 'react'

// 重新导出常用的React类型
export type { ReactNode, ComponentType, ReactElement, CSSProperties } from 'react'

// 解决类型冲突，使用别名导出
export type { ComponentProps as LowcodeComponentProps } from './component'
export type { PropertyDefinition } from './property'
export type { StyleValue as LowcodeStyleValue } from './style'

// 组件渲染器通用接口
export interface ComponentRendererProps {
  id: string
  componentType?: string
  component?: React.ComponentType<ComponentProps>
  props: ComponentProps
  styles: StyleValue
  isSelected?: boolean
  isDragging?: boolean
  onSelect?: (id: string) => void
  onDelete?: (id: string) => void
  onUpdate?: (id: string, data: Partial<ComponentRendererProps>) => void
  children?: ReactNode
  className?: string
}

// 组件注册表类型
export interface ComponentRegistry {
  [componentType: string]: ComponentDefinition
}

// 组件实例类型
export interface ComponentInstance {
  id: string
  type: string
  props: ComponentProps
  styles: StyleValue
  children?: ComponentInstance[]
  parent_id?: string
  order: number
}

// 页面设计器画布状态
export interface CanvasState {
  components: ComponentInstance[]
  selected_component_id?: string
  clipboard?: ComponentInstance
  history: {
    past: CanvasState[]
    present: CanvasState
    future: CanvasState[]
  }
  zoom: number
  viewport_size: {
    width: number
    height: number
  }
}

// 组件面板状态
export interface ComponentPanelState {
  search_query: string
  selected_category: string
  collapsed_categories: Record<string, boolean>
}

// 属性面板状态
export interface PropertiesPanelState {
  selected_component_id?: string
  active_tab: 'properties' | 'styles' | 'validation'
  is_loading: boolean
  errors: Record<string, string[]>
}

// 组件库配置
export interface ComponentLibraryConfig {
  theme: Theme
  breakpoints: Record<Breakpoint, number>
  default_font_size: number
  default_spacing_unit: string
  max_undo_steps: number
  auto_save: boolean
  auto_save_interval: number
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

// 组件列表API响应
export interface ComponentListResponse {
  components: ComponentDefinition[]
  categories: string[]
  total: number
}

// 保存页面API请求
export interface SavePageRequest {
  id?: string
  name: string
  description?: string
  components: ComponentInstance[]
  styles: Record<string, StyleValue>
  metadata: {
    created_at?: string
    updated_at?: string
    version: string
  }
}

// 保存页面API响应
export interface SavePageResponse {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  version: string
}

// 事件类型
export interface ComponentEvent {
  type: 'select' | 'delete' | 'update' | 'create' | 'move' | 'copy' | 'paste'
  component_id: string
  data?: unknown
  timestamp: number
}

// 拖拽相关类型
export interface DragItem {
  type: string
  id: string
  component_type?: string
  component_data?: ComponentInstance
}

// 错误类型
export interface ComponentLibraryError {
  code: string
  message: string
  details?: unknown
  stack?: string
}

// 性能监控类型
export interface PerformanceMetrics {
  render_time: number
  component_count: number
  memory_usage: number
  bundle_size: number
  interaction_latency: number
}
