/**
 * Checkbox 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Checkbox } from './Checkbox'
import { CheckboxPreview } from './Preview'
import { CheckboxIcon } from './Icon'
import type { LowcodeCheckboxProps } from './Checkbox'
import type { CheckboxPreviewProps } from './Preview'

export const CheckboxDefinition: ComponentDefinition<LowcodeCheckboxProps, CheckboxPreviewProps> = {
  // 基础信息
  type: 'checkbox',
  name: 'Checkbox',
  category: 'basic',
  description: '复选框组件，支持选中和未选中状态',
  icon: 'checkbox',

  // 组件实现
  component: Checkbox,
  preview: CheckboxPreview,

  // 属性定义
  properties: [
    {
      key: 'label',
      type: 'string',
      label: '标签文字',
      description: '复选框旁边显示的标签',
      required: false,
      default: '',
      group: '基础属性',
      order: 1,
    },
    {
      key: 'checked',
      type: 'boolean',
      label: '选中状态',
      description: '是否选中复选框',
      required: false,
      default: false,
      group: '基础属性',
      order: 2,
    },
    {
      key: 'indeterminate',
      type: 'boolean',
      label: '半选状态',
      description: '是否显示半选状态（不确定状态）',
      required: false,
      default: false,
      group: '基础属性',
      order: 3,
    },
    {
      key: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '是否禁用复选框',
      required: false,
      default: false,
      group: '基础属性',
      order: 4,
    },
    {
      key: 'required',
      type: 'boolean',
      label: '必填字段',
      description: '是否为必填字段',
      required: false,
      default: false,
      group: '基础属性',
      order: 5,
    },
    {
      key: 'error',
      type: 'string',
      label: '错误信息',
      description: '显示的错误提示信息',
      required: false,
      group: '状态属性',
      order: 6,
    },
    {
      key: 'helper',
      type: 'string',
      label: '帮助信息',
      description: '显示的帮助提示信息',
      required: false,
      group: '状态属性',
      order: 7,
    },
    {
      key: 'onChange',
      type: 'string',
      label: '变更事件',
      description: '状态变更时触发的事件处理器名称',
      required: false,
      group: '事件处理',
      order: 8,
    },
  ],

  // 默认属性
  default_props: {
    checkbox: {
      label: '',
      checked: false,
      indeterminate: false,
      disabled: false,
      required: false,
      error: '',
      helper: '',
    },
  },

  // 预览属性
  preview_props: {
    checkbox: {
      label: '同意条款',
      checked: false,
      indeterminate: false,
      disabled: false,
      required: true,
      helper: '请阅读并同意相关条款',
    },
  },

  // 使用示例
  examples: [
    {
      checkbox: {
        label: '记住我',
        checked: false,
        helper: '下次访问时自动登录',
      },
    },
    {
      checkbox: {
        label: '订阅通知',
        checked: true,
        helper: '接收产品更新和活动通知',
      },
    },
    {
      checkbox: {
        label: '已禁用选项',
        checked: true,
        disabled: true,
        helper: '此选项当前不可用',
      },
    },
    {
      checkbox: {
        label: '全选',
        indeterminate: true,
        helper: '部分项目已选中',
      },
    },
  ],
}
