/**
 * Row 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Row } from './Row'
import { RowPreview } from './Preview'
import { RowIcon } from './Icon'
import type { RowProps } from '@/types/lowcode/component'

export const RowDefinition: ComponentDefinition<RowProps> = {
  // 基础标识
  type: 'row',
  name: 'Row',
  category: 'layout',
  description: '行组件，水平布局容器，用于将子组件水平排列',

  // 组件实现
  component: Row,
  preview: Row,
  icon: 'layout-row',

  // 属性定义
  properties: [
    {
      key: 'wrap',
      type: 'boolean',
      label: '允许换行',
      description: '是否允许子元素在空间不足时换行',
      required: false,
      default: false,
      group: '基础属性',
      order: 1,
    },
    {
      key: 'justify',
      type: 'select',
      label: '水平对齐',
      description: '行内元素的水平对齐方式',
      required: false,
      default: 'start',
      group: '基础属性',
      order: 2,
      options: [
        { value: 'start', label: '起始对齐', description: '元素向行起始位置对齐' },
        { value: 'center', label: '居中对齐', description: '元素在行中居中对齐' },
        { value: 'end', label: '结束对齐', description: '元素向行结束位置对齐' },
        {
          value: 'between',
          label: '两端对齐',
          description: '第一个元素在起始位置，最后一个元素在结束位置，其他元素均匀分布',
        },
        { value: 'around', label: '环绕分布', description: '每个元素周围都有相等的空间' },
        { value: 'evenly', label: '均匀分布', description: '所有元素之间的空间完全相等' },
      ],
    },
    {
      key: 'align',
      type: 'select',
      label: '垂直对齐',
      description: '行内元素的垂直对齐方式',
      required: false,
      default: 'start',
      group: '基础属性',
      order: 3,
      options: [
        { value: 'start', label: '顶部对齐', description: '元素向行顶部对齐' },
        { value: 'center', label: '居中对齐', description: '元素在行中垂直居中对齐' },
        { value: 'end', label: '底部对齐', description: '元素向行底部对齐' },
        { value: 'stretch', label: '拉伸', description: '元素被拉伸以填充行的交叉轴' },
      ],
    },
    {
      key: 'gap',
      type: 'number',
      label: '间距',
      description: '子元素之间的间距大小',
      required: false,
      default: 16,
      min: 0,
      max: 100,
      group: '样式',
      order: 4,
    },
    {
      key: 'padding',
      type: 'spacing',
      label: '内边距',
      description: '行的内边距，控制内容与行边界的距离',
      required: false,
      default: { x: 0, y: 0 },
      group: '样式',
      order: 5,
    },
    {
      key: 'margin',
      type: 'spacing',
      label: '外边距',
      description: '行的外边距，控制行与其他元素的距离',
      required: false,
      default: { x: 0, y: 0 },
      group: '样式',
      order: 6,
    },
  ],

  // 默认属性
  default_props: {
    wrap: false,
    justify: 'start',
    align: 'start',
    gap: 16,
    padding: { x: 0, y: 0 },
    margin: { x: 0, y: 0 },
  },

  // 预览属性
  preview_props: {
    gap: 16,
    justify: 'start',
    align: 'center',
  },

  // 示例配置
  examples: [
    {
      name: '基础行布局',
      description: '简单的水平布局行',
      props: {
        gap: 16,
        justify: 'start',
      },
    },
    {
      name: '居中对齐行',
      description: '水平和垂直都居中对齐的行',
      props: {
        gap: 24,
        justify: 'center',
        align: 'center',
      },
    },
    {
      name: '两端对齐行',
      description: '子元素两端对齐的行布局',
      props: {
        gap: 12,
        justify: 'between',
        align: 'center',
        padding: { x: 16, y: 8 },
      },
    },
    {
      name: '可换行行',
      description: '支持自动换行的行布局',
      props: {
        gap: 16,
        justify: 'start',
        align: 'start',
        wrap: true,
      },
    },
  ],
}
