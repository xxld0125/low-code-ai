// 页面设计器布局组件类型定义

import {
  ComponentType,
  ComponentProps,
  ComponentStyles,
  Breakpoint,
  SpacingValue,
} from './component'

// 重新导出Breakpoint类型
export type { Breakpoint } from './component'

// 布局组件类型枚举（扩展基础组件类型）
export const LAYOUT_COMPONENT_TYPES = {
  CONTAINER: 'container',
  ROW: 'row',
  COL: 'col',
  GRID: 'grid',
  FLEX: 'flex',
  SECTION: 'section',
  ASIDE: 'aside',
  HEADER: 'header',
  FOOTER: 'footer',
  MAIN: 'main',
  NAV: 'nav',
  ARTICLE: 'article',
} as const

export type LayoutComponentType =
  (typeof LAYOUT_COMPONENT_TYPES)[keyof typeof LAYOUT_COMPONENT_TYPES]

// 布局系统类型
export const LAYOUT_SYSTEMS = {
  FLEXBOX: 'flexbox',
  GRID: 'grid',
  CUSTOM: 'custom',
} as const

export type LayoutSystem = (typeof LAYOUT_SYSTEMS)[keyof typeof LAYOUT_SYSTEMS]

// Flexbox布局属性
export interface FlexboxLayoutProps {
  display: 'flex'
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly'
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'space-between' | 'space-around'
  gap?: SpacingValue
  rowGap?: SpacingValue
  columnGap?: SpacingValue
}

// Grid布局属性
export interface GridLayoutProps {
  display: 'grid'
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridTemplateAreas?: string
  gridAutoColumns?: string
  gridAutoRows?: string
  gridAutoFlow?: 'row' | 'column' | 'row dense' | 'column dense'
  gridColumnGap?: SpacingValue
  gridRowGap?: SpacingValue
  gap?: SpacingValue
  justifyItems?: 'start' | 'end' | 'center' | 'stretch'
  alignItems?: 'start' | 'end' | 'center' | 'stretch'
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
  alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between'
}

// Container容器属性
export interface ContainerProps extends FlexboxLayoutProps {
  // 基础属性
  maxWidth?:
    | 'none'
    | 'xs'
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl'
    | string
  centerContent?: boolean

  // 尺寸控制
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number

  // 间距
  padding?: SpacingValue
  margin?: SpacingValue

  // 背景和边框
  background?: string
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: 'cover' | 'contain' | 'auto'
  backgroundPosition?: string
  backgroundRepeat?: 'repeat' | 'no-repeat'

  border?: boolean | string
  borderColor?: string
  borderWidth?: number
  borderRadius?: string | number

  // 阴影效果
  shadow?: boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner'

  // 圆角效果
  rounded?: boolean | 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

  // 溢出控制
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto'
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto'
}

// Row行布局属性
export interface RowProps extends FlexboxLayoutProps {
  // Row特有属性
  reverse?: boolean

  // 响应式断点控制
  responsive?: {
    [breakpoint in Breakpoint]?: {
      direction?: FlexboxLayoutProps['direction']
      wrap?: FlexboxLayoutProps['wrap']
      justify?: FlexboxLayoutProps['justify']
      align?: FlexboxLayoutProps['align']
      gap?: SpacingValue
    }
  }

  // 间距
  gap?: SpacingValue
  padding?: SpacingValue
  margin?: SpacingValue

  // 对齐辅助线
  showAlignmentGuides?: boolean
}

// Col列布局属性
export interface ColProps {
  // 栅格系统
  span?: number | string | Record<Breakpoint, number | string>
  offset?: number | string | Record<Breakpoint, number | string>
  order?: number | Record<Breakpoint, number>

  // Flexbox属性
  flex?: string | number
  flexGrow?: number
  flexShrink?: number
  flexBasis?: string | number

  // 对齐
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'

  // 间距
  padding?: SpacingValue
  margin?: SpacingValue

  // 响应式断点控制
  responsive?: {
    [breakpoint in Breakpoint]?: {
      span?: number | string
      offset?: number | string
      order?: number
      flex?: string | number
      alignSelf?: ColProps['alignSelf']
      padding?: SpacingValue
      margin?: SpacingValue
    }
  }

  // 显示控制
  hide?: Record<Breakpoint, boolean>
  show?: Record<Breakpoint, boolean>
}

// Grid网格布局属性
export interface GridProps extends GridLayoutProps {
  // 网格命名区域
  areas?: Record<string, string>
  templateAreas?: string[]

  // 子项布局
  autoFit?: boolean
  autoFill?: boolean
  minMaxWidth?: string
  minMaxHeight?: string

  // 间距
  gap?: SpacingValue
  padding?: SpacingValue
  margin?: SpacingValue

  // 响应式网格
  responsive?: {
    [breakpoint in Breakpoint]?: {
      columns?: string
      rows?: string
      areas?: string[]
      gap?: SpacingValue
    }
  }
}

// 布局容器基础接口
export interface LayoutContainerProps {
  // 通用布局属性
  layout?: LayoutSystem

