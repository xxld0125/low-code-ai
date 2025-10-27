# 基础页面设计器快速开始指南

**功能模块**: 基础页面设计器 (003-page-designer)
**创建日期**: 2025-10-27
**文档版本**: v1.0

---

## 1. 项目设置

### 1.1 环境要求

确保您的开发环境满足以下要求：

- **Node.js**: 18.x 或更高版本
- **pnpm**: 8.x 或更高版本（推荐的包管理器）
- **Supabase**: 已配置的项目实例
- **PostgreSQL**: 14.x 或更高版本（通过Supabase提供）

### 1.2 依赖安装

页面设计器功能需要以下核心依赖：

```bash
# 核心拖拽系统
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 布局引擎
pnpm add framer-motion

# 状态管理
pnpm add zustand

# 工具库
pnpm add lodash-es @types/lodash-es

# 画布缩放
pnpm add react-zoom-pan-pinch

# 响应式工具
pnpm add react-use

# 类型检查
pnpm add zod
```

### 1.3 环境变量配置

在 `.env.local` 文件中添加以下配置：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 页面设计器配置
NEXT_PUBLIC_DESIGNER_AUTO_SAVE_INTERVAL=30000
NEXT_PUBLIC_DESIGNER_MAX_COMPONENTS=500
NEXT_PUBLIC_DESIGNER_THUMBNAIL_SIZE=400x300
```

---

## 2. 数据库设置

### 2.1 运行数据库迁移

```bash
# 创建数据库表
supabase db push

# 应用RLS策略
supabase db reset
```

### 2.2 验证表结构

确保以下表已正确创建：

- `page_designs` - 页面设计表
- `component_instances` - 组件实例表
- `design_history` - 设计历史表

### 2.3 RLS权限验证

```sql
-- 验证RLS策略是否正确启用
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('page_designs', 'component_instances', 'design_history');
```

---

## 3. 项目结构

### 3.1 目录结构

```
/app/
  /protected/
    /designer/                    # 页面设计器主页面
      /page/
        [id]/                    # 设计器编辑页面
      /list/                     # 页面设计列表
      /create/                   # 创建新页面

/components/
  /designer/                     # 设计器组件
    ├── DesignerLayout.tsx       # 三栏布局
    ├── ComponentPanel.tsx       # 左侧组件面板
    ├── Canvas.tsx               # 中间画布
    ├── PropertiesPanel.tsx      # 右侧属性面板
    ├── DragOverlay.tsx          # 拖拽覆盖层
    ├── AlignmentGuides.tsx      # 对齐辅助线
    └── MiniMap.tsx              # 小地图

  /lowcode/                      # 低代码组件库
    /basic/                      # 基础组件
      ├── Button.tsx
      ├── Input.tsx
      ├── Text.tsx
      └── Image.tsx
    /layout/                     # 布局组件
      ├── Container.tsx
      ├── Row.tsx
      └── Col.tsx
    /business/                   # 业务组件
      ├── Form.tsx
      ├── Card.tsx
      └── Grid.tsx

/lib/
  /designer/                    # 设计器核心逻辑
    ├── layout-engine.ts        # 布局引擎
    ├── component-registry.ts   # 组件注册表
    ├── style-system.ts         # 样式系统
    ├── history-manager.ts      # 历史管理
    └── validation.ts           # 验证器

  /stores/                      # Zustand状态管理
    ├── designer-store.ts       # 设计器状态
    ├── component-store.ts      # 组件状态
    └── layout-store.ts         # 布局状态

/hooks/                        # 自定义Hooks
  ├── use-drag-drop.ts         # 拖拽逻辑
  ├── use-layout-engine.ts     # 布局引擎
  ├── use-auto-save.ts         # 自动保存
  └── use-keyboard-shortcuts.ts # 键盘快捷键

/types/                        # TypeScript类型定义
  ├── designer.ts              # 设计器类型
  ├── component.ts             # 组件类型
  └── layout.ts                # 布局类型
```

### 3.2 核心文件说明

#### DesignerLayout.tsx

```typescript
// 主布局组件，包含三个主要面板
// - ComponentPanel: 左侧组件库
// - Canvas: 中央设计画布
// - PropertiesPanel: 右侧属性编辑器
```

#### layout-engine.ts

```typescript
// 布局引擎核心逻辑
// - 处理组件嵌套规则
// - 计算布局位置
// - 生成响应式样式
```

#### component-registry.ts

```typescript
// 组件注册表
// - 定义可用组件类型
// - 管理组件属性配置
// - 处理组件渲染逻辑
```

---

## 4. 核心功能实现

### 4.1 拖拽系统设置

```typescript
// components/designer/DesignerProvider.tsx
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { useSensors, useSensor, PointerSensor, KeyboardSensor } from '@dnd-kit/core'

