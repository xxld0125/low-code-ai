# 📝 文本组件 (Text)

## 组件概述

文本组件用于显示各种格式的文本内容，支持基础样式和排版配置。

## 属性配置

### 基础配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `text.content` | 文本内容 | textarea | - | ✅ | 文本的显示内容，支持多行文本 |
| `text.color` | 文本颜色 | color | `#000000` | ❌ | 文本的颜色，提供预设颜色选项 |

### 样式配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `text.size` | 字体大小 | radio | `base` | ❌ | 字体大小，4个尺寸选项 |
| `text.weight` | 字体粗细 | radio | `normal` | ❌ | 字体粗细，正常或粗体 |
| `text.textAlign` | 文本对齐 | radio | `left` | ❌ | 文本对齐方式，左对齐、居中或右对齐 |

## 详细配置

### text.content - 文本内容
```typescript
{
  key: 'text.content',
  label: '文本内容',
  type: 'textarea',
  placeholder: '请输入文本内容',
  maxLength: 500,
  required: true
}
```

**选项说明**：
- 最大长度：500个字符
- 支持多行文本输入
- 自动识别换行符

### text.color - 文本颜色
```typescript
{
  key: 'text.color',
  label: '文本颜色',
  type: 'color',
  defaultValue: '#000000',
  options: [
    { label: '黑色', value: '#000000' },
    { label: '灰色', value: '#6b7280' },
    { label: '蓝色', value: '#3b82f6' },
    { label: '红色', value: '#ef4444' },
    { label: '绿色', value: '#10b981' }
  ]
}
```

**预设颜色**：
- 黑色 (#000000) - 正文文本
- 灰色 (#6b7280) - 辅助文本
- 蓝色 (#3b82f6) - 链接文本
- 红色 (#ef4444) - 强调文本
- 绿色 (#10b981) - 成功状态

### text.size - 字体大小
```typescript
{
  key: 'text.size',
  label: '字体大小',
  type: 'radio',
  defaultValue: 'base',
  options: [
    { label: '小 (14px)', value: 'sm' },
    { label: '正常 (16px)', value: 'base' },
    { label: '大 (18px)', value: 'lg' },
    { label: '特大 (24px)', value: 'xl' }
  ]
}
```

**尺寸映射**：
- 小 (sm) → 14px
- 正常 (base) → 16px
- 大 (lg) → 18px
- 特大 (xl) → 24px

### text.weight - 字体粗细
```typescript
{
  key: 'text.weight',
  label: '字体粗细',
  type: 'radio',
  defaultValue: 'normal',
  options: [
    { label: '正常', value: 'normal' },
    { label: '粗体', value: 'bold' }
  ]
}
```

### text.textAlign - 文本对齐
```typescript
{
  key: 'text.textAlign',
  label: '文本对齐',
  type: 'radio',
  defaultValue: 'left',
  options: [
    { label: '左对齐', value: 'left' },
    { label: '居中', value: 'center' },
    { label: '右对齐', value: 'right' }
  ]
}
```

## 使用示例

### 基础文本
```json
{
  "text.content": "这是一段示例文本",
  "text.color": "#000000",
  "text.size": "base",
  "text.weight": "normal",
  "text.textAlign": "left"
}
```

### 标题样式文本
```json
{
  "text.content": "页面标题",
  "text.color": "#111827",
  "text.size": "xl",
  "text.weight": "bold",
  "text.textAlign": "center"
}
```

### 链接样式文本
```json
{
  "text.content": "点击这里",
  "text.color": "#3b82f6",
  "text.size": "sm",
  "text.weight": "normal",
  "text.textAlign": "center"
}
```

## 样式映射

| 属性值 | CSS类 | 说明 |
|--------|--------|------|
| size: sm | `text-sm` | 14px字体 |
| size: base | `text-base` | 16px字体 |
| size: lg | `text-lg` | 18px字体 |
| size: xl | `text-xl` | 24px字体 |
| weight: normal | `font-normal` | 400字重 |
| weight: bold | `font-bold` | 700字重 |
| textAlign: left | `text-left` | 左对齐 |
| textAlign: center | `text-center` | 居中对齐 |
| textAlign: right | `text-right` | 右对齐 |

## 注意事项

1. **内容限制**：文本内容最多500个字符
2. **颜色选择**：建议使用预设颜色以保持设计一致性
3. **响应式**：字体大小在不同屏幕尺寸下保持比例
4. **无障碍**：确保颜色对比度符合WCAG标准

## 更新日志

### v1.0.0
- 初始版本，包含5个核心属性配置
- 支持基础文本样式和排版功能
- 提供预设颜色和字体大小选项