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

  const groupedOptions = [
    { value: 'beijing', label: '北京', group: '华北' },
    { value: 'shanghai', label: '上海', group: '华东' },
    { value: 'guangzhou', label: '广州', group: '华南' },
  ]

  // 默认预览属性
  const defaultPreviewProps: LowcodeSelectProps = {
    label: '选择器',
    placeholder: '请选择一个选项...',
    value: '',
    options: defaultOptions,
    required: false,
    disabled: false,
    multiple: false,
    helper: '请选择您需要的选项',
    ...props,
  }

  // 如果显示变体预览
  if (showVariants) {
    const variants = [
      {
        label: '基础选择器',
        props: { multiple: false, options: defaultOptions },
      },
      {
        label: '多选选择器',
        props: { multiple: true, options: defaultOptions },
      },
      {
        label: '分组选择器',
        props: { multiple: false, options: groupedOptions },
      },
    ]

    return (
      <div style={styles} className="space-y-6">
        <h4 className="mb-4 text-sm font-medium text-gray-900">选择器变体</h4>
        <div className="grid grid-cols-1 gap-6">
          {variants.map((variant, index) => (
            <div key={index} className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700">{variant.label}</h5>
              <Select
                {...defaultPreviewProps}
                {...variant.props}
                onChange={value => console.log(`Select ${variant.label} changed:`, value)}
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
      {
        label: '默认状态',
        props: { disabled: false, error: undefined, required: false },
      },
      {
        label: '禁用状态',
        props: { disabled: true, error: undefined, required: false },
      },
      {
        label: '错误状态',
        props: { disabled: false, error: '请选择一个有效选项', required: true },
      },
      {
        label: '必填状态',
        props: { disabled: false, error: undefined, required: true },
      },
    ]

    return (
      <div style={styles} className="space-y-6">
        <h4 className="mb-4 text-sm font-medium text-gray-900">选择器状态</h4>
        <div className="grid grid-cols-1 gap-6">
          {states.map(state => (
            <div key={state.label} className="space-y-3">
              <h5 className="text-xs font-medium text-gray-700">{state.label}</h5>
              <Select
                {...defaultPreviewProps}
                {...state.props}
                label={state.label}
                onChange={value => console.log(`Select ${state.label} changed:`, value)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 默认预览
  return (
    <div style={styles} className="space-y-6">
      <h4 className="mb-4 text-sm font-medium text-gray-900">选择器预览</h4>

      {/* 基础选择器 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">基础选择器</h5>
        <Select
          {...defaultPreviewProps}
          onChange={value => console.log('Basic select changed:', value)}
        />
      </div>

      {/* 多选选择器 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">多选选择器</h5>
        <Select
          {...defaultPreviewProps}
          label="技能选择"
          placeholder="选择您的技能..."
          multiple
          options={[
            { value: 'js', label: 'JavaScript' },
            { value: 'ts', label: 'TypeScript' },
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
          ]}
          helper="可以选择多个技能"
          onChange={value => console.log('Multi select changed:', value)}
        />
      </div>

      {/* 分组选择器 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">分组选择器</h5>
        <Select
          {...defaultPreviewProps}
          label="城市选择"
          placeholder="请选择城市..."
          options={groupedOptions}
          helper="请选择您所在的城市"
          onChange={value => console.log('Grouped select changed:', value)}
        />
      </div>
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
