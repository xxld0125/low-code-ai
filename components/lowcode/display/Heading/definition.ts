/**
 * Heading 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Heading } from './Heading'
import { HeadingPreview } from './Preview'
import { HeadingIcon } from './Icon'
import type { LowcodeHeadingProps } from './Heading'
import type { HeadingPreviewProps } from './Preview'

export const HeadingDefinition: ComponentDefinition<LowcodeHeadingProps, HeadingPreviewProps> = {
  // 基础信息
  type: 'heading',
  name: 'Heading',
  category: 'display',
  description: '标题组件，支持不同级别的标题样式',
  icon: 'heading',

  // 组件实现
  component: Heading,
  preview: HeadingPreview,

  // 属性定义
  properties: [
    {
      key: 'content',
      type: 'string',
      label: '标题内容',
      description: '显示的标题文本内容',
      required: true,
      default: '这是标题文本',
      validation: [
        {
          type: 'required',
          message: '标题内容不能为空',
        },
        {
          type: 'max_length',
          params: { max: 200 },
          message: '标题内容不能超过200个字符',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'level',
      type: 'select',
      label: '标题级别',
      description: 'HTML标题级别（H1-H6）',
      required: false,
      default: 2,
      options: [
        {
          value: 1,
          label: 'H1',
          description: '一级标题，最大字号',
        },
        {
          value: 2,
          label: 'H2',
          description: '二级标题，较大字号',
        },
        {
          value: 3,
          label: 'H3',
          description: '三级标题，中等字号',
        },
        {
          value: 4,
          label: 'H4',
          description: '四级标题，较小字号',
        },
        {
          value: 5,
          label: 'H5',
          description: '五级标题，更小字号',
        },
        {
          value: 6,
          label: 'H6',
          description: '六级标题，最小字号',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'size',
      type: 'select',
      label: '字体大小',
      description: '标题的字号大小（可覆盖默认级别大小）',
      required: false,
      default: 'auto',
      options: [
        {
          value: 'auto',
          label: '自动',
          description: '根据标题级别自动选择大小',
        },
        {
          value: 'xs',
          label: '极小',
          description: '12px，适用于副标题',
        },
        {
          value: 'sm',
          label: '小',
          description: '14px，适用于小标题',
        },
        {
          value: 'base',
          label: '默认',
          description: '16px，标准标题大小',
        },
        {
          value: 'lg',
          label: '大',
          description: '18px，适用于重要标题',
        },
        {
          value: 'xl',
          label: '极大',
          description: '20px，适用于突出标题',
        },
        {
          value: '2xl',
          label: '2倍大',
          description: '24px，适用于主标题',
        },
        {
          value: '3xl',
          label: '3倍大',
          description: '30px，适用于大标题',
        },
        {
          value: '4xl',
          label: '4倍大',
          description: '36px，适用于特大标题',
        },
        {
          value: '5xl',
          label: '5倍大',
          description: '48px，适用于巨大标题',
        },
        {
          value: '6xl',
          label: '6倍大',
          description: '60px，适用于最大标题',
        },
      ],
      group: '样式属性',
      order: 3,
    },
    {
      key: 'weight',
      type: 'select',
      label: '字体粗细',
      description: '标题的字体粗细',
      required: false,
      default: 'semibold',
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
          description: '半粗字体（推荐）',
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
      description: '标题的水平对齐方式',
      required: false,
      default: 'left',
      options: [
        {
          value: 'left',
          label: '左对齐',
          description: '标题左对齐',
        },
        {
          value: 'center',
          label: '居中',
          description: '标题居中对齐',
        },
        {
          value: 'right',
          label: '右对齐',
          description: '标题右对齐',
        },
      ],
      group: '样式属性',
      order: 5,
    },
    {
      key: 'color',
      type: 'color',
      label: '标题颜色',
      description: '标题的颜色',
      required: false,
      default: '#111827',
      group: '样式属性',
      order: 6,
    },
    {
      key: 'decoration',
      type: 'select',
      label: '文本装饰',
      description: '标题的装饰效果',
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
      ],
      group: '样式属性',
      order: 7,
    },
  ],

  // 默认属性
  default_props: {
    content: '这是标题文本',
    level: 2,
    size: 'auto',
    weight: 'semibold',
    align: 'left',
    color: '#111827',
    decoration: 'none',
  },

  // 预览属性
  preview_props: {
    content: '标题预览',
    level: 3,
    size: 'auto',
    weight: 'semibold',
    align: 'left',
    color: '#111827',
    decoration: 'none',
  },

  // 使用示例
  examples: [
    {
      content: '一级标题',
      level: 1,
      size: 'auto',
      weight: 'bold',
      align: 'left',
    },
    {
      content: '居中二级标题',
      level: 2,
      size: 'auto',
      weight: 'semibold',
      align: 'center',
    },
    {
      content: '三级标题',
      level: 3,
      size: 'lg',
      weight: 'medium',
      align: 'left',
    },
    {
      content: '带下划线的标题',
      level: 4,
      size: 'auto',
      weight: 'semibold',
      decoration: 'underline',
    },
  ],
}
