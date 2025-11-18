# 组件使用示例

## Button 组件

### 基础用法

```tsx
import { Button } from '@/components/ui/button'

// 主要按钮
<Button variant="default">主要操作</Button>

// 次要按钮
<Button variant="secondary">次要操作</Button>

// 边框按钮
<Button variant="outline">边框按钮</Button>

// 幽灵按钮
<Button variant="ghost">幽灵按钮</Button>

// 链接样式
<Button variant="link">链接按钮</Button>
```

### 状态按钮

```tsx
// 成功按钮
<Button variant="success">保存成功</Button>

// 警告按钮
<Button variant="warning">注意</Button>

// 信息按钮
<Button variant="info">提示信息</Button>

// 危险按钮
<Button variant="destructive">删除</Button>
```

### 尺寸变化

```tsx
// 小尺寸
<Button variant="default" size="sm">小按钮</Button>

// 默认尺寸
<Button variant="default" size="default">默认按钮</Button>

// 大尺寸
<Button variant="default" size="lg">大按钮</Button>

// 图标按钮
<Button variant="default" size="icon">
  <PlusIcon />
</Button>
```

### 设计器专用按钮

```tsx
// 设计器风格
<Button variant="designer">设计器按钮</Button>

// 组件选择按钮
<Button variant="component">组件按钮</Button>
```

## ComponentCard 组件 (设计器专用)

### 基础用法

```tsx
import { ComponentCard } from '@/components/ui/component-card'

// 默认状态
<ComponentCard
  icon={<ButtonIcon />}
  title="按钮"
  description="可点击的操作按钮"
  onClick={() => addComponent('Button')}
/>

// 带徽章
<ComponentCard
  icon={<InputIcon />}
  title="输入框"
  description="文本输入组件"
  badge="常用"
  onClick={() => addComponent('Input')}
/>
```

### 状态变化

```tsx
// 选中状态
<ComponentCard
  icon={<CardIcon />}
  title="卡片"
  description="容器组件"
  selected={isSelected}
  onClick={() => selectComponent('Card')}
/>

// 拖拽状态
<ComponentCard
  icon={<ImageIcon />}
  title="图片"
  description="图片展示组件"
  dragging={isDragging}
  onDragEnd={handleDragEnd}
/>

// 禁用状态
<ComponentCard
  icon={<AdvancedIcon />}
  title="高级组件"
  description="需要专业版"
  disabled
  variant="disabled"
/>
```

### 尺寸变化

```tsx
// 紧凑尺寸
<ComponentCard
  icon={<Icon />}
  title="组件"
  size="compact"
  onClick={handleClick}
/>

// 大尺寸
<ComponentCard
  icon={<Icon />}
  title="组件"
  description="详细描述信息"
  size="large"
  onClick={handleClick}
/>
```

## Card 组件

### 基础用法

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

;<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述信息</CardDescription>
  </CardHeader>
  <CardContent>
    <p>这是卡片的主要内容区域</p>
  </CardContent>
  <CardFooter>
    <Button>操作按钮</Button>
  </CardFooter>
</Card>
```

### 简化用法

```tsx
<Card className="p-4">
  <h3 className="mb-2 font-semibold">简化的卡片</h3>
  <p className="text-sm text-muted-foreground">这是一个简化的卡片示例，没有使用结构化组件。</p>
</Card>
```

## 低代码设计器画布

### 组件样式优化

画布中的组件会自动应用设计系统样式：

```tsx
// 按钮组件 - 自动使用品牌色
// 输入框组件 - 自动使用焦点环效果
// 卡片组件 - 自动使用圆角和阴影
```

### 选择状态

被选中的组件会显示：

- 蓝色主题的焦点环
- 轻微的放大效果
- 增强的阴影

### 拖拽交互

- 拖拽时组件会有视觉反馈
- 网格吸附功能 (20px)
- 边界约束防止超出画布

## 颜色使用指南

### 状态色彩

```tsx
// 成功状态
<div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm">
  操作成功
</div>

// 警告状态
<div className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm">
  请注意
</div>

// 信息状态
<div className="bg-info/10 text-info px-3 py-1 rounded-full text-sm">
  提示信息
</div>

// 危险状态
<div className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm">
  错误信息
</div>
```

### 背景色彩

```tsx
// 组件背景
<div className="bg-component-bg border border-component-border p-4 rounded-lg">
  组件容器
</div>

// 画布背景
<div className="bg-canvas-bg min-h-screen">
  画布区域
</div>

// 面板背景
<div className="bg-panel-bg border border-border rounded-xl shadow-md p-6">
  属性面板
</div>
```

## 响应式设计示例

### 移动端适配

```tsx
// 响应式按钮
<Button
  size={{ default: "default", sm: "sm", md: "default" }}
  className="w-full sm:w-auto"
>
  响应式按钮
</Button>

// 响应式布局
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="col-span-full md:col-span-1">侧边栏</div>
  <div className="col-span-full md:col-span-1">主内容</div>
</div>
```

## 统一主题使用

### CSS变量使用

```tsx
// 使用设计令牌
<div className="rounded-lg bg-primary text-primary-foreground shadow-md">使用统一的亮色主题</div>
```

## 性能优化建议

### 1. 使用CSS变量

```css
/* 推荐 */
.my-button {
  background-color: hsl(var(--primary));
  transition: all 0.2s ease-out;
}

/* 避免 */
.my-button {
  background-color: #3b82f6;
  transition: all 0.2s ease-out;
}
```

### 2. 合理使用动画

```tsx
// 推荐：微交互动画
<div className="transition-all duration-200 hover:scale-105">
  悬停时轻微放大
</div>

// 避免：过度动画
<div className="transition-all duration-1000 hover:rotate-180">
  旋转动画会影响性能
</div>
```

### 3. 条件渲染

```tsx
// 推荐：按需加载
{
  showAdvanced && <AdvancedPanel />
}

// 避免：隐藏但仍渲染
;<div className={showAdvanced ? 'block' : 'hidden'}>
  <AdvancedPanel />
</div>
```

## 常见问题

### Q: 如何自定义组件颜色？

A: 使用CSS变量覆盖设计令牌：

```css
.custom-component {
  --primary: 220 90% 56%; /* 自定义主色 */
}
```

### Q: 如何添加新的组件变体？

A: 扩展cva配置：

```tsx
const buttonVariants = cva(baseClasses, {
  variants: {
    variant: {
      // 现有变体...
      custom: 'bg-custom text-custom-foreground hover:bg-custom/90',
    },
  },
})
```

### Q: 如何自定义组件颜色？

A: 使用CSS变量覆盖设计令牌：

```css
.custom-component {
  --primary: 220 90% 56%; /* 自定义主色 */
}
```

---

## 快速参考

### 常用组合类

```tsx
// 标准卡片容器
<div className="bg-card border border-border rounded-xl shadow-md p-6">
  内容
</div>

// 状态徽章
<div className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
  状态
</div>

// 响应式按钮
<button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all">
  按钮
</button>
```
