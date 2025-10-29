/**
 * Radio 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Radio } from './Radio'
import type { LowcodeRadioProps } from './Radio'

export const RadioDefinition: ComponentDefinition<LowcodeRadioProps> = {
  // 基础信息
  type: 'radio',
  name: 'Radio',
  category: 'basic',
  description: '单选框组件，用于选择一组选项中的一个',
  icon: 'radio',

  // 组件实现
  component: Radio,

  // 属性定义
  properties: [
    {
      key: 'label',
      type: 'string',
      label: '标签文字',
      description: '单选框组的标签文字',
      required: false,
      default: '请选择选项',
      group: '基础属性',
      order: 1,
    },
    {
      key: 'value',
      type: 'string',
      label: '选中值',
      description: '当前选中的值',
      required: false,
      default: '',
      group: '基础属性',
      order: 2,
    },
    {
      key: 'required',
      type: 'boolean',
      label: '必填',
      description: '是否必填',
      required: false,
      default: false,
      group: '验证属性',
      order: 3,
    },
    {
      key: 'disabled',
      type: 'boolean',
      label: '禁用',
      description: '是否禁用',
      required: false,
      default: false,
      group: '状态属性',
      order: 4,
    },
  ],

  // 默认属性
  default_props: {
    label: '请选择选项',
    value: '',
    required: false,
    disabled: false,
  },

  // 预览属性
  preview_props: {
    label: '请选择选项',
    value: '',
    required: false,
    disabled: false,
  },
}
