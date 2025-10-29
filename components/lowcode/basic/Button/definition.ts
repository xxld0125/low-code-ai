/**
 * Button 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Button } from './Button'
import { ButtonPreview } from './Preview'
import { ButtonIcon } from './Icon'
import type { LowcodeButtonProps } from './Button'
import type { ButtonPreviewProps } from './Preview'

export const ButtonDefinition: ComponentDefinition<LowcodeButtonProps, ButtonPreviewProps> = {
  // 基础信息
  type: 'button',
  name: 'Button',
  category: 'basic',
  description: '按钮组件，支持多种样式和交互状态',
  icon: 'button',

  // 组件实现
  component: Button,
  preview: ButtonPreview,

  // 属性定义
  properties: [
    {
      key: 'text',
      type: 'string',
      label: '按钮文字',
      description: '按钮上显示的文字内容',
      required: true,
      default: '点击按钮',
      validation: [
        {
          type: 'required',
          message: '按钮文字不能为空',
        },
        {
          type: 'min_length',
          params: { min: 1 },
          message: '按钮文字至少需要1个字符',
        },
        {
          type: 'max_length',
          params: { max: 50 },
          message: '按钮文字不能超过50个字符',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'variant',
      type: 'select',
      label: '按钮样式',
      description: '按钮的视觉样式变体',
      required: false,
      default: 'default',
      options: [
        {
          value: 'default',
          label: '默认',
          description: '灰色背景的标准按钮',
        },
        {
          value: 'primary',
          label: '主要',
          description: '蓝色背景的主要操作按钮',
        },
        {
          value: 'secondary',
          label: '次要',
          description: '灰色背景的次要操作按钮',
        },
        {
          value: 'outline',
          label: '轮廓',
          description: '透明背景带边框的按钮',
        },
        {
          value: 'ghost',
          label: '幽灵',
          description: '透明背景无轮廓的按钮',
        },
        {
          value: 'destructive',
          label: '危险',
          description: '红色背景的危险操作按钮',
        },
        {
          value: 'link',
          label: '链接',
          description: '类似链接样式的按钮',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'size',
      type: 'select',
      label: '按钮大小',
      description: '按钮的尺寸大小',
      required: false,
      default: 'default',
      options: [
        {
          value: 'sm',
          label: '小',
          description: '适用于紧凑布局',
        },
        {
          value: 'default',
          label: '默认',
          description: '标准尺寸，适用于大多数场景',
        },
        {
          value: 'lg',
          label: '大',
          description: '适用于重要操作',
        },
        {
          value: 'icon',
          label: '图标',
          description: '正方形，适用于图标按钮',
        },
      ],
      group: '基础属性',
      order: 3,
    },
    {
      key: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '是否禁用按钮',
      required: false,
      default: false,
      group: '基础属性',
      order: 4,
    },
    {
      key: 'loading',
      type: 'boolean',
      label: '加载状态',
      description: '是否显示加载动画',
      required: false,
      default: false,
      group: '基础属性',
      order: 5,
    },
    {
      key: 'icon',
      type: 'icon',
      label: '图标',
      description: '按钮显示的图标',
      required: false,
      group: '高级属性',
      order: 6,
    },
    {
      key: 'icon_position',
      type: 'select',
      label: '图标位置',
      description: '图标相对于文字的位置',
      required: false,
      default: 'left',
      options: [
        {
          value: 'left',
          label: '左侧',
          description: '图标在文字左侧',
        },
        {
          value: 'right',
          label: '右侧',
          description: '图标在文字右侧',
        },
      ],
      conditional: {
        property: 'icon',
        operator: 'not_equals',
        value: null,
      },
      group: '高级属性',
      order: 7,
    },
    {
      key: 'onClick',
      type: 'string',
      label: '点击事件',
      description: '按钮点击时触发的事件处理器名称',
      required: false,
      group: '事件处理',
      order: 8,
    },
  ],

  // 默认属性
  default_props: {
    text: '点击按钮',
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    icon: null,
    icon_position: 'left',
  },

  // 预览属性
  preview_props: {
    text: '预览按钮',
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
  },

  // 使用示例
  examples: [
    {
      text: '主要按钮',
      variant: 'default',
      size: 'default',
    },
    {
      text: '次要按钮',
      variant: 'secondary',
      size: 'sm',
    },
    {
      text: '危险操作',
      variant: 'destructive',
      size: 'default',
    },
    {
      text: '加载中...',
      variant: 'default',
      size: 'default',
      loading: true,
    },
  ],
}
