# 基础组件库快速开始指南

**版本**: 1.0.0
**更新日期**: 2025-10-28
**分支**: 004-basic-component-library

## 概述

基础组件库为低代码平台提供20个核心组件，分为表单组件、展示组件和布局组件三大类。本指南将帮助开发者快速理解和使用组件库。

## 组件分类

### 表单组件 (6个)

- **Button**: 按钮组件，支持多种样式和交互
- **Input**: 输入框组件，支持文本、数字、密码等类型
- **Textarea**: 文本域组件，支持多行文本输入
- **Select**: 选择器组件，支持下拉选择
- **Checkbox**: 复选框组件，支持单个和多个选项
- **Radio**: 单选框组件，支持互斥选择

### 展示组件 (5个)

- **Text**: 文本组件，支持丰富的文字样式配置
- **Heading**: 标题组件，支持不同级别的标题
- **Image**: 图片组件，支持多种图片源和样式
- **Card**: 卡片组件，支持内容容器和阴影效果
- **Badge**: 徽章组件，用于状态标识和标签显示

### 布局组件 (5个)

- **Container**: 容器组件，提供内容包裹和居中
- **Row**: 行组件，水平布局容器
- **Col**: 列组件，垂直布局容器
- **Divider**: 分割线组件，提供视觉分隔
- **Spacer**: 间距器组件，用于调整组件间距

## 快速集成

### 1. 组件注册

```typescript
// components/lowcode/registry/index.ts
import { ComponentRegistry } from './component-registry'
import { ButtonDefinition } from '../basic/Button/definition'
import { InputDefinition } from '../basic/Input/definition'
// ... 导入其他组件定义

// 注册所有组件
const registry = new ComponentRegistry()

// 注册表单组件
registry.register(ButtonDefinition)
registry.register(InputDefinition)
registry.register(TextareaDefinition)
registry.register(SelectDefinition)
registry.register(CheckboxDefinition)
registry.register(RadioDefinition)

// 注册展示组件
registry.register(TextDefinition)
registry.register(HeadingDefinition)
registry.register(ImageDefinition)
registry.register(CardDefinition)
registry.register(BadgeDefinition)

// 注册布局组件
registry.register(ContainerDefinition)
registry.register(RowDefinition)
registry.register(ColDefinition)
registry.register(DividerDefinition)
registry.register(SpacerDefinition)

export { registry }
```

### 2. 页面设计器集成

```typescript
// components/page-designer/ComponentPanel.tsx
import { registry } from '../lowcode/registry'
import { ComponentCategory } from '../lowcode/types'

export const ComponentPanel: React.FC = () => {
  const [components, setComponents] = useState<ComponentDefinition[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // 获取组件列表
    const allComponents = registry.list()
    setComponents(allComponents)
  }, [])

  const filteredComponents = selectedCategory === 'all'
    ? components
    : components.filter(comp => comp.category === selectedCategory)

  return (
    <div className="component-panel">
      <div className="category-tabs">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          全部
        </button>
        <button
          className={selectedCategory === 'basic' ? 'active' : ''}
          onClick={() => setSelectedCategory('basic')}
        >
          表单组件
        </button>
        <button
          className={selectedCategory === 'display' ? 'active' : ''}
          onClick={() => setSelectedCategory('display')}
        >
          展示组件
        </button>
        <button
          className={selectedCategory === 'layout' ? 'active' : ''}
          onClick={() => setSelectedCategory('layout')}
        >
          布局组件
        </button>
      </div>

      <div className="component-list">
        {filteredComponents.map(component => (
          <ComponentItem
            key={component.id}
            component={component}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    </div>
  )
}
```

### 3. 组件渲染

```typescript
// components/lowcode/ComponentRenderer.tsx
import { registry } from './registry'

interface ComponentRendererProps {
  componentId: string
  props: Record<string, any>
  styles?: ComponentStyles
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  componentId,
  props,
  styles
}) => {
  const componentDefinition = registry.get(componentId)

  if (!componentDefinition) {
    return <div>组件未找到: {componentId}</div>
  }

  const Component = componentDefinition.component

  // 合并默认属性和自定义属性
  const mergedProps = {
    ...componentDefinition.defaultProps,
    ...props
  }

  // 合并默认样式和自定义样式
  const mergedStyles = {
    ...componentDefinition.defaultStyles,
    ...styles
  }

  return (
    <div style={mergedStyles}>
      <Component {...mergedProps} />
    </div>
  )
}
```

