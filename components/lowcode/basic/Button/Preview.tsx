/**
 * Button 预览组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React from 'react'
import { Button } from './Button'
import type { LowcodeButtonProps } from './Button'

export interface ButtonPreviewProps {
  props?: Partial<LowcodeButtonProps>
  styles?: React.CSSProperties
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'default' | 'lg' | 'icon'
  showVariants?: boolean
  showSizes?: boolean
}

export const ButtonPreview: React.FC<ButtonPreviewProps> = ({
  props = {},
  styles = {},
  variant = 'default',
  size = 'default',
  showVariants = false,
  showSizes = false,
}) => {
  // 默认预览属性
  const defaultPreviewProps: LowcodeButtonProps = {
    text: '预览按钮',
    variant: variant,
    size: size,
    disabled: false,
    loading: false,
    ...props,
  }

  // 如果显示变体预览
  if (showVariants) {
    const variants: Array<LowcodeButtonProps['variant']> = [
      'default',
      'secondary',
      'outline',
      'ghost',
      'destructive',
      'link',
    ]

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">按钮样式变体</h4>
        <div className="grid grid-cols-2 gap-4">
          {variants.map(variant => (
            <div key={variant} className="space-y-2">
              <label className="text-xs capitalize text-gray-600">{variant}</label>
              <Button
                {...defaultPreviewProps}
                variant={variant}
                text={`${variant} 按钮`}
                onClick={() => console.log(`${variant} button clicked`)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 如果显示尺寸预览
  if (showSizes) {
    const sizes: Array<LowcodeButtonProps['size']> = ['sm', 'default', 'lg', 'icon']

    return (
      <div style={styles} className="space-y-4">
        <h4 className="mb-3 text-sm font-medium text-gray-900">按钮尺寸</h4>
        <div className="flex flex-wrap items-center gap-4">
          {sizes.map(size => (
            <div key={size} className="space-y-2 text-center">
              <label className="text-xs text-gray-600">{size}</label>
              <Button
                {...defaultPreviewProps}
                size={size}
                text={size === 'icon' ? undefined : `${size} 按钮`}
                icon={size === 'icon' ? '🔥' : undefined}
                onClick={() => console.log(`${size} button clicked`)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 显示状态预览
  const states = [
    { label: '默认', props: { disabled: false, loading: false } },
    { label: '禁用', props: { disabled: true, loading: false } },
    { label: '加载中', props: { disabled: false, loading: true } },
  ]

  return (
    <div style={styles} className="space-y-4">
      <h4 className="mb-3 text-sm font-medium text-gray-900">按钮状态预览</h4>

      {/* 主要预览 */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <Button {...defaultPreviewProps} onClick={() => console.log('Primary button clicked')} />

          <Button
            {...defaultPreviewProps}
            variant="secondary"
            text="次要按钮"
            onClick={() => console.log('Secondary button clicked')}
          />

          <Button
            {...defaultPreviewProps}
            variant="outline"
            text="轮廓按钮"
            onClick={() => console.log('Outline button clicked')}
          />
        </div>
      </div>

      {/* 状态预览 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">交互状态</h5>
        <div className="flex flex-wrap items-center gap-4">
          {states.map(state => (
            <div key={state.label} className="space-y-2 text-center">
              <label className="text-xs text-gray-600">{state.label}</label>
              <Button
                {...defaultPreviewProps}
                {...state.props}
                text={state.label}
                onClick={() => console.log(`${state.label} button clicked`)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 带图标的按钮预览 */}
      <div className="space-y-3">
        <h5 className="text-xs font-medium text-gray-700">带图标按钮</h5>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            {...defaultPreviewProps}
            text="左侧图标"
            icon="⭐"
            icon_position="left"
            onClick={() => console.log('Left icon button clicked')}
          />

          <Button
            {...defaultPreviewProps}
            text="右侧图标"
            icon="🚀"
            icon_position="right"
            onClick={() => console.log('Right icon button clicked')}
          />
        </div>
      </div>
    </div>
  )
}

// 导出用于特定场景的预览组件
export const ButtonVariantPreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <ButtonPreview showVariants={true} styles={styles} />
)

export const ButtonSizePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <ButtonPreview showSizes={true} styles={styles} />
)

export const ButtonStatePreview: React.FC<{ styles?: React.CSSProperties }> = ({ styles }) => (
  <ButtonPreview styles={styles} />
)

// 默认导出
export default ButtonPreview
