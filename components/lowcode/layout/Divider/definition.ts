/**
 * Divider 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Divider } from './Divider'
import { DividerPreview } from './Preview'
import { DividerIcon } from './Icon'
import type { DividerProps } from '@/types/lowcode/component'

export const DividerDefinition: ComponentDefinition<DividerProps> = {
  // 基础标识
  type: 'divider',
  name: 'Divider',
  category: 'layout',
  description: '分割线组件，用于分隔内容区域，支持水平和垂直方向',

  // 组件实现
  component: Divider,
  preview: Divider,
  icon: 'layout-divider',

  // 属性定义
  properties: [
    {
      key: 'orientation',
      type: 'select',
      label: '方向',
      description: '分割线的方向，水平或垂直',
      required: false,
      default: 'horizontal',
      group: '基础属性',
      order: 1,
      options: [
        { value: 'horizontal', label: '水平', description: '水平分割线' },
        { value: 'vertical', label: '垂直', description: '垂直分割线' },
      ],
    },
    {
      key: 'thickness',
      type: 'number',
      label: '粗细',
      description: '分割线的粗细程度',
      required: false,
      default: 1,
      min: 1,
      max: 10,
      group: '样式',
      order: 2,
    },
    {
      key: 'color',
      type: 'color',
      label: '颜色',
      description: '分割线的颜色',
      required: false,
      default: '#e5e7eb',
      group: '样式',
      order: 3,
    },
    {
      key: 'style',
      type: 'select',
      label: '线条样式',
      description: '分割线的样式类型',
      required: false,
      default: 'solid',
      group: '样式',
      order: 4,
      options: [
        { value: 'solid', label: '实线', description: '实线样式' },
        { value: 'dashed', label: '虚线', description: '虚线样式' },
        { value: 'dotted', label: '点线', description: '点线样式' },
      ],
    },
    {
      key: 'length',
      type: 'string',
      label: '长度',
      description: '分割线的长度，可以是像素值或百分比',
      required: false,
      default: '100%',
      group: '样式',
      order: 5,
    },
  ],

  // 默认属性
  default_props: {
    orientation: 'horizontal',
    thickness: 1,
    color: '#e5e7eb',
    style: 'solid',
    length: '100%',
  },

  // 预览属性
  preview_props: {
    orientation: 'horizontal',
    thickness: 1,
    color: '#d1d5db',
    style: 'solid',
    length: '80%',
  },

  // 示例配置
  examples: [
    {
      name: '基础分割线',
      description: '简单的水平分割线',
      props: {
        orientation: 'horizontal',
        thickness: 1,
        color: '#e5e7eb',
        style: 'solid',
      },
    },
    {
      name: '垂直分割线',
      description: '垂直方向的分割线',
      props: {
        orientation: 'vertical',
        thickness: 1,
        color: '#d1d5db',
        style: 'solid',
        length: '100px',
      },
    },
    {
      name: '虚线分割线',
      description: '虚线样式的分割线',
      props: {
        orientation: 'horizontal',
        thickness: 1,
        color: '#9ca3af',
        style: 'dashed',
        length: '60%',
      },
    },
    {
      name: '粗分割线',
      description: '较粗的分割线用于重要分隔',
      props: {
        orientation: 'horizontal',
        thickness: 3,
        color: '#6b7280',
        style: 'solid',
        length: '100%',
      },
    },
  ],
}