## 组件开发指南

### 1. 创建新组件

```typescript
// components/lowcode/basic/ExampleComponent/ExampleComponent.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface ExampleComponentProps {
  text: string
  variant: 'default' | 'primary' | 'secondary'
  size: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export const ExampleComponent = React.forwardRef<
  HTMLButtonElement,
  ExampleComponentProps
>(({
  text,
  variant = 'default',
  size = 'medium',
  disabled = false,
  onClick,
  className,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors'

  const variantClasses = {
    default: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700'
  }

  const sizeClasses = {
    small: 'h-8 px-3 text-sm',
    medium: 'h-10 px-4 text-base',
    large: 'h-12 px-6 text-lg'
  }

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {text}
    </button>
  )
})

ExampleComponent.displayName = 'ExampleComponent'
```

### 2. 创建组件定义

```typescript
// components/lowcode/basic/ExampleComponent/definition.ts
import { ComponentDefinition } from '../../types'
import { ExampleComponent } from './ExampleComponent'
import { ExamplePreview } from './Preview'
import { ExampleIcon } from './Icon'

export const ExampleDefinition: ComponentDefinition = {
  // 基础信息
  id: 'component-basic-example',
  name: 'Example',
  description: '示例组件，展示组件定义的标准格式',
  version: '1.0.0',
  author: '开发团队',

  // 分类信息
  category: 'basic',
  subcategory: 'form',
  tags: ['example', 'button', 'form'],

  // 组件实现
  component: ExampleComponent,
  preview: ExamplePreview,
  icon: ExampleIcon,

  // 属性定义
  props_schema: [
    {
      id: 'prop-example-text',
      name: 'text',
      type: 'string',
      label: '按钮文字',
      description: '按钮上显示的文字内容',
      required: true,
      default_value: 'Click me',
      group: 'basic',
      category: 'content',
      order: 1,
      validation: [
        {
          type: 'minLength',
          value: 1,
          message: '按钮文字不能为空',
        },
        {
          type: 'maxLength',
          value: 50,
          message: '按钮文字不能超过50个字符',
        },
      ],
      editor_config: {
        type: 'text',
        placeholder: '请输入按钮文字',
        help: '建议使用简洁明确的文字描述',
      },
    },
    {
      id: 'prop-example-variant',
      name: 'variant',
      type: 'select',
      label: '按钮样式',
      description: '按钮的视觉样式',
      required: false,
      default_value: 'default',
      group: 'basic',
      category: 'appearance',
      order: 2,
      options: [
        {
          value: 'default',
          label: '默认',
          description: '灰色背景的标准按钮',
        },
        {
          value: 'primary',
          label: '主要',
          description: '蓝色背景的主要操作按钮',
        },
        {
          value: 'secondary',
          label: '次要',
          description: '深灰背景的次要操作按钮',
        },
      ],
      editor_config: {
        type: 'select',
        help: '根据按钮的重要程度选择合适的样式',
      },
    },
    {
      id: 'prop-example-size',
      name: 'size',
      type: 'select',
      label: '按钮大小',
      description: '按钮的尺寸大小',
      required: false,
      default_value: 'medium',
      group: 'style',
      category: 'appearance',
      order: 3,
      options: [
        {
          value: 'small',
          label: '小',
          description: '适用于紧凑布局',
        },
        {
          value: 'medium',
          label: '中',
          description: '标准尺寸，适用于大多数场景',
        },
        {
          value: 'large',
          label: '大',
          description: '适用于重要操作',
        },
      ],
      editor_config: {
        type: 'radio',
      },
    },
    {
      id: 'prop-example-disabled',
      name: 'disabled',
      type: 'boolean',
      label: '禁用状态',
      description: '是否禁用按钮',
      required: false,
      default_value: false,
      group: 'advanced',
      category: 'behavior',
      order: 4,
      editor_config: {
        type: 'checkbox',
        help: '禁用后按钮将无法点击',
      },
    },
  ],

  // 默认配置
  default_props: {
    text: 'Click me',
    variant: 'default',
    size: 'medium',
    disabled: false,
  },

  default_styles: {
    display: 'inline-block',
  },

  // 约束条件
  constraints: {
    min_width: 50,
    min_height: 20,
    resizable: true,
    draggable: true,
  },

  // 验证规则
  validation_rules: [
    {
      type: 'custom',
      value: 'validateButtonText',
      message: '按钮文字需要符合业务规范',
    },
  ],

  // 状态
  status: 'active',
}
```