export const DesignerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px距离才激活拖拽
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
      <DragOverlay>
        {activeId && <DragPreview />}
      </DragOverlay>
    </DndContext>
  )
}
```

### 4.2 状态管理设置

```typescript
// lib/stores/designer-store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface DesignerState {
  // 页面设计
  currentPageId: string | null
  pageDesigns: Record<string, PageDesign>

  // 组件管理
  components: Record<string, ComponentInstance>
  selectedComponentIds: string[]

  // 画布状态
  canvas: {
    zoom: number
    pan: { x: number; y: number }
    gridSize: number
    showGrid: boolean
  }

  // 拖拽状态
  dragState: {
    isDragging: boolean
    draggedComponentType: string | null
    dropZoneId: string | null
  }

  // 历史记录
  history: {
    past: DesignerState[]
    present: DesignerState
    future: DesignerState[]
  }

  // Actions
  setPageDesign: (pageDesign: PageDesign) => void
  addComponent: (component: ComponentInstance) => void
  updateComponent: (id: string, updates: Partial<ComponentInstance>) => void
  deleteComponent: (id: string) => void
  selectComponent: (id: string, multi?: boolean) => void
  moveComponent: (id: string, newParentId: string, newPosition: number) => void
  undo: () => void
  redo: () => void
}

export const useDesignerStore = create<DesignerState>()(
  subscribeWithSelector((set, get) => ({
    // ... 初始状态和实现
  }))
)
```

### 4.3 组件注册系统

```typescript
// lib/designer/component-registry.ts
interface ComponentDefinition {
  type: string
  name: string
  category: ComponentCategory
  icon: React.ComponentType
  defaultProps: Record<string, any>
  defaultStyles: ComponentStyles
  configurableProps: PropDefinition[]
  render: (props: any) => React.ReactElement
  constraints: {
    maxDepth?: number
    allowedParents?: string[]
    allowedChildren?: string[]
  }
}

export const componentRegistry: Record<string, ComponentDefinition> = {
  button: {
    type: 'button',
    name: '按钮',
    category: 'basic',
    icon: ButtonIcon,
    defaultProps: {
      text: '点击按钮',
      variant: 'primary',
      size: 'md',
      disabled: false
    },
    defaultStyles: {
      padding: { x: 16, y: 8 }
    },
    configurableProps: [
      {
        name: 'text',
        type: 'string',
        label: '按钮文字',
        required: true
      },
      {
        name: 'variant',
        type: 'select',
        label: '按钮样式',
        options: [
          { label: '主要按钮', value: 'primary' },
          { label: '次要按钮', value: 'secondary' },
          { label: '轮廓按钮', value: 'outline' }
        ]
      }
    ],
    render: ({ text, variant, size, disabled, ...props }) => (
      <Button variant={variant} size={size} disabled={disabled} {...props}>
        {text}
      </Button>
    ),
    constraints: {
      allowedParents: ['container', 'row', 'col']
    }
  },

  container: {
    type: 'container',
    name: '容器',
    category: 'layout',
    icon: ContainerIcon,
    defaultProps: {
      direction: 'column',
      padding: 16,
      gap: 16
    },
    defaultStyles: {
      width: '100%',
      padding: 16
    },
    configurableProps: [
      {
        name: 'direction',
        type: 'radio',
        label: '布局方向',
        options: [
          { label: '垂直', value: 'column' },
          { label: '水平', value: 'row' }
        ]
      }
    ],
    render: ({ children, direction, padding, gap, ...props }) => (
      <div
        style={{
          display: 'flex',
          flexDirection: direction,
          padding: padding,
          gap: gap,
          ...props.style
        }}
        {...props}
      >
        {children}
      </div>
    ),
    constraints: {
      maxDepth: 10,
      allowedChildren: ['container', 'row', 'col', 'button', 'input', 'text', 'image']
    }
  }
  // ... 更多组件定义
}
```

### 4.4 布局引擎实现

```typescript
// lib/designer/layout-engine.ts
export class LayoutEngine {
  private componentTree: ComponentTree
  private constraints: LayoutConstraints

  constructor(componentTree: ComponentTree) {
    this.componentTree = componentTree
    this.constraints = new LayoutConstraints()
  }

