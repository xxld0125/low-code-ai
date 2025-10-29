/**
 * Image 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { LowcodeImage } from './Image'
import { ImagePreview } from './Preview'
import { ImageIcon } from './Icon'
import type { LowcodeImageProps } from './Image'
import type { ImagePreviewProps } from './Preview'

export const ImageDefinition: ComponentDefinition<LowcodeImageProps, ImagePreviewProps> = {
  // 基础信息
  type: 'image',
  name: 'Image',
  category: 'display',
  description: '图片组件，支持多种图片源和样式配置',
  icon: 'image',

  // 组件实现
  component: LowcodeImage,
  preview: ImagePreview,

  // 属性定义
  properties: [
    {
      key: 'src',
      type: 'string',
      label: '图片地址',
      description: '图片的URL地址或相对路径',
      required: true,
      default: '/api/placeholder/300/200',
      validation: [
        {
          type: 'required',
          message: '图片地址不能为空',
        },
        {
          type: 'url',
          message: '请输入有效的URL地址',
        },
      ],
      group: '基础属性',
      order: 1,
    },
    {
      key: 'alt',
      type: 'string',
      label: '替代文本',
      description: '图片的替代文本，用于无障碍访问',
      required: false,
      default: '图片',
      validation: [
        {
          type: 'max_length',
          params: { max: 200 },
          message: '替代文本不能超过200个字符',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'width',
      type: 'string',
      label: '宽度',
      description: '图片的宽度（像素或百分比）',
      required: false,
      default: '300',
      group: '尺寸属性',
      order: 3,
    },
    {
      key: 'height',
      type: 'string',
      label: '高度',
      description: '图片的高度（像素或百分比）',
      required: false,
      default: '200',
      group: '尺寸属性',
      order: 4,
    },
    {
      key: 'object_fit',
      type: 'select',
      label: '适应方式',
      description: '图片在容器中的适应方式',
      required: false,
      default: 'cover',
      options: [
        {
          value: 'cover',
          label: '覆盖',
          description: '保持宽高比，覆盖整个容器',
        },
        {
          value: 'contain',
          label: '包含',
          description: '保持宽高比，完整显示在容器内',
        },
        {
          value: 'fill',
          label: '填充',
          description: '拉伸填充整个容器',
        },
        {
          value: 'none',
          label: '原始',
          description: '保持原始尺寸',
        },
        {
          value: 'scale-down',
          label: '缩小',
          description: '按比例缩小图片',
        },
      ],
      group: '样式属性',
      order: 5,
    },
    {
      key: 'rounded',
      type: 'select',
      label: '圆角',
      description: '图片的圆角样式',
      required: false,
      default: 'none',
      options: [
        {
          value: 'none',
          label: '无圆角',
          description: '无圆角效果',
        },
        {
          value: 'sm',
          label: '小圆角',
          description: '小圆角效果',
        },
        {
          value: 'md',
          label: '中等圆角',
          description: '中等圆角效果',
        },
        {
          value: 'lg',
          label: '大圆角',
          description: '大圆角效果',
        },
        {
          value: 'xl',
          label: '超大圆角',
          description: '超大圆角效果',
        },
        {
          value: 'full',
          label: '圆形',
          description: '完全圆形',
        },
      ],
      group: '样式属性',
      order: 6,
    },
    {
      key: 'shadow',
      type: 'select',
      label: '阴影',
      description: '图片的阴影效果',
      required: false,
      default: 'none',
      options: [
        {
          value: 'none',
          label: '无阴影',
          description: '无阴影效果',
        },
        {
          value: 'sm',
          label: '小阴影',
          description: '小阴影效果',
        },
        {
          value: 'md',
          label: '中等阴影',
          description: '中等阴影效果',
        },
        {
          value: 'lg',
          label: '大阴影',
          description: '大阴影效果',
        },
        {
          value: 'xl',
          label: '超大阴影',
          description: '超大阴影效果',
        },
      ],
      group: '样式属性',
      order: 7,
    },
    {
      key: 'loading',
      type: 'select',
      label: '加载方式',
      description: '图片的加载策略',
      required: false,
      default: 'lazy',
      options: [
        {
          value: 'lazy',
          label: '懒加载',
          description: '滚动到视口时加载',
        },
        {
          value: 'eager',
          label: '立即加载',
          description: '立即加载图片',
        },
      ],
      group: '高级属性',
      order: 8,
    },
  ],

  // 默认属性
  default_props: {
    src: '/api/placeholder/300/200',
    alt: '图片',
    width: '300',
    height: '200',
    object_fit: 'cover',
    rounded: 'none',
    shadow: 'none',
    loading: 'lazy',
  },

  // 预览属性
  preview_props: {
    src: '/api/placeholder/100/100',
    alt: '图片预览',
    width: '100',
    height: '100',
    object_fit: 'cover',
    rounded: 'md',
    shadow: 'sm',
    loading: 'lazy',
  },

  // 使用示例
  examples: [
    {
      src: '/api/placeholder/400/300',
      alt: '示例图片',
      width: '400',
      height: '300',
      object_fit: 'cover',
      rounded: 'lg',
      shadow: 'md',
    },
    {
      src: '/api/placeholder/200/200',
      alt: '圆形头像',
      width: '200',
      height: '200',
      object_fit: 'cover',
      rounded: 'full',
      shadow: 'lg',
    },
    {
      src: '/api/placeholder/600/400',
      alt: '横幅图片',
      width: '100%',
      height: '400',
      object_fit: 'cover',
      rounded: 'none',
      shadow: 'xl',
    },
  ],
}
