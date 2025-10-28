/**
 * 样式类型定义
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-28
 */

// CSS样式值类型
export interface StyleValue {
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距
  margin?: SpacingValue
  padding?: SpacingValue

  // 背景和边框
  background?: string | BackgroundValue
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string

  border?: BorderValue
  borderRadius?: string | number | boolean
  boxShadow?: string

  // 字体和文本
  color?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textDecoration?: 'none' | 'underline' | 'line-through'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  lineHeight?: string | number
  letterSpacing?: string | number

  // 布局
  display?: string
  position?: string
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  zIndex?: number

  // Flexbox
  flex?: string | number
  flexDirection?: string
  flexWrap?: string
  justifyContent?: string
  alignItems?: string
  gap?: string | number

  // 其他
  opacity?: number
  overflow?: string
  transform?: string
  transition?: string
  cursor?: string
  userSelect?: string
  pointerEvents?: string
}

// 间距值类型
export type SpacingValue =
  | string
  | number
  | {
      x?: string | number
      y?: string | number
      top?: string | number
      right?: string | number
      bottom?: string | number
      left?: string | number
    }

// 背景值类型
export interface BackgroundValue {
  color?: string
  image?: string
  size?: string
  position?: string
  repeat?: string
}

// 边框值类型
export type BorderValue =
  | boolean
  | string
  | {
      width?: number
      color?: string
      style?: 'solid' | 'dashed' | 'dotted' | 'double'
      side?: 'all' | 'top' | 'right' | 'bottom' | 'left' | 'x' | 'y'
    }

// 响应式断点
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// 响应式样式
export interface ResponsiveStyle {
  xs?: StyleValue
  sm?: StyleValue
  md?: StyleValue
  lg?: StyleValue
  xl?: StyleValue
}

// 主题系统
export interface Theme {
  colors: {
    primary: ColorPalette
    secondary: ColorPalette
    success: ColorPalette
    warning: ColorPalette
    error: ColorPalette
    gray: ColorPalette
    background: BackgroundColors
    text: TextColors
    border: BorderColors
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  typography: {
    fontFamily: {
      sans: string[]
      serif: string[]
      mono: string[]
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
      '5xl': string
      '6xl': string
    }
    fontWeight: {
      normal: number
      medium: number
      semibold: number
      bold: number
    }
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    xl: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    inner: string
  }
}

export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

export interface BackgroundColors {
  DEFAULT: string
  paper: string
  elevated: string
  overlay: string
}

export interface TextColors {
  primary: string
  secondary: string
  muted: string
  inverse: string
}

export interface BorderColors {
  DEFAULT: string
  muted: string
  interactive: string
}

// 样式编辑器状态
export interface StyleEditorState {
  current_styles: StyleValue
  active_breakpoint: Breakpoint
  theme: Theme
  preset_styles: StylePreset[]
  custom_properties: Record<string, string>
}

export interface StylePreset {
  id: string
  name: string
  description?: string
  styles: StyleValue
  category: string
  tags?: string[]
}
