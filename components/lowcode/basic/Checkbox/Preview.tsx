/**
 * Checkbox 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Checkbox } from './Checkbox'
import type { LowcodeCheckboxProps } from './Checkbox'

export interface CheckboxPreviewProps {
  props?: Partial<LowcodeCheckboxProps>
  styles?: React.CSSProperties
  showVariants?: boolean
  showStates?: boolean
}

export const CheckboxPreview: React.FC<CheckboxPreviewProps> = ({
  props = {},
  styles = {},
  showVariants = false,
  showStates = false,
}) => {
  // 默认预览属性 - 在组件库中只展示简单的基础复选框
  const defaultPreviewProps: LowcodeCheckboxProps = {
    label: '复选框',
    checked: false,
    indeterminate: false,
    disabled: false,
    required: false,
    helper: undefined,
    ...props,
  }

  return (
    <div style={styles} className="flex justify-center">
      <Checkbox {...defaultPreviewProps} disabled={true} className="pointer-events-none" />
    </div>
  )

  // 如果显示变体预览
  if (showVariants) {
    const variants = [
      {
        label: '未选中',
        props: { checked: false, indeterminate: false },
      },
      {
        label: '选中',
        props: { checked: true, indeterminate: false },
      },
      {
        label: '半选状态',
        props: { checked: false, indeterminate: true },
      },
    ]

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">复选框变体</h4>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={index} className="flex items-center space-x-4">
              <label className="w-16 text-xs text-gray-600">{variant.label}</label>
              <Checkbox
                {...defaultPreviewProps}
                {...variant.props}
                label={variant.label}
                onChange={checked => console.log(`Checkbox ${variant.label} changed:`, checked)}
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
        props: { disabled: false, error: '请同意此条款', required: true },
      },
      {
        label: '必填状态',
        props: { disabled: false, error: undefined, required: true },
      },
    ]

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">复选框状态</h4>
        <div className="space-y-3">
          {states.map(state => (
            <div key={state.label} className="space-y-2">
              <label className="text-xs text-gray-600">{state.label}</label>
              <Checkbox
                {...defaultPreviewProps}
                {...state.props}
                label={state.label}
                onChange={checked => console.log(`Checkbox ${state.label} changed:`, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 默认预览 - 展示主要功能
  return (
    <div style={styles} className="space-y-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">复选框预览</h4>

      {/* 基础复选框 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">基础复选框</h5>
        <div className="space-y-3">
          <Checkbox
            {...defaultPreviewProps}
            label="记住我"
            helper="下次访问时自动登录"
            onChange={checked => console.log('Remember me changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="订阅通知"
            checked={true}
            helper="接收产品更新和活动通知"
            onChange={checked => console.log('Subscribe changed:', checked)}
          />
        </div>
      </div>

      {/* 不同状态的复选框 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">状态示例</h5>
        <div className="space-y-3">
          <Checkbox
            {...defaultPreviewProps}
            label="半选状态"
            indeterminate={true}
            helper="部分子项已选中"
            onChange={checked => console.log('Indeterminate changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="禁用状态"
            checked={true}
            disabled={true}
            helper="此选项当前不可用"
            onChange={checked => console.log('Disabled changed:', checked)}
          />
        </div>
      </div>

      {/* 带验证的复选框 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">验证示例</h5>
        <div className="space-y-3">
          <Checkbox
            {...defaultPreviewProps}
            label="同意用户协议"
            required={true}
            error="请同意用户协议才能继续"
            onChange={checked => console.log('Terms changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="隐私政策"
            required={true}
            checked={true}
            helper="我们重视您的隐私保护"
            onChange={checked => console.log('Privacy changed:', checked)}
          />
        </div>
      </div>

      {/* 多选组示例 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">多选组示例</h5>
        <div className="space-y-2">
          <Checkbox
            {...defaultPreviewProps}
            label="前端开发"
            checked={true}
            helper="选择您的技术栈"
            onChange={checked => console.log('Frontend changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="后端开发"
            checked={true}
            onChange={checked => console.log('Backend changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="UI/UX设计"
            onChange={checked => console.log('Design changed:', checked)}
          />
          <Checkbox
            {...defaultPreviewProps}
            label="数据分析"
            onChange={checked => console.log('Analytics changed:', checked)}
          />
        </div>
      </div>
    </div>
  )
}

// 导出特定预览组件
export const CheckboxVariantPreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <CheckboxPreview showVariants={true} styles={styles} />
)

export const CheckboxStatePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <CheckboxPreview showStates={true} styles={styles} />
)

// 交互式预览组件
export const CheckboxInteractivePreview: React.FC<{ styles?: React.CSSProperties }> = ({
  styles,
}) => {
  const [allChecked, setAllChecked] = React.useState(false)
  const [indeterminate, setIndeterminate] = React.useState(false)
  const [items, setItems] = React.useState([
    { id: 1, label: '选项 1', checked: false },
    { id: 2, label: '选项 2', checked: true },
    { id: 3, label: '选项 3', checked: false },
  ])

  // 更新全选状态
  React.useEffect(() => {
    const checkedCount = items.filter(item => item.checked).length
    if (checkedCount === 0) {
      setAllChecked(false)
      setIndeterminate(false)
    } else if (checkedCount === items.length) {
      setAllChecked(true)
      setIndeterminate(false)
    } else {
      setAllChecked(false)
      setIndeterminate(true)
    }
  }, [items])

  const handleAllChange = (checked: boolean) => {
    setItems(items.map(item => ({ ...item, checked })))
    setAllChecked(checked)
    setIndeterminate(false)
  }

  const handleItemChange = (id: number, checked: boolean) => {
    setItems(items.map(item => (item.id === id ? { ...item, checked } : item)))
  }

  return (
    <div style={styles} className="space-y-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">交互式复选框组</h4>

      {/* 全选控制 */}
      <div className="space-y-2">
        <Checkbox
          label="全选"
          checked={allChecked}
          indeterminate={indeterminate}
          onChange={handleAllChange}
        />
      </div>

      {/* 选项列表 */}
      <div className="ml-6 space-y-2">
        {items.map(item => (
          <Checkbox
            key={item.id}
            label={item.label}
            checked={item.checked}
            onChange={checked => handleItemChange(item.id, checked)}
          />
        ))}
      </div>

      {/* 状态显示 */}
      <div className="mt-3 text-xs text-gray-500">
        已选择 {items.filter(item => item.checked).length} / {items.length} 项
      </div>
    </div>
  )
}

// 简化的拖拽预览组件（用于设计器面板）
export const CheckboxDragPreview: React.FC<{
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
      <div className="flex items-center space-x-2">
        <div className="h-4 w-4 rounded border border-gray-300"></div>
        <span className="text-sm text-gray-600">复选框</span>
      </div>
    </div>
  )
}

// 默认导出
export default CheckboxPreview
