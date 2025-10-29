/**
 * 组件注册系统类型定义
 * 功能模块: 基础组件库 (004-basic-component-library) - T006任务
 * 创建日期: 2025-10-29
 * 描述: 属性定义和验证系统的核心类型定义
 */

// ============================================================================
// 基础枚举类型
// ============================================================================

/**
 * 组件分类枚举
 */
export enum ComponentCategory {
  BASIC = 'basic', // 基础组件 (Button, Input等)
  DISPLAY = 'display', // 展示组件 (Text, Image等)
  LAYOUT = 'layout', // 布局组件 (Container, Grid等)
  FORM = 'form', // 表单组件 (FormField, FormSection等)
  ADVANCED = 'advanced', // 高级组件
  CUSTOM = 'custom', // 自定义组件
}

/**
 * 属性类型枚举
 */
export enum PropType {
  // 基础类型
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',

  // 特殊类型
  COLOR = 'color',
  DATE = 'date',
  TIME = 'time',
  URL = 'url',
  EMAIL = 'email',

  // 选择类型
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',

  // 复杂类型
  ARRAY = 'array',
  OBJECT = 'object',
  JSON = 'json',

  // 样式类型
  SIZE = 'size',
  SPACING = 'spacing',
  BORDER = 'border',
  SHADOW = 'shadow',

  // 响应式类型
  RESPONSIVE_SIZE = 'responsive_size',
  RESPONSIVE_SPACING = 'responsive_spacing',
}

/**
 * 属性类别枚举
 */
export enum PropCategory {
  BASIC = 'basic', // 基础属性
  STYLE = 'style', // 样式属性
  LAYOUT = 'layout', // 布局属性
  EVENT = 'event', // 事件属性
  ADVANCED = 'advanced', // 高级属性
}

/**
 * 组件状态枚举
 */
export enum ComponentStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 激活
  DEPRECATED = 'deprecated', // 废弃
  ARCHIVED = 'archived', // 归档
}

/**
 * 断点枚举
 */
export enum Breakpoint {
  XS = 'xs', // 超小屏幕
  SM = 'sm', // 小屏幕
  MD = 'md', // 中等屏幕
  LG = 'lg', // 大屏幕
  XL = 'xl', // 超大屏幕
  XXL = 'xxl', // 超超大屏幕
}

// ============================================================================
// 属性选项和约束相关类型
// ============================================================================

/**
 * 属性选项定义
 */
export interface PropOption {
  value: any // 选项值
  label: string // 显示标签
  description?: string // 选项描述
  icon?: string // 选项图标
  disabled?: boolean // 是否禁用
  group?: string // 选项分组
}

/**
 * 属性约束定义
 */
export interface PropConstraints {
  // 字符串约束
  minLength?: number
  maxLength?: number
  pattern?: string // 正则表达式
  patternMessage?: string // 正则匹配失败提示

  // 数字约束
  min?: number
  max?: number
  step?: number
  precision?: number // 小数位数

  // 数组约束
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean

  // 对象约束
  requiredKeys?: string[] // 必需的键
  allowedKeys?: string[] // 允许的键

  // 自定义约束
  customValidator?: string // 自定义验证函数名
  constraintMessage?: string // 约束失败提示
}

/**
 * 显示提示定义
 */
export interface DisplayHint {
  type: 'condition' | 'dependency' | 'format' | 'layout'
  condition?: string // 显示条件
  format?: string // 显示格式
  layout?: 'inline' | 'block' | 'grid' // 布局方式
  width?: string | number // 宽度
  height?: string | number // 高度
}

// ============================================================================
// 验证和编辑器相关类型
// ============================================================================

/**
 * 验证规则定义
 */
export interface ValidationRule {
  name: string // 规则名称
  type: 'required' | 'type' | 'format' | 'range' | 'custom' // 规则类型
  condition?: string // 验证条件
  message: string // 错误消息
  severity?: 'error' | 'warning' | 'info' // 严重级别
  async?: boolean // 是否异步验证
}

/**
 * 编辑器配置定义
 */
