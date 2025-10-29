/**
 * Badge 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Badge } from './Badge'
import { BadgePreview } from './Preview'
import { BadgeIcon } from './Icon'
import type { LowcodeBadgeProps } from './Badge'
import type { BadgePreviewProps } from './Preview'

export const BadgeDefinition: ComponentDefinition<LowcodeBadgeProps, BadgePreviewProps> = {
  // 基础信息
  type: 'badge',
  name: 'Badge',
  category: 'display',
  description: '徽章组件，用于状态标识和标签显示',
  icon: 'badge',

  // 组件实现
  component: Badge,
  preview: BadgePreview,

  // 属性定义
  properties: [
    {
      key: 'content',
      type: 'string',
      label: '徽章内容',
      description: '徽章上显示的文本内容',
      required: true,
      default: '徽章',
      validation: [
        {
          type: 'required',
          message: '徽章内容不能为空',
        },
        {
          type: 'max_length',
          params: { max: 20 },
          message: '徽章内容不能超过20个字符',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'variant',
      type: 'select',
      label: '徽章样式',
      description: '徽章的颜色和样式变体',
      required: false,
      default: 'default',
      options: [
        {
          value: 'default',
          label: '默认',
          description: '蓝色背景的主要徽章',
        },
        {
          value: 'secondary',
          label: '次要',
          description: '灰色背景的次要徽章',
        },
        {
          value: 'destructive',
          label: '危险',
          description: '红色背景的危险徽章',
        },
        {
          value: 'outline',
          label: '轮廓',
          description: '透明背景带边框的徽章',
        },
      ],
      group: '样式属性',
      order: 2,
    },
    {
      key: 'size',
      type: 'select',
      label: '徽章大小',
      description: '徽章的尺寸大小',
      required: false,
      default: 'default',
      options: [
        {
          value: 'sm',
          label: '小',
          description: '小号徽章',
        },
        {
          value: 'default',
          label: '默认',
          description: '标准大小徽章',
        },
        {
          value: 'lg',
          label: '大',
          description: '大号徽章',
        },
      ],
      group: '样式属性',
      order: 3,
    },
    {
      key: 'rounded',
      type: 'select',
      label: '圆角样式',
      description: '徽章的圆角样式',
      required: false,
      default: 'full',
      options: [
        {
          value: 'none',
          label: '无圆角',
          description: '无圆角效果',
        },
        {
          value: 'sm',
          label: '小圆角',
          description: '小圆角效果',
        },
        {
          value: 'md',
          label: '中等圆角',
          description: '中等圆角效果',
        },
        {
          value: 'lg',
          label: '大圆角',
          description: '大圆角效果',
        },
        {
          value: 'full',
          label: '圆形',
          description: '完全圆形徽章',
        },
      ],
      group: '样式属性',
      order: 4,
    },
  ],

  // 默认属性
  default_props: {
    content: '徽章',
    variant: 'default',
    size: 'default',
    rounded: 'full',
  },

  // 预览属性
  preview_props: {
    content: '徽章',
    variant: 'default',
    size: 'default',
    rounded: 'full',
  },

  // 使用示例
  examples: [
    {
      content: '新',
      variant: 'default',
      size: 'sm',
      rounded: 'full',
    },
    {
      content: 'Beta',
      variant: 'secondary',
      size: 'default',
      rounded: 'md',
    },
    {
      content: '错误',
      variant: 'destructive',
      size: 'default',
      rounded: 'full',
    },
    {
      content: '可选',
      variant: 'outline',
      size: 'lg',
      rounded: 'sm',
    },
  ],
}
