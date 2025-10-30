// 页面设计器组件类型定义

// 组件类型枚举
export const COMPONENT_TYPES = {
  // 基础组件
  BUTTON: 'button',
  INPUT: 'input',
  TEXT: 'text',
  IMAGE: 'image',
  LINK: 'link',
  HEADING: 'heading',
  PARAGRAPH: 'paragraph',
  DIVIDER: 'divider',
  SPACER: 'spacer',

  // 布局组件
  CONTAINER: 'container',
  ROW: 'row',
  COL: 'col',

  // 表单组件
  FORM: 'form',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',

  // 导航组件
  NAVBAR: 'navbar',
  SIDEBAR: 'sidebar',
  BREADCRUMB: 'breadcrumb',
  TABS: 'tabs',

  // 列表组件
  LIST: 'list',
  TABLE: 'table',
  CARD: 'card',
  GRID: 'grid',
} as const

export type ComponentType = (typeof COMPONENT_TYPES)[keyof typeof COMPONENT_TYPES]

// 布局组件类型（从layout.ts重新导出）
export type LayoutComponentType =
  | 'container'
  | 'row'
  | 'col'
  | 'grid'
  | 'flex'
  | 'section'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'article'

// 组件分类
export const COMPONENT_CATEGORIES = {
  BASIC: 'basic',
  LAYOUT: 'layout',
  FORM: 'form',
  NAVIGATION: 'navigation',
  LIST: 'list',
  BUSINESS: 'business',
} as const

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[keyof typeof COMPONENT_CATEGORIES]

// 响应式断点
export const BREAKPOINTS = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl',
  '2XL': '2xl',
} as const

export type Breakpoint = (typeof BREAKPOINTS)[keyof typeof BREAKPOINTS]

// 组件属性定义
export interface ComponentProps {
  // Button属性
  button?: {
    text: string
    variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    size: 'sm' | 'default' | 'lg' | 'icon'
    disabled?: boolean
    loading?: boolean
    icon?: string
    icon_position?: 'left' | 'right'
    onClick?: string
    type?: 'button' | 'submit' | 'reset'
    className?: string
  }

  // Input属性
  input?: {
    placeholder?: string
    value?: string
    type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    maxlength?: number
    minlength?: number
    pattern?: string
    label?: string
    error?: string
    helper?: string
    className?: string
  }

  // Link属性
  link?: {
    text: string
    href: string
    target?: '_self' | '_blank' | '_parent' | '_top'
    rel?: string
    download?: string
    className?: string
  }

  // Text属性
  text?: {
    content: string
    variant: 'body' | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
    weight?: 'normal' | 'medium' | 'semibold' | 'bold'
    size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
    color?: string
    align?: 'left' | 'center' | 'right' | 'justify'
    decoration?: 'none' | 'underline' | 'line-through'
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
    className?: string
  }

  // Image属性
  image?: {
    src: string
    alt?: string
    width?: number | 'auto'
    height?: number | 'auto'
    object_fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    rounded?: boolean
    shadow?: boolean
    loading?: 'lazy' | 'eager'
    className?: string
  }

  // Container属性
  container?: {
    direction?: 'row' | 'column'
    wrap?: boolean
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    align?: 'start' | 'center' | 'end' | 'stretch'
    gap?: number
    padding?: SpacingValue
    margin?: SpacingValue
    background?: BackgroundValue
    border?: BorderValue
    shadow?: ShadowValue
    rounded?: RoundedValue
    tag?: 'div' | 'section' | 'article' | 'main' | 'header' | 'footer' | 'nav' | 'aside'
    className?: string
  }

  // Row属性
  row?: {
    wrap?: boolean
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    align?: 'start' | 'center' | 'end' | 'stretch'
    gap?: SpacingValue
    padding?: SpacingValue
    margin?: SpacingValue
  }

  // Col属性
  col?: {
    span?: number | Record<Breakpoint, number>
    offset?: number | Record<Breakpoint, number>
    order?: number
    flex?: string | number
    flexGrow?: number
    flexShrink?: number
    flexBasis?: string | number
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
    padding?: SpacingValue
    margin?: SpacingValue
  }

  // 通用属性
  [key: string]: any
}

// 间距值类型
export type SpacingValue =
  | string
  | number
  | {
      x?: number
      y?: number
      top?: number
      right?: number
      bottom?: number
      left?: number
    }

