/**
 * 按钮属性编辑器示例
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { PropertyEditor } from '../PropertyEditor'
import { PropertyDefinition } from '@/types/lowcode/property'
import { ComponentProps } from '@/types/lowcode/component'

// 按钮属性定义
export const buttonPropertyDefinitions: PropertyDefinition[] = [
  // 基础属性组
  {
    key: 'text',
    type: 'string',
    label: '按钮文本',
    description: '按钮上显示的文本内容',
    required: true,
    default: '点击按钮',
    group: '基础属性',
    order: 1,
    validation: [
      { type: 'required', message: '按钮文本不能为空' },
      { type: 'max_length', params: { maxLength: 20 }, message: '按钮文本不能超过20个字符' },
    ],
  },
  {
    key: 'variant',
    type: 'select',
    label: '按钮样式',
    description: '选择按钮的视觉样式',
    default: 'primary',
    group: '基础属性',
    order: 2,
    options: [
      { value: 'primary', label: '主要按钮', description: '用于主要操作' },
      { value: 'secondary', label: '次要按钮', description: '用于次要操作' },
      { value: 'outline', label: '边框按钮', description: '仅显示边框' },
      { value: 'ghost', label: '幽灵按钮', description: '悬停时显示背景' },
      { value: 'link', label: '链接按钮', description: '样式类似链接' },
    ],
  },
  {
    key: 'size',
    type: 'select',
    label: '按钮大小',
    description: '选择按钮的尺寸',
    default: 'medium',
    group: '基础属性',
    order: 3,
    options: [
      { value: 'small', label: '小' },
      { value: 'medium', label: '中' },
      { value: 'large', label: '大' },
    ],
  },
  {
    key: 'disabled',
    type: 'boolean',
    label: '禁用状态',
    description: '是否禁用按钮',
    default: false,
    group: '基础属性',
    order: 4,
  },
  {
    key: 'loading',
    type: 'boolean',
    label: '加载状态',
    description: '是否显示加载中状态',
    default: false,
    group: '基础属性',
    order: 5,
  },

  // 图标属性组
  {
    key: 'hasIcon',
    type: 'boolean',
    label: '显示图标',
    description: '是否在按钮中显示图标',
    default: false,
    group: '图标属性',
    order: 10,
  },
  {
    key: 'iconType',
    type: 'select',
    label: '图标类型',
    description: '选择要显示的图标',
    group: '图标属性',
    order: 11,
    conditional: {
      property: 'hasIcon',
      operator: 'equals',
      value: true,
    },
    options: [
      { value: 'arrow', label: '箭头图标' },
      { value: 'check', label: '勾选图标' },
      { value: 'close', label: '关闭图标' },
      { value: 'download', label: '下载图标' },
      { value: 'upload', label: '上传图标' },
      { value: 'edit', label: '编辑图标' },
      { value: 'delete', label: '删除图标' },
    ],
  },
  {
    key: 'iconPosition',
    type: 'select',
    label: '图标位置',
    description: '选择图标相对于文本的位置',
    default: 'left',
    group: '图标属性',
    order: 12,
    conditional: {
      property: 'hasIcon',
      operator: 'equals',
      value: true,
    },
    options: [
      { value: 'left', label: '左侧' },
      { value: 'right', label: '右侧' },
    ],
  },

  // 样式属性组
  {
    key: 'backgroundColor',
    type: 'color',
    label: '背景颜色',
    description: '自定义按钮的背景颜色',
    group: '样式属性',
    order: 20,
  },
  {
    key: 'textColor',
    type: 'color',
    label: '文本颜色',
    description: '自定义按钮的文本颜色',
    group: '样式属性',
    order: 21,
  },
  {
    key: 'borderColor',
    type: 'color',
    label: '边框颜色',
    description: '自定义按钮的边框颜色',
    group: '样式属性',
    order: 22,
  },
  {
    key: 'borderRadius',
    type: 'spacing',
    label: '圆角大小',
    description: '设置按钮的圆角大小',
    group: '样式属性',
    order: 23,
  },
  {
    key: 'padding',
    type: 'spacing',
    label: '内边距',
    description: '设置按钮的内边距',
    group: '样式属性',
    order: 24,
  },

  // 阴影属性组
  {
    key: 'hasShadow',
    type: 'boolean',
    label: '启用阴影',
    description: '是否为按钮添加阴影效果',
    default: false,
    group: '阴影属性',
    order: 30,
  },
  {
    key: 'shadowType',
    type: 'shadow',
    label: '阴影样式',
    description: '选择阴影的效果样式',
    default: 'md',
    group: '阴影属性',
    order: 31,
    conditional: {
      property: 'hasShadow',
      operator: 'equals',
      value: true,
    },
  },

  // 高级属性组
  {
    key: 'onClick',
    type: 'string',
    label: '点击事件',
    description: '按钮点击时触发的事件处理函数名',
    group: '高级属性',
    order: 40,
    validation: [
      {
        type: 'pattern',
        params: { pattern: '^[a-zA-Z_][a-zA-Z0-9_]*$' },
        message: '事件名必须是有效的函数名',
      },
    ],
  },
  {
    key: 'type',
    type: 'select',
    label: '按钮类型',
    description: '按钮在表单中的类型',
    default: 'button',
    group: '高级属性',
    order: 41,
    options: [
      { value: 'button', label: '普通按钮' },
      { value: 'submit', label: '提交按钮' },
      { value: 'reset', label: '重置按钮' },
    ],
  },
  {
    key: 'ariaLabel',
    type: 'string',
    label: '无障碍标签',
    description: '为屏幕阅读器提供的描述文本',
    group: '高级属性',
    order: 42,
    validation: [{ type: 'max_length', params: { maxLength: 100 } }],
  },
]

// 按钮属性编辑器示例组件
export const ButtonPropertyEditor: React.FC<{
  componentId: string
  properties: ComponentProps
  onPropertyChange: (event: any) => void
}> = ({ componentId, properties, onPropertyChange }) => {
  return (
    <PropertyEditor
      componentType="button"
      componentId={componentId}
      properties={properties}
      propertyDefinitions={buttonPropertyDefinitions}
      onPropertyChange={onPropertyChange}
      showGroups={true}
      collapsibleGroups={true}
      showValidation={true}
      showAdvancedToggle={true}
    />
  )
}

// 使用示例
export const ButtonPropertyEditorExample: React.FC = () => {
  const [properties, setProperties] = React.useState<ComponentProps>({
    button: {
      text: '点击按钮',
      variant: 'default' as any,
      size: 'default' as any,
      disabled: false,
      loading: false,
    },
  })

  const handlePropertyChange = (event: any) => {
    const { property_key, value } = event

    // 解析属性键名，支持嵌套属性
    const keys = property_key.split('.')
    const newProperties = { ...properties }

    if (keys.length === 1) {
      // 直接属性
      ;(newProperties as any)[keys[0]] = value
    } else if (keys.length === 2) {
      // 嵌套属性
      if (!(newProperties as any)[keys[0]]) {
        ;(newProperties as any)[keys[0]] = {}
      }
      ;(newProperties as any)[keys[0]] = {
        ...(newProperties as any)[keys[0]],
        [keys[1]]: value,
      }
    }

    setProperties(newProperties)
    console.log('属性变更:', event)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-4">
        <h3 className="text-lg font-medium">按钮属性编辑器示例</h3>
        <p className="text-sm text-muted-foreground">
          这个示例展示了如何使用属性编辑器来配置按钮组件的各种属性。
        </p>
      </div>

      <ButtonPropertyEditor
        componentId="button-example"
        properties={properties}
        onPropertyChange={handlePropertyChange}
      />

      <div className="mt-6 rounded-md border bg-muted/50 p-4">
        <h4 className="mb-2 text-sm font-medium">当前属性值:</h4>
        <pre className="max-h-40 overflow-auto text-xs">{JSON.stringify(properties, null, 2)}</pre>
      </div>
    </div>
  )
}
