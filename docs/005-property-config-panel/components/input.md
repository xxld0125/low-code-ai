# 📝 输入框组件 (Input)

## 组件概述

输入框组件用于收集用户输入的文本数据，支持多种输入类型和验证功能。

## 属性配置

### 基础配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `input.value` | 默认值 | text | - | ❌ | 输入框的默认文本内容 |
| `input.placeholder` | 占位符 | text | - | ❌ | 输入提示文本 |
| `input.type` | 输入类型 | select | `text` | ❌ | 输入数据的格式类型 |
| `input.required` | 必填字段 | switch | false | ❌ | 是否为必填项 |
| `input.disabled` | 禁用状态 | switch | false | ❌ | 是否禁用输入 |

### 样式配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `input.size` | 输入框大小 | radio | `medium` | ❌ | 输入框的尺寸大小 |

## 详细配置

### input.value - 默认值
```typescript
{
  key: 'input.value',
  label: '默认值',
  type: 'text',
  placeholder: '输入默认值'
}
```

### input.placeholder - 占位符
```typescript
{
  key: 'input.placeholder',
  label: '占位符',
  type: 'text',
  placeholder: '请输入占位符文本'
}
```

### input.type - 输入类型
```typescript
{
  key: 'input.type',
  label: '输入类型',
  type: 'select',
  defaultValue: 'text',
  options: [
    { label: '文本', value: 'text' },
    { label: '数字', value: 'number' },
    { label: '邮箱', value: 'email' },
    {label: '密码', value: 'password' },
    {label: '电话', value: 'tel' },
    {label: '搜索', value: 'search' }
  ]
}
```

**类型说明**：
- **text**：普通文本输入
- **number**：数字输入，支持上下箭头
- **email**：邮箱地址，自动验证格式
- **password**：密码输入，显示为星号
- **tel**：电话号码，支持移动端数字键盘
- **search**：搜索框，带清除按钮

### input.required - 必填字段
```typescript
{
  key: 'input.required',
  label: '必填字段',
  type: 'switch',
  defaultValue: false
}
```

### input.size - 输入框大小
```typescript
{
  key: 'input.size',
  label: '输入框大小',
  type: 'radio',
  defaultValue: 'medium',
  options: [
    { label: '小', value: 'small' },
    { label: '正常', value: 'medium' },
    { label: '大', value: 'large' }
  ]
}
```

## 使用示例

### 基础文本输入
```json
{
  "input.value": "",
  "input.placeholder": "请输入您的姓名",
  "input.type": "text",
  "input.required": true,
  "input.disabled": false,
  "input.size": "medium"
}
```

### 邮箱输入
```json
{
  "input.value": "",
  "input.placeholder": "请输入邮箱地址",
  "input.type": "email",
  "input.required": true,
  "input.disabled": false,
  "input.size": "medium"
}
```

### 密码输入
```json
{
  "input.value": "",
  "input.placeholder": "请输入密码",
  "input.type": "password",
  "input.required": true,
  "input.disabled": false,
  "input.size": "medium"
}
```

### 禁用状态
```json
{
  "input.value": "只读内容",
  "input.placeholder": "此输入框已禁用",
  "input.type": "text",
  "input.required": false,
  "input.disabled": true,
  "input.size": "medium"
}
```

## 样式映射

| 尺寸 | CSS类 | 高度 | 字体大小 | 内边距 |
|------|--------|------|----------|--------|
| small | `h-9 px-3 py-2 text-sm` | 36px | 14px | 8px 12px |
| medium | `h-10 px-4 py-2` | 40px | 16px | 12px 16px |
| large | `h-12 px-5 py-3` | 48px | 18px | 16px 20px |

## 输入类型特性

### email 类型
- 自动验证邮箱格式
- 移动端显示邮箱键盘
- 支持自动补全

### number 类型
- 显示上下箭头控制数值
- 支持 min/max 属性限制
- 移动端显示数字键盘

### password 类型
- 输入内容显示为星号
- 支持密码可见性切换
- 浏览器自动记住密码

### tel 类型
- 移动端显示电话键盘
- 支持电话号码格式验证
- 支持拨号链接

## 验证和提示

### 必填验证
- 必填字段显示红色边框
- 显示红色警告图标
- 提供清晰的错误提示

### 类型验证
- email：验证邮箱格式
- number：验证数字格式
- url：验证网址格式

### 实时反馈
- 输入时即时验证
- 失去焦点时显示验证结果
- 错误状态提供修改建议

## 注意事项

1. **安全考虑**：密码类型应使用 HTTPS 传输
2. **用户体验**：提供清晰的占位符和错误提示
3. **可访问性**：确保输入框有适当的标签和描述
4. **移动优化**：考虑移动端键盘适配
5. **数据安全**：敏感数据应加密传输

## 更新日志

### v1.0.0
- 初始版本，包含6个核心属性配置
- 支持6种常用输入类型
- 添加必填验证和禁用状态
- 提供3种尺寸选项和完整样式映射