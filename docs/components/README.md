# 组件库文档

## 概述

本文档介绍基础组件库的使用方法、API参考和最佳实践。基础组件库包含20个核心组件，分为表单组件、展示组件和布局组件三大类。

## 快速开始

### 安装组件库

```bash
# 组件库已集成在项目中，无需额外安装
import { Button } from '@/components/lowcode/basic/Button'
import { StyleEditor } from '@/components/lowcode/editors/StyleEditor'
```

### 基础使用

```typescript
// 使用基础组件
import { Button } from '@/components/lowcode/basic/Button'

function MyComponent() {
  return (
    <Button text="点击我" variant="primary" size="large" />
  )
}

// 使用样式编辑器
import { StyleEditor } from '@/components/lowcode/editors/StyleEditor'

function StylePanel() {
  const [styles, setStyles] = useState({
    backgroundColor: '#3b82f6',
    color: '#ffffff'
  })

  return (
    <StyleEditor
      componentDefinition={componentDef}
      componentStyles={styles}
      onStyleChange={setStyles}
    />
  )
}
```

## 组件分类

### 表单组件 (Form Components)

表单组件用于收集用户输入，支持数据绑定和验证。

#### Button - 按钮组件

```typescript
interface ButtonProps {
  text: string
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  onClick?: () => void
}
```

**使用示例:**

```typescript
<Button text="提交" variant="primary" size="large" onClick={handleSubmit} />
<Button text="取消" variant="outline" />
<Button text="删除" variant="destructive" disabled />
```

#### Input - 输入框组件

```typescript
interface InputProps {
  placeholder?: string
  value?: string
  type?: 'text' | 'email' | 'password' | 'number'
  required?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}
```

**使用示例:**

```typescript
<Input
  placeholder="请输入用户名"
  value={username}
  onChange={setUsername}
  required
/>
```

#### Textarea - 文本域组件

```typescript
interface TextareaProps {
  placeholder?: string
  value?: string
  rows?: number
  maxLength?: number
  required?: boolean
  onChange?: (value: string) => void
}
```

**使用示例:**

```typescript
<Textarea
  placeholder="请输入描述"
  value={description}
  onChange={setDescription}
  rows={4}
  maxLength={500}
/>
```

#### Select - 选择器组件

```typescript
interface SelectProps {
  options: Array<{ value: string; label: string }>
  value?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  onChange?: (value: string) => void
}
```

**使用示例:**

```typescript
<Select
  options={[
    { value: 'option1', label: '选项1' },
    { value: 'option2', label: '选项2' }
  ]}
  value={selectedOption}
  onChange={setSelectedOption}
/>
```

#### Checkbox - 复选框组件

```typescript
interface CheckboxProps {
  checked?: boolean
  label?: string
  disabled?: boolean
  onChange?: (checked: boolean) => void
}
```

**使用示例:**

```typescript
<Checkbox
  checked={agreeTerms}
  label="我同意服务条款"
  onChange={setAgreeTerms}
/>
```

#### Radio - 单选框组件

```typescript
interface RadioProps {
  options: Array<{ value: string; label: string }>
  value?: string
  disabled?: boolean
  onChange?: (value: string) => void
}
```

**使用示例:**

```typescript
<Radio
  options={[
    { value: 'male', label: '男' },
    { value: 'female', label: '女' }
  ]}
  value={gender}
  onChange={setGender}
/>
```

### 展示组件 (Display Components)

展示组件用于显示静态和动态内容。

#### Text - 文本组件

```typescript
interface TextProps {
  content: string
  fontSize?: 'small' | 'medium' | 'large'
  color?: string
  weight?: 'normal' | 'medium' | 'bold'
}
```

#### Heading - 标题组件

```typescript
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6
  content: string
  color?: string
  weight?: 'normal' | 'medium' | 'bold'
}
```

#### Image - 图片组件

```typescript
interface ImageProps {
  src: string
  alt?: string
  width?: number | string
  height?: number | string
  objectFit?: 'cover' | 'contain' | 'fill'
  onLoad?: () => void
  onError?: () => void
}
```

#### Card - 卡片组件

```typescript
interface CardProps {
  title?: string
  description?: string
  image?: string
  actions?: React.ReactNode
  shadow?: 'none' | 'small' | 'medium' | 'large'
}
```

#### Badge - 徽章组件

```typescript
interface BadgeProps {
  text: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'small' | 'medium' | 'large'
}
```

### 布局组件 (Layout Components)

布局组件用于组织页面结构和响应式设计。

#### Container - 容器组件

```typescript
interface ContainerProps {
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: number | string
  center?: boolean
  children: React.ReactNode
}
```

#### Row - 行组件

```typescript
interface RowProps {
  gap?: number | string
  align?: 'start' | 'center' | 'end' | 'stretch'
  wrap?: boolean
  children: React.ReactNode
}
```

#### Col - 列组件

```typescript
interface ColProps {
  span?: number | string
  offset?: number | string
  order?: number
  children: React.ReactNode
}
```

#### Divider - 分割线组件

```typescript
interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  thickness?: number
}
```

#### Spacer - 间距组件

```typescript
interface SpacerProps {
  size?: number | string
  direction?: 'horizontal' | 'vertical'
  flex?: boolean
}
```

