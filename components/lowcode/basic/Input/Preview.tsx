/**
 * Input 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Input } from './Input'
import type { LowcodeInputProps } from './Input'

export interface InputPreviewProps {
  props?: Partial<LowcodeInputProps>
  styles?: React.CSSProperties
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  showTypes?: boolean
  showStates?: boolean
}

export const InputPreview: React.FC<InputPreviewProps> = ({
  props = {},
  styles = {},
  type = 'text',
  showTypes = false,
  showStates = false,
}) => {
  // 默认预览属性
  const defaultPreviewProps: LowcodeInputProps = {
    label: '示例输入框',
    placeholder: '请输入示例内容',
    type: type,
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    helper: '这是帮助信息',
    ...props,
  }

  // 如果显示类型预览
  if (showTypes) {
    const types: Array<LowcodeInputProps['type']> = [
      'text',
      'email',
      'password',
      'number',
      'tel',
      'url',
    ]

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">输入框类型</h4>
        <div className="space-y-4">
          {types.map(type => (
            <div key={type} className="space-y-2">
              <label className="text-xs capitalize text-gray-600">{type}</label>
              <Input
                {...defaultPreviewProps}
                type={type}
                label={`${type} 输入框`}
                placeholder={`请输入${type}`}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 如果显示状态预览
  if (showStates) {
    const states = [
      { label: '默认', props: { disabled: false, readonly: false, error: undefined } },
      { label: '禁用', props: { disabled: true, readonly: false, error: undefined } },
      { label: '只读', props: { disabled: false, readonly: true, error: undefined } },
      { label: '错误', props: { disabled: false, readonly: false, error: '输入内容不正确' } },
    ]

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">输入框状态</h4>
        <div className="space-y-4">
          {states.map(state => (
            <div key={state.label} className="space-y-2">
              <label className="text-xs text-gray-600">{state.label}</label>
              <Input
                {...defaultPreviewProps}
                {...state.props}
                label={`${state.label} 状态`}
                placeholder={state.label === '只读' ? '这是只读内容' : '请输入内容'}
                value={state.label === '只读' ? '只读内容示例' : ''}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 主要预览显示
  return (
    <div style={styles} className="space-y-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">输入框预览</h4>

      {/* 基础输入框 */}
      <div className="space-y-3">
        <Input {...defaultPreviewProps} onChange={value => console.log('Input changed:', value)} />
      </div>

      {/* 不同类型的输入框示例 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">常用类型</h5>
        <div className="space-y-3">
          <Input
            {...defaultPreviewProps}
            type="email"
            label="邮箱地址"
            placeholder="请输入邮箱地址"
            helper="我们将使用此邮箱发送通知"
          />
          <Input
            {...defaultPreviewProps}
            type="password"
            label="密码"
            placeholder="请输入密码"
            helper="密码至少8个字符"
          />
          <Input
            {...defaultPreviewProps}
            type="number"
            label="年龄"
            placeholder="请输入年龄"
            helper="请输入1-120之间的数字"
          />
        </div>
      </div>

      {/* 带验证的输入框 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">验证示例</h5>
        <div className="space-y-3">
          <Input
            {...defaultPreviewProps}
            label="必填字段"
            placeholder="这是必填字段"
            required={true}
            helper="此字段为必填项"
          />
          <Input
            {...defaultPreviewProps}
            label="有错误的字段"
            placeholder="请输入内容"
            error="输入格式不正确"
            helper="请按照要求格式输入"
          />
        </div>
      </div>
    </div>
  )
}

// 导出用于特定场景的预览组件
export const InputTypePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <InputPreview showTypes={true} styles={styles} />
)

export const InputStatePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <InputPreview showStates={true} styles={styles} />
)

// 简化的拖拽预览组件（用于设计器面板）
export const InputDragPreview: React.FC<{
  onClick?: () => void
}> = ({ onClick }) => {
  return (
    <div
      className="flex h-16 w-full cursor-pointer items-center justify-center rounded border border-gray-200 bg-white p-2 hover:border-blue-300 hover:bg-blue-50"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.()
        }
      }}
    >
      <Input label="" placeholder="输入框" disabled className="pointer-events-none" />
    </div>
  )
}

// 默认导出
export default InputPreview
