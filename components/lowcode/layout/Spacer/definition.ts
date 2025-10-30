/**
 * Spacer 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Spacer } from './Spacer'
import { SpacerPreview } from './Preview'
import { SpacerIcon } from './Icon'
import type { SpacerProps } from '@/types/lowcode/component'

export const SpacerDefinition: ComponentDefinition<SpacerProps> = {
  // 基础标识
  type: 'spacer',
  name: 'Spacer',
  category: 'layout',
  description: '间距组件，用于在元素之间创建可调节的空间',

  // 组件实现
  component: Spacer,
  preview: Spacer,
  icon: 'layout-spacer',

  // 属性定义
  properties: [
    {
      key: 'size',
      type: 'select',
      label: '间距大小',
      description: '间距的预设尺寸',
      required: false,
      default: 16,
      group: '基础属性',
      order: 1,
      options: [
        { value: 4, label: '超小 (4px)', description: '4像素间距' },
        { value: 8, label: '小 (8px)', description: '8像素间距' },
        { value: 16, label: '中等 (16px)', description: '16像素间距' },
        { value: 24, label: '大 (24px)', description: '24像素间距' },
        { value: 32, label: '超大 (32px)', description: '32像素间距' },
        { value: 48, label: '特大 (48px)', description: '48像素间距' },
        { value: 64, label: '巨大 (64px)', description: '64像素间距' },
      ],
    },
    {
      key: 'direction',
      type: 'select',
      label: '间距方向',
      description: '间距应用的方向',
      required: false,
      default: 'vertical',
      group: '基础属性',
      order: 2,
      options: [
        { value: 'vertical', label: '垂直', description: '垂直方向的间距' },
        { value: 'horizontal', label: '水平', description: '水平方向的间距' },
      ],
    },
    {
      key: 'flex_grow',
      type: 'boolean',
      label: '弹性间距',
      description: '是否使用弹性布局，自动填充剩余空间',
      required: false,
      default: false,
      group: '基础属性',
      order: 3,
    },
  ],

  // 默认属性
  default_props: {
    size: 16,
    direction: 'vertical',
    flex_grow: false,
  },

  // 预览属性
  preview_props: {
    size: 16,
    direction: 'vertical',
    flex_grow: false,
  },

  // 示例配置
  examples: [
    {
      name: '小间距',
      description: '8像素的小间距',
      props: {
        size: 8,
        direction: 'vertical',
      },
    },
    {
      name: '中等间距',
      description: '16像素的中等间距',
      props: {
        size: 16,
        direction: 'vertical',
      },
    },
    {
      name: '大间距',
      description: '32像素的大间距',
      props: {
        size: 32,
        direction: 'vertical',
      },
    },
    {
      name: '水平间距',
      description: '水平方向的间距',
      props: {
        size: 16,
        direction: 'horizontal',
      },
    },
    {
      name: '弹性间距',
      description: '自动填充剩余空间的弹性间距',
      props: {
        size: 16,
        direction: 'vertical',
        flex_grow: true,
      },
    },
  ],
}
