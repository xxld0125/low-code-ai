/**
 * 组件定义类型转换工具
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 * 描述: 将简化版组件定义转换为完整版组件定义
 */

import type {
  ComponentDefinition as SimpleComponentDefinition,
} from '@/types/lowcode/property'
import type {
  ComponentDefinition as FullComponentDefinition,
  ComponentConstraints,
  ValidationRule,
  PropSchema,
  ComponentStyles,
  EditorConfig,
  ValidationRule as RegistryValidationRule,
} from './types'
import {
  ComponentCategory,
  ComponentStatus,
  Breakpoint,
  PropType,
  PropCategory,
} from './types'

/**
 * 将简化版组件定义转换为完整版组件定义
 * @param simpleDef 简化版组件定义
 * @returns 完整版组件定义
 */
export function convertToFullComponentDefinition(
  simpleDef: SimpleComponentDefinition<any, any>
): FullComponentDefinition {
  const now = new Date()
  const category = convertCategory(simpleDef.category)

  // 创建完整的组件定义
  const fullDef: FullComponentDefinition = {
    // 基础标识
    id: `component-${simpleDef.category}-${simpleDef.type}`,
    name: simpleDef.name,
    description: simpleDef.description,
    version: '1.0.0',
    author: 'system',

    // 分类信息
    category,
    tags: extractTags(simpleDef),

    // 组件实现路径
    componentPath: getComponentPath(simpleDef.type, simpleDef.category),
    previewPath: getPreviewPath(simpleDef.type, simpleDef.category),
    iconPath: getIconPath(simpleDef.type, simpleDef.category),

    // 属性配置
    propsSchema: convertPropertiesToPropSchema(simpleDef.properties, simpleDef.type),
    defaultProps: simpleDef.default_props || {},
    defaultStyles: getDefaultStyles(simpleDef.category),

    // 约束和验证
    constraints: getDefaultConstraints(simpleDef.category),
    validationRules: convertValidationRules(simpleDef.properties),

    // 状态管理
    status: ComponentStatus.ACTIVE,

    // 元数据
    createdAt: now,
    updatedAt: now,
    createdBy: 'system',
    updatedBy: 'system',
  }

  return fullDef
}

/**
 * 转换分类枚举
 */
function convertCategory(category: string): ComponentCategory {
  switch (category) {
    case 'basic':
      return ComponentCategory.BASIC
    case 'display':
      return ComponentCategory.DISPLAY
    case 'layout':
      return ComponentCategory.LAYOUT
    case 'form':
      return ComponentCategory.FORM
    default:
      return ComponentCategory.CUSTOM
  }
}

/**
 * 从组件定义中提取标签
 */
function extractTags(simpleDef: SimpleComponentDefinition<any, any>): string[] {
  const tags: string[] = []

  // 基于分类的基础标签
  tags.push(simpleDef.category)

  // 基于类型的标签
  if (simpleDef.type) {
    tags.push(simpleDef.type)
  }

  // 从属性中提取更多标签
  if (simpleDef.properties) {
    for (const prop of simpleDef.properties) {
      if (prop.type === 'icon') {
        tags.push('icon')
      }
      if (prop.type === 'image') {
        tags.push('image')
      }
      if (prop.type === 'color') {
        tags.push('color')
      }
    }
  }

  return [...new Set(tags)] // 去重
}

/**
 * 获取组件路径
 */
function getComponentPath(type: string, category: string): string {
  return `/components/lowcode/${category}/${type}/${type}.tsx`
}

/**
 * 获取预览组件路径
 */
function getPreviewPath(type: string, category: string): string {
  return `/components/lowcode/${category}/${type}/Preview.tsx`
}

/**
 * 获取图标组件路径
 */
function getIconPath(type: string, category: string): string {
  return `/components/lowcode/${category}/${type}/Icon.tsx`
}

/**
 * 将属性定义转换为属性模式
 */
function convertPropertiesToPropSchema(
  properties: any[],
  componentType: string
): PropSchema[] {
  return properties.map((prop, index) => {
    const now = new Date()

    return {
      id: `${componentType}_${prop.key}`,
      componentId: `component-${componentType}`,

      // 基础属性
      name: prop.key,
      type: convertPropertyType(prop.type),
      label: prop.label,
      description: prop.description,
      required: prop.required || false,
      defaultValue: prop.default,

      // 分组和显示
      group: prop.group || '基础属性',
      category: getPropertyCategory(prop.group),
      order: prop.order || index,

      // 选项
      options: prop.options?.map((opt: any) => ({
        value: opt.value,
        label: opt.label,
        description: opt.description,
        disabled: opt.disabled,
        group: opt.group,
      })),

      // 验证规则
      validation: convertValidationRule(prop.validation),

      // 编辑器配置
      editorConfig: getEditorConfig(prop),

      // 响应式支持
      responsive: isResponsiveProperty(prop.key),

      // 时间戳
      createdAt: now,
      updatedAt: now,
    }
  })
}

/**
 * 转换属性类型
 */
