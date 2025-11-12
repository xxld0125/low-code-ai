# FlowBase 组件属性配置面板 - 快速开始指南

**功能分支**: `005-property-config-panel`
**版本**: v1.0.0
**更新日期**: 2025-11-12

## 📋 概述

本文档为开发人员提供FlowBase低代码平台组件属性配置面板功能的快速上手指南。通过本指南，您将了解如何：

- 快速集成属性配置面板到页面设计器
- 使用属性编辑器配置组件属性
- 实现实时预览和显式保存
- 管理属性模板和样式预设
- 处理事件绑定和验证

## 🚀 快速开始

### 前置条件

确保您的开发环境已满足以下要求：

```bash
# Node.js 版本
node --version  # >= 18.0.0

# 包管理器
pnpm --version  # >= 8.0.0

# 确保在正确的分支
git checkout 005-property-config-panel
```

### 1. 项目设置

克隆项目并安装依赖：

```bash
# 如果还未克隆项目
git clone <repository-url>
cd low-code-ai

# 切换到功能分支
git checkout 005-property-config-panel

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 2. 环境配置

复制环境配置文件：

```bash
cp .env.example .env.local
```

配置以下环境变量：

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. 数据库设置

运行数据库迁移：

```bash
# 运行Supabase迁移
pnpm supabase db push
```

## 🏗️ 架构概览

### 核心组件

```
components/designer/
├── DesignerLayout.tsx           # 设计器三栏布局
├── ComponentPanel.tsx           # 左侧组件面板
├── Canvas.tsx                   # 中间画布
└── PropertiesPanel.tsx          # 右侧属性面板 (新功能)
    ├── components/
    │   ├── PropertyForm.tsx     # 动态属性表单
    │   ├── PropertyEditor.tsx   # 属性编辑器
    │   ├── StyleConfig.tsx      # 样式配置
    │   └── EventConfig.tsx      # 事件配置
```

### 状态管理

```
stores/
└── property-config-store.ts     # 属性配置状态管理
    ├── propertyStore            # 属性配置Store
    ├── selectionStore           # 组件选择Store
    ├── previewStore             # 预览状态Store
    └── historyStore             # 历史记录Store
```

### 核心工具

```
lib/designer/
├── property-engine.ts           # 属性配置引擎
├── form-generator.ts            # 动态表单生成器
├── validation.ts                # 属性验证器
└── preview-manager.ts           # 预览管理器
```

## 📝 基础使用

### 1. 集成属性面板

在页面设计器中集成属性配置面板：

```typescript
// app/protected/designer/page.tsx
import { DesignerLayout } from '@/components/designer/DesignerLayout'
import { PropertiesPanel } from '@/components/designer/PropertiesPanel'

export default function DesignerPage() {
  return (
    <DesignerLayout>
      {/* 现有的组件面板和画布 */}
      <ComponentPanel />
      <Canvas />

      {/* 新增的属性配置面板 */}
      <PropertiesPanel />
    </DesignerLayout>
  )
}
```

### 2. 基础属性配置

使用属性编辑器配置组件的基础属性：

```typescript
// 使用属性编辑器Hook
import { usePropertyEditor } from '@/hooks/usePropertyEditor'

function BasicPropertyEditor({ componentId }: { componentId: string }) {
  const {
    properties,
    updateProperty,
    saveChanges,
    isDirty,
    isLoading
  } = usePropertyEditor(componentId)

  const handlePropertyChange = (key: string, value: any) => {
    updateProperty(key, value)
  }

  const handleSave = () => {
    saveChanges()
  }

  return (
    <div className="space-y-4">
      {/* 文本属性 */}
      <PropertyEditor
        label="文本内容"
        type="text"
        value={properties.text}
        onChange={(value) => handlePropertyChange('text', value)}
      />

      {/* 占位符属性 */}
      <PropertyEditor
        label="占位符"
        type="text"
        value={properties.placeholder}
        onChange={(value) => handlePropertyChange('placeholder', value)}
      />

      {/* 必填状态 */}
      <PropertyEditor
        label="必填"
        type="boolean"
        value={properties.required}
        onChange={(value) => handlePropertyChange('required', value)}
      />

      {/* 保存按钮 */}
      <Button
        onClick={handleSave}
        disabled={!isDirty || isLoading}
      >
        {isLoading ? '保存中...' : '保存更改'}
      </Button>
    </div>
  )
}
```

### 3. 样式配置

配置组件的视觉样式：

```typescript
import { StyleConfig } from '@/components/designer/PropertiesPanel/components/StyleConfig'