  // 添加组件
  addComponent(parentId: string, component: ComponentInstance, position?: number): boolean {
    // 验证约束
    if (!this.constraints.canAddComponent(parentId, component.component_type)) {
      throw new Error(`Cannot add ${component.component_type} to ${parentId}`)
    }

    // 更新组件树
    const parent = this.componentTree.components[parentId]
    if (!parent) {
      throw new Error(`Parent component ${parentId} not found`)
    }

    // 计算位置
    const children = this.getChildren(parentId)
    const insertPosition = position !== undefined ? position : children.length

    // 更新层级关系
    component.parent_id = parentId
    component.position = {
      z_index: this.getMaxZIndex(parentId) + 1,
      order: insertPosition,
    }

    // 添加到组件树
    this.componentTree.components[component.id] = component
    this.updateHierarchy(parentId, component.id, insertPosition)

    return true
  }

  // 移动组件
  moveComponent(componentId: string, newParentId: string, newPosition: number): boolean {
    const component = this.componentTree.components[componentId]
    const oldParentId = component.parent_id

    // 验证移动合法性
    if (!this.constraints.canMoveComponent(componentId, newParentId)) {
      throw new Error(`Cannot move component ${componentId} to ${newParentId}`)
    }

    // 从旧父组件移除
    this.removeFromHierarchy(oldParentId!, componentId)

    // 添加到新父组件
    component.parent_id = newParentId
    this.updateHierarchy(newParentId, componentId, newPosition)

    // 更新位置
    component.position.order = newPosition

    return true
  }

  // 删除组件
  deleteComponent(componentId: string): boolean {
    const component = this.componentTree.components[componentId]
    const parentId = component.parent_id

    // 递归删除子组件
    const children = this.getChildren(componentId)
    for (const child of children) {
      this.deleteComponent(child.id)
    }

    // 从组件树移除
    delete this.componentTree.components[componentId]

    // 从层级结构移除
    if (parentId) {
      this.removeFromHierarchy(parentId, componentId)
    }

    return true
  }

  // 验证布局
  validateLayout(): ValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 检查组件约束
    for (const [id, component] of Object.entries(this.componentTree.components)) {
      const result = this.constraints.validateComponent(id, component)
      errors.push(...result.errors)
      warnings.push(...result.warnings)
    }

    // 检查层级深度
    const maxDepth = this.calculateMaxDepth()
    if (maxDepth > 20) {
      warnings.push({
        type: 'depth_warning',
        message: `组件嵌套层级过深 (${maxDepth} 层)，可能影响性能`,
        componentIds: [],
      })
    }

    return { errors, warnings, isValid: errors.length === 0 }
  }

  // 生成样式
  generateStyles(componentId: string): React.CSSProperties {
    const component = this.componentTree.components[componentId]
    const styles: React.CSSProperties = {}

    // 应用基础样式
    if (component.styles) {
      Object.assign(styles, component.styles)
    }

    // 应用布局样式
    if (component.layout_props) {
      Object.assign(styles, this.generateLayoutStyles(component.layout_props))
    }

    // 应用响应式样式
    if (component.responsive) {
      Object.assign(styles, this.generateResponsiveStyles(component.responsive))
    }

    return styles
  }

  private generateLayoutStyles(layoutProps: any): React.CSSProperties {
    const styles: React.CSSProperties = {}

    if (layoutProps.container) {
      const { direction, wrap, justify, align, gap } = layoutProps.container
      Object.assign(styles, {
        display: 'flex',
        flexDirection: direction === 'row' ? 'row' : 'column',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        alignItems: align,
        gap: gap,
      })
    }

    if (layoutProps.row) {
      const { wrap, justify, align, gap } = layoutProps.row
      Object.assign(styles, {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: wrap ? 'wrap' : 'nowrap',
        justifyContent: justify,
        alignItems: align,
        gap: gap,
      })
    }

    if (layoutProps.col) {
      const { span, offset, padding } = layoutProps.col
      Object.assign(styles, {
        flex: `0 0 ${(span / 12) * 100}%`,
        marginLeft: offset ? `${(offset / 12) * 100}%` : 0,
        padding: padding,
      })
    }

    return styles
  }
}
```

---

## 5. 开发指南

### 5.1 创建新组件

1. **定义组件类型**：

```typescript
// types/component.ts
export const COMPONENT_TYPES = {
  // 基础组件
  BUTTON: 'button',
  INPUT: 'input',
  TEXT: 'text',
  IMAGE: 'image',

  // 布局组件
  CONTAINER: 'container',
  ROW: 'row',
  COL: 'col',

  // 业务组件
  CARD: 'card',
  FORM: 'form',
} as const
```

2. **实现组件**：

```typescript
// components/lowcode/basic/CustomComponent.tsx
import React from 'react'
import { ComponentRendererProps } from '@/types/designer'

