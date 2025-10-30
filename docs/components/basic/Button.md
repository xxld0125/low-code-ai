# Button 组件

按钮组件用于触发操作，支持多种样式和尺寸变体。

## API 参考

### Props

| 属性      | 类型                                                                                       | 默认值      | 描述             |
| --------- | ------------------------------------------------------------------------------------------ | ----------- | ---------------- |
| text      | `string`                                                                                   | -           | 按钮文字内容     |
| variant   | `'default' \| 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'link' \| 'destructive'` | `'default'` | 按钮样式变体     |
| size      | `'small' \| 'medium' \| 'large'`                                                           | `'medium'`  | 按钮尺寸         |
| disabled  | `boolean`                                                                                  | `false`     | 是否禁用按钮     |
| onClick   | `() => void`                                                                               | -           | 点击事件处理函数 |
| loading   | `boolean`                                                                                  | `false`     | 是否显示加载状态 |
| type      | `'button' \| 'submit' \| 'reset'`                                                          | `'button'`  | 按钮类型         |
| className | `string`                                                                                   | -           | 自定义CSS类名    |

### 事件

| 事件名  | 类型                                  | 描述         |
| ------- | ------------------------------------- | ------------ |
| onClick | `React.MouseEvent<HTMLButtonElement>` | 按钮点击事件 |

## 使用示例

### 基础用法

```typescript
import { Button } from '@/components/lowcode/basic/Button'

function Example() {
  return (
    <div className="space-x-2">
      <Button text="默认按钮" />
      <Button text="主要按钮" variant="primary" />
      <Button text="次要按钮" variant="secondary" />
      <Button text="轮廓按钮" variant="outline" />
    </div>
  )
}
```

### 不同尺寸

```typescript
function Example() {
  return (
    <div className="space-x-2">
      <Button text="小按钮" size="small" />
      <Button text="中等按钮" size="medium" />
      <Button text="大按钮" size="large" />
    </div>
  )
}
```

### 禁用状态

```typescript
function Example() {
  return (
    <div className="space-x-2">
      <Button text="正常按钮" />
      <Button text="禁用按钮" disabled />
    </div>
  )
}
```

### 加载状态

```typescript
function Example() {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
  }

  return (
    <Button text={loading ? '处理中...' : '提交'} onClick={handleClick} loading={loading} />
  )
}
```

### 危险操作

```typescript
function Example() {
  const handleDelete = () => {
    if (confirm('确定要删除吗？')) {
      // 执行删除操作
    }
  }

  return (
    <Button text="删除" variant="destructive" onClick={handleDelete} />
  )
}
```

### 链接样式

```typescript
function Example() {
  return (
    <Button text="了解更多" variant="link" onClick={() => window.open('/about')} />
  )
}
```

### 表单提交

```typescript
function Example() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 处理表单提交
  }

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" text="提交表单" variant="primary" />
    </form>
  )
}
```

## 样式定制

### 自定义颜色

```css
.custom-button {
  background-color: #10b981;
  border-color: #10b981;
}

.custom-button:hover {
  background-color: #059669;
}
```

```typescript
<Button text="自定义按钮" className="custom-button" />
```

### 自定义尺寸

```css
.custom-button {
  padding: 12px 24px;
  font-size: 18px;
}
```

## 无障碍支持

按钮组件支持以下无障碍特性：

- **键盘导航**: 支持Tab键导航
- **焦点样式**: 提供清晰的焦点指示
- **屏幕阅读器**: 适当的ARIA属性
- **高对比度**: 支持系统高对比度模式

### 键盘操作

- `Tab`: 导航到按钮
- `Enter` / `Space`: 激活按钮
- `Esc`: 取消操作（如有）

## 最佳实践

### 1. 清晰的文字描述

按钮文字应该清楚地描述操作结果：

```typescript
// ✅ 好的示例
<Button text="保存更改" />
<Button text="删除所有记录" variant="destructive" />

// ❌ 避免的示例
<Button text="点击这里" />
<Button text="确定" />
```

### 2. 合理的变体使用

根据操作的重要性选择合适的变体：

```typescript
// 主要操作
<Button text="保存" variant="primary" />

// 次要操作
<Button text="取消" variant="outline" />

// 危险操作
<Button text="删除" variant="destructive" />
```

### 3. 禁用状态处理

在操作进行中或条件不满足时禁用按钮：

```typescript
function SaveButton({ isSaving, hasChanges }: { isSaving: boolean; hasChanges: boolean }) {
  return (
    <Button
      text={isSaving ? '保存中...' : '保存'}
      disabled={isSaving || !hasChanges}
      variant="primary"
    />
  )
}
```

## 故障排除

### 常见问题

**Q: 按钮点击没有反应？**
A: 检查onClick事件处理函数是否正确定义，确保按钮没有被意外禁用。

**Q: 按钮样式不正确？**
A: 确认导入了正确的CSS样式，检查是否有样式冲突。

**Q: 按钮在不同浏览器中显示不一致？**
A: 检查浏览器兼容性，确保使用了标准CSS属性。

## 设计规范

### 颜色规范

- **主要按钮**: 蓝色背景，白色文字
- **次要按钮**: 灰色背景，深色文字
- **危险按钮**: 红色背景，白色文字
- **链接按钮**: 透明背景，蓝色文字

### 尺寸规范

- **小按钮**: 高度32px，内边距 8px 16px
- **中等按钮**: 高度40px，内边距 12px 24px
- **大按钮**: 高度48px，内边距 16px 32px

### 圆角规范

- **所有按钮**: 统一使用6px圆角
- **特殊情况**: 可根据设计需要调整

## 更新历史

### v1.0.0

- 初始版本发布
- 支持多种样式变体
- 支持不同尺寸
- 添加加载状态
- 完善无障碍支持
