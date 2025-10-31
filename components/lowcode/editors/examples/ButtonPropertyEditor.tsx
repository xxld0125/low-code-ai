/**
 * 按钮属性编辑器示例
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 更新日期: 2025-10-30 (适配新的FieldDefinition类型)
 */

import React from 'react'
import { PropertyEditor } from '../PropertyEditor'
import { FieldDefinition } from '@/lib/lowcode/types/editor'
import { ComponentProps } from '@/types/lowcode/component'

// 按钮属性定义
export const buttonPropertyDefinitions: FieldDefinition[] = [
  // 基础属性组
  {
    name: 'text',
    label: '按钮文本',
    type: 'text',
    required: true,
    default_value: '点击按钮',
    description: '按钮上显示的文本内容',
    placeholder: '请输入按钮文本',
  },
  {
    name: 'variant',
    label: '按钮样式',
    type: 'select',
    default_value: 'primary',
    description: '选择按钮的视觉样式',
    options: [
      { value: 'primary', label: '主要按钮', description: '用于主要操作' },
      { value: 'secondary', label: '次要按钮', description: '用于次要操作' },
      { value: 'outline', label: '边框按钮', description: '仅显示边框' },
      { value: 'ghost', label: '幽灵按钮', description: '悬停时显示背景' },
      { value: 'link', label: '链接按钮', description: '样式类似链接' },
    ],
  },
  {
    name: 'size',
    label: '按钮大小',
    type: 'select',
    default_value: 'md',
    description: '选择按钮的尺寸',
    options: [
      { value: 'sm', label: '小号', description: '紧凑的小按钮' },
      { value: 'md', label: '中号', description: '标准大小的按钮' },
      { value: 'lg', label: '大号', description: '突出的大按钮' },
      { value: 'icon', label: '图标按钮', description: '仅显示图标的按钮' },
    ],
  },
  {
    name: 'disabled',
    label: '禁用状态',
    type: 'switch',
    default_value: false,
    description: '是否禁用按钮',
  },
  {
    name: 'loading',
    label: '加载状态',
    type: 'switch',
    default_value: false,
    description: '是否显示加载动画',
  },
  // 样式属性组
  {
    name: 'backgroundColor',
    label: '背景色',
    type: 'color',
    description: '按钮的背景颜色',
  },
  {
    name: 'textColor',
    label: '文字颜色',
    type: 'color',
    description: '按钮文字的颜色',
  },
  {
    name: 'borderRadius',
    label: '圆角大小',
    type: 'border-radius',
    default_value: '6px',
    description: '按钮的圆角大小',
  },
  {
    name: 'padding',
    label: '内边距',
    type: 'spacing',
    default_value: '8px 16px',
    description: '按钮的内边距',
  },
  {
    name: 'hasShadow',
    label: '显示阴影',
    type: 'switch',
    default_value: false,
    description: '是否为按钮添加阴影效果',
  },
  {
    name: 'shadowType',
    label: '阴影样式',
    type: 'shadow',
    default_value: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    description: '按钮的阴影效果',
  },
  // 高级属性组
  {
    name: 'type',
    label: '按钮类型',
    type: 'select',
    default_value: 'button',
    description: 'HTML按钮类型',
    options: [
      { value: 'button', label: '按钮', description: '普通按钮' },
      { value: 'submit', label: '提交', description: '表单提交按钮' },
      { value: 'reset', label: '重置', description: '表单重置按钮' },
    ],
  },
  {
    name: 'ariaLabel',
    label: '无障碍标签',
    type: 'text',
    description: '屏幕阅读器识别的标签',
    placeholder: '请输入无障碍标签',
  },
]

// 按钮属性编辑器组件
export const ButtonPropertyEditor: React.FC<{
  componentId: string
  properties: ComponentProps
  onPropertyChange: (event: { propertyKey: string; value: unknown; oldValue?: unknown }) => void
}> = ({ componentId, properties, onPropertyChange }) => {
  // 适配器函数，转换事件格式
  const handlePropertyChange = (event: any) => {
    onPropertyChange({
      propertyKey: event.propertyKey || event.property_key,
      value: event.value,
      oldValue: event.oldValue || event.previous_value,
    })
  }

  return (
    <PropertyEditor
      componentType="button"
      componentId={componentId}
      properties={properties}
      propertyDefinitions={buttonPropertyDefinitions}
      onPropertyChange={handlePropertyChange}
      showGroups={true}
      collapsibleGroups={true}
    />
  )
}

export default ButtonPropertyEditor