export interface EditorConfig {
  // 基础配置
  widget:
    | 'input'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'radio'
    | 'color'
    | 'date'
    | 'time'
    | 'slider'
    | 'switch'
    | 'file'
    | 'custom' // 编辑器控件类型
  placeholder?: string // 占位符文本
  disabled?: boolean // 是否禁用
  readonly?: boolean // 是否只读

  // 显示配置
  label?: string // 标签文本
  description?: string // 描述文本
  helpText?: string // 帮助文本
  tooltip?: string // 工具提示

  // 选项配置 (用于select、radio等)
  options?: PropOption[]
  optionGroups?: { [group: string]: string } // 选项分组

  // 样式配置
  width?: string | number
  height?: string | number
  maxWidth?: string | number
  maxHeight?: string | number
  maxLength?: number // 最大长度 (用于input等)
  type?: string // 输入类型 (用于input等)
  min?: number | string // 最小值
  max?: number | string // 最大值

  // 高级配置
  customWidget?: string // 自定义组件名
  widgetProps?: Record<string, any> // 传递给组件的属性
  format?: string // 显示格式
  parse?: string // 解析格式

  // 依赖配置
  showWhen?: string // 显示条件表达式
  hideWhen?: string // 隐藏条件表达式
  enableWhen?: string // 启用条件表达式
  disableWhen?: string // 禁用条件表达式
}

// ============================================================================
// 依赖关系相关类型
// ============================================================================

/**
 * 属性依赖关系定义
 */
export interface PropertyDependency {
  type: 'value' | 'visibility' | 'enablement' | 'validation' // 依赖类型
  sourceProperty: string // 源属性名
  condition: DependencyCondition // 依赖条件
  action: DependencyAction // 依赖动作
}

/**
 * 依赖条件定义
 */
export interface DependencyCondition {
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'in'
    | 'not_in'
    | 'contains'
    | 'not_contains'
    | 'regex'
    | 'custom' // 比较操作符
  value: any // 比较值
  customFunction?: string // 自定义比较函数名
}

/**
 * 依赖动作定义
 */
export interface DependencyAction {
  type:
    | 'show'
    | 'hide'
    | 'enable'
    | 'disable'
    | 'set_value'
    | 'clear_value'
    | 'add_validation'
    | 'remove_validation'
    | 'update_options' // 动作类型
  value?: any // 动作值 (用于set_value等)
  options?: PropOption[] // 新选项 (用于update_options)
  validation?: ValidationRule[] // 新验证规则 (用于add_validation等)
}

// ============================================================================
// 样式和布局相关类型
// ============================================================================

/**
 * 组件样式配置
 */
export interface ComponentStyles {
  // 显示属性
  display?: CSSDisplayProperty
  position?: CSSPositionProperty
  visibility?: CSSVisibilityProperty
  opacity?: number
  zIndex?: number

  // 尺寸控制
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距控制
  margin?: SpacingValue
  padding?: SpacingValue

  // 布局属性
  flex?: FlexProperties
  grid?: GridProperties

  // 文字样式
  color?: string
  backgroundColor?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: string | number
  textAlign?: CSSTextAlignProperty
  textDecoration?: CSSTextDecorationProperty

  // 边框和圆角
  border?: BorderProperties
  borderRadius?: BorderRadiusValue
  boxShadow?: string

  // 变换
  transform?: TransformProperties

  // 动画
  transition?: TransitionProperties

  // 自定义CSS
  customCSS?: string

  // 响应式样式
  responsive?: Record<Breakpoint, Partial<ComponentStyles>>
}

/**
 * 间距值定义
 */
export interface SpacingValue {
  top?: string | number
  right?: string | number
  bottom?: string | number
  left?: string | number
  all?: string | number
  x?: string | number // 水平间距
  y?: string | number // 垂直间距
}

/**
 * 弹性属性定义
 */
export interface FlexProperties {
  direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch'
  grow?: number
  shrink?: number
  basis?: string | number
  order?: number
  alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch'
}

/**
 * 网格属性定义
 */