### 3. 创建预览组件

```typescript
// components/lowcode/basic/ExampleComponent/Preview.tsx
import React from 'react'
import { ExampleComponent } from './ExampleComponent'

interface PreviewProps {
  props?: Record<string, any>
  styles?: Record<string, any>
}

export const ExamplePreview: React.FC<PreviewProps> = ({
  props = {},
  styles = {}
}) => {
  return (
    <div style={styles}>
      <ExampleComponent
        text={props.text || 'Preview Button'}
        variant={props.variant || 'default'}
        size={props.size || 'medium'}
        disabled={props.disabled || false}
      />
    </div>
  )
}
```

### 4. 创建图标组件

```typescript
// components/lowcode/basic/ExampleComponent/Icon.tsx
import React from 'react'

export const ExampleIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = ''
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
      >
        Btn
      </text>
    </svg>
  )
}
```

### 5. 导出组件

```typescript
// components/lowcode/basic/ExampleComponent/index.ts
export { ExampleComponent } from './ExampleComponent'
export { ExampleDefinition } from './definition'
export { ExamplePreview } from './Preview'
export { ExampleIcon } from './Icon'
```

## 属性配置指南

### 基础属性类型

```typescript
// 字符串类型
{
  name: 'title',
  type: 'string',
  label: '标题',
  required: true,
  validation: [
    { type: 'minLength', value: 1, message: '标题不能为空' },
    { type: 'maxLength', value: 100, message: '标题不能超过100字符' }
  ]
}

// 数字类型
{
  name: 'fontSize',
  type: 'number',
  label: '字体大小',
  default_value: 16,
  constraints: {
    min: 12,
    max: 72,
    step: 1
  }
}

// 颜色类型
{
  name: 'backgroundColor',
  type: 'color',
  label: '背景颜色',
  default_value: '#ffffff',
  editor_config: {
    type: 'color',
    preset: ['#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db']
  }
}

// 选择类型
{
  name: 'alignment',
  type: 'select',
  label: '对齐方式',
  default_value: 'left',
  options: [
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' }
  ]
}

// 布尔类型
{
  name: 'required',
  type: 'boolean',
  label: '必填',
  default_value: false,
  editor_config: {
    type: 'checkbox',
    help: '标记为必填字段'
  }
}
```

### 响应式属性

```typescript
{
  name: 'padding',
  type: 'spacing',
  label: '内边距',
  responsive: true,
  breakpoints: ['mobile', 'tablet', 'desktop'],
  default_value: {
    mobile: { x: 16, y: 12 },
    tablet: { x: 24, y: 16 },
    desktop: { x: 32, y: 20 }
  },
  editor_config: {
    type: 'responsive_spacing',
    preset: ['compact', 'normal', 'spacious']
  }
}
```

### 属性依赖

```typescript
{
  name: 'placeholder',
  type: 'string',
  label: '占位符',
  dependencies: [
    {
      property: 'type',
      condition: 'equals',
      value: 'text',
      action: 'show'
    }
  ]
}

{
  name: 'rows',
  type: 'number',
  label: '行数',
  default_value: 3,
  dependencies: [
    {
      property: 'multiline',
      condition: 'equals',
      value: true,
      action: 'enable'
    }
  ]
}
```

## 样式配置

### 基础样式属性

```typescript
const defaultStyles: ComponentStyles = {
  // 显示属性
  display: 'block',
  position: 'relative',

  // 尺寸控制
  width: 'auto',
  height: 'auto',
  minWidth: 50,
  minHeight: 30,

  // 间距控制
  margin: { x: 0, y: 0 },
  padding: { x: 16, y: 8 },

  // 文字样式
  color: '#000000',
  fontSize: 14,
  fontWeight: 'normal',
  fontFamily: 'Inter, sans-serif',

  // 背景和边框
  backgroundColor: '#ffffff',
  border: {
    width: 1,
    style: 'solid',
    color: '#e5e7eb',
  },
  borderRadius: 4,

  // 响应式样式
  responsive: {
    mobile: {
      fontSize: 12,
      padding: { x: 12, y: 6 },
    },
    tablet: {
      fontSize: 14,
      padding: { x: 16, y: 8 },
    },
    desktop: {
      fontSize: 16,
      padding: { x: 20, y: 10 },
    },
  },
}
```

