/**
 * Checkbox 组件样式定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import type { ComponentStyleDefinition, StyleGroup, StylePropertyDefinition } from '@/lib/lowcode/types/editor'

// 复选框样式属性定义
const checkboxStyleProperties: StylePropertyDefinition[] = [
  // 复选框尺寸
  {
    id: 'checkboxSize',
    name: 'checkboxSize',
    label: '复选框大小',
    type: 'size',
    category: 'layout',
    default_value: '16px',
    description: '复选框的大小',
    config: {
      min: 12,
      max: 32,
      step: 1,
      units: ['px', 'rem'],
      defaultUnit: 'px',
      presets: [
        { label: '小', value: '12px' },
        { label: '默认', value: '16px' },
        { label: '中', value: '20px' },
        { label: '大', value: '24px' },
        { label: '很大', value: '28px' },
      ],
    },
  },

  // 间距属性
  {
    id: 'margin',
    name: 'margin',
    label: '外边距',
    type: 'spacing',
    category: 'spacing',
    default_value: '0',
    description: '复选框容器的外边距',
    config: {
      allowNegative: true,
      presets: [
        { label: '无', value: '0' },
        { label: '小', value: '4px' },
        { label: '中', value: '8px' },
        { label: '大', value: '16px' },
      ],
    },
  },
  {
    id: 'gap',
    name: 'gap',
    label: '间距',
    type: 'spacing',
    category: 'spacing',
    default_value: '8px',
    description: '复选框与标签之间的间距',
    config: {
      presets: [
        { label: '紧凑', value: '4px' },
        { label: '默认', value: '8px' },
        { label: '宽松', value: '12px' },
        { label: '很宽', value: '16px' },
      ],
    },
  },

  // 字体属性（标签文字）
  {
    id: 'fontSize',
    name: 'fontSize',
    label: '字体大小',
    type: 'font-size',
    category: 'typography',
    default_value: '14px',
    description: '标签文字的大小',
    config: {
      min: 10,
      max: 24,
      step: 1,
      units: ['px', 'rem', 'em'],
      defaultUnit: 'px',
      presets: [
        { label: '很小', value: '12px' },
        { label: '小', value: '14px' },
        { label: '默认', value: '16px' },
        { label: '大', value: '18px' },
        { label: '很大', value: '20px' },
      ],
    },
  },
  {
    id: 'fontWeight',
    name: 'fontWeight',
    label: '字体粗细',
    type: 'font-weight',
    category: 'typography',
    default_value: 'normal',
    description: '标签文字的粗细',
    config: {
      presets: [
        { label: '细', value: '300' },
        { label: '正常', value: '400' },
        { label: '中等', value: '500' },
        { label: '粗', value: '600' },
        { label: '很粗', value: '700' },
      ],
    },
  },
  {
    id: 'fontFamily',
    name: 'fontFamily',
    label: '字体',
    type: 'text',
    category: 'typography',
    default_value: 'inherit',
    description: '标签文字的字体',
    config: {
      presets: [
        { label: '继承', value: 'inherit' },
        { label: '无衬线', value: 'sans-serif' },
        { label: '衬线', value: 'serif' },
        { label: '等宽', value: 'monospace' },
      ],
    },
  },

  // 颜色属性
  {
    id: 'color',
    name: 'color',
    label: '文字颜色',
    type: 'color',
    category: 'color',
    default_value: '#374151',
    description: '标签文字的颜色',
    config: {
      allowAlpha: false,
      presets: [
        { label: '默认', value: '#374151', category: 'neutral' },
        { label: '白色', value: '#ffffff', category: 'neutral' },
        { label: '黑色', value: '#000000', category: 'neutral' },
        { label: '主色', value: '#3b82f6', category: 'primary' },
        { label: '成功', value: '#10b981', category: 'success' },
        { label: '警告', value: '#f59e0b', category: 'warning' },
        { label: '错误', value: '#ef4444', category: 'error' },
      ],
    },
  },
  {
    id: 'checkboxColor',
    name: 'checkboxColor',
    label: '复选框颜色',
    type: 'color',
    category: 'color',
    default_value: '#3b82f6',
    description: '复选框选中时的颜色',
    config: {
      allowAlpha: false,
      presets: [
        { label: '主色', value: '#3b82f6', category: 'primary' },
        { label: '成功', value: '#10b981', category: 'success' },
        { label: '警告', value: '#f59e0b', category: 'warning' },
        { label: '错误', value: '#ef4444', category: 'error' },
        { label: '深灰', value: '#374151', category: 'neutral' },
      ],
    },
  },
  {
    id: 'borderColor',
    name: 'borderColor',
    label: '边框颜色',
    type: 'color',
    category: 'color',
    default_value: '#d1d5db',
    description: '复选框的边框颜色',
    config: {
      allowAlpha: false,
      presets: [
        { label: '默认', value: '#d1d5db', category: 'neutral' },
        { label: '浅灰', value: '#e5e7eb', category: 'neutral' },
        { label: '中灰', value: '#9ca3af', category: 'neutral' },
        { label: '深灰', value: '#6b7280', category: 'neutral' },
      ],
    },
  },
  {
    id: 'checkmarkColor',
    name: 'checkmarkColor',
    label: '勾选标记颜色',
    type: 'color',
    category: 'color',
    default_value: '#ffffff',
    description: '勾选标记的颜色',
    config: {
      allowAlpha: false,
      presets: [
        { label: '白色', value: '#ffffff', category: 'neutral' },
        { label: '黑色', value: '#000000', category: 'neutral' },
      ],
    },
  },

  // 边框属性
  {
    id: 'border',
    name: 'border',
    label: '边框',
    type: 'border',
    category: 'border',
    default_value: '1px solid #d1d5db',
    description: '复选框的边框样式',
    config: {
      allowRadius: true,
      presets: [
        { label: '默认', value: '1px solid #d1d5db' },
        { label: '无边框', value: 'none' },
        { label: '细线', value: '1px solid #e5e7eb' },
        { label: '粗线', value: '2px solid #d1d5db' },
        { label: '虚线', value: '1px dashed #d1d5db' },
        { label: '点线', value: '1px dotted #d1d5db' },
      ],
    },
  },
  {
    id: 'borderRadius',
    name: 'borderRadius',
    label: '圆角',
    type: 'border-radius',
    category: 'border',
    default_value: '4px',
    description: '复选框的圆角大小',
    config: {
      min: 0,
      max: 20,
      step: 1,
      units: ['px', '%', 'rem'],
      defaultUnit: 'px',
      presets: [
        { label: '无', value: '0' },
        { label: '小', value: '2px' },
        { label: '默认', value: '4px' },
        { label: '中', value: '6px' },
        { label: '大', value: '8px' },
        { label: '圆', value: '50%' },
      ],
    },
  },

  // 阴影属性
  {
    id: 'boxShadow',
    name: 'boxShadow',
    label: '阴影',
    type: 'shadow',
    category: 'shadow',
    default_value: 'none',
    description: '复选框的阴影效果',
    config: {
      presets: [
        { label: '无', value: 'none' },
        { label: '小', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
        { label: '默认', value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' },
        { label: '中', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' },
        { label: '大', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
      ],
    },
  },

  // 其他视觉效果
  {
    id: 'opacity',
    name: 'opacity',
    label: '透明度',
    type: 'slider',
    category: 'effects',
    default_value: 1,
    description: '复选框的透明度',
    config: {
      min: 0,
      max: 1,
      step: 0.1,
      presets: [
        { label: '完全透明', value: 0 },
        { label: '半透明', value: 0.5 },
        { label: '不透明', value: 1 },
      ],
    },
  },
  {
    id: 'transition',
    name: 'transition',
    label: '过渡动画',
    type: 'text',
    category: 'effects',
    default_value: 'all 0.15s ease-in-out',
    description: '复选框的过渡动画效果',
    config: {
      presets: [
        { label: '无', value: 'none' },
        { label: '快速', value: 'all 0.1s ease-in-out' },
        { label: '默认', value: 'all 0.15s ease-in-out' },
        { label: '慢速', value: 'all 0.3s ease-in-out' },
        { label: '仅颜色', value: 'color 0.15s ease-in-out' },
        { label: '仅边框', value: 'border-color 0.15s ease-in-out' },
        { label: '仅阴影', value: 'box-shadow 0.15s ease-in-out' },
      ],
    },
  },
]

// 样式分组定义
const checkboxStyleGroups: StyleGroup[] = [
  {
    id: 'layout',
    name: '布局',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'layout'),
  },
  {
    id: 'spacing',
    name: '间距',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'spacing'),
  },
  {
    id: 'typography',
    name: '字体',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'typography'),
  },
  {
    id: 'colors',
    name: '颜色',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'color'),
  },
  {
    id: 'border',
    name: '边框',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'border'),
  },
  {
    id: 'effects',
    name: '效果',
    properties: checkboxStyleProperties.filter(prop => prop.category === 'shadow' || prop.category === 'effects'),
  },
]

// Checkbox组件样式定义
export const CheckboxStyleDefinition: ComponentStyleDefinition = {
  id: 'checkbox-style',
  name: 'Checkbox',
  category: 'basic',
  style_schema: {
    groups: checkboxStyleGroups,
  },
  properties: checkboxStyleProperties,
  defaultStyles: {
    checkboxSize: '16px',
    margin: '0',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 'normal',
    fontFamily: 'inherit',
    color: '#374151',
    checkboxColor: '#3b82f6',
    borderColor: '#d1d5db',
    checkmarkColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    boxShadow: 'none',
    opacity: 1,
    transition: 'all 0.15s ease-in-out',
  },
}

export default CheckboxStyleDefinition