export interface GridProperties {
  templateColumns?: string
  templateRows?: string
  templateAreas?: string
  columnGap?: string | number
  rowGap?: string | number
  gap?: string | number
  justifyContent?: 'start' | 'end' | 'center' | 'stretch'
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
  placeItems?: 'start' | 'end' | 'center' | 'stretch'
  gridArea?: string
  gridColumn?: string
  gridRow?: string
}

/**
 * 边框属性定义
 */
export interface BorderProperties {
  width?: string | number
  style?:
    | 'none'
    | 'hidden'
    | 'dotted'
    | 'dashed'
    | 'solid'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'inset'
    | 'outset'
  color?: string
  radius?: BorderRadiusValue
  top?: {
    width?: string | number
    style?: string
    color?: string
  }
  right?: {
    width?: string | number
    style?: string
    color?: string
  }
  bottom?: {
    width?: string | number
    style?: string
    color?: string
  }
  left?: {
    width?: string | number
    style?: string
    color?: string
  }
}

/**
 * 圆角值定义
 */
export interface BorderRadiusValue {
  topLeft?: string | number
  topRight?: string | number
  bottomRight?: string | number
  bottomLeft?: string | number
  all?: string | number
}

/**
 * 变换属性定义
 */
export interface TransformProperties {
  translate?: string
  rotate?: string
  scale?: string
  skew?: string
  matrix?: string
  origin?: string
}

/**
 * 过渡属性定义
 */
export interface TransitionProperties {
  property?: string
  duration?: string
  timingFunction?: string
  delay?: string
}

// ============================================================================
// 核心接口定义
// ============================================================================

/**
 * 属性模式定义
 * 这是组件属性系统的核心接口
 */
export interface PropSchema {
  id: string // 属性唯一标识
  componentId: string // 关联的组件ID

  // 基础属性
  name: string // 属性名称
  type: PropType // 属性数据类型
  label: string // 显示标签
  description?: string // 属性描述
  required: boolean // 是否必填
  defaultValue?: any // 默认值

  // 分组和显示
  group: string // 属性分组 (基础/样式/布局/高级)
  category: PropCategory // 属性类别
  order: number // 显示顺序
  displayHints?: DisplayHint[] // 显示提示

  // 选项和约束
  options?: PropOption[] // 可选值列表 (用于select/radio等)
  constraints?: PropConstraints // 属性约束

  // 验证规则
  validation?: ValidationRule[] // 验证规则

  // 编辑器配置
  editorConfig: EditorConfig // 编辑器配置

  // 响应式支持
  responsive: boolean // 是否支持响应式配置
  breakpoints?: Breakpoint[] // 支持的断点列表

  // 依赖关系
  dependencies?: PropertyDependency[] // 属性依赖关系

  // 状态
  createdAt: Date
  updatedAt: Date
}

/**
 * 组件定义接口
 */
export interface ComponentDefinition {
  // 基础标识
  id: string // 唯一标识符，格式: "component-{category}-{name}"
  name: string // 组件显示名称
  description: string // 组件描述
  version: string // 组件版本号 (semver)
  author: string // 作者

  // 分类信息
  category: ComponentCategory // 组件分类
  subcategory?: string // 子分类
  tags: string[] // 标签，用于搜索和过滤

  // 组件实现
  componentPath: string // React组件文件路径
  previewPath: string // 预览组件文件路径
  iconPath: string // 图标组件文件路径

  // 属性配置
  propsSchema: PropSchema[] // 属性定义数组
  defaultProps: Record<string, any> // 默认属性值
  defaultStyles: ComponentStyles // 默认样式配置

  // 约束和验证
  constraints: ComponentConstraints // 布局约束
  validationRules: ValidationRule[] // 验证规则

  // 状态管理
  status: ComponentStatus // 组件状态
  deprecated?: boolean // 是否已废弃
  deprecatedReason?: string // 废弃原因
  deprecatedAlternative?: string // 替代组件

  // 元数据
  createdAt: Date
  updatedAt: Date
  createdBy: string // 创建者用户ID
  updatedBy: string // 更新者用户ID
}

/**
 * 组件约束定义
 */