// 背景值类型
export type BackgroundValue =
  | string
  | {
      color?: string
      image?: string
      size?: 'cover' | 'contain' | 'auto'
      position?: string
      repeat?: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y'
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

// 阴影值类型
export type ShadowValue = boolean | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner' | string

// 圆角值类型
export type RoundedValue =
  | boolean
  | 'none'
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | 'full'
  | string
  | number

// 样式类型定义
export interface ComponentStyles {
  // 尺寸
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距
  margin?: SpacingValue
  padding?: SpacingValue

  // 定位
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  zIndex?: number

  // 显示和布局
  display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'grid' | 'none'
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto'
  order?: number
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
  flex?: {
    grow?: number
    shrink?: number
    basis?: string | number
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
    align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
    gap?: string | number
  }
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  gap?: SpacingValue
  flexGrow?: number
  flexShrink?: number
  flexBasis?: string | number
  grid?: {
    columns?: string
    rows?: string
    areas?: string
    gap?: string | number
  }

  // 背景
  background?: BackgroundValue
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string

  // 边框
  border?: BorderValue
  borderRadius?: RoundedValue
  marginLeft?: string | number

  // 阴影
  boxShadow?: ShadowValue

  // 文字样式
  color?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textDecoration?: string
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase'
  lineHeight?: string | number

  // 透明度
  opacity?: number

  // 过渡
  transition?: string

  // 自定义CSS
  customCSS?: string
}

// 事件处理定义
export interface ComponentEvents {
  [eventType: string]: EventHandlerConfig
}

export interface EventHandlerConfig {
  id: string
  type: EventType
  action: EventAction
  enabled: boolean
  conditions?: EventCondition[]
}

export type EventType =
  | 'click'
  | 'change'
  | 'submit'
  | 'focus'
  | 'blur'
  | 'hover'
  | 'load'
  | 'scroll'

export type EventAction =
  | { type: 'navigate'; to: string }
  | { type: 'api'; method: 'GET' | 'POST' | 'PUT' | 'DELETE'; url: string; data?: any }
  | { type: 'setState'; state: Record<string, any> }
  | { type: 'showMessage'; message: string; variant?: 'success' | 'error' | 'warning' | 'info' }
  | { type: 'component'; action: 'show' | 'hide' | 'enable' | 'disable'; target: string }
  | { type: 'custom'; code: string }

export interface EventCondition {
  type: 'component' | 'state' | 'form'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than'
  field: string
  value: any
}

// 响应式配置
export type ResponsiveConfig = {
  [breakpoint in Breakpoint]?: {
    props?: Partial<ComponentProps>
    styles?: Partial<ComponentStyles>
    visible?: boolean
  }
}

// 组件实例
export interface ComponentInstance {
  id: string
  page_design_id: string
  component_type: ComponentType
  parent_id?: string

  // 层级和位置
  position: {
    z_index: number
    order: number
  }

  // 组件属性
  props: ComponentProps
  styles: ComponentStyles
  events: ComponentEvents

  // 响应式配置
  responsive: ResponsiveConfig

  // 布局属性（仅对布局组件有效）
  layout_props?: {
    container?: ComponentProps['container']
    row?: ComponentProps['row']
    col?: ComponentProps['col']
  }

  // 系统字段
  created_at: string
  updated_at: string
  version: number

  // 元数据
  meta: {
    locked: boolean
    hidden: boolean
    custom_name?: string
    notes?: string
  }
}

// 组件定义
export interface ComponentDefinition {
  type: ComponentType
  name: string
  category: ComponentCategory
  icon: React.ComponentType<any>
  description?: string
  defaultProps: ComponentProps
  defaultStyles: ComponentStyles
  configurableProps: PropDefinition[]
  render: (props: any) => React.ReactElement
  constraints: ComponentConstraints
  examples?: ComponentExample[]

  // 新增属性以支持 validation.ts
  tags?: string[]
  configurable?: Record<string, any>
  responsive?: {
    breakpoints?: string[]
    properties?: string[]
  }
}

// 属性定义
export interface PropDefinition {
  name: string
  type: PropType
  label: string
  description?: string
  required?: boolean
  default?: any
  options?: PropOption[]
  validation?: PropValidation
  group?: string
}

export type PropType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiselect'
  | 'color'
  | 'image'
  | 'link'
  | 'text'
  | 'json'
  | 'array'
  | 'object'

export interface PropOption {
  label: string
  value: any
  description?: string
}

export interface PropValidation {
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  required?: boolean
  custom?: string // 自定义验证函数
}

// 组件约束
export interface ComponentConstraints {
  maxDepth?: number
  allowedParents?: ComponentType[]
  allowedChildren?: ComponentType[]
  maxInstances?: number
  requiresParent?: boolean
  canContainChildren?: boolean
  uniqueInParent?: boolean
}

// 组件示例
export interface ComponentExample {
  name: string
  description?: string
  props: ComponentProps
  styles?: ComponentStyles
  preview?: string // 预览图URL
}

// 组件树结构
export interface ComponentTree {
  version: string
  root_id: string
  components: Record<string, ComponentInstance>
  hierarchy: HierarchyNode[]
}

export interface HierarchyNode {
  component_id: string
  parent_id?: string
  children: string[]
  depth: number
  path: string
}

// 组件验证结果
export interface ComponentValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'required' | 'invalid_type' | 'constraint' | 'reference'
  message: string
  field?: string
  componentId?: string
}

export interface ValidationWarning {
  type: 'performance' | 'accessibility' | 'best_practice'
  message: string
  componentId?: string
  suggestion?: string
}

// 组件渲染属性
export interface ComponentRendererProps {
  id: string
  type: ComponentType
  props: ComponentProps
  styles: ComponentStyles
  events: ComponentEvents
  responsive?: ResponsiveConfig
  isSelected?: boolean
  isHovered?: boolean
  isDragging?: boolean
  readonly?: boolean
  onSelect?: (id: string) => void
  onUpdate?: (id: string, updates: Partial<ComponentInstance>) => void
  onDelete?: (id: string) => void
  children?: React.ReactNode
}

// 拖拽数据接口
export interface DragItem {
  type: ComponentType
  id: string
  isFromPanel: boolean
  componentData?: Partial<ComponentInstance>
}

// 拖拽状态接口
export interface DragState {
  isDragging: boolean
  activeId: string | null
  draggedComponentType: ComponentType | null
  dropZoneId: string | null
  position?: { x: number; y: number }
}

// 拖拽提供者属性
export interface DragProviderProps {
  children: React.ReactNode
  onDragStart?: (dragData: DragItem) => void
  onDragEnd?: (dragData: DragItem | null, dropData: any) => void
  onDragOver?: (dragData: DragItem, dropData: any) => void
}

// 拖拽覆盖层属性
export interface DragOverlayProps {
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}