export const CustomComponent: React.FC<ComponentRendererProps> = ({
  id,
  props,
  styles,
  events,
  isSelected,
  onSelect
}) => {
  return (
    <div
      style={styles}
      onClick={() => onSelect?.(id)}
      className={isSelected ? 'component-selected' : ''}
    >
      {/* 组件内容 */}
      {props.text}
    </div>
  )
}
```

3. **注册组件**：

```typescript
// lib/designer/component-registry.ts
componentRegistry.custom = {
  type: 'custom',
  name: '自定义组件',
  category: 'business',
  render: CustomComponent,
  // ... 其他配置
}
```

### 5.2 添加新属性配置

```typescript
// 在组件定义中添加
configurableProps: [
  {
    name: 'customProperty',
    type: 'string',
    label: '自定义属性',
    required: false,
    default: '默认值',
    validation: {
      minLength: 1,
      maxLength: 100,
      pattern: /^[a-zA-Z0-9]+$/,
    },
  },
]
```

### 5.3 实现事件处理

```typescript
// 在组件中添加事件处理
const handleClick = () => {
  if (events.onClick) {
    // 执行事件处理逻辑
    executeEventHandler(events.onClick, { componentId: id })
  }
}

<div onClick={handleClick}>
  {/* 组件内容 */}
</div>
```

---

## 6. 测试指南

### 6.1 单元测试

```typescript
// __tests__/layout-engine.test.ts
import { LayoutEngine } from '@/lib/designer/layout-engine'

describe('LayoutEngine', () => {
  let engine: LayoutEngine

  beforeEach(() => {
    engine = new LayoutEngine(createMockComponentTree())
  })

  test('should add component to parent', () => {
    const parent = createMockComponent('container')
    const child = createMockComponent('button')

    const result = engine.addComponent(parent.id, child)

    expect(result).toBe(true)
    expect(engine.getChildren(parent.id)).toContain(child)
  })

  test('should validate layout constraints', () => {
    const result = engine.validateLayout()

    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})
```

### 6.2 集成测试

```typescript
// __tests__/designer.integration.test.ts
import { render, screen, fireEvent } from '@testing-library/react'
import { DesignerLayout } from '@/components/designer/DesignerLayout'

describe('Designer Integration', () => {
  test('should drag component from panel to canvas', async () => {
    render(<DesignerLayout />)

    const buttonComponent = screen.getByTestId('component-button')
    const canvas = screen.getByTestId('designer-canvas')

    fireEvent.dragStart(buttonComponent)
    fireEvent.drop(canvas)

    expect(screen.getByTestId('canvas-button')).toBeInTheDocument()
  })
})
```

---

## 7. 部署指南

### 7.1 生产环境配置

```bash
# 构建生产版本
pnpm build

# 运行生产服务器
pnpm start
```

### 7.2 环境变量配置

```env
# 生产环境
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
NEXT_PUBLIC_DESIGNER_AUTO_SAVE_INTERVAL=60000
```

### 7.3 性能优化

1. **启用代码分割**：

```typescript
// 动态导入组件
const LazyComponent = React.lazy(() => import('./LazyComponent'))
```

2. **优化图片加载**：

```typescript
import Image from 'next/image'

<Image
  src={src}
  alt={alt}
  width={width}
  height={height}
  loading="lazy"
/>
```

3. **启用缓存**：

```typescript
// 使用SWR进行数据缓存
import useSWR from 'swr'

const { data, error } = useSWR(`/api/page-designs/${id}`, fetcher)
```

---

## 8. 故障排除

### 8.1 常见问题

**问题**: 拖拽不工作
**解决方案**: 检查 `@dnd-kit` 是否正确配置，确保传感器设置正确

**问题**: 组件样式不生效
**解决方案**: 验证CSS优先级，确保样式对象正确转换

**问题**: 自动保存失败
**解决方案**: 检查网络连接和Supabase配置

### 8.2 调试技巧

1. **启用开发模式**：

```typescript
// 在开发环境中启用调试信息
if (process.env.NODE_ENV === 'development') {
  window.DESIGNER_DEBUG = true
}
```

2. **查看状态变化**：

```typescript
// 使用Redux DevTools或Zustand DevTools
import { devtools } from 'zustand/middleware'

const store = create()(devtools(storeImplementation))
```

3. **性能监控**：

```typescript
// 使用React DevTools Profiler
// 或添加性能监控代码
const start = performance.now()
// ... 执行操作
console.log(`Operation took ${performance.now() - start}ms`)
```

---

## 9. API参考

详细的API文档请参考：

- [OpenAPI 规范](./contracts/openapi.yaml)
- [数据模型文档](./data-model.md)
- [实现规划文档](./plan.md)

---

**文档结束**

_注：本快速开始指南涵盖了页面设计器的核心开发流程。更多详细信息和高级功能，请参考相关技术文档。_
