# 📋 选择器组件 (Select)

## 组件概述

选择器组件用于从多个选项中选择一个值，支持下拉选择和搜索功能。

## 属性配置

### 基础配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `select.options` | 选项列表 | array | - | ✅ | 下拉选择的所有选项内容 |
| `select.defaultValue` | 默认值 | text | - | ❌ | 默认选中的选项值 |
| `select.placeholder` | 占位符 | text | 请选择 | ❌ | 选择框的提示文本 |
| `select.required` | 必填字段 | switch | false | ❌ | 是否为必填项 |
| `select.disabled` | 禁用状态 | switch | false | ❌ | 是否禁用选择 |

### 样式配置

| 属性键名 | 标签 | 类型 | 默认值 | 必填 | 说明 |
|----------|------|------|--------|------|------|
| `select.size` | 选择器大小 | radio | `medium` | ❌ | 选择器的尺寸大小 |

## 详细配置

### select.options - 选项列表
```typescript
{
  key: 'select.options',
  label: '选项列表',
  type: 'array',
  required: true,
  placeholder: '请输入选项，格式：标签|值',
  description: '每行一个选项，格式：显示文本|选项值，如：选项一|option1'
}
```

**格式要求**：
- 每行一个选项
- 格式：`显示文本|选项值`
- 示例：`北京|beijing`、`上海|shanghai`

### select.defaultValue - 默认值
```typescript
{
  key: 'select.defaultValue',
  label: '默认值',
  type: 'text',
  placeholder: '请输入默认选中的值',
  description: '必须与选项中的值匹配'
}
```

### select.placeholder - 占位符
```typescript
{
  key: 'select.placeholder',
  label: '占位符',
  type: 'text',
  defaultValue: '请选择',
  placeholder: '请输入占位符文本'
}
```

### select.size - 选择器大小
```typescript
{
  key: 'select.size',
  label: '选择器大小',
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

### 城市选择器
```json
{
  "select.options": "北京|beijing\n上海|shanghai\n广州|guangzhou\n深圳|shenzhen",
  "select.defaultValue": "beijing",
  "select.placeholder": "请选择城市",
  "select.required": true,
  "select.disabled": false,
  "select.size": "medium"
}
```

### 状态选择器
```json
{
  "select.options": "启用|enabled\n禁用|disabled\n待审核|pending",
  "select.defaultValue": "enabled",
  "select.placeholder": "请选择状态",
  "select.required": true,
  "select.disabled": false,
  "select.size": "small"
}
```

### 禁用状态选择器
```json
{
  "select.options": "选项一|opt1\n选项二|opt2\n选项三|opt3",
  "select.defaultValue": "opt1",
  "select.placeholder": "此选择器已禁用",
  "select.required": false,
  "select.disabled": true,
  "select.size": "medium"
}
```

## 样式映射

| 尺寸 | CSS类 | 高度 | 字体大小 | 内边距 |
|------|--------|------|----------|--------|
| small | `h-9 px-3 py-2 text-sm` | 36px | 14px | 8px 12px |
| medium | `h-10 px-4 py-2` | 40px | 16px | 12px 16px |
| large | `h-12 px-5 py-3` | 48px | 18px | 16px 20px |

## 选项解析

选项列表格式：
```
显示文本|选项值
北京|beijing
上海|shanghai
广州|guangzhou
```

解析后的选项数组：
```typescript
[
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' }
]
```

## 功能特性

### 搜索功能
- 支持选项搜索过滤
- 实时搜索结果显示
- 搜索关键词高亮

### 验证和提示
- 必填字段验证
- 默认值匹配检查
- 选项值有效性验证

### 交互体验
- 清晰的焦点指示
- 平滑的下拉动画
- 选中状态的视觉反馈

## 注意事项

1. **选项格式**：严格遵循 `显示文本|选项值` 格式
2. **默认值**：必须存在于选项值中
3. **必填验证**：必填状态下显示红色边框
4. **数据安全**：敏感信息不建议作为选项值
5. **性能考虑**：大量选项建议使用分页或搜索

## 最佳实践

1. **选项设计**：
   - 显示文本简洁明了
   - 选项值使用英文或数字
   - 避免选项过多（建议不超过20个）

2. **默认值设置**：
   - 选择最常用的选项
   - 避免留空产生歧义

3. **占位符文本**：
   - 明确指示选择要求
   - 提供选择范围提示

## 更新日志

### v1.0.0
- 初始版本，包含6个核心属性配置
- 支持选项列表解析和验证
- 添加3种尺寸选项和完整样式映射
- 提供必填验证和禁用状态