  // 容器标识
  id: string
  type: LayoutComponentType
  name?: string

  // 子组件管理
  children?: string[] // 子组件ID数组
  maxChildren?: number
  allowedChildTypes?: ComponentType[]

  // 尺寸和定位
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距
  margin?: SpacingValue
  padding?: SpacingValue

  // 显示属性
  display?: 'block' | 'flex' | 'grid' | 'none'
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex?: number

  // 背景和边框
  background?: string
  backgroundColor?: string
  border?: boolean | string
  borderColor?: string
  borderWidth?: number
  borderRadius?: string | number

  // 阴影和效果
  boxShadow?: string
  opacity?: number

  // 自定义CSS
  customCSS?: string

  // 元数据
  meta?: {
    locked?: boolean
    hidden?: boolean
    customName?: string
    description?: string
  }
}

// 布局约束规则
export interface LayoutConstraints {
  // 父子关系约束
  allowedParents?: LayoutComponentType[]
  allowedChildren?: ComponentType[] | LayoutComponentType[]
  requiredParents?: LayoutComponentType[]

  // 嵌套约束
  maxNestingLevel?: number
  maxDirectChildren?: number

  // 尺寸约束
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number

  // 布局系统约束
  supportedLayoutSystems?: LayoutSystem[]

  // 特殊约束
  canContainLayoutComponents?: boolean
  canContainBasicComponents?: boolean
  requiresSpecificBreakpoint?: Breakpoint
}

// 布局验证结果
export interface LayoutValidationResult {
  isValid: boolean
  errors: LayoutValidationError[]
  warnings: LayoutValidationWarning[]
  suggestions?: LayoutValidationSuggestion[]
}

export interface LayoutValidationError {
  code: string
  message: string
  componentId: string
  parentId?: string
  severity: 'error' | 'warning'
  field?: string
}

export interface LayoutValidationWarning {
  code: string
  message: string
  componentId: string
  suggestion?: string
  impact?: 'performance' | 'accessibility' | 'responsive' | 'best_practice'
}

export interface LayoutValidationSuggestion {
  type: 'add' | 'remove' | 'modify' | 'reorder'
  target: string
  description: string
  action: string
  priority: 'high' | 'medium' | 'low'
}

// 布局计算结果
export interface LayoutCalculationResult {
  // 计算后的样式
  computedStyles: ComponentStyles

  // 布局信息
  layoutInfo: {
    width: number
    height: number
    position: { x: number; y: number }
    zIndex: number
  }

  // 子组件布局信息
  childrenLayouts: Record<
    string,
    {
      position: { x: number; y: number }
      size: { width: number; height: number }
      zIndex: number
    }
  >

  // 响应式信息
  responsive: {
    breakpoint: Breakpoint
    viewportWidth: number
    adjustments: string[]
  }

  // 性能信息
  performance: {
    calculationTime: number
    affectedComponents: number
    optimized: boolean
  }
}

// 布局引擎配置
export interface LayoutEngineConfig {
  // 性能设置
  enableCaching: boolean
  cacheSize: number
  debounceDelay: number

  // 网格设置
  gridSize: number
  snapToGrid: boolean
  showGrid: boolean

  // 对齐设置
  enableAlignmentGuides: boolean
  alignmentThreshold: number

  // 响应式设置
  breakpoints: Record<Breakpoint, number>
  mobileFirst: boolean

  // 验证设置
  enableValidation: boolean
  strictMode: boolean
  showWarnings: boolean
}

// 布局变更事件
export interface LayoutChangeEvent {
  type: 'layout_change'
  componentId: string
  changeType: 'add' | 'remove' | 'move' | 'resize' | 'reorder'
  oldValue?: any
  newValue?: any
  timestamp: number
  source: 'user' | 'system' | 'responsive'
}

// 布局快照
export interface LayoutSnapshot {
  id: string
  timestamp: number
  layout: Record<string, LayoutContainerProps>
  hierarchy: Record<string, string[]>
  viewport: {
    width: number
    height: number
    breakpoint: Breakpoint
  }
  metadata: {
    version: string
    createdBy: string
    description?: string
  }
}

// 布局模板
export interface LayoutTemplate {
  id: string
  name: string
  description: string
  category: 'basic' | 'navigation' | 'content' | 'form' | 'ecommerce' | 'custom'
  preview: string // 预览图URL

  // 模板结构
  structure: {
    root: LayoutContainerProps
    components: Record<string, LayoutContainerProps>
  }

  // 适用条件
  constraints: {
    minViewportWidth?: number
    maxViewportWidth?: number
    supportedBreakpoints?: Breakpoint[]
  }

  // 样式变量
  theme?: {
    colors: Record<string, string>
    spacing: Record<string, string>
    typography: Record<string, string>
  }

  // 元数据
  metadata: {
    tags: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime: number
    author: string
    createdAt: string
    updatedAt: string
  }
}

// 响应式布局上下文
export interface LayoutContext {
  viewport: {
    width: number
    height: number
  }
  breakpoint: Breakpoint
  orientation: 'portrait' | 'landscape'
  devicePixelRatio: number
}
