/**
 * 组件类型定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

import { ReactNode } from 'react'
import type { SpacingValue, BackgroundValue, BorderValue } from './style'

// 基础组件属性接口
export interface ComponentProps {
  // 表单组件属性
  button?: ButtonProps
  input?: InputProps
  textarea?: TextareaProps
  select?: SelectProps
  checkbox?: CheckboxProps
  radio?: RadioProps

  // 展示组件属性
  text?: TextProps
  heading?: HeadingProps
  image?: ImageProps
  card?: CardProps
  badge?: BadgeProps

  // 布局组件属性
  container?: ContainerProps
  row?: RowProps
  col?: ColProps
  divider?: DividerProps
  spacer?: SpacerProps
}

// 表单组件属性类型
export interface ButtonProps {
  text?: string
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  icon?: ReactNode
  icon_position?: 'left' | 'right'
  onClick?: string // 事件处理器标识符
}

export interface InputProps {
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  value?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxlength?: number
  minlength?: number
  pattern?: string
  error?: string
  helper?: string
}

export interface TextareaProps {
  label?: string
  placeholder?: string
  value?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  maxlength?: number
  error?: string
  helper?: string
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
}

export interface SelectProps {
  label?: string
  placeholder?: string
  value?: string | string[]
  options?: SelectOption[]
  required?: boolean
  disabled?: boolean
  multiple?: boolean
  error?: string
  helper?: string
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  group?: string
}

export interface CheckboxProps {
  label?: string
  checked?: boolean
  disabled?: boolean
  required?: boolean
  indeterminate?: boolean
  error?: string
  helper?: string
}

export interface RadioProps {
  label?: string
  options?: RadioOption[]
  value?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helper?: string
}

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

// 展示组件属性类型
export interface TextProps {
  content?: string
  variant?: 'body' | 'caption'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right' | 'justify'
  color?: string
  decoration?: 'none' | 'underline' | 'line-through'
}

export interface HeadingProps {
  content?: string
  level?: 1 | 2 | 3 | 4 | 5 | 6
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  align?: 'left' | 'center' | 'right'
  color?: string
  decoration?: 'none' | 'underline'
}

export interface ImageProps {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  object_fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded?: boolean | string
  shadow?: boolean | string
  loading?: 'lazy' | 'eager'
}

export interface CardProps {
  title?: string
  description?: string
  footer?: string
  padding?: number | string
  rounded?: boolean | string
  shadow?: boolean | string
  border?: boolean | string
  background?: string
}

export interface BadgeProps {
  content?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  rounded?: boolean | string
}

// 布局组件属性类型
export interface ContainerProps {
  direction?: 'row' | 'column'
  wrap?: boolean
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch'
  gap?: number | string
  padding?: SpacingValue
  margin?: SpacingValue
  background?: BackgroundValue
  border?: BorderValue
  rounded?: boolean | string
  shadow?: boolean | string
}

export interface RowProps {
  wrap?: boolean
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'stretch'
  gap?: number | string
  padding?: SpacingValue
  margin?: SpacingValue
}

export interface ColProps {
  span?: GridSpan
  offset?: GridSpan
  order?: number | OrderValue
  flex?: string | number
  flex_grow?: number
  flex_shrink?: number
  flex_basis?: string | number
  align_self?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  padding?: SpacingValue
  margin?: SpacingValue
}

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  thickness?: number | string
  color?: string
  style?: 'solid' | 'dashed' | 'dotted'
  length?: number | string
}

export interface SpacerProps {
  size?: number | string
  direction?: 'horizontal' | 'vertical'
}

// 通用工具类型（组件特定）
export type GridSpan =
  | number
  | {
      xs?: number | string
      sm?: number | string
      md?: number | string
      lg?: number | string
      xl?: number | string
    }
export type OrderValue = { xs?: number; sm?: number; md?: number; lg?: number; xl?: number }