function ComponentStyleEditor({ componentId }: { componentId: string }) {
  return (
    <StyleConfig componentId={componentId}>
      <div className="space-y-6">
        {/* 尺寸配置 */}
        <PropertyGroup title="尺寸">
          <PropertyEditor
            label="宽度"
            type="size"
            value="100%"
            onChange={(value) => handleStyleChange('width', value)}
          />
          <PropertyEditor
            label="高度"
            type="size"
            value="auto"
            onChange={(value) => handleStyleChange('height', value)}
          />
        </PropertyGroup>

        {/* 颜色配置 */}
        <PropertyGroup title="颜色">
          <PropertyEditor
            label="背景颜色"
            type="color"
            value="#ffffff"
            onChange={(value) => handleStyleChange('backgroundColor', value)}
          />
          <PropertyEditor
            label="文字颜色"
            type="color"
            value="#000000"
            onChange={(value) => handleStyleChange('color', value)}
          />
        </PropertyGroup>

        {/* 边距配置 */}
        <PropertyGroup title="间距">
          <PropertyEditor
            label="外边距"
            type="spacing"
            value="16px"
            onChange={(value) => handleStyleChange('margin', value)}
          />
          <PropertyEditor
            label="内边距"
            type="spacing"
            value="8px"
            onChange={(value) => handleStyleChange('padding', value)}
          />
        </PropertyGroup>
      </div>
    </StyleConfig>
  )
}
```

### 4. 事件绑定

为组件绑定交互事件：

```typescript
import { EventConfig } from '@/components/designer/PropertiesPanel/components/EventConfig'

function ComponentEventEditor({ componentId }: { componentId: string }) {
  return (
    <EventConfig componentId={componentId}>
      <div className="space-y-4">
        {/* 点击事件 */}
        <EventHandler
          eventType="click"
          componentId={componentId}
          onConfigChange={(config) => handleEventConfig('click', config)}
        />

        {/* 提交事件 */}
        <EventHandler
          eventType="submit"
          componentId={componentId}
          onConfigChange={(config) => handleEventConfig('submit', config)}
        />
      </div>
    </EventConfig>
  )
}
```

## 🔧 高级功能

### 1. 自定义属性编辑器

创建自定义的属性编辑器组件：

```typescript
// components/designer/PropertiesPanel/components/CustomEditors/RichTextEditor.tsx
import { PropertyEditorProps } from '@/types/property-editor'

export function RichTextEditor({
  value,
  onChange,
  schema,
  disabled
}: PropertyEditorProps) {
  const [editorState, setEditorState] = useState(value)

  const handleChange = useCallback((newValue: string) => {
    setEditorState(newValue)
    onChange(newValue)
  }, [onChange])

  return (
    <div className="space-y-2">
      <Label>富文本内容</Label>
      <RichTextEditorComponent
        value={editorState}
        onChange={handleChange}
        disabled={disabled}
        placeholder={schema.description}
      />
    </div>
  )
}

// 注册自定义编辑器
import { PropertyEditorRegistry } from '@/lib/property-editor-registry'

const registry = new PropertyEditorRegistry()
registry.register('richtext', RichTextEditor)
```

### 2. 属性验证

实现自定义属性验证规则：

```typescript
// lib/designer/validation/custom-validators.ts
export const emailValidator: CustomValidator = {
  name: 'email',
  validate: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      valid: emailRegex.test(value),
      message: emailRegex.test(value) ? null : '请输入有效的邮箱地址',
    }
  },
}

export const urlValidator: CustomValidator = {
  name: 'url',
  validate: (value: string) => {
    try {
      new URL(value)
      return { valid: true, message: null }
    } catch {
      return { valid: false, message: '请输入有效的URL地址' }
    }
  },
}

// 注册验证器
import { ValidationManager } from '@/lib/designer/validation'