## 测试指南

### 单元测试

```typescript
// components/lowcode/basic/ExampleComponent/ExampleComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ExampleComponent } from './ExampleComponent'

describe('ExampleComponent', () => {
  test('renders with default props', () => {
    render(<ExampleComponent text="Test Button" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('Test Button')).toBeInTheDocument()
  })

  test('applies variant styles correctly', () => {
    const { rerender } = render(<ExampleComponent text="Test" variant="primary" />)
    const button = screen.getByRole('button')

    expect(button).toHaveClass('bg-blue-600', 'text-white')

    rerender(<ExampleComponent text="Test" variant="secondary" />)
    expect(button).toHaveClass('bg-gray-600', 'text-white')
  })

  test('handles click events', () => {
    const handleClick = jest.fn()
    render(<ExampleComponent text="Test" onClick={handleClick} />)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('disabled state works correctly', () => {
    const handleClick = jest.fn()
    render(<ExampleComponent text="Test" disabled onClick={handleClick} />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50')

    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })
})
```

### 属性定义测试

```typescript
// components/lowcode/basic/ExampleComponent/definition.test.ts
import { ExampleDefinition } from './definition'
import { ComponentRegistry } from '../../registry'

describe('ExampleDefinition', () => {
  test('has required properties', () => {
    expect(ExampleDefinition.id).toBe('component-basic-example')
    expect(ExampleDefinition.name).toBe('Example')
    expect(ExampleDefinition.category).toBe('basic')
    expect(ExampleDefinition.component).toBeDefined()
    expect(ExampleDefinition.preview).toBeDefined()
    expect(ExampleDefinition.icon).toBeDefined()
  })

  test('props schema is valid', () => {
    const textProp = ExampleDefinition.props_schema.find(p => p.name === 'text')
    expect(textProp).toBeDefined()
    expect(textProp?.type).toBe('string')
    expect(textProp?.required).toBe(true)
    expect(textProp?.validation).toHaveLength(2)
  })

  test('can be registered', () => {
    const registry = new ComponentRegistry()
    expect(() => registry.register(ExampleDefinition)).not.toThrow()

    const retrieved = registry.get('component-basic-example')
    expect(retrieved).toBe(ExampleDefinition)
  })
})
```

## 部署说明

### 1. 构建组件库

```bash
# 构建组件库
pnpm build:components

# 生成类型定义
pnpm generate:types

# 运行测试
pnpm test:components
```

### 2. 发布配置

```json
// package.json
{
  "name": "@lowcode-ai/components",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsc && rollup -c",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### 3. 环境变量

```env
# 组件库配置
NEXT_PUBLIC_COMPONENTS_VERSION=1.0.0
NEXT_PUBLIC_COMPONENTS_CDN_URL=https://cdn.lowcode-ai.com/components
NEXT_PUBLIC_COMPONENTS_DEV_MODE=true
```

## 故障排除

### 常见问题

**Q: 组件注册失败**
A: 检查组件定义的ID是否唯一，确保所有必需的属性都已定义

**Q: 属性配置不生效**
A: 验证属性类型和默认值是否匹配，检查验证规则是否正确

**Q: 样式渲染异常**
A: 确认CSS类名是否正确，检查Tailwind配置是否包含相关类

**Q: 响应式样式无效**
A: 验证断点配置是否正确，确保响应式属性格式符合规范

### 调试技巧

1. **使用React DevTools** 检查组件属性和状态
2. **启用开发模式** 查看详细的错误信息
3. **检查控制台** 查看注册和渲染相关的日志
4. **使用TypeScript严格模式** 提前发现类型错误

## 支持和反馈

- **文档**: [组件库完整文档](https://docs.lowcode-ai.com/components)
- **示例**: [组件示例库](https://examples.lowcode-ai.com)
- **问题反馈**: [GitHub Issues](https://github.com/lowcode-ai/components/issues)
- **社区讨论**: [Discord频道](https://discord.gg/lowcode-ai)

---

通过本指南，你应该能够快速上手基础组件库的开发和使用。如有任何问题，请参考完整文档或联系开发团队。
