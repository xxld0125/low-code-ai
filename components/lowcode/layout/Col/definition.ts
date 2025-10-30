/**
 * Col 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Col } from './Col'
import { ColPreview } from './Preview'
import { ColIcon } from './Icon'
import type { ColProps } from '@/types/lowcode/component'

export const ColDefinition: ComponentDefinition<ColProps> = {
  // 基础标识
  type: 'col',
  name: 'Col',
  category: 'layout',
  description: '列组件，栅格布局的列容器，支持响应式布局',

  // 组件实现
  component: Col,
  preview: Col,
  icon: 'layout-columns',

  // 属性定义
  properties: [
    {
      key: 'span',
      type: 'number',
      label: '栅格宽度',
      description: '列占用的栅格数量，总共24栅格',
      required: false,
      default: 12,
      min: 1,
      max: 24,
      group: '基础属性',
      order: 1,
    },
    {
      key: 'offset',
      type: 'number',
      label: '左侧间隔',
      description: '列左侧空出的栅格数量',
      required: false,
      default: 0,
      min: 0,
      max: 23,
      group: '基础属性',
      order: 2,
    },
    {
      key: 'order',
      type: 'number',
      label: '排序',
      description: '列的排序顺序，数值越小越靠前',
      required: false,
      default: 0,
      min: 0,
      max: 100,
      group: '基础属性',
      order: 3,
    },
    {
      key: 'flex',
      type: 'select',
      label: 'Flex属性',
      description: '列的flex属性，用于控制列的伸缩行为',
      required: false,
      default: 'none',
      group: '基础属性',
      order: 4,
      options: [
        { value: 'none', label: '无', description: '不设置flex属性' },
        { value: 'auto', label: '自动', description: 'flex: auto' },
        { value: '1', label: '等分', description: 'flex: 1' },
        { value: 'initial', label: '初始', description: 'flex: initial' },
      ],
    },
    {
      key: 'align_self',
      type: 'select',
      label: '自身对齐',
      description: '列在交叉轴上的对齐方式',
      required: false,
      default: 'auto',
      group: '基础属性',
      order: 5,
      options: [
        { value: 'auto', label: '自动', description: '继承父容器的align-items属性' },
        { value: 'flex-start', label: '起始对齐', description: '向交叉轴起始位置对齐' },
        { value: 'flex-end', label: '结束对齐', description: '向交叉轴结束位置对齐' },
        { value: 'center', label: '居中对齐', description: '在交叉轴上居中对齐' },
        { value: 'baseline', label: '基线对齐', description: '按基线对齐' },
        { value: 'stretch', label: '拉伸', description: '拉伸以填满交叉轴' },
      ],
    },
    {
      key: 'padding',
      type: 'spacing',
      label: '内边距',
      description: '列的内边距，控制内容与列边界的距离',
      required: false,
      default: { x: 0, y: 0 },
      group: '样式',
      order: 6,
    },
    {
      key: 'margin',
      type: 'spacing',
      label: '外边距',
      description: '列的外边距，控制列与其他元素的距离',
      required: false,
      default: { x: 0, y: 0 },
      group: '样式',
      order: 7,
    },
  ],

  // 默认属性
  default_props: {
    span: 12,
    offset: 0,
    order: 0,
    flex: 'none',
    align_self: 'auto',
    padding: { x: 0, y: 0 },
    margin: { x: 0, y: 0 },
  },

  // 预览属性
  preview_props: {
    span: 12,
    padding: { x: 8, y: 8 },
    background: '#f0f9ff',
    rounded: 'small',
  },

  // 示例配置
  examples: [
    {
      name: '基础列',
      description: '占用12栅格的基础列',
      props: {
        span: 12,
        padding: { x: 16, y: 16 },
      },
    },
    {
      name: '带间隔的列',
      description: '带左侧间隔的列布局',
      props: {
        span: 8,
        offset: 4,
        padding: { x: 16, y: 16 },
      },
    },
    {
      name: '等分列',
      description: '自动等分剩余空间的列',
      props: {
        flex: 1,
        padding: { x: 16, y: 16 },
      },
    },
    {
      name: '自定义排序列',
      description: '自定义排序顺序的列',
      props: {
        span: 6,
        order: 2,
        padding: { x: 16, y: 16 },
      },
    },
  ],
}