const validationManager = new ValidationManager()
validationManager.registerValidator(emailValidator)
validationManager.registerValidator(urlValidator)
```

### 3. 实时预览

实现属性的实时预览功能：

```typescript
// hooks/useRealtimePreview.ts
export function useRealtimePreview({
  componentId,
  enablePreview = true,
}: {
  componentId: string
  enablePreview?: boolean
}) {
  const { updatePreview, previewState } = usePreviewStore()
  const { properties } = usePropertyStore(componentId)

  const handlePropertyChange = useCallback(
    (propertyKey: string, newValue: any) => {
      if (enablePreview) {
        // 立即更新预览状态
        updatePreview(componentId, propertyKey, newValue)
      }
    },
    [componentId, enablePreview, updatePreview]
  )

  return {
    handlePropertyChange,
    previewState: previewState[componentId],
  }
}
```

### 4. 撤销重做功能

实现属性配置的撤销重做：

```typescript
// lib/designer/history/property-history.ts
export class PropertyHistoryManager {
  private history: PropertyChange[] = []
  private currentIndex = -1

  recordChange(change: PropertyChange): void {
    // 记录属性变更
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.history.push(change)
    this.currentIndex++
  }

  undo(): PropertyChange | null {
    if (this.canUndo()) {
      this.currentIndex--
      return this.history[this.currentIndex]
    }
    return null
  }

  redo(): PropertyChange | null {
    if (this.canRedo()) {
      this.currentIndex++
      return this.history[this.currentIndex]
    }
    return null
  }

  canUndo(): boolean {
    return this.currentIndex > 0
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
}
```

## 🎯 最佳实践

### 1. 性能优化

- **使用React.memo**: 对属性编辑器组件使用memo优化渲染
- **防抖处理**: 对频繁的属性变更使用防抖
- **虚拟化**: 大量属性时使用虚拟化列表

```typescript
// 防抖示例
import { useDebouncedCallback } from 'use-debounce'

const debouncedUpdateProperty = useDebouncedCallback((key: string, value: any) => {
  updateProperty(key, value)
}, 300)
```

### 2. 类型安全

- **严格TypeScript**: 使用严格的TypeScript配置
- **类型定义**: 为所有属性配置定义完整的类型
- **运行时验证**: 使用Zod进行运行时类型验证

```typescript
// 类型定义示例
interface ComponentProperty {
  id: string
  propertyName: string
  propertyValue: unknown
  propertyType: PropertyType
  validation?: PropertyValidation
}

// Zod验证模式
const PropertySchema = z.object({
  id: z.string().uuid(),
  propertyName: z.string(),
  propertyValue: z.unknown(),
  propertyType: z.nativeEnum(PropertyType),
})
```

### 3. 错误处理

- **边界捕获**: 使用ErrorBoundary捕获渲染错误
- **优雅降级**: 属性编辑器加载失败时提供备用方案
- **用户反馈**: 提供清晰的错误提示和恢复建议

```typescript
// 错误边界示例
function PropertyEditorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<PropertyEditorError />}
      onError={(error) => console.error('Property Editor Error:', error)}
    >
      {children}
    </ErrorBoundary>
  )
}
```

### 4. 可访问性

- **键盘导航**: 支持Tab键导航属性编辑器
- **屏幕阅读器**: 提供适当的ARIA标签
- **颜色对比**: 确保足够的颜色对比度

```typescript
// 可访问性示例
<PropertyEditor
  label="组件名称"
  aria-label="输入组件的显示名称"
  aria-describedby="component-name-help"
  aria-invalid={hasError}
  aria-errormessage={errorMessage}
/>
<div id="component-name-help" className="sr-only">
  输入组件在界面中显示的名称
</div>
{hasError && (
  <div id="component-name-error" role="alert" className="text-red-500">
    {errorMessage}
  </div>
)}
```

## 🧪 测试

### 单元测试

```typescript
// tests/property-editor.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { PropertyEditor } from '@/components/designer/PropertiesPanel/components/PropertyEditor'

