# 🃏 卡片容器组件

## 组件概述

卡片容器组件用于创建具有圆角、阴影等视觉效果的容器，常用于展示独立的信息模块。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `card.padding` | 内边距 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 卡片内边距 |
| 5 | `card.shadow` | 阴影效果 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) | 卡片阴影 |
| 6 | `card.border` | 边框显示 | switch | false | - | 是否显示边框 |
| 7 | `card.borderRadius` | 圆角大小 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) / 圆形(full) | 卡片圆角 |
| 8 | `card.backgroundColor` | 背景颜色 | color | '#ffffff' | 预设颜色选项 | 卡片背景色 |
| 9 | `card.hoverEffect` | 悬停效果 | switch | true | - | 鼠标悬停时的视觉反馈 |
| 10 | `layout.margin` | 外边距 | radio | 'sm' | 无 / 小(sm) / 中(md) / 大(lg) | 卡片外边距 |
| 11 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 卡片宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "card_001",
    "customName": "用户信息卡片",
    "visible": true
  },
  "card": {
    "padding": "lg",
    "shadow": "md",
    "border": false,
    "borderRadius": "md",
    "backgroundColor": "#ffffff",
    "hoverEffect": true
  },
  "layout": {
    "margin": "md",
    "width": "auto"
  }
}
```

## 使用场景

1. **用户卡片** - 用户信息展示
2. **产品卡片** - 商品信息展示
3. **文章卡片** - 文章预览展示
4. **统计卡片** - 数据统计展示
5. **功能卡片** - 功能模块展示

## 扩展配置（MVP阶段暂不实现）

- `card.header` - 卡片头部配置
- `card.footer` - 卡片底部配置
- `card.image` - 卡片图片区域
- `card.maxWidth` - 最大宽度限制

## 设计说明

- 现代化的卡片设计
- 柔和的阴影效果
- 合适的圆角大小
- 悬停交互反馈