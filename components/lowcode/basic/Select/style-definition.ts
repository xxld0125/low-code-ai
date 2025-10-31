/**
 * Select 组件样式定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import type { ComponentStyleDefinition, StyleGroup, StylePropertyDefinition } from '@/lib/lowcode/types/editor'

// 选择框样式属性定义
const selectStyleProperties: StylePropertyDefinition[] = [
  // 布局属性
  {
    id: 'width',
    name: 'width',
    label: '宽度',
    type: 'size',
    category: 'layout',
    default_value: '100%',
    description: '选择框的宽度',
    config: {
      min: 0,
      max: 1200,
      step: 1,
      units: ['px', '%', 'rem', 'em'],
      defaultUnit: 'px',
      allowAuto: true,
      presets: [
        { label: '自动', value: 'auto' },
        { label: '全宽', value: '100%' },
        { label: '小', value: '150px' },
        { label: '中', value: '200px' },
        { label: '大', value: '300px' },
      ],
    },
  },
  {
    id: 'height',
    name: 'height',
    label: '高度',
    type: 'size',
    category: 'layout',
    default_value: '40px',
    description: '选择框的高度',
    config: {
      min: 20,
      max: 100,
      step: 1,
      units: ['px', 'rem', 'em'],
      defaultUnit: 'px',
      allowAuto: true,
      presets: [
        { label: '自动', value: 'auto' },
        { label: '小', value: '32px' },
        { label: '默认', value: '40px' },
        { label: '大', value: '48px' },
        { label: '超大', value: '56px' },
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
    description: '选择框的外边距',
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
    id: 'padding',
    name: 'padding',
    label: '内边距',
    type: 'spacing',
    category: 'spacing',
    default_value: '8px 12px',
    description: '选择框的内边距',
    config: {
      presets: [
        { label: '紧凑', value: '4px 8px' },
        { label: '默认', value: '8px 12px' },
        { label: '宽松', value: '12px 16px' },
        { label: '很宽', value: '16px 20px' },
      ],
    },
  },

  // 字体属性
  {
    id: 'fontSize',
    name: 'fontSize',
    label: '字体大小',
    type: 'font-size',
    category: 'typography',
    default_value: '14px',
    description: '选择框文字的大小',
    config: {
      min: 10,
      max: 32,
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
    description: '选择框文字的粗细',
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
    description: '选择框文字的字体',
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
    description: '选择框文字的颜色',
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
    id: 'backgroundColor',
    name: 'backgroundColor',
    label: '背景颜色',
    type: 'color',
    category: 'background',
    default_value: '#ffffff',
    description: '选择框的背景颜色',
    config: {
      allowAlpha: true,
      presets: [
        { label: '白色', value: '#ffffff', category: 'neutral' },
        { label: '浅灰', value: '#f9fafb', category: 'neutral' },
        { label: '透明', value: 'transparent', category: 'neutral' },
        { label: '主色浅', value: '#eff6ff', category: 'primary' },
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
    description: '选择框的边框样式',
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
    default_value: '6px',
    description: '选择框的圆角大小',
    config: {
      min: 0,
      max: 50,
      step: 1,
      units: ['px', '%', 'rem'],
      defaultUnit: 'px',
      presets: [
        { label: '无', value: '0' },
        { label: '小', value: '4px' },
        { label: '默认', value: '6px' },
        { label: '中', value: '8px' },
        { label: '大', value: '12px' },
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
    description: '选择框的阴影效果',
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
    description: '选择框的透明度',
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
    description: '选择框的过渡动画效果',
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
const selectStyleGroups: StyleGroup[] = [
  {
    id: 'layout',
    name: '布局',
    properties: selectStyleProperties.filter(prop => prop.category === 'layout'),
  },
  {
    id: 'spacing',
    name: '间距',
    properties: selectStyleProperties.filter(prop => prop.category === 'spacing'),
  },
  {
    id: 'typography',
    name: '字体',
    properties: selectStyleProperties.filter(prop => prop.category === 'typography'),
  },
  {
    id: 'colors',
    name: '颜色',
    properties: selectStyleProperties.filter(prop => prop.category === 'color' || prop.category === 'background'),
  },
  {
    id: 'border',
    name: '边框',
    properties: selectStyleProperties.filter(prop => prop.category === 'border'),
  },
  {
    id: 'effects',
    name: '效果',
    properties: selectStyleProperties.filter(prop => prop.category === 'shadow' || prop.category === 'effects'),
  },
]

// Select组件样式定义
export const SelectStyleDefinition: ComponentStyleDefinition = {
  id: 'select-style',
  name: 'Select',
  category: 'basic',
  style_schema: {
    groups: selectStyleGroups,
  },
  properties: selectStyleProperties,
  defaultStyles: {
    width: '100%',
    height: '40px',
    margin: '0',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 'normal',
    fontFamily: 'inherit',
    color: '#374151',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: 'none',
    opacity: 1,
    transition: 'all 0.15s ease-in-out',
  },
}

export default SelectStyleDefinition