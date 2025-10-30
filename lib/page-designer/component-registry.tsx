/**
 * 页面设计器组件注册表
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import React from 'react'

import {
  ComponentDefinition,
  ComponentType,
  ComponentCategory,
  ComponentConstraints,
  PropDefinition,
  PropType,
  PropOption,
  LayoutComponentType,
} from '@/types/page-designer/component'
import { LayoutConstraints } from '@/types/page-designer/layout'

// 基础组件导入 - 从新的组件库导入
import { Button } from '@/components/lowcode/basic/Button'
import { Input } from '@/components/lowcode/basic/Input'
import { Text } from '@/components/lowcode/display/Text'
import { Image } from '@/components/lowcode/display/Image'

// 布局组件导入 - 从新的组件库导入
import { Container } from '@/components/lowcode/layout/Container'
import { Row } from '@/components/lowcode/layout/Row'
import { Col } from '@/components/lowcode/layout/Col'

// 组件图标（简单的SVG图标）
const ButtonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="6" width="18" height="12" rx="2" />
  </svg>
)

const InputIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const TextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
)

const ImageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
)

const ContainerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <rect x="7" y="7" width="10" height="10" rx="1" ry="1" />
  </svg>
)

const RowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <line x1="8" y1="6" x2="8" y2="18" />
    <line x1="16" y1="6" x2="16" y2="18" />
  </svg>
)

const ColIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="6" y1="8" x2="18" y2="8" />
    <line x1="6" y1="16" x2="18" y2="16" />
  </svg>
)

// 基础组件属性定义
const buttonProps: PropDefinition[] = [
  {
    name: 'text',
    type: 'string',
    label: '按钮文本',
    required: true,
    default: '点击按钮',
    group: '基础属性',
  },
  {
    name: 'variant',
    type: 'select',
    label: '按钮样式',
    default: 'primary',
    group: '样式',
    options: [
      { label: '主要按钮', value: 'primary' },
      { label: '次要按钮', value: 'secondary' },
      { label: '轮廓按钮', value: 'outline' },
      { label: '幽灵按钮', value: 'ghost' },
      { label: '链接按钮', value: 'link' },
    ],
  },
  {
    name: 'size',
    type: 'select',
    label: '按钮大小',
    default: 'md',
    group: '样式',
    options: [
      { label: '小', value: 'sm' },
      { label: '中', value: 'md' },
      { label: '大', value: 'lg' },
    ],
  },
  {
    name: 'disabled',
    type: 'boolean',
    label: '禁用状态',
    default: false,
    group: '状态',
  },
  {
    name: 'loading',
    type: 'boolean',
    label: '加载状态',
    default: false,
    group: '状态',
  },
]

const inputProps: PropDefinition[] = [
  {
    name: 'placeholder',
    type: 'string',
    label: '占位符文本',
    group: '基础属性',
  },
  {
    name: 'type',
    type: 'select',
    label: '输入类型',
    default: 'text',
    group: '基础属性',
    options: [
      { label: '文本', value: 'text' },
      { label: '邮箱', value: 'email' },
      { label: '密码', value: 'password' },
      { label: '数字', value: 'number' },
      { label: '电话', value: 'tel' },
      { label: '网址', value: 'url' },
    ],
  },
  {
    name: 'label',
    type: 'string',
    label: '标签文本',
    group: '基础属性',
  },
  {
    name: 'required',
    type: 'boolean',
    label: '必填',
    default: false,
    group: '验证',
  },
  {
    name: 'disabled',
    type: 'boolean',
    label: '禁用',
    default: false,
    group: '状态',
  },
]

const textProps: PropDefinition[] = [
  {
    name: 'content',
    type: 'text',
    label: '文本内容',
    required: true,
    default: '这是一段文本',
    group: '基础属性',
  },
  {
    name: 'variant',
    type: 'select',
    label: '文本样式',
    default: 'body',
    group: '样式',
    options: [
      { label: '正文', value: 'body' },
      { label: '标题1', value: 'heading1' },
      { label: '标题2', value: 'heading2' },
      { label: '标题3', value: 'heading3' },
      { label: '标题4', value: 'heading4' },
      { label: '标题5', value: 'heading5' },
      { label: '标题6', value: 'heading6' },
    ],
  },
  {
    name: 'weight',
    type: 'select',
    label: '字体粗细',
    default: 'normal',
    group: '样式',
    options: [
      { label: '正常', value: 'normal' },
      { label: '中等', value: 'medium' },
      { label: '半粗', value: 'semibold' },
      { label: '粗体', value: 'bold' },
    ],
  },
  {
    name: 'color',
    type: 'color',
    label: '文字颜色',
    group: '样式',
  },
  {
    name: 'align',
    type: 'select',
    label: '对齐方式',
    default: 'left',
    group: '布局',
    options: [
      { label: '左对齐', value: 'left' },
      { label: '居中', value: 'center' },
      { label: '右对齐', value: 'right' },
      { label: '两端对齐', value: 'justify' },
    ],
  },
]

const imageProps: PropDefinition[] = [
  {
    name: 'src',
    type: 'image',
    label: '图片地址',
    required: true,
    default: 'https://via.placeholder.com/300x200',
    group: '基础属性',
  },
  {
    name: 'alt',
    type: 'string',
    label: '替代文本',
    group: '基础属性',
  },
  {
    name: 'width',
    type: 'number',
    label: '宽度',
    default: 'auto',
    group: '尺寸',
  },
  {
    name: 'height',
    type: 'number',
    label: '高度',
    default: 'auto',
    group: '尺寸',
  },
  {
    name: 'object_fit',
    type: 'select',
    label: '填充方式',
    default: 'cover',
    group: '样式',
    options: [
      { label: '覆盖', value: 'cover' },
      { label: '包含', value: 'contain' },
      { label: '填充', value: 'fill' },
      { label: '无', value: 'none' },
      { label: '缩小', value: 'scale-down' },
    ],
  },
  {
    name: 'rounded',
    type: 'boolean',
    label: '圆角',
    default: false,
    group: '样式',
  },
]

// 布局组件属性定义
const containerProps: PropDefinition[] = [
  {
    name: 'direction',
    type: 'select',
    label: '布局方向',
    default: 'column',
    group: '布局',
    options: [
      { label: '垂直', value: 'column' },
      { label: '水平', value: 'row' },
    ],
  },
  {
    name: 'wrap',
    type: 'boolean',
    label: '换行',
    default: false,
    group: '布局',
  },
  {
    name: 'justify',
    type: 'select',
    label: '水平对齐',
    default: 'start',
    group: '布局',
    options: [
      { label: '开始', value: 'start' },
      { label: '居中', value: 'center' },
      { label: '结束', value: 'end' },
      { label: '两端对齐', value: 'between' },
      { label: '周围对齐', value: 'around' },
      { label: '均匀对齐', value: 'evenly' },
    ],
  },
  {
    name: 'align',
    type: 'select',
    label: '垂直对齐',
    default: 'start',
    group: '布局',
    options: [
      { label: '开始', value: 'start' },
      { label: '居中', value: 'center' },
      { label: '结束', value: 'end' },
      { label: '拉伸', value: 'stretch' },
    ],
  },
  {
    name: 'gap',
    type: 'number',
    label: '间距',
    default: 0,
    group: '布局',
  },
  {
    name: 'padding',
    type: 'string',
    label: '内边距',
    group: '布局',
  },
  {
    name: 'margin',
    type: 'string',
    label: '外边距',
    group: '布局',
  },
  {
    name: 'background',
    type: 'color',
    label: '背景颜色',
    group: '样式',
  },
  {
    name: 'border',
    type: 'boolean',
    label: '边框',
    default: false,
    group: '样式',
  },
  {
    name: 'shadow',
    type: 'boolean',
    label: '阴影',
    default: false,
    group: '样式',
  },
]

const rowProps: PropDefinition[] = [
  {
    name: 'wrap',
    type: 'boolean',
    label: '换行',
    default: false,
    group: '布局',
  },
  {
    name: 'justify',
    type: 'select',
    label: '水平对齐',
    default: 'start',
    group: '布局',
    options: [
      { label: '开始', value: 'start' },
      { label: '居中', value: 'center' },
      { label: '结束', value: 'end' },
      { label: '两端对齐', value: 'between' },
      { label: '周围对齐', value: 'around' },
      { label: '均匀对齐', value: 'evenly' },
    ],
  },
  {
    name: 'align',
    type: 'select',
    label: '垂直对齐',
    default: 'start',
    group: '布局',
    options: [
      { label: '开始', value: 'start' },
      { label: '居中', value: 'center' },
      { label: '结束', value: 'end' },
      { label: '拉伸', value: 'stretch' },
    ],
  },
  {
    name: 'gap',
    type: 'number',
    label: '间距',
    default: 0,
    group: '布局',
  },
  {
    name: 'padding',
    type: 'string',
    label: '内边距',
    group: '布局',
  },
  {
    name: 'margin',
    type: 'string',
    label: '外边距',
    group: '布局',
  },
]

const colProps: PropDefinition[] = [
  {
    name: 'span',
    type: 'number',
    label: '栅格宽度',
    required: true,
    default: 12,
    group: '栅格',
    validation: { min: 1, max: 12 },
  },
  {
    name: 'offset',
    type: 'number',
    label: '偏移量',
    default: 0,
    group: '栅格',
    validation: { min: 0, max: 11 },
  },
  {
    name: 'order',
    type: 'number',
    label: '排序',
    default: 0,
    group: '栅格',
  },
  {
    name: 'flex',
    type: 'string',
    label: 'Flex属性',
    group: '布局',
  },
  {
    name: 'alignSelf',
    type: 'select',
    label: '垂直对齐',
    default: 'auto',
    group: '布局',
    options: [
      { label: '自动', value: 'auto' },
      { label: '开始', value: 'flex-start' },
      { label: '结束', value: 'flex-end' },
      { label: '居中', value: 'center' },
      { label: '基线', value: 'baseline' },
      { label: '拉伸', value: 'stretch' },
    ],
  },
  {
    name: 'padding',
    type: 'string',
    label: '内边距',
    group: '布局',
  },
  {
    name: 'margin',
    type: 'string',
    label: '外边距',
    group: '布局',
  },
]

// 组件约束定义
const basicComponentConstraints: ComponentConstraints = {
  canContainChildren: false,
  maxDepth: 10,
  allowedParents: ['container', 'row', 'col'],
}

const layoutComponentConstraints: ComponentConstraints = {
  canContainChildren: true,
  maxDepth: 5,
  allowedParents: ['container', 'row', 'col'],
}

const containerConstraints: LayoutConstraints = {
  allowedChildren: ['container', 'row', 'col', 'button', 'input', 'text', 'image'],
  canContainLayoutComponents: true,
  canContainBasicComponents: true,
  maxNestingLevel: 5,
  maxDirectChildren: 50,
}

const rowConstraints: LayoutConstraints = {
  allowedChildren: ['col'],
  canContainLayoutComponents: true,
  canContainBasicComponents: false,
  maxNestingLevel: 3,
  maxDirectChildren: 12,
}

const colConstraints: LayoutConstraints = {
  allowedChildren: ['container', 'row', 'col', 'button', 'input', 'text', 'image'],
  canContainLayoutComponents: true,
  canContainBasicComponents: true,
  maxNestingLevel: 5,
  maxDirectChildren: 20,
}

// 组件定义注册表
const COMPONENT_REGISTRY: Partial<
  Record<ComponentType | LayoutComponentType, ComponentDefinition>
> = {
  // 基础组件
  button: {
    type: 'button',
    name: '按钮',
    category: 'basic',
    icon: ButtonIcon,
    description: '可点击的按钮组件',
    defaultProps: { button: { text: '点击按钮', variant: 'primary', size: 'md' } },
    defaultStyles: {},
    configurableProps: buttonProps,
    render: props => <Button {...props} />,
    constraints: basicComponentConstraints,
    examples: [
      {
        name: '主要按钮',
        description: '主要操作按钮',
        props: { button: { text: '确认', variant: 'primary', size: 'md' } },
      },
      {
        name: '次要按钮',
        description: '次要操作按钮',
        props: { button: { text: '取消', variant: 'secondary', size: 'md' } },
      },
    ],
  },

  input: {
    type: 'input',
    name: '输入框',
    category: 'basic',
    icon: InputIcon,
    description: '文本输入框组件',
    defaultProps: { input: { type: 'text', placeholder: '请输入内容' } },
    defaultStyles: {},
    configurableProps: inputProps,
    render: props => <Input {...props} />,
    constraints: basicComponentConstraints,
  },

  text: {
    type: 'text',
    name: '文本',
    category: 'basic',
    icon: TextIcon,
    description: '文本显示组件',
    defaultProps: { content: '这是一段文本', variant: 'body', size: 'base' },
    defaultStyles: {},
    configurableProps: textProps,
    render: props => <Text {...props} />,
    constraints: basicComponentConstraints,
  },

  image: {
    type: 'image',
    name: '图片',
    category: 'basic',
    icon: ImageIcon,
    description: '图片显示组件',
    defaultProps: { src: '/api/placeholder/300/200', alt: '示例图片', width: 300, height: 200 },
    defaultStyles: {},
    configurableProps: imageProps,
    render: props => <Image {...props} alt={props.alt || '图片'} />,
    constraints: basicComponentConstraints,
  },

  // 布局组件
  container: {
    type: 'container',
    name: '容器',
    category: 'layout',
    icon: ContainerIcon,
    description: '通用容器组件，可以包含其他组件',
    defaultProps: { container: { direction: 'column', gap: 0 } },
    defaultStyles: { width: '100%' },
    configurableProps: containerProps,
    render: props => <Container {...props} />,
    constraints: layoutComponentConstraints,
    examples: [
      {
        name: '垂直容器',
        description: '垂直排列的容器',
        props: { container: { direction: 'column', gap: 16, padding: { x: 16, y: 16 } } },
      },
      {
        name: '水平容器',
        description: '水平排列的容器',
        props: { container: { direction: 'row', gap: 16, padding: { x: 16, y: 16 } } },
      },
    ],
  },

  row: {
    type: 'row',
    name: '行布局',
    category: 'layout',
    icon: RowIcon,
    description: '水平行布局组件，专门用于放置列组件',
    defaultProps: { row: { gap: 16, justify: 'start' } },
    defaultStyles: { width: '100%' },
    configurableProps: rowProps,
    render: props => <Row {...props} />,
    constraints: layoutComponentConstraints,
  },

  col: {
    type: 'col',
    name: '列布局',
    category: 'layout',
    icon: ColIcon,
    description: '列布局组件，用于栅格系统',
    defaultProps: { col: { span: 12 } },
    defaultStyles: {},
    configurableProps: colProps,
    render: props => <Col {...props} />,
    constraints: layoutComponentConstraints,
  },
}

// 预览组件包装器
const ButtonWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Button text="按钮" variant="default" size="default" onClick={() => onClick?.()} />
)

const InputWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Input type="text" placeholder="输入框" />
)

const TextWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer' }}>
    <Text content="文本" variant="body" size="base" />
  </div>
)

const ImageWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <div onClick={onClick} style={{ cursor: 'pointer' }}>
    <Image src="/api/placeholder/100/100" alt="图片" width={100} height={100} />
  </div>
)

const ContainerWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Container
    id="preview"
    type="container"
    props={{}}
    styles={{}}
    events={{}}
    onSelect={() => onClick?.()}
  />
)

const RowWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Row id="preview" type="row" props={{}} styles={{}} events={{}} onSelect={() => onClick?.()} />
)

const ColWrapper: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <Col id="preview" type="col" props={{}} styles={{}} events={{}} onSelect={() => onClick?.()} />
)

// 预览组件注册表
const PREVIEW_REGISTRY: Partial<
  Record<ComponentType | LayoutComponentType, React.FC<{ onClick?: () => void }>>
> = {
  button: ButtonWrapper,
  input: InputWrapper,
  text: TextWrapper,
  image: ImageWrapper,
  container: ContainerWrapper,
  row: RowWrapper,
  col: ColWrapper,
}

// 组件注册表类
export class ComponentRegistry {
  private static instance: ComponentRegistry
  private components: Map<string, ComponentDefinition>
  private previews: Map<string, React.FC<{ onClick?: () => void }>>

  private constructor() {
    this.components = new Map()
    this.previews = new Map()
    this.registerDefaultComponents()
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry()
    }
    return ComponentRegistry.instance
  }

  // 注册默认组件
  private registerDefaultComponents(): void {
    Object.entries(COMPONENT_REGISTRY).forEach(([type, definition]) => {
      this.components.set(type, definition)
    })

    Object.entries(PREVIEW_REGISTRY).forEach(([type, preview]) => {
      this.previews.set(type, preview)
    })
  }

  // 注册组件
  public registerComponent(definition: ComponentDefinition): void {
    this.components.set(definition.type, definition)
  }

  // 注册预览组件
  public registerPreview(type: string, preview: React.FC<{ onClick?: () => void }>): void {
    this.previews.set(type, preview)
  }

  // 获取组件定义
  public getComponent(type: ComponentType | LayoutComponentType): ComponentDefinition | undefined {
    return this.components.get(type)
  }

  // 获取预览组件
  public getPreview(
    type: ComponentType | LayoutComponentType
  ): React.FC<{ onClick?: () => void }> | undefined {
    return this.previews.get(type)
  }

  // 获取所有组件
  public getAllComponents(): ComponentDefinition[] {
    return Array.from(this.components.values())
  }

  // 按分类获取组件
  public getComponentsByCategory(category: ComponentCategory): ComponentDefinition[] {
    return this.getAllComponents().filter(component => component.category === category)
  }

  // 获取所有分类
  public getCategories(): ComponentCategory[] {
    const categories = new Set<ComponentCategory>()
    this.getAllComponents().forEach(component => {
      categories.add(component.category)
    })
    return Array.from(categories)
  }

  // 检查组件类型是否存在
  public hasComponent(type: string): boolean {
    return this.components.has(type)
  }

  // 获取组件默认属性
  public getDefaultProps(type: ComponentType | LayoutComponentType): any {
    const component = this.getComponent(type)
    return component?.defaultProps || {}
  }

  // 获取组件默认样式
  public getDefaultStyles(type: ComponentType | LayoutComponentType): any {
    const component = this.getComponent(type)
    return component?.defaultStyles || {}
  }

  // 获取组件约束
  public getConstraints(
    type: ComponentType | LayoutComponentType
  ): ComponentConstraints | undefined {
    const component = this.getComponent(type)
    return component?.constraints
  }

  // 验证组件是否可以放置在指定父组件中
  public canPlaceInParent(
    componentType: ComponentType | LayoutComponentType,
    parentType: ComponentType | LayoutComponentType
  ): boolean {
    const component = this.getComponent(componentType)
    const constraints = component?.constraints

    if (!constraints) return true

    // 检查允许的父组件类型
    if (constraints.allowedParents && constraints.allowedParents.length > 0) {
      return constraints.allowedParents.includes(parentType as any)
    }

    return true
  }

  // 搜索组件
  public searchComponents(query: string): ComponentDefinition[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getAllComponents().filter(
      component =>
        component.name.toLowerCase().includes(lowercaseQuery) ||
        component.description?.toLowerCase().includes(lowercaseQuery)
    )
  }
}

// 导出单例实例
export const componentRegistry = ComponentRegistry.getInstance()

// 导出工具函数
export const registerComponent = (definition: ComponentDefinition) => {
  componentRegistry.registerComponent(definition)
}

export const getComponent = (type: ComponentType | LayoutComponentType) => {
  return componentRegistry.getComponent(type)
}

export const getPreview = (type: ComponentType | LayoutComponentType) => {
  return componentRegistry.getPreview(type)
}

export const getAllComponents = () => {
  return componentRegistry.getAllComponents()
}

export const getComponentsByCategory = (category: ComponentCategory) => {
  return componentRegistry.getComponentsByCategory(category)
}

export const canPlaceInParent = (
  componentType: ComponentType | LayoutComponentType,
  parentType: ComponentType | LayoutComponentType
) => {
  return componentRegistry.canPlaceInParent(componentType, parentType)
}
