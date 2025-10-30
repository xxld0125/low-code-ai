/**
 * Row 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { PageRow } from './Row'
import { RowPreview } from './Preview'

export const RowDefinition: ComponentDefinition<any> = {
  type: 'row',
  name: '行',
  category: 'layout',
  description: '水平布局容器，用于将子组件水平排列',
  icon: 'Rows',

  // 组件实现
  component: PageRow,
  preview: RowPreview,

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
      key: 'gutter',
      label: '栅格间隔',
      type: 'number',
      default: 0,
      min: 0,
      max: 50,
    },
    {
      key: 'justify',
      label: '水平对齐',
      type: 'select',
      default: 'start',
      options: [
        { value: 'start', label: '起始对齐' },
        { value: 'center', label: '居中对齐' },
        { value: 'end', label: '结束对齐' },
        { value: 'space-between', label: '两端对齐' },
        { value: 'space-around', label: '环绕分布' },
        { value: 'space-evenly', label: '均匀分布' },
      ],
    },
    {
      key: 'align',
      label: '垂直对齐',
      type: 'select',
      default: 'top',
      options: [
        { value: 'top', label: '顶部对齐' },
        { value: 'middle', label: '居中对齐' },
        { value: 'bottom', label: '底部对齐' },
        { value: 'stretch', label: '拉伸填充' },
      ],
    },
    {
      key: 'wrap',
      label: '是否换行',
      type: 'boolean',
      default: false,
    },
  ],

  // 预览属性
  preview_props: {
    gutter: 16,
    justify: 'start',
  },

  // 示例
  examples: [
    {
      name: '基础行',
      props: {
        gutter: 16,
        justify: 'start',
      },
    },
    {
      name: '居中对齐',
      props: {
        gutter: 24,
        justify: 'center',
        align: 'middle',
      },
    },
  ],
}