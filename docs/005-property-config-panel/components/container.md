# 📦 容器组件

## 组件概述

容器组件是最基础的布局容器，用于包裹和组织其他组件，提供基础的样式和布局功能。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `container.padding` | 内边距 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 容器内边距 |
| 5 | `container.border` | 边框样式 | radio | 'none' | 无(none) / 实线(solid) / 虚线(dashed) / 点线(dotted) | 边框样式 |
| 6 | `container.borderWidth` | 边框宽度 | radio | '1' | 1px / 2px / 3px | 边框粗细 |
| 7 | `container.borderColor` | 边框颜色 | color | '#e5e7eb' | 预设颜色选项 | 边框颜色 |
| 8 | `container.borderRadius` | 圆角大小 | radio | 'none' | 无(none) / 小(sm) / 中(md) / 大(lg) / 圆形(full) | 边框圆角 |
| 9 | `container.backgroundColor` | 背景颜色 | color | '#ffffff' | 预设颜色选项 | 容器背景色 |
| 10 | `container.shadow` | 阴影效果 | radio | 'none' | 无(none) / 小(sm) / 中(md) / 大(lg) | 容器阴影 |
| 11 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 12 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "container_001",
    "customName": "主要内容区域",
    "visible": true
  },
  "container": {
    "padding": "lg",
    "border": "solid",
    "borderWidth": "1",
    "borderColor": "#d1d5db",
    "borderRadius": "md",
    "backgroundColor": "#ffffff",
    "shadow": "md"
  },
  "layout": {
    "margin": "md",
    "width": "full"
  }
}
```

## 使用场景

1. **内容区域** - 页面主要内容容器
2. **卡片容器** - 信息卡片的基础容器
3. **表单容器** - 表单区域的外层容器
4. **导航容器** - 导航菜单的包裹容器
5. **分割区域** - 不同功能区域的视觉分割

## 边框样式说明

- **none**: 无边框
- **solid**: 实线边框，最常用
- **dashed**: 虚线边框，用于临时或次要分割
- **dotted**: 点线边框，用于装饰性分割

## 阴影级别

- **none**: 无阴影
- **sm**: 轻微阴影，适合 subtle 提升
- **md**: 中等阴影，适合卡片和浮动元素
- **lg**: 较大阴影，适合弹窗和重要元素

## 扩展配置（MVP阶段暂不实现）

- `container.maxWidth` - 最大宽度限制
- `container.minHeight` - 最小高度
- `container.overflow` - 内容溢出处理
- `container.backgroundImage` - 背景图片
- `container.gradient` - 渐变背景

## 设计说明

- 简洁的视觉设计
- 一致的边距系统
- 柔和的颜色方案
- 响应式布局支持

## 最佳实践

1. 合理使用内边距，保持内容呼吸感
2. 边框和阴影适度使用，避免视觉噪音
3. 背景色选择考虑可读性
4. 嵌套容器时注意层级关系
5. 保持容器用途的单一性