export interface ComponentConstraints {
  // 布局约束
  canHaveChildren?: boolean // 是否可以包含子组件
  maxChildren?: number // 最大子组件数量
  allowedParentTypes?: string[] // 允许的父组件类型
  allowedChildTypes?: string[] // 允许的子组件类型

  // 尺寸约束
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  aspectRatio?: number

  // 位置约束
  canDrag?: boolean // 是否可拖拽
  canResize?: boolean // 是否可调整大小
  canRotate?: boolean // 是否可旋转
  lockAspectRatio?: boolean // 是否锁定宽高比

  // 行为约束
  canDelete?: boolean // 是否可删除
  canCopy?: boolean // 是否可复制
  canEdit?: boolean // 是否可编辑
}

// ============================================================================
// CSS属性类型定义
// ============================================================================

type CSSDisplayProperty =
  | 'block'
  | 'inline'
  | 'inline-block'
  | 'flex'
  | 'inline-flex'
  | 'grid'
  | 'inline-grid'
  | 'none'
  | 'contents'
type CSSPositionProperty = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
type CSSVisibilityProperty = 'visible' | 'hidden' | 'collapse'
type CSSTextAlignProperty = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end'
type CSSTextDecorationProperty = 'none' | 'underline' | 'overline' | 'line-through' | 'blink'

// ============================================================================
// 验证结果相关类型
// ============================================================================

/**
 * 属性验证结果
 */
export interface PropValidationResult {
  valid: boolean // 是否有效
  value: any // 验证后的值
  errors: ValidationError[] // 错误列表
  warnings: ValidationWarning[] // 警告列表
}

/**
 * 验证错误定义
 */
export interface ValidationError {
  code: string // 错误代码
  message: string // 错误消息
  path?: string // 属性路径
  value?: any // 错误值
  constraint?: string // 违反的约束
}

/**
 * 验证警告定义
 */
export interface ValidationWarning {
  code: string // 警告代码
  message: string // 警告消息
  path?: string // 属性路径
  value?: any // 警告值
}

// ============================================================================
// 响应式相关类型
// ============================================================================

/**
 * 响应式值定义
 */
export interface ResponsiveValue<T> {
  [Breakpoint.XS]?: T
  [Breakpoint.SM]?: T
  [Breakpoint.MD]?: T
  [Breakpoint.LG]?: T
  [Breakpoint.XL]?: T
  [Breakpoint.XXL]?: T
}

/**
 * 响应式属性配置
 */
export interface ResponsivePropConfig {
  baseValue: any // 基础值
  breakpointValues: ResponsiveValue<any> // 断点值
  breakpoints: Breakpoint[] // 启用的断点
}

// ============================================================================
// 工具类型定义
// ============================================================================

/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 属性值类型映射
 */
export type PropValueMap = {
  [PropType.STRING]: string
  [PropType.NUMBER]: number
  [PropType.BOOLEAN]: boolean
  [PropType.COLOR]: string
  [PropType.DATE]: string
  [PropType.TIME]: string
  [PropType.URL]: string
  [PropType.EMAIL]: string
  [PropType.SELECT]: any
  [PropType.MULTI_SELECT]: any[]
  [PropType.RADIO]: any
  [PropType.CHECKBOX]: boolean
  [PropType.ARRAY]: any[]
  [PropType.OBJECT]: Record<string, any>
  [PropType.JSON]: any
  [PropType.SIZE]: string | number
  [PropType.SPACING]: SpacingValue
  [PropType.BORDER]: BorderProperties
  [PropType.SHADOW]: string
  [PropType.RESPONSIVE_SIZE]: ResponsiveValue<string | number>
  [PropType.RESPONSIVE_SPACING]: ResponsiveValue<SpacingValue>
}

/**
 * 根据属性类型获取对应的值类型
 */
export type GetPropValueType<T extends PropType> = PropValueMap[T]

/**
 * 属性编辑器组件类型
 */
export type PropEditorComponent<T = any> = React.ComponentType<{
  value: T
  onChange: (value: T) => void
  schema: PropSchema
  disabled?: boolean
  error?: string
}>
