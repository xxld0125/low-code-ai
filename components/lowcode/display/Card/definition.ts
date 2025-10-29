/**
 * Card 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Card } from './Card'
import { CardPreview } from './Preview'
import { CardIcon } from './Icon'
import type { LowcodeCardProps } from './Card'
import type { CardPreviewProps } from './Preview'

export const CardDefinition: ComponentDefinition<LowcodeCardProps, CardPreviewProps> = {
  // 基础信息
  type: 'card',
  name: 'Card',
  category: 'display',
  description: '卡片组件，用于内容容器和展示信息',
  icon: 'card',

  // 组件实现
  component: Card,
  preview: CardPreview,

  // 属性定义
  properties: [
    {
      key: 'title',
      type: 'string',
      label: '卡片标题',
      description: '卡片的标题文本',
      required: false,
      default: '卡片标题',
      validation: [
        {
          type: 'max_length',
          params: { max: 100 },
          message: '标题不能超过100个字符',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'description',
      type: 'string',
      label: '卡片描述',
      description: '卡片的描述内容',
      required: false,
      default: '卡片描述内容，可以包含详细信息',
      validation: [
        {
          type: 'max_length',
          params: { max: 500 },
          message: '描述不能超过500个字符',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'footer',
      type: 'string',
      label: '底部内容',
      description: '卡片底部显示的内容',
      required: false,
      default: '',
      validation: [
        {
          type: 'max_length',
          params: { max: 200 },
          message: '底部内容不能超过200个字符',
        },
      ],
      group: '基础属性',
      order: 3,
    },
    {
      key: 'padding',
      type: 'select',
      label: '内边距',
      description: '卡片内部的内边距大小',
      required: false,
      default: 'medium',
      options: [
        {
          value: 'none',
          label: '无',
          description: '无内边距',
        },
        {
          value: 'small',
          label: '小',
          description: '12px 内边距',
        },
        {
          value: 'medium',
          label: '中',
          description: '16px 内边距',
        },
        {
          value: 'large',
          label: '大',
          description: '24px 内边距',
        },
      ],
      group: '样式属性',
      order: 4,
    },
    {
      key: 'rounded',
      type: 'select',
      label: '圆角',
      description: '卡片的圆角样式',
      required: false,
      default: 'medium',
      options: [
        {
          value: 'none',
          label: '无圆角',
          description: '无圆角效果',
        },
        {
          value: 'small',
          label: '小圆角',
          description: '小圆角效果',
        },
        {
          value: 'medium',
          label: '中等圆角',
          description: '中等圆角效果',
        },
        {
          value: 'large',
          label: '大圆角',
          description: '大圆角效果',
        },
      ],
      group: '样式属性',
      order: 5,
    },
    {
      key: 'shadow',
      type: 'select',
      label: '阴影',
      description: '卡片的阴影效果',
      required: false,
      default: 'medium',
      options: [
        {
          value: 'none',
          label: '无阴影',
          description: '无阴影效果',
        },
        {
          value: 'small',
          label: '小阴影',
          description: '小阴影效果',
        },
        {
          value: 'medium',
          label: '中等阴影',
          description: '中等阴影效果',
        },
        {
          value: 'large',
          label: '大阴影',
          description: '大阴影效果',
        },
      ],
      group: '样式属性',
      order: 6,
    },
    {
      key: 'border',
      type: 'select',
      label: '边框',
      description: '卡片的边框样式',
      required: false,
      default: 'light',
      options: [
        {
          value: 'none',
          label: '无边框',
          description: '无边框效果',
        },
        {
          value: 'light',
          label: '浅边框',
          description: '浅色边框',
        },
        {
          value: 'medium',
          label: '中等边框',
          description: '中等边框',
        },
        {
          value: 'strong',
          label: '强边框',
          description: '深色边框',
        },
      ],
      group: '样式属性',
      order: 7,
    },
    {
      key: 'background',
      type: 'color',
      label: '背景颜色',
      description: '卡片的背景颜色',
      required: false,
      default: '#ffffff',
      group: '样式属性',
      order: 8,
    },
  ],

  // 默认属性
  default_props: {
    title: '卡片标题',
    description: '卡片描述内容，可以包含详细信息',
    footer: '',
    padding: 'medium',
    rounded: 'medium',
    shadow: 'medium',
    border: 'light',
    background: '#ffffff',
  },

  // 预览属性
  preview_props: {
    title: '卡片',
    description: '卡片预览',
    footer: '',
    padding: 'small',
    rounded: 'medium',
    shadow: 'small',
    border: 'light',
    background: '#ffffff',
  },

  // 使用示例
  examples: [
    {
      title: '标准卡片',
      description: '这是一个标准的卡片组件，包含标题和描述内容',
      padding: 'medium',
      rounded: 'medium',
      shadow: 'medium',
      border: 'light',
    },
    {
      title: '简洁卡片',
      description: '简洁样式的卡片',
      padding: 'small',
      rounded: 'small',
      shadow: 'small',
      border: 'none',
    },
    {
      title: '重要卡片',
      description: '重要信息的卡片，使用更大的阴影',
      padding: 'large',
      rounded: 'large',
      shadow: 'large',
      border: 'medium',
    },
  ],
}
