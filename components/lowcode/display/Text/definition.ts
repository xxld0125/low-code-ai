/**
 * Text 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Text } from './Text'
import { TextPreview } from './Preview'
import { TextIcon } from './Icon'
import type { LowcodeTextProps } from './Text'
import type { TextPreviewProps } from './Preview'

export const TextDefinition: ComponentDefinition<LowcodeTextProps, TextPreviewProps> = {
  // 基础信息
  type: 'text',
  name: 'Text',
  category: 'display',
  description: '文本组件，支持丰富的文字样式配置',
  icon: 'text',

  // 组件实现
  component: Text,
  preview: TextPreview,

  // 属性定义
  properties: [
    {
      key: 'content',
      type: 'string',
      label: '文本内容',
      description: '显示的文本内容',
      required: true,
      default: '这是一段示例文本',
      validation: [
        {
          type: 'required',
          message: '文本内容不能为空',
        },
        {
          type: 'max_length',
          params: { max: 1000 },
          message: '文本内容不能超过1000个字符',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'variant',
      type: 'select',
      label: '文本类型',
      description: '文本的语义类型',
      required: false,
      default: 'body',
      options: [
        {
          value: 'body',
          label: '正文',
          description: '标准正文文本',
        },
        {
          value: 'caption',
          label: '说明',
          description: '辅助说明文本，字号较小',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'size',
      type: 'select',
      label: '字体大小',
      description: '文本的字号大小',
      required: false,
      default: 'base',
      options: [
        {
          value: 'xs',
          label: '极小',
          description: '12px，适用于标注文本',
        },
        {
          value: 'sm',
          label: '小',
          description: '14px，适用于辅助文本',
        },
        {
          value: 'base',
          label: '默认',
          description: '16px，标准正文大小',
        },
        {
          value: 'lg',
          label: '大',
          description: '18px，适用于重要文本',
        },
        {
          value: 'xl',
          label: '极大',
          description: '20px，适用于突出文本',
        },
      ],
      group: '样式属性',
      order: 3,
    },
    {
      key: 'weight',
      type: 'select',
      label: '字体粗细',
      description: '文本的字体粗细',
      required: false,
      default: 'normal',
      options: [
        {
          value: 'normal',
          label: '正常',
          description: '标准字体粗细',
        },
        {
          value: 'medium',
          label: '中等',
          description: '中等字体粗细',
        },
        {
          value: 'semibold',
          label: '半粗',
          description: '半粗字体',
        },
        {
          value: 'bold',
          label: '粗体',
          description: '粗字体',
        },
      ],
      group: '样式属性',
      order: 4,
    },
    {
      key: 'align',
      type: 'select',
      label: '文本对齐',
      description: '文本的水平对齐方式',
      required: false,
      default: 'left',
      options: [
        {
          value: 'left',
          label: '左对齐',
          description: '文本左对齐',
        },
        {
          value: 'center',
          label: '居中',
          description: '文本居中对齐',
        },
        {
          value: 'right',
          label: '右对齐',
          description: '文本右对齐',
        },
        {
          value: 'justify',
          label: '两端对齐',
          description: '文本两端对齐',
        },
      ],
      group: '样式属性',
      order: 5,
    },
    {
      key: 'color',
      type: 'color',
      label: '文本颜色',
      description: '文本的颜色',
      required: false,
      default: '#000000',
      group: '样式属性',
      order: 6,
    },
    {
      key: 'decoration',
      type: 'select',
      label: '文本装饰',
      description: '文本的装饰效果',
      required: false,
      default: 'none',
      options: [
        {
          value: 'none',
          label: '无装饰',
          description: '无文本装饰',
        },
        {
          value: 'underline',
          label: '下划线',
          description: '添加下划线',
        },
        {
          value: 'line-through',
          label: '删除线',
          description: '添加删除线',
        },
      ],
      group: '样式属性',
      order: 7,
    },
  ],

  // 默认属性
  default_props: {
    content: '这是一段示例文本',
    variant: 'body',
    size: 'base',
    weight: 'normal',
    align: 'left',
    color: '#000000',
    decoration: 'none',
  },

  // 预览属性
  preview_props: {
    content: '文本预览',
    variant: 'body',
    size: 'base',
    weight: 'normal',
    align: 'left',
    color: '#374151',
    decoration: 'none',
  },

  // 使用示例
  examples: [
    {
      content: '这是一段正文文本',
      variant: 'body',
      size: 'base',
      weight: 'normal',
      align: 'left',
    },
    {
      content: '这是一段重要的文本',
      variant: 'body',
      size: 'lg',
      weight: 'semibold',
      align: 'center',
    },
    {
      content: '这是一段说明文本',
      variant: 'caption',
      size: 'sm',
      weight: 'normal',
      align: 'left',
    },
    {
      content: '带下划线的文本',
      variant: 'body',
      size: 'base',
      weight: 'normal',
      decoration: 'underline',
    },
  ],
}
