import React from 'react'
import { ComponentRendererProps } from '@/types/page-designer/component'
import { cn } from '@/lib/utils'

export interface SpacerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | number
  customSize?: number
  direction?: 'vertical' | 'horizontal' | 'both'
  flexible?: boolean
  backgroundColor?: string
  showBorder?: boolean
  className?: string
}

// 预设间距映射
const SPACING_MAP: Record<string, number> = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const Spacer: React.FC<
  ComponentRendererProps & SpacerProps & React.HTMLAttributes<HTMLDivElement>
> = ({
  id,
  props = {},
  styles = {},
  className,
  isSelected,
  isDragging,
  onSelect,
  onDelete,
  readonly,
  onUpdate,
  isHovered,
  ...htmlProps
}) => {
  const {
    size = 'md',
    customSize,
    direction = 'vertical',
    flexible = false,
    backgroundColor = 'transparent',
    showBorder = false,
  } = props

  // 计算间距值
  const getSpacingValue = (): number => {
    if (customSize !== undefined && customSize > 0) {
      return customSize
    }

    if (typeof size === 'number') {
      return size
    }

    return SPACING_MAP[size] || SPACING_MAP.md
  }

  const spacingValue = getSpacingValue()

  // 生成样式
  const generateStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor,
      display: styles.display || 'block',
      opacity: styles.opacity || 1,
      minWidth: styles.minWidth,
      minHeight: styles.minHeight,
      border: showBorder ? '1px dashed #d1d5db' : 'none',
    }

    if (flexible) {
      // 弹性间距
      if (direction === 'vertical') {
        return {
          ...baseStyles,
          flex: 1,
          width: '100%',
          minHeight: spacingValue,
        }
      } else if (direction === 'horizontal') {
        return {
          ...baseStyles,
          flex: 1,
          height: '100%',
          minWidth: spacingValue,
        }
      } else {
        return {
          ...baseStyles,
          flex: 1,
          minHeight: spacingValue,
          minWidth: spacingValue,
        }
      }
    } else {
      // 固定间距
      if (direction === 'vertical') {
        return {
          ...baseStyles,
          width: '100%',
          height: `${spacingValue}px`,
        }
      } else if (direction === 'horizontal') {
        return {
          ...baseStyles,
          height: '100%',
          width: `${spacingValue}px`,
        }
      } else {
        return {
          ...baseStyles,
          width: `${spacingValue}px`,
          height: `${spacingValue}px`,
        }
      }
    }
  }

  return (
    <div
      data-component-id={id}
      data-component-type="spacer"
      data-size={size}
      data-direction={direction}
      data-flexible={flexible}
      className={cn('spacer', className)}
      style={generateStyles()}
      role="separator"
      aria-label={`${direction === 'vertical' ? '垂直' : direction === 'horizontal' ? '水平' : '双向'}间距: ${spacingValue}px`}
      aria-hidden="true"
    />
  )
}
