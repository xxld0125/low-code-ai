# 🔘 按钮组件 (Button)

## 组件概述

按钮组件用于触发用户操作，支持多种样式和状态，是交互式界面的核心组件。

## 属性配置

### 基础配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `button.text` | 按钮文本 | text | - | ✅ | 按钮上显示的文本内容 |
| `button.variant` | 按钮类型 | radio | `primary` | ❌ | 按钮的视觉样式类型 |
| `button.size` | 按钮大小 | radio | `medium` | ❌ | 按钮的尺寸大小 |
| `button.disabled` | 禁用状态 | switch | false | ❌ | 控制按钮是否可用 |

### 样式配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `button.width` | 按钮宽度 | radio | `auto` | ❌ | 按钮的宽度模式 |

## 详细配置

### button.text - 按钮文本
```typescript
{
  key: 'button.text',
  label: '按钮文本',
  type: 'text',
  placeholder: '请输入按钮文本',
  required: true
}
```

**要求**：
- 必填属性，不能为空
- 建议长度不超过20个字符
- 支持中英文和数字

### button.variant - 按钮类型
```typescript
{
  key: 'button.variant',
  label: '按钮类型',
  type: 'radio',
  defaultValue: 'primary',
  options: [
    { label: '主要', value: 'primary' },
    { label: '次要', value: 'secondary' },
    { label: '危险', value: 'danger' },
    { label: '链接', value: 'link' }
  ]
}
```

**类型说明**：
- **主要 (primary)**：突出显示，用于主要操作
- **次要 (secondary)**：次要操作，与主按钮形成对比
- **危险 (danger)**：危险操作，如删除、清除
- **链接 (link)**：链接样式，如导航按钮

### button.size - 按钮大小
```typescript
{
  key: 'button.size',
  label: '按钮大小',
  type: 'radio',
  defaultValue: 'medium',
  options: [
    { label: '小', value: 'sm' },
    { label: '正常', value: 'md' },
    { label: '大', value: 'lg' }
  ]
}
```

**尺寸映射**：
- 小 (sm)：高度 32px，内边距 8px 16px
- 正常 (md)：高度 40px，内边距 12px 24px
- 大 (lg)：高度 48px，内边距 16px 32px

### button.disabled - 禁用状态
```typescript
{
  key: 'button.disabled',
  label: '禁用状态',
  type: 'switch',
  defaultValue: false
}
```

**效果**：
- 启用时按钮变灰且不可点击
- 自动添加 `disabled` 属性
- 鼠标指针变为 `not-allowed`

### button.width - 按钮宽度
```typescript
{
  key: 'button.width',
  label: '按钮宽度',
  type: 'radio',
  defaultValue: 'auto',
  options: [
    { label: '自适应', value: 'auto' },
    { label: '全宽', value: 'full' }
  ]
}
```

**宽度模式**：
- **自适应**：根据内容自动调整宽度
- **全宽**：占满父容器的全部宽度

## 使用示例

### 主要操作按钮
```json
{
  "button.text": "保存",
  "button.variant": "primary",
  "button.size": "medium",
  "button.width": "auto",
  "button.disabled": false
}
```

### 危险操作按钮
```json
{
  "button.text": "删除",
  "button.variant": "danger",
  "button.size": "medium",
  "button.width": "auto",
  "button.disabled": false
}
```

### 全宽按钮
```json
{
  "button.text": "提交表单",
  "button.variant": "primary",
  "button.size": "lg",
  "button.width": "full",
  "button.disabled": false
}
```

### 链接样式按钮
```json
{
  "button.text": "了解更多",
  "button.variant": "link",
  "button.size": "sm",
  "button.width": "auto",
  "button.disabled": false
}
```

### 禁用状态按钮
```json
{
  "button.text": "提交中...",
  "button.variant": "primary",
  "button.size": "medium",
  "button.width": "auto",
  "button.disabled": true
}
```

## 样式映射

### 变体样式 (Variant)
| 类型 | CSS类 | 主要颜色 | 文字颜色 |
|------|--------|----------|----------|
| primary | `bg-blue-500` | 蓝色 | 白色 |
| secondary | `bg-gray-500` | 灰色 | 白色 |
| danger | `bg-red-500` | 红色 | 白色 |
| link | `text-blue-500` | 透明 | 蓝色 |

### 尺寸样式 (Size)
| 尺寸 | CSS类 | 高度 | 字体大小 |
|------|--------|------|----------|
| sm | `px-3 py-2 text-sm` | 32px | 14px |
| md | `px-4 py-3 text-base` | 40px | 16px |
| lg | `px-6 py-4 text-lg` | 48px | 18px |

### 宽度样式 (Width)
| 模式 | CSS类 | 说明 |
|------|--------|------|
| auto | `w-auto` | 根据内容自动调整 |
| full | `w-full` | 占满父容器宽度 |

## 状态样式

### 禁用状态 (Disabled)
- 透明度降低到 60%
- 鼠标指针变为 `not-allowed`
- 移除所有交互效果
- 背景色变为浅灰色

### 悬停状态 (Hover)
- 所有变体都有悬停效果
- 链接类型有下划线装饰
- 阴影效果增强

### 点击状态 (Active)
- 按下时的视觉反馈
- 稍微内缩效果
- 颜色稍微加深

## 注意事项

1. **文本长度**：按钮文本建议不超过20个字符
2. **禁用状态**：禁用的按钮不应触发点击事件
3. **全宽按钮**：通常用于表单提交或模态框操作
4. **访问性**：确保按钮有足够的点击区域和对比度
5. **语义化**：根据操作重要性选择合适的变体类型

## 最佳实践

1. **主要操作**：使用 `primary` 变体
2. **次要操作**：使用 `secondary` 变体
3. **危险操作**：使用 `danger` 变体
4. **导航链接**：使用 `link` 变体
5. **表单按钮**：表单中使用 `full` 宽度
6. **移动端**：使用 `lg` 尺寸提高可点击性

## 更新日志

### v1.0.0
- 初始版本，包含5个核心属性配置
- 支持4种按钮变体和3种尺寸选项
- 添加禁用状态和宽度模式配置
- 提供完整的样式映射和状态反馈