/**
 * Textarea 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Textarea } from './Textarea'
import { TextareaPreview } from './Preview'
import { TextareaIcon } from './Icon'
import type { LowcodeTextareaProps } from './Textarea'
import type { TextareaPreviewProps } from './Preview'

export const TextareaDefinition: ComponentDefinition<LowcodeTextareaProps, TextareaPreviewProps> = {
  // 基础信息
  type: 'textarea',
  name: 'Textarea',
  category: 'basic',
  description: '文本域组件，支持多行文本输入',
  icon: 'textarea',

  // 组件实现
  component: Textarea,
  preview: TextareaPreview,

  // 属性定义
  properties: [
    {
      key: 'label',
      type: 'string',
      label: '标签文字',
      description: '文本域上方显示的标签',
      required: false,
      default: '',
      group: '基础属性',
      order: 1,
    },
    {
      key: 'placeholder',
      type: 'string',
      label: '占位符',
      description: '文本域为空时显示的提示文字',
      required: false,
      default: '请输入内容...',
      validation: [
        {
          type: 'max_length',
          params: { max: 200 },
          message: '占位符不能超过200个字符',
        },
      ],
      group: '基础属性',
      order: 2,
    },
    {
      key: 'value',
      type: 'string',
      label: '默认值',
      description: '文本域的默认内容',
      required: false,
      default: '',
      group: '基础属性',
      order: 3,
    },
    {
      key: 'rows',
      type: 'number',
      label: '行数',
      description: '文本域显示的行数',
      required: false,
      default: 3,
      validation: [
        {
          type: 'min',
          params: { min: 1 },
          message: '行数至少为1',
        },
        {
          type: 'max',
          params: { max: 20 },
          message: '行数不能超过20',
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
      group: '验证规则',
      order: 5,
    },
    {
      key: 'validationPreset',
      type: 'select',
      label: '验证预设',
      description: '选择预定义的验证规则组合',
      required: false,
      default: 'none',
      options: [
        { value: 'none', label: '无预设' },
        { value: 'shortText', label: '短文本' },
        { value: 'longText', label: '长文本' },
        { value: 'description', label: '描述文本' },
      ],
      group: '验证规则',
      order: 6,
    },
    {
      key: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '是否禁用文本域',
      required: false,
      default: false,
      group: '基础属性',
      order: 6,
    },
    {
      key: 'readonly',
      type: 'boolean',
      label: '只读状态',
      description: '是否为只读状态',
      required: false,
      default: false,
      group: '基础属性',
      order: 7,
    },
    {
      key: 'maxlength',
      type: 'number',
      label: '最大字符数',
      description: '允许输入的最大字符数',
      required: false,
      validation: [
        {
          type: 'min',
          params: { min: 1 },
          message: '最大字符数至少为1',
        },
      ],
      group: '高级属性',
      order: 8,
    },
    {
      key: 'resize',
      type: 'select',
      label: '调整大小',
      description: '用户是否可以调整文本域大小',
      required: false,
      default: 'vertical',
      options: [
        {
          value: 'none',
          label: '不可调整',
          description: '用户无法调整大小',
        },
        {
          value: 'vertical',
          label: '垂直调整',
          description: '只能垂直方向调整',
        },
        {
          value: 'horizontal',
          label: '水平调整',
          description: '只能水平方向调整',
        },
        {
          value: 'both',
          label: '双向调整',
          description: '可以任意方向调整',
        },
      ],
      group: '高级属性',
      order: 9,
    },
    {
      key: 'error',
      type: 'string',
      label: '错误信息',
      description: '显示的错误提示信息',
      required: false,
      group: '状态属性',
      order: 10,
    },
    {
      key: 'helper',
      type: 'string',
      label: '帮助信息',
      description: '显示的帮助提示信息',
      required: false,
      group: '状态属性',
      order: 11,
    },
    {
      key: 'onChange',
      type: 'string',
      label: '变更事件',
      description: '文本内容变更时触发的事件处理器名称',
      required: false,
      group: '事件处理',
      order: 12,
    },
  ],

  // 默认属性
  default_props: {
    textarea: {
      label: '',
      placeholder: '请输入内容...',
      value: '',
      rows: 3,
      required: false,
      disabled: false,
      readonly: false,
      maxlength: undefined,
      error: '',
      helper: '',
      resize: 'vertical',
    },
  },

  // 预览属性
  preview_props: {
    textarea: {
      label: '文本域',
      placeholder: '请输入您的意见或建议...',
      value: '',
      rows: 4,
      required: false,
      disabled: false,
      readonly: false,
      helper: '您最多可以输入500个字符',
      resize: 'vertical',
    },
  },

  // 使用示例
  examples: [
    {
      textarea: {
        label: '用户反馈',
        placeholder: '请分享您的使用体验...',
        rows: 5,
        helper: '我们重视您的每一条反馈',
      },
    },
    {
      textarea: {
        label: '产品描述',
        placeholder: '请输入产品详细描述...',
        rows: 8,
        required: true,
        maxlength: 1000,
        resize: 'vertical',
      },
    },
    {
      textarea: {
        label: '备注信息',
        placeholder: '添加备注...',
        rows: 3,
        readonly: true,
        value: '这是一段只读的示例文本',
        helper: '此字段为只读状态',
      },
    },
    {
      textarea: {
        label: '错误示例',
        placeholder: '请输入内容...',
        rows: 3,
        error: '内容不能为空',
        helper: '请填写必要的信息',
      },
    },
  ],
}
