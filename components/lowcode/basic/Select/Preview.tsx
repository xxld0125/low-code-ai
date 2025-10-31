/**
 * Select 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Select } from './Select'
import type { LowcodeSelectProps } from './Select'

export interface SelectPreviewProps {
  props?: Partial<LowcodeSelectProps>
  styles?: React.CSSProperties
  showVariants?: boolean
  showStates?: boolean
}

export const SelectPreview: React.FC<SelectPreviewProps> = ({
  props = {},
  styles = {},
  showVariants = false,
  showStates = false,
}) => {
  const defaultOptions = [
    { value: 'option1', label: '选项 1' },
    { value: 'option2', label: '选项 2' },
    { value: 'option3', label: '选项 3' },
  ]

  // 默认预览属性 - 在组件库中只展示简单的基础选择器
  const defaultPreviewProps: LowcodeSelectProps = {
    label: undefined,
    placeholder: '请选择',
    value: '',
    options: defaultOptions,
    required: false,
    disabled: false,
    multiple: false,
    helper: undefined,
    ...props,
  }

  return (
    <div style={styles} className="w-full">
      <Select {...defaultPreviewProps} disabled={true} className="pointer-events-none" />
    </div>
  )
}

// 导出特定预览组件
export const SelectVariantPreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <SelectPreview showVariants={true} styles={styles} />
)

export const SelectStatePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <SelectPreview showStates={true} styles={styles} />
)

export default SelectPreview
