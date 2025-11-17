# 📄 文本域组件 (Textarea)

## 组件概述

文本域组件用于收集多行文本输入，支持自动调整高度和手动设置行数。

## 属性配置

### 基础配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `textarea.value` | 默认值 | textarea | - | ❌ | 文本域的默认内容 |
| `textarea.placeholder` | 占位符 | text | - | ❌ | 输入提示文本 |
| `textarea.rows` | 显示行数 | radio | 3 | ❌ | 固定显示的行数 |
| `textarea.required` | 必填字段 | switch | false | ❌ | 是否为必填项 |

### 样式配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `textarea.resizable` | 调整大小 | radio | `vertical` | ❌ | 是否允许用户调整大小 |

## 详细配置

### textarea.value - 默认值
```typescript
{
  key: 'textarea.value',
  label: '默认值',
  type: 'textarea',
  placeholder: '请输入默认文本'
}
```

### textarea.placeholder - 占位符
```typescript
{
  key: 'textarea.placeholder',
  label: '占位符',
  type: 'text',
  placeholder: '请输入占位符文本'
}
```

### textarea.rows - 显示行数
```typescript
{
  key: 'textarea.rows',
  label: '显示行数',
  type: 'radio',
  defaultValue: '3',
  options: [
    { label: '3行', value: '3' },
    { label: '5行', value: '5' },
    { label: '10行', value: '10' }
  ]
}
```

### textarea.required - 必填字段
```typescript
{
  key: 'textarea.required',
  label: '必填字段',
  type: 'switch',
  defaultValue: false
}
```

### textarea.resizable - 调整大小
```typescript
{
  key: 'textarea.resizable',
  label: '调整大小',
  type: 'radio',
  defaultValue: 'vertical',
  options: [
    { label: '固定大小', value: 'none' },
    { label: '垂直调整', value: 'vertical' },
    { label: '自由调整', value: 'both' }
  ]
}
```

## 使用示例

### 基础文本域
```json
{
  "textarea.value": "",
  "textarea.placeholder": "请输入您的反馈",
  "textarea.rows": "5",
  "textarea.required": true,
  "textarea.resizable": "vertical"
}
```

### 长文本输入
```json
{
  "textarea.value": "",
  "textarea.placeholder": "请输入详细描述...",
  "textarea.rows": "10",
  "textarea.required": true,
  "textarea.resizable": "both"
}
```

### 简短输入
```json
{
  "textarea.value": "",
  "textarea.placeholder": "请输入简短备注",
  "textarea.rows": "3",
  "textarea.required": false,
  "textarea.resizable": "none"
}
```

## 样式映射

| 调整模式 | CSS类 | 说明 |
|----------|--------|------|
| none | `resize-none` | 禁止调整大小 |
| vertical | `resize-y` | 只能垂直调整 |
| both | `resize` | 可以调整宽度和高度 |

## 功能特性

### 自动调整高度
- `resizable: vertical` 时自动垂直调整
- 最小高度为固定的行数高度
- 最大高度根据内容自动扩展

### 字符计数
- 实时显示字符数量
- 支持设置最大字符限制
- 超出时显示警告

### 输入验证
- 必填字段验证
- 字符长度限制
- 自定义验证规则

## 注意事项

1. **性能考虑**：大量文本建议使用固定高度
2. **用户体验**：提供清晰的字符限制提示
3. **可访问性**：确保有适当的标签和描述
4. **移动端**：考虑虚拟键盘的高度影响

## 更新日志

### v1.0.0
- 初始版本，包含5个核心属性配置
- 支持3种行数选项和3种调整模式
- 添加必填验证和基础样式