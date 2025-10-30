/**
 * Col 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { PageCol } from './Col'
import { ColPreview } from './Preview'

export const ColDefinition: ComponentDefinition<any> = {
  type: 'col',
  name: '列',
  category: 'layout',
  description: '栅格列组件，用于在Row组件中创建列布局',
  icon: 'Columns',

  // 组件实现
  component: PageCol,
  preview: ColPreview,

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
      key: 'span',
      label: '栅格宽度',
      type: 'number',
      default: 24,
      min: 1,
      max: 24,
    },
    {
      key: 'offset',
      label: '左侧间隔',
      type: 'number',
      default: 0,
      min: 0,
      max: 23,
    },
    {
      key: 'push',
      label: '右移栅格',
      type: 'number',
      default: 0,
      min: 0,
      max: 23,
    },
    {
      key: 'pull',
      label: '左移栅格',
      type: 'number',
      default: 0,
      min: 0,
      max: 23,
    },
  ],

  // 预览属性
  preview_props: {
    span: 12,
  },

  // 示例
  examples: [
    {
      name: '12栅格列',
      props: {
        span: 12,
      },
    },
    {
      name: '带间隔的列',
      props: {
        span: 8,
        offset: 2,
      },
    },
  ],
}