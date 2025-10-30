/**
 * Container 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { PageContainer } from './Container'
import { ContainerPreview } from './Preview'

export const ContainerDefinition: ComponentDefinition<any> = {
  type: 'container',
  name: '容器',
  category: 'layout',
  description: '基础容器组件，用于包裹和组织其他组件',
  icon: 'Layout',

  // 组件实现
  component: PageContainer,
  preview: ContainerPreview,

  // 默认属性
  default_props: {
    id: '',
    props: {
      container: {
        direction: 'column',
        wrap: false,
        justify: 'start',
        align: 'start',
        gap: 0,
        padding: { x: 0, y: 0 },
        margin: { x: 0, y: 0 },
        background: null,
        border: false,
        shadow: false,
        rounded: false,
      },
    },
    styles: {},
    isSelected: false,
    isDragging: false,
  },

  // 属性定义
  properties: [
    {
      key: 'direction',
      label: '布局方向',
      type: 'select',
      default: 'column',
      options: [
        { value: 'column', label: '垂直' },
        { value: 'row', label: '水平' },
        { value: 'column-reverse', label: '垂直反转' },
        { value: 'row-reverse', label: '水平反转' },
      ],
    },
    {
      key: 'wrap',
      label: '是否换行',
      type: 'boolean',
      default: false,
    },
    {
      key: 'justify',
      label: '水平对齐',
      type: 'select',
      default: 'start',
      options: [
        { value: 'start', label: '起始' },
        { value: 'center', label: '居中' },
        { value: 'end', label: '结束' },
        { value: 'between', label: '两端对齐' },
        { value: 'around', label: '环绕分布' },
        { value: 'evenly', label: '均匀分布' },
      ],
    },
    {
      key: 'align',
      label: '垂直对齐',
      type: 'select',
      default: 'start',
      options: [
        { value: 'start', label: '起始' },
        { value: 'center', label: '居中' },
        { value: 'end', label: '结束' },
        { value: 'stretch', label: '拉伸' },
        { value: 'baseline', label: '基线' },
      ],
    },
    {
      key: 'gap',
      label: '间距',
      type: 'number',
      default: 0,
      min: 0,
      max: 100,
    },
  ],

  // 预览属性
  preview_props: {
    direction: 'column',
    gap: 16,
  },

  // 示例
  examples: [
    {
      name: '基础容器',
      props: {
        direction: 'column',
        gap: 16,
      },
    },
    {
      name: '水平布局',
      props: {
        direction: 'row',
        gap: 12,
        justify: 'space-between',
      },
    },
  ],
}