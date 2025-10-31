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
  // 默认预览属性 - 在组件库中只展示简单的基础输入框
  const defaultPreviewProps: LowcodeInputProps = {
    label: undefined,
    placeholder: '请输入',
    type: type,
    value: '',
    required: false,
    disabled: false,
    readonly: false,
    helper: undefined,
    ...props,
  }

  return (
    <div style={styles} className="w-full">
      <Input {...defaultPreviewProps} disabled={true} className="pointer-events-none" />
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
