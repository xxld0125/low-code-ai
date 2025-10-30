/**
 * Divider 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Divider } from './Divider'
import { DividerPreview } from './Preview'

export const DividerDefinition: ComponentDefinition<any> = {
  type: 'divider',
  name: '分割线',
  category: 'layout',
  description: '分割线组件，用于分隔内容区域',
  icon: 'Minus',

  // 组件实现
  component: Divider,
  preview: DividerPreview,

  // 默认属性
  default_props: {
    id: '',
    props: {},
    styles: {},
    isSelected: false,
    isDragging: false,
  },

  // 属性定义
  properties: [
    {
      key: 'orientation',
      label: '方向',
      type: 'select',
      default: 'horizontal',
      options: [
        { value: 'horizontal', label: '水平' },
        { value: 'vertical', label: '垂直' },
      ],
    },
    {
      key: 'type',
      label: '线条类型',
      type: 'select',
      default: 'solid',
      options: [
        { value: 'solid', label: '实线' },
        { value: 'dashed', label: '虚线' },
        { value: 'dotted', label: '点线' },
      ],
    },
    {
      key: 'color',
      label: '颜色',
      type: 'color',
      default: '#e5e7eb',
    },
    {
      key: 'size',
      label: '粗细',
      type: 'number',
      default: 1,
      min: 1,
      max: 10,
    },
  ],

  // 预览属性
  preview_props: {
    orientation: 'horizontal',
    type: 'solid',
  },

  // 示例
  examples: [
    {
      name: '水平分割线',
      props: {
        orientation: 'horizontal',
        type: 'solid',
      },
    },
    {
      name: '垂直分割线',
      props: {
        orientation: 'vertical',
        type: 'dashed',
      },
    },
  ],
}