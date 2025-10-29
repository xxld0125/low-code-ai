/**
 * Input 组件定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import type { ComponentDefinition } from '@/types/lowcode'
import { Input } from './Input'
import { InputPreview } from './Preview'
import { InputIcon } from './Icon'
import type { LowcodeInputProps } from './Input'
import type { InputPreviewProps } from './Preview'

export const InputDefinition: ComponentDefinition<LowcodeInputProps, InputPreviewProps> = {
  // 基础信息
  type: 'input',
  name: 'Input',
  category: 'basic',
  description: '输入框组件，支持多种输入类型和验证',
  icon: 'input',

  // 组件实现
  component: Input,
  preview: InputPreview,

  // 属性定义
  properties: [
    {
      key: 'label',
      type: 'string',
      label: '标签',
      description: '输入框的标签文字',
      required: false,
      default: '',
      group: '基础属性',
      order: 1,
    },
    {
      key: 'placeholder',
      type: 'string',
      label: '占位符',
      description: '输入框为空时显示的提示文字',
      required: false,
      default: '请输入内容',
      group: '基础属性',
      order: 2,
    },
    {
      key: 'type',
      type: 'select',
      label: '输入类型',
      description: '输入框的数据类型',
      required: false,
      default: 'text',
      options: [
        { value: 'text', label: '文本' },
        { value: 'email', label: '邮箱' },
        { value: 'password', label: '密码' },
        { value: 'number', label: '数字' },
        { value: 'tel', label: '电话' },
        { value: 'url', label: '网址' },
      ],
      group: '基础属性',
      order: 3,
    },
    {
      key: 'value',
      type: 'string',
      label: '默认值',
      description: '输入框的默认内容',
      required: false,
      default: '',
      group: '基础属性',
      order: 4,
    },
    {
      key: 'required',
      type: 'boolean',
      label: '必填',
      description: '是否为必填字段',
      required: false,
      default: false,
      group: '验证规则',
      order: 5,
    },
    {
      key: 'disabled',
      type: 'boolean',
      label: '禁用',
      description: '是否禁用输入框',
      required: false,
      default: false,
      group: '基础属性',
      order: 6,
    },
    {
      key: 'readonly',
      type: 'boolean',
      label: '只读',
      description: '是否为只读状态',
      required: false,
      default: false,
      group: '基础属性',
      order: 7,
    },
    {
      key: 'maxlength',
      type: 'number',
      label: '最大长度',
      description: '输入内容的最大字符数',
      required: false,
      default: undefined,
      validation: [
        {
          type: 'min_value',
          params: { min: 1 },
          message: '最大长度必须大于0',
        },
      ],
      group: '验证规则',
      order: 8,
    },
    {
      key: 'minlength',
      type: 'number',
      label: '最小长度',
      description: '输入内容的最小字符数',
      required: false,
      default: undefined,
      validation: [
        {
          type: 'min_value',
          params: { min: 0 },
          message: '最小长度不能小于0',
        },
      ],
      group: '验证规则',
      order: 9,
    },
    {
      key: 'pattern',
      type: 'string',
      label: '正则表达式',
      description: '输入内容的验证正则表达式',
      required: false,
      default: '',
      group: '验证规则',
      order: 10,
    },
    {
      key: 'error',
      type: 'string',
      label: '错误信息',
      description: '验证失败时显示的错误信息',
      required: false,
      default: '',
      group: '状态显示',
      order: 11,
    },
    {
      key: 'helper',
      type: 'string',
      label: '帮助信息',
      description: '输入框下方显示的帮助文字',
      required: false,
      default: '',
      group: '状态显示',
      order: 12,
    },
  ],

  // 默认属性
  default_props: {
    input: {
      label: '',
      placeholder: '请输入内容',
      type: 'text',
      value: '',
      required: false,
      disabled: false,
      readonly: false,
      maxlength: undefined,
      minlength: undefined,
      pattern: '',
      error: '',
      helper: '',
    },
  },

  // 预览属性
  preview_props: {
    input: {
      label: '示例输入框',
      placeholder: '请输入示例内容',
      type: 'text',
      value: '',
      required: true,
      disabled: false,
      readonly: false,
      helper: '这是帮助信息',
    },
  },

  // 使用示例
  examples: [
    {
      input: {
        label: '用户名',
        placeholder: '请输入用户名',
        type: 'text',
        required: true,
        helper: '用户名长度为3-20个字符',
      },
    },
    {
      input: {
        label: '密码',
        placeholder: '请输入密码',
        type: 'password',
        required: true,
        helper: '密码至少包含8个字符',
      },
    },
    {
      input: {
        label: '邮箱',
        placeholder: '请输入邮箱地址',
        type: 'email',
        required: true,
        error: '请输入有效的邮箱地址',
      },
    },
    {
      input: {
        label: '手机号',
        placeholder: '请输入手机号',
        type: 'tel',
        required: false,
        helper: '格式：13800138000',
      },
    },
  ],
}
