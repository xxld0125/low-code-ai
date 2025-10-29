/**
 * Select 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Select } from './Select'
import { SelectPreview } from './Preview'
import { SelectIcon } from './Icon'
import type { LowcodeSelectProps } from './Select'
import type { SelectPreviewProps } from './Preview'

export const SelectDefinition: ComponentDefinition<LowcodeSelectProps, SelectPreviewProps> = {
  // 基础信息
  type: 'select',
  name: 'Select',
  category: 'basic',
  description: '下拉选择组件，支持单选和多选模式',
  icon: 'select',

  // 组件实现
  component: Select,
  preview: SelectPreview,

  // 属性定义
  properties: [
    {
      key: 'label',
      type: 'string',
      label: '标签文字',
      description: '选择器上方显示的标签',
      required: false,
      default: '',
      group: '基础属性',
      order: 1,
    },
    {
      key: 'placeholder',
      type: 'string',
      label: '占位符',
      description: '未选择时显示的提示文字',
      required: false,
      default: '请选择...',
      validation: [
        {
          type: 'max_length',
          params: { max: 100 },
          message: '占位符不能超过100个字符',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'value',
      type: 'string',
      label: '默认值',
      description: '默认选中的值',
      required: false,
      default: '',
      group: '基础属性',
      order: 3,
    },
    {
      key: 'options',
      type: 'array',
      label: '选项列表',
      description: '下拉选择器的选项配置',
      required: true,
      default: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
        { value: 'option3', label: '选项3' },
      ],
      validation: [
        {
          type: 'min_items',
          params: { min: 1 },
          message: '至少需要一个选项',
        },
      ],
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
      key: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '是否禁用选择器',
      required: false,
      default: false,
      group: '基础属性',
      order: 6,
    },
    {
      key: 'multiple',
      type: 'boolean',
      label: '多选模式',
      description: '是否支持多选',
      required: false,
      default: false,
      group: '高级属性',
      order: 7,
    },
    {
      key: 'error',
      type: 'string',
      label: '错误信息',
      description: '显示的错误提示信息',
      required: false,
      group: '状态属性',
      order: 8,
    },
    {
      key: 'helper',
      type: 'string',
      label: '帮助信息',
      description: '显示的帮助提示信息',
      required: false,
      group: '状态属性',
      order: 9,
    },
    {
      key: 'onChange',
      type: 'string',
      label: '变更事件',
      description: '选择变更时触发的事件处理器名称',
      required: false,
      group: '事件处理',
      order: 10,
    },
  ],

  // 默认属性
  default_props: {
    select: {
      label: '',
      placeholder: '请选择...',
      value: '',
      options: [
        { value: 'option1', label: '选项1' },
        { value: 'option2', label: '选项2' },
        { value: 'option3', label: '选项3' },
      ],
      required: false,
      disabled: false,
      multiple: false,
      error: '',
      helper: '',
    },
  },

  // 预览属性
  preview_props: {
    select: {
      label: '选择器',
      placeholder: '请选择一个选项...',
      value: '',
      options: [
        { value: 'china', label: '中国' },
        { value: 'usa', label: '美国' },
        { value: 'japan', label: '日本' },
        { value: 'korea', label: '韩国' },
      ],
      required: false,
      disabled: false,
      multiple: false,
      helper: '请选择您所在的国家或地区',
    },
  },

  // 使用示例
  examples: [
    {
      select: {
        label: '国家选择',
        placeholder: '请选择国家',
        options: [
          { value: 'cn', label: '中国' },
          { value: 'us', label: '美国' },
          { value: 'uk', label: '英国' },
        ],
        required: true,
        helper: '请选择您所在的国家',
      },
    },
    {
      select: {
        label: '技能标签',
        placeholder: '选择您的技能',
        options: [
          { value: 'js', label: 'JavaScript' },
          { value: 'ts', label: 'TypeScript' },
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
          { value: 'angular', label: 'Angular' },
        ],
        multiple: true,
        helper: '可以选择多个技能',
      },
    },
    {
      select: {
        label: '城市选择（分组）',
        placeholder: '请选择城市',
        options: [
          { value: 'beijing', label: '北京', group: '华北' },
          { value: 'shanghai', label: '上海', group: '华东' },
          { value: 'guangzhou', label: '广州', group: '华南' },
          { value: 'shenzhen', label: '深圳', group: '华南' },
        ],
        required: true,
        helper: '请选择您所在的城市',
      },
    },
    {
      select: {
        label: '状态选择',
        placeholder: '请选择状态',
        value: 'active',
        options: [
          { value: 'active', label: '激活' },
          { value: 'inactive', label: '未激活' },
          { value: 'disabled', label: '禁用' },
        ],
        error: '状态不能为空',
        helper: '选择用户的当前状态',
      },
    },
  ],
}