describe('PropertyEditor', () => {
  it('should render property editor correctly', () => {
    render(
      <PropertyEditor
        label="测试属性"
        type="text"
        value="test value"
        onChange={jest.fn()}
      />
    )

    expect(screen.getByLabelText('测试属性')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test value')).toBeInTheDocument()
  })

  it('should call onChange when value changes', () => {
    const mockOnChange = jest.fn()
    render(
      <PropertyEditor
        label="测试属性"
        type="text"
        value=""
        onChange={mockOnChange}
      />
    )

    const input = screen.getByLabelText('测试属性')
    fireEvent.change(input, { target: { value: 'new value' } })

    expect(mockOnChange).toHaveBeenCalledWith('new value')
  })
})
```

### 集成测试

```typescript
// tests/property-config-integration.test.ts
describe('Property Configuration Integration', () => {
  it('should handle complete property configuration workflow', async () => {
    const { result } = renderHook(() => usePropertyEditor('test-component-id'))

    // 更新属性
    act(() => {
      result.current.updateProperty('text', 'Hello World')
    })

    // 检查属性已更新
    expect(result.current.properties.text).toBe('Hello World')

    // 保存更改
    await act(async () => {
      await result.current.saveChanges()
    })

    // 检查保存状态
    expect(result.current.isDirty).toBe(false)
  })
})
```

## 📚 API 参考

### 核心Hooks

#### usePropertyEditor

```typescript
const {
  properties, // 当前属性值
  updateProperty, // 更新单个属性
  updateProperties, // 批量更新属性
  saveChanges, // 保存更改
  resetChanges, // 重置更改
  isDirty, // 是否有未保存的更改
  isLoading, // 是否正在保存
  error, // 错误信息
} = usePropertyEditor(componentId)
```

#### usePropertyValidation

```typescript
const {
  validateProperty, // 验证单个属性
  validateAll, // 验证所有属性
  errors, // 验证错误
  warnings, // 验证警告
  isValid, // 是否全部验证通过
} = usePropertyValidation(componentId, properties)
```

#### useRealtimePreview

```typescript
const {
  previewState, // 预览状态
  updatePreview, // 更新预览
  clearPreview, // 清除预览
  applyPreview, // 应用预览更改
} = useRealtimePreview(componentId)
```

### 核心组件

#### PropertyEditor

```typescript
<PropertyEditor
  label="属性标签"
  type="text"         // 属性类型
  value={value}
  onChange={handleChange}
  schema={propertySchema}
  validation={validation}
  disabled={false}
  placeholder="请输入..."
/>
```

#### PropertyGroup

```typescript
<PropertyGroup
  title="基础属性"
  collapsible={true}
  defaultCollapsed={false}
>
  <PropertyEditor ... />
  <PropertyEditor ... />
</PropertyGroup>
```

## 🐛 故障排除

### 常见问题

#### 1. 属性面板不显示

**症状**: 属性面板空白或不显示
**解决方案**:

- 检查组件ID是否正确传递
- 确认组件是否在设计器中被选中
- 验证权限设置是否正确

#### 2. 属性更改不生效

**症状**: 修改属性值后没有反应
**解决方案**:

- 检查onChange回调是否正确实现
- 确认组件是否正确订阅状态变更
- 验证属性值的数据类型是否匹配

#### 3. 预览功能不工作

**症状**: 属性修改后画布没有实时更新
**解决方案**:

- 确认实时预览功能是否启用
- 检查画布组件是否正确监听预览状态
- 验证预览状态管理是否正常工作

#### 4. 保存功能失败

**症状**: 点击保存按钮没有反应或报错
**解决方案**:

- 检查网络连接和API端点
- 验证用户权限是否足够
- 确认属性值是否通过验证

### 调试技巧

1. **使用React DevTools**: 检查组件状态和props
2. **查看网络请求**: 使用浏览器开发者工具检查API调用
3. **启用详细日志**: 在开发环境中启用详细日志输出
4. **使用TypeScript检查**: 确保没有类型错误

## 📞 支持与反馈

如果您在使用过程中遇到问题或有改进建议，请通过以下方式联系我们：

- **GitHub Issues**: [项目地址/issues](https://github.com/your-repo/issues)
- **开发团队**: dev@flowbase.com
- **文档反馈**: docs@flowbase.com

---

**Happy Coding! 🎉**

通过本指南，您应该能够快速上手FlowBase组件属性配置面板的开发。如有任何问题，请随时联系我们。