function convertPropertyType(type: string): PropType {
  const typeMap: Record<string, PropType> = {
    string: PropType.STRING,
    number: PropType.NUMBER,
    boolean: PropType.BOOLEAN,
    select: PropType.SELECT,
    multiselect: PropType.MULTI_SELECT,
    color: PropType.COLOR,
    image: PropType.STRING,
    icon: PropType.STRING,
    spacing: PropType.SPACING,
    border: PropType.BORDER,
    array: PropType.ARRAY,
    object: PropType.OBJECT,
    custom: PropType.STRING,
  }

  return typeMap[type] || PropType.STRING
}

/**
 * 获取属性类别
 */
function getPropertyCategory(group?: string): PropCategory {
  if (!group) return PropCategory.BASIC

  const groupLower = group.toLowerCase()

  if (groupLower.includes('基础') || groupLower.includes('basic')) {
    return PropCategory.BASIC
  }
  if (groupLower.includes('样式') || groupLower.includes('style')) {
    return PropCategory.STYLE
  }
  if (groupLower.includes('布局') || groupLower.includes('layout')) {
    return PropCategory.LAYOUT
  }
  if (groupLower.includes('事件') || groupLower.includes('event')) {
    return PropCategory.EVENT
  }

  return PropCategory.ADVANCED
}

/**
 * 转换验证规则
 */
function convertValidationRule(validation?: any[]): ValidationRule[] {
  if (!validation) return []

  return validation.map((rule) => ({
    name: rule.type,
    type: getValidationRuleType(rule.type),
    condition: rule.condition,
    message: rule.message,
    severity: rule.severity || 'error',
    async: rule.async || false,
  }))
}

/**
 * 获取验证规则类型
 */
function getValidationRuleType(type: string): 'required' | 'type' | 'format' | 'range' | 'custom' {
  const typeMap: Record<string, 'required' | 'type' | 'format' | 'range' | 'custom'> = {
    required: 'required',
    min_length: 'range',
    max_length: 'range',
    min_value: 'range',
    max_value: 'range',
    pattern: 'format',
    email: 'format',
    url: 'format',
    custom: 'custom',
  }

  return typeMap[type] || 'custom'
}

/**
 * 获取编辑器配置
 */
function getEditorConfig(prop: any): EditorConfig {
  const baseConfig: EditorConfig = {
    widget: getWidgetType(prop.type),
    label: prop.label,
    description: prop.description,
    placeholder: prop.placeholder,
  }

  // 添加选项
  if (prop.options) {
    baseConfig.options = prop.options.map((opt: any) => ({
      value: opt.value,
      label: opt.label,
      description: opt.description,
      disabled: opt.disabled,
      group: opt.group,
    }))
  }

  // 添加约束
  if (prop.min !== undefined) baseConfig.min = prop.min
  if (prop.max !== undefined) baseConfig.max = prop.max
  if (prop.maxLength !== undefined) baseConfig.maxLength = prop.maxLength

  return baseConfig
}

/**
 * 获取控件类型
 */
function getWidgetType(propertyType: string): EditorConfig['widget'] {
  const widgetMap: Record<string, EditorConfig['widget']> = {
    string: 'input',
    number: 'input',
    boolean: 'checkbox',
    select: 'select',
    multiselect: 'select',
    color: 'color',
    image: 'file',
    icon: 'custom',
    spacing: 'custom',
    border: 'custom',
    array: 'custom',
    object: 'custom',
    custom: 'custom',
  }

  return widgetMap[propertyType] || 'input'
}

/**
 * 判断是否为响应式属性
 */
function isResponsiveProperty(key: string): boolean {
  const responsiveKeys = ['width', 'height', 'margin', 'padding', 'spacing']
  return responsiveKeys.some(responsiveKey => key.toLowerCase().includes(responsiveKey))
}

/**
 * 获取默认样式
 */
function getDefaultStyles(category: string): ComponentStyles {
  const baseStyles: ComponentStyles = {
    display: 'block',
  }

  switch (category) {
    case 'layout':
      return {
        ...baseStyles,
        width: '100%',
      }
    case 'basic':
      return {
        ...baseStyles,
      }
    case 'display':
      return {
        ...baseStyles,
      }
    default:
      return baseStyles
  }
}

/**
 * 获取默认约束
 */
function getDefaultConstraints(category: string): ComponentConstraints {
  const baseConstraints: ComponentConstraints = {
    canHaveChildren: false,
    canDrag: true,
    canResize: true,
    canDelete: true,
    canCopy: true,
    canEdit: true,
  }

  switch (category) {
    case 'layout':
      return {
        ...baseConstraints,
        canHaveChildren: true,
      }
    default:
      return baseConstraints
  }
}

/**
 * 转换验证规则为注册系统格式
 */
function convertValidationRules(properties: any[]): RegistryValidationRule[] {
  const rules: RegistryValidationRule[] = []

  properties.forEach(prop => {
    if (prop.validation) {
      prop.validation.forEach((validation: any) => {
        rules.push({
          name: `${prop.key}_${validation.type}`,
          type: getValidationRuleType(validation.type),
          condition: validation.condition,
          message: validation.message,
          severity: validation.severity || 'error',
          async: validation.async || false,
        })
      })
    }
  })

  return rules
}