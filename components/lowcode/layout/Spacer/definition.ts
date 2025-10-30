/**
 * Spacer 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Spacer } from './Spacer'
import { SpacerPreview } from './Preview'

export const SpacerDefinition: ComponentDefinition<any> = {
  type: 'spacer',
  name: '间距',
  category: 'layout',
  description: '间距组件，用于在元素之间创建空间',
  icon: 'Space',

  // 组件实现
  component: Spacer,
  preview: SpacerPreview,

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
      key: 'size',
      label: '间距大小',
      type: 'select',
      default: 'md',
      options: [
        { value: 'xs', label: '超小 (4px)' },
        { value: 'sm', label: '小 (8px)' },
        { value: 'md', label: '中等 (16px)' },
        { value: 'lg', label: '大 (24px)' },
        { value: 'xl', label: '超大 (32px)' },
      ],
    },
    {
      key: 'direction',
      label: '间距方向',
      type: 'select',
      default: 'vertical',
      options: [
        { value: 'vertical', label: '垂直' },
        { value: 'horizontal', label: '水平' },
        { value: 'both', label: '双向' },
      ],
    },
    {
      key: 'flexible',
      label: '弹性间距',
      type: 'boolean',
      default: false,
    },
  ],

  // 预览属性
  preview_props: {
    size: 'md',
    direction: 'vertical',
  },

  // 示例
  examples: [
    {
      name: '小间距',
      props: {
        size: 'sm',
        direction: 'vertical',
      },
    },
    {
      name: '水平间距',
      props: {
        size: 'md',
        direction: 'horizontal',
      },
    },
  ],
}