## 编辑器组件

### PropertyEditor - 属性编辑器

属性编辑器用于配置组件的属性值。

```typescript
interface PropertyEditorProps {
  componentType: string
  componentId: string
  componentCategory?: string
  properties: ComponentProps
  propertyDefinitions: PropertyDefinition[]
  onPropertyChange: (event: PropertyUpdateEvent) => void
  disabled?: boolean
}
```

### StyleEditor - 样式编辑器

样式编辑器用于配置组件的样式。

```typescript
interface StyleEditorProps {
  componentDefinition: ComponentStyleDefinition
  componentStyles: ComponentStyles
  onStyleChange: (property: string, value: unknown, options?: { breakpoint?: string }) => void
  onValidationError?: (property: string, error: Record<string, unknown>) => void
  showResponsive?: boolean
  showPreview?: boolean
}
```

### ValidationEditor - 验证编辑器

验证编辑器用于配置组件的验证规则。

```typescript
interface ValidationEditorProps {
  componentType: string
  propertyName: string
  propertyType: 'string' | 'number' | 'email' | 'url'
  validationRules: ValidationRule[]
  onValidationRulesChange: (rules: ValidationRule[]) => void
  showAdvanced?: boolean
}
```

## 样式系统

### 主题配置

组件库支持多种主题，可以通过CSS变量进行定制：

```css
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --background: #ffffff;
  --border: #e5e7eb;
  --text-primary: #111827;
  --text-secondary: #6b7280;
}
```

### 响应式设计

组件库采用移动优先的响应式设计策略，支持以下断点：

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: ≥ 1024px

### 样式属性

支持以下样式属性类别：

- **文字样式**: color, fontSize, fontWeight, fontFamily, lineHeight, textAlign
- **布局样式**: display, position, width, height, margin, padding
- **视觉样式**: backgroundColor, border, borderRadius, boxShadow, opacity
- **变换样式**: transform, transition, animation

## 验证系统

### 内置验证规则

- **必填验证**: 确保字段不为空
- **长度验证**: 限制文本长度范围
- **格式验证**: 验证邮箱、URL等格式
- **数值验证**: 限制数值范围
- **自定义验证**: 支持自定义验证函数

### 错误处理

验证失败时，组件会显示错误提示：

```typescript
// 错误状态显示
<ValidationEditor
  componentType="input"
  propertyName="email"
  propertyType="email"
  validationRules={[
    {
      id: 'email-format',
      type: 'email',
      label: '邮箱格式',
      enabled: true,
      errorMessage: '请输入有效的邮箱地址'
    }
  ]}
/>
```

## 最佳实践

### 1. 组件组合

推荐使用布局组件来组织其他组件：

```typescript
<Container maxWidth="lg" padding={4} center>
  <Card title="用户信息" shadow="medium">
    <Row gap={4}>
      <Col span={6}>
        <Input placeholder="用户名" />
      </Col>
      <Col span={6}>
        <Input placeholder="密码" type="password" />
      </Col>
    </Row>
    <Row gap={2} justify="end">
      <Button text="取消" variant="outline" />
      <Button text="登录" variant="primary" />
    </Row>
  </Card>
</Container>
```

### 2. 表单验证

结合ValidationEditor使用验证规则：

```typescript
const validationRules = [
  {
    id: 'required',
    type: 'required',
    label: '必填',
    enabled: true,
    errorMessage: '此字段为必填项',
  },
  {
    id: 'min-length',
    type: 'min_length',
    label: '最小长度',
    enabled: true,
    params: { min: 6 },
    errorMessage: '至少需要输入6个字符',
  },
]
```

### 3. 样式一致性

使用StyleEditor确保样式一致性：

```typescript
// 定义统一的样式模板
const buttonStyles = {
  backgroundColor: '#3b82f6',
  color: '#ffffff',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '14px',
  fontWeight: '500',
}
```

### 4. 可访问性

- 确保所有交互元素都有合适的焦点样式
- 为图片提供alt文本
- 使用语义化HTML标签
- 确保足够的颜色对比度

## 故障排除

### 常见问题

**Q: 组件样式不生效？**
A: 检查CSS变量是否正确定义，确保样式属性名称正确。

**Q: 验证规则不工作？**
A: 确认ValidationEditor的validationRules配置正确，检查验证规则是否已启用。

**Q: 响应式布局异常？**
A: 检查断点设置和媒体查询配置，确保Container、Row、Col组件正确嵌套。

### 调试技巧

1. 使用浏览器开发者工具检查组件结构和样式
2. 查看控制台错误信息
3. 使用React DevTools检查组件状态
4. 检查网络请求和资源加载

## 更新日志

### v1.0.0 (2025-10-30)

- 初始版本发布
- 包含20个核心组件
- 完整的编辑器系统
- 响应式设计支持
- 验证系统

## 贡献指南

欢迎提交Issue和Pull Request来改进组件库。

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build
```

### 组件开发规范

1. 所有组件必须使用TypeScript
2. 遵循设计系统规范
3. 编写单元测试
4. 提供完整的类型定义
5. 编写使用文档

## 许可证

本项目采用 MIT 许可证。
