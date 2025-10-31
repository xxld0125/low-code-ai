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
  // 默认预览属性 - 在组件库中只展示简单的基础按钮
  const defaultPreviewProps: LowcodeButtonProps = {
    text: '按钮',
    variant: 'default',
    size: 'default',
    disabled: false,
    loading: false,
    ...props,
  }

  return (
    <div style={styles} className="flex justify-center">
      <Button {...defaultPreviewProps} variant={variant} size={size} />
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
