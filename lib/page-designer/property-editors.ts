/**
 * 页面设计器属性编辑器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import { PropDefinition, PropType, ComponentInstance } from '@/types/page-designer/component'
import { ContainerProps, RowProps, ColProps } from '@/types/page-designer/layout'

// 属性编辑器配置
export interface PropertyEditorConfig {
  showAdvanced: boolean
  groupByCategory: boolean
  showValidation: boolean
  autoSave: boolean
}

// 属性值变更事件
export interface PropertyValueChange {
  componentId: string
  propertyPath: string
  oldValue: any
  newValue: any
  timestamp: number
}

// 布局属性编辑器类
export class LayoutPropertyEditors {
  private config: PropertyEditorConfig
  private changeHistory: PropertyValueChange[]

  constructor(config: Partial<PropertyEditorConfig> = {}) {
    this.config = {
      showAdvanced: false,
      groupByCategory: true,
      showValidation: true,
      autoSave: false,
      ...config,
    }
    this.changeHistory = []
  }

  // 获取布局属性定义
  public getLayoutPropertyDefinitions(componentType: string): PropDefinition[] {
    switch (componentType) {
      case 'container':
        return this.getContainerPropertyDefinitions()
      case 'row':
        return this.getRowPropertyDefinitions()
      case 'col':
        return this.getColPropertyDefinitions()
      default:
        return []
    }
  }

  // Container属性定义
  private getContainerPropertyDefinitions(): PropDefinition[] {
    return [
      {
        name: 'direction',
        type: 'select',
        label: '布局方向',
        default: 'column',
        group: '布局',
        options: [
          { label: '垂直方向', value: 'column' },
          { label: '水平方向', value: 'row' },
        ],
      },
      {
        name: 'wrap',
        type: 'boolean',
        label: '允许换行',
        default: false,
        group: '布局',
      },
      {
        name: 'justify',
        type: 'select',
        label: '水平对齐',
        default: 'start',
        group: '布局',
        options: [
          { label: '开始对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '结束对齐', value: 'end' },
          { label: '两端对齐', value: 'between' },
          { label: '周围对齐', value: 'around' },
          { label: '均匀对齐', value: 'evenly' },
        ],
      },
      {
        name: 'align',
        type: 'select',
        label: '垂直对齐',
        default: 'start',
        group: '布局',
        options: [
          { label: '开始对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '结束对齐', value: 'end' },
          { label: '拉伸对齐', value: 'stretch' },
        ],
      },
      {
        name: 'gap',
        type: 'number',
        label: '间距',
        default: 0,
        group: '布局',
        validation: { min: 0, max: 100 },
      },
      {
        name: 'padding',
        type: 'object',
        label: '内边距',
        group: '间距',
        description: '设置容器内部间距',
      },
      {
        name: 'margin',
        type: 'object',
        label: '外边距',
        group: '间距',
        description: '设置容器外部间距',
      },
      {
        name: 'background',
        type: 'color',
        label: '背景颜色',
        group: '样式',
      },
      {
        name: 'border',
        type: 'boolean',
        label: '显示边框',
        default: false,
        group: '样式',
      },
      {
        name: 'shadow',
        type: 'select',
        label: '阴影效果',
        default: 'none',
        group: '样式',
        options: [
          { label: '无阴影', value: 'none' },
          { label: '小阴影', value: 'sm' },
          { label: '中阴影', value: 'md' },
          { label: '大阴影', value: 'lg' },
          { label: '特大阴影', value: 'xl' },
          { label: '内阴影', value: 'inner' },
        ],
      },
      {
        name: 'rounded',
        type: 'select',
        label: '圆角',
        default: 'none',
        group: '样式',
        options: [
          { label: '无圆角', value: 'none' },
          { label: '小圆角', value: 'sm' },
          { label: '中圆角', value: 'md' },
          { label: '大圆角', value: 'lg' },
          { label: '特大圆角', value: 'xl' },
          { label: '全圆角', value: 'full' },
        ],
      },
    ]
  }

  // Row属性定义
  private getRowPropertyDefinitions(): PropDefinition[] {
    return [
      {
        name: 'wrap',
        type: 'boolean',
        label: '允许换行',
        default: false,
        group: '布局',
      },
      {
        name: 'justify',
        type: 'select',
        label: '水平对齐',
        default: 'start',
        group: '布局',
        options: [
          { label: '开始对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '结束对齐', value: 'end' },
          { label: '两端对齐', value: 'between' },
          { label: '周围对齐', value: 'around' },
          { label: '均匀对齐', value: 'evenly' },
        ],
      },
      {
        name: 'align',
        type: 'select',
        label: '垂直对齐',
        default: 'start',
        group: '布局',
        options: [
          { label: '开始对齐', value: 'start' },
          { label: '居中对齐', value: 'center' },
          { label: '结束对齐', value: 'end' },
          { label: '拉伸对齐', value: 'stretch' },
        ],
      },
      {
        name: 'gap',
        type: 'number',
        label: '列间距',
        default: 0,
        group: '布局',
        validation: { min: 0, max: 100 },
      },
      {
        name: 'padding',
        type: 'object',
        label: '内边距',
        group: '间距',
      },
      {
        name: 'margin',
        type: 'object',
        label: '外边距',
        group: '间距',
      },
    ]
  }

  // Col属性定义
  private getColPropertyDefinitions(): PropDefinition[] {
    return [
      {
        name: 'span',
        type: 'number',
        label: '栅格宽度',
        required: true,
        default: 12,
        group: '栅格',
        validation: { min: 1, max: 12 },
        description: '设置列在12栅格系统中占用的列数',
      },
      {
        name: 'offset',
        type: 'number',
        label: '偏移量',
        default: 0,
        group: '栅格',
        validation: { min: 0, max: 11 },
        description: '设置列向右偏移的列数',
      },
      {
        name: 'order',
        type: 'number',
        label: '排序',
        default: 0,
        group: '栅格',
        description: '设置列的显示顺序',
      },
      {
        name: 'flex',
        type: 'string',
        label: 'Flex属性',
        group: '布局',
        description: 'Flex属性的简写形式，如 "1 1 auto"',
      },
      {
        name: 'alignSelf',
        type: 'select',
        label: '垂直对齐',
        default: 'auto',
        group: '布局',
        options: [
          { label: '自动', value: 'auto' },
          { label: '开始对齐', value: 'flex-start' },
          { label: '结束对齐', value: 'flex-end' },
          { label: '居中对齐', value: 'center' },
          { label: '基线对齐', value: 'baseline' },
          { label: '拉伸对齐', value: 'stretch' },
        ],
      },
      {
        name: 'padding',
        type: 'object',
        label: '内边距',
        group: '间距',
      },
      {
        name: 'margin',
        type: 'object',
        label: '外边距',
        group: '间距',
      },
    ]
  }

  // 验证属性值
  public validatePropertyValue(
    propertyDefinition: PropDefinition,
    value: any
  ): { isValid: boolean; error?: string } {
    const { type, required, validation } = propertyDefinition

    // 检查必填项
    if (required && (value === undefined || value === null || value === '')) {
      return {
        isValid: false,
        error: `${propertyDefinition.label}是必填项`,
      }
    }

    // 类型检查
    if (value !== undefined && value !== null) {
      switch (type) {
        case 'number':
          if (isNaN(Number(value))) {
            return {
              isValid: false,
              error: `${propertyDefinition.label}必须是数字`,
            }
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            return {
              isValid: false,
              error: `${propertyDefinition.label}必须是布尔值`,
            }
          }
          break
        case 'string':
          if (typeof value !== 'string') {
            return {
              isValid: false,
              error: `${propertyDefinition.label}必须是文本`,
            }
          }
          break
      }

      // 范围验证
      if (validation && typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          return {
            isValid: false,
            error: `${propertyDefinition.label}不能小于${validation.min}`,
          }
        }
        if (validation.max !== undefined && value > validation.max) {
          return {
            isValid: false,
            error: `${propertyDefinition.label}不能大于${validation.max}`,
          }
        }
      }

      // 字符串长度验证
      if (validation && typeof value === 'string') {
        if (validation.minLength !== undefined && value.length < validation.minLength) {
          return {
            isValid: false,
            error: `${propertyDefinition.label}长度不能少于${validation.minLength}个字符`,
          }
        }
        if (validation.maxLength !== undefined && value.length > validation.maxLength) {
          return {
            isValid: false,
            error: `${propertyDefinition.label}长度不能超过${validation.maxLength}个字符`,
          }
        }
      }
    }

    return { isValid: true }
  }

  // 更新组件属性
  public updateComponentProperty(
    component: ComponentInstance,
    propertyPath: string,
    newValue: any
  ): { success: boolean; updatedComponent?: ComponentInstance; error?: string } {
    const propertyDefinition = this.findPropertyDefinition(component.component_type, propertyPath)
    if (!propertyDefinition) {
      return {
        success: false,
        error: `属性 ${propertyPath} 不存在`,
      }
    }

    // 验证属性值
    const validation = this.validatePropertyValue(propertyDefinition, newValue)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // 获取当前值
    const oldValue = this.getPropertyValue(component, propertyPath)

    // 如果值没有变化，直接返回
    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      return { success: true, updatedComponent: component }
    }

    // 更新属性值
    const updatedComponent = this.setPropertyValue(component, propertyPath, newValue)

    // 记录变更历史
    this.recordPropertyChange({
      componentId: component.id,
      propertyPath,
      oldValue,
      newValue,
      timestamp: Date.now(),
    })

    return { success: true, updatedComponent }
  }

  // 查找属性定义
  private findPropertyDefinition(
    componentType: string,
    propertyPath: string
  ): PropDefinition | undefined {
    const propertyDefinitions = this.getLayoutPropertyDefinitions(componentType)
    return propertyDefinitions.find(def => propertyPath.startsWith(def.name))
  }

  // 获取属性值
  private getPropertyValue(component: ComponentInstance, propertyPath: string): any {
    const parts = propertyPath.split('.')
    let current: any = component.props

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return undefined
      }
    }

    return current
  }

  // 设置属性值
  private setPropertyValue(
    component: ComponentInstance,
    propertyPath: string,
    newValue: any
  ): ComponentInstance {
    const parts = propertyPath.split('.')
    const rootProp = parts[0]
    const subProps = parts.slice(1)

    const updatedProps = { ...component.props }

    // 确保根属性存在
    if (!updatedProps[rootProp]) {
      updatedProps[rootProp] = {}
    }

    // 设置嵌套属性值
    let current: any = updatedProps[rootProp]
    for (let i = 0; i < subProps.length - 1; i++) {
      const part = subProps[i]
      if (!current[part] || typeof current[part] !== 'object') {
        current[part] = {}
      }
      current = current[part]
    }

    const finalProp = subProps[subProps.length - 1]
    current[finalProp] = newValue

    return {
      ...component,
      props: updatedProps,
      updated_at: new Date().toISOString(),
      version: component.version + 1,
    }
  }

  // 批量更新属性
  public updateComponentProperties(
    component: ComponentInstance,
    updates: Record<string, any>
  ): { success: boolean; updatedComponent?: ComponentInstance; errors?: string[] } {
    let updatedComponent = { ...component }
    const errors: string[] = []

    for (const [propertyPath, newValue] of Object.entries(updates)) {
      const result = this.updateComponentProperty(updatedComponent, propertyPath, newValue)
      if (result.success && result.updatedComponent) {
        updatedComponent = result.updatedComponent
      } else {
        errors.push(result.error || `更新属性 ${propertyPath} 失败`)
      }
    }

    return {
      success: errors.length === 0,
      updatedComponent: errors.length === 0 ? updatedComponent : undefined,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  // 记录属性变更历史
  private recordPropertyChange(change: PropertyValueChange): void {
    this.changeHistory.push(change)

    // 限制历史记录大小
    if (this.changeHistory.length > 1000) {
      this.changeHistory.shift()
    }
  }

  // 获取变更历史
  public getChangeHistory(componentId?: string): PropertyValueChange[] {
    if (componentId) {
      return this.changeHistory.filter(change => change.componentId === componentId)
    }
    return [...this.changeHistory]
  }

  // 清除变更历史
  public clearChangeHistory(): void {
    this.changeHistory = []
  }

  // 获取属性分组
  public getPropertyGroups(componentType: string): Record<string, PropDefinition[]> {
    const propertyDefinitions = this.getLayoutPropertyDefinitions(componentType)
    const groups: Record<string, PropDefinition[]> = {}

    propertyDefinitions.forEach(property => {
      const group = property.group || '其他'
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(property)
    })

    return groups
  }

  // 重置组件属性为默认值
  public resetComponentProperties(component: ComponentInstance): ComponentInstance {
    const propertyDefinitions = this.getLayoutPropertyDefinitions(component.component_type)
    const defaultProps: any = {}

    propertyDefinitions.forEach(property => {
      if (property.default !== undefined) {
        const parts = property.name.split('.')
        let current = defaultProps

        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i]
          if (!current[part]) {
            current[part] = {}
          }
          current = current[part]
        }

        current[parts[parts.length - 1]] = property.default
      }
    })

    return {
      ...component,
      props: { ...component.props, ...defaultProps },
      updated_at: new Date().toISOString(),
      version: component.version + 1,
    }
  }
}

// 导出单例实例
export const layoutPropertyEditors = new LayoutPropertyEditors()

// 导出工具函数
export const getLayoutPropertyDefinitions = (componentType: string) => {
  return layoutPropertyEditors.getLayoutPropertyDefinitions(componentType)
}

export const updateLayoutProperty = (
  component: ComponentInstance,
  propertyPath: string,
  newValue: any
) => {
  return layoutPropertyEditors.updateComponentProperty(component, propertyPath, newValue)
}

export const validateLayoutProperty = (propertyDefinition: PropDefinition, value: any) => {
  return layoutPropertyEditors.validatePropertyValue(propertyDefinition, value)
}
