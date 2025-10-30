/**
 * Container 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Container } from './Container'
import { ContainerPreview } from './Preview'
import { ContainerIcon } from './Icon'
import type { ContainerProps } from '@/types/lowcode/component'

export const ContainerDefinition: ComponentDefinition<ContainerProps> = {
  // 基础标识
  type: 'container',
  name: 'Container',
  category: 'layout',
  description: '容器组件，提供内容包裹和居中功能',

  // 组件实现
  component: Container,
  preview: Container,
  icon: 'layout-container',

  // 属性定义
  properties: [
    {
      key: 'direction',
      type: 'select',
      label: '布局方向',
      description: '容器内元素的排列方向',
      required: false,
      default: 'column',
      group: '基础属性',
      order: 1,
      options: [
        { value: 'row', label: '水平排列', description: '从左到右水平排列子元素' },
        { value: 'column', label: '垂直排列', description: '从上到下垂直排列子元素' },
      ],
    },
    {
      key: 'wrap',
      type: 'boolean',
      label: '允许换行',
      description: '是否允许子元素在空间不足时换行',
      required: false,
      default: false,
      group: '基础属性',
      order: 2,
    },
    {
      key: 'justify',
      type: 'select',
      label: '水平对齐',
      description: '容器内元素的水平对齐方式',
      required: false,
      default: 'start',
      group: '基础属性',
      order: 3,
      options: [
        { value: 'start', label: '起始对齐', description: '元素向容器起始位置对齐' },
        { value: 'center', label: '居中对齐', description: '元素在容器中居中对齐' },
        { value: 'end', label: '结束对齐', description: '元素向容器结束位置对齐' },
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
      description: '容器内元素的垂直对齐方式',
      required: false,
      default: 'start',
      group: '基础属性',
      order: 4,
      options: [
        { value: 'start', label: '起始对齐', description: '元素向容器起始边对齐' },
        { value: 'center', label: '居中对齐', description: '元素在容器中垂直居中对齐' },
        { value: 'end', label: '结束对齐', description: '元素向容器结束边对齐' },
        { value: 'stretch', label: '拉伸', description: '元素被拉伸以填充容器的交叉轴' },
      ],
    },
    {
      key: 'gap',
      type: 'number',
      label: '间距',
      description: '子元素之间的间距大小',
      required: false,
      default: 0,
      min: 0,
      max: 100,
      group: '样式',
      order: 5,
    },
    {
      key: 'padding',
      type: 'spacing',
      label: '内边距',
      description: '容器内边距，控制内容与容器边界的距离',
      required: false,
      default: { x: 16, y: 16 },
      group: '样式',
      order: 6,
    },
    {
      key: 'margin',
      type: 'spacing',
      label: '外边距',
      description: '容器外边距，控制容器与其他元素的距离',
      required: false,
      default: { x: 0, y: 0 },
      group: '样式',
      order: 7,
    },
    {
      key: 'background',
      type: 'color',
      label: '背景颜色',
      description: '容器的背景颜色',
      required: false,
      default: 'transparent',
      group: '样式',
      order: 8,
    },
    {
      key: 'border',
      type: 'border',
      label: '边框',
      description: '容器的边框样式',
      required: false,
      default: false,
      group: '样式',
      order: 9,
    },
    {
      key: 'rounded',
      type: 'select',
      label: '圆角',
      description: '容器的圆角大小',
      required: false,
      default: false,
      group: '样式',
      order: 10,
      options: [
        { value: false, label: '无圆角', description: '容器没有圆角' },
        { value: 'small', label: '小圆角', description: '小尺寸圆角' },
        { value: 'medium', label: '中圆角', description: '中等尺寸圆角' },
        { value: 'large', label: '大圆角', description: '大尺寸圆角' },
        { value: 'full', label: '完全圆角', description: '完全圆形的圆角' },
      ],
    },
    {
      key: 'shadow',
      type: 'select',
      label: '阴影',
      description: '容器的阴影效果',
      required: false,
      default: false,
      group: '样式',
      order: 11,
      options: [
        { value: false, label: '无阴影', description: '容器没有阴影' },
        { value: 'small', label: '小阴影', description: '轻微的阴影效果' },
        { value: 'medium', label: '中阴影', description: '中等阴影效果' },
        { value: 'large', label: '大阴影', description: '明显的阴影效果' },
      ],
    },
  ],

  // 默认属性
  default_props: {
    direction: 'column',
    wrap: false,
    justify: 'start',
    align: 'start',
    gap: 0,
    padding: { x: 16, y: 16 },
    margin: { x: 0, y: 0 },
    background: 'transparent',
    border: false,
    rounded: false,
    shadow: false,
  },

  // 预览属性
  preview_props: {
    direction: 'column',
    gap: 16,
    padding: { x: 16, y: 16 },
    background: '#f8fafc',
    rounded: 'medium',
  },

  // 示例配置
  examples: [
    {
      name: '基础容器',
      description: '简单的垂直布局容器',
      props: {
        direction: 'column',
        gap: 16,
        padding: { x: 16, y: 16 },
      },
    },
    {
      name: '水平布局容器',
      description: '水平排列的布局容器',
      props: {
        direction: 'row',
        gap: 12,
        justify: 'between',
        padding: { x: 20, y: 16 },
      },
    },
    {
      name: '卡片容器',
      description: '带背景和阴影的卡片样式容器',
      props: {
        direction: 'column',
        gap: 16,
        padding: { x: 24, y: 20 },
        background: '#ffffff',
        rounded: 'large',
        shadow: 'medium',
      },
    },
  ],
}
