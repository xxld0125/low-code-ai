/**
 * 统一的图标组件接口定义
 */

import React from 'react'

export interface BaseIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  /** 图标描述，用于可访问性 */
  label?: string
  /** 是否作为装饰性图标（不显示给屏幕阅读器） */
  decorative?: boolean
}

export interface IconComponentType extends React.FC<BaseIconProps> {
  Small?: React.FC<Omit<BaseIconProps, 'size'>>
  Large?: React.FC<Omit<BaseIconProps, 'size'>>
}

/**
 * 创建标准化的图标组件
 */
export function createIconComponent(
  displayName: string,
  renderIcon: (props: BaseIconProps) => React.ReactElement
): IconComponentType {
  const IconComponent = React.forwardRef<SVGSVGElement, BaseIconProps>(
    ({ size = 24, className, label, decorative = true, ...props }, ref) => {
      return renderIcon({
        size,
        className,
        label,
        decorative,
        ref,
        ...props,
      })
    }
  ) as any

  IconComponent.displayName = displayName

  // 创建小尺寸变体
  IconComponent.Small = (props: any) => (
    <IconComponent size={16} {...props} />
  )
  IconComponent.Small.displayName = `${displayName}.Small`

  // 创建大尺寸变体
  IconComponent.Large = (props: any) => (
    <IconComponent size={32} {...props} />
  )
  IconComponent.Large.displayName = `${displayName}.Large`

  return IconComponent as IconComponentType
}

/**
 * 获取标准化的图标SVG属性
 */
export function getIconSVGProps(props: BaseIconProps): React.SVGProps<SVGSVGElement> {
  const { label, decorative = true, size = 24, className, ...svgProps } = props

  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': decorative,
    'aria-label': decorative ? undefined : label,
    role: decorative ? 'img' : undefined,
    focusable: 'false',
    className: `text-gray-600 ${className || ''}`,
    ...svgProps,
  }
}