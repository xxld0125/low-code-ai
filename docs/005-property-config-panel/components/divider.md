# ➖ 分割线组件

## 组件概述

分割线组件用于在视觉上分割不同区域的内容，提供清晰的层次结构和内容分组。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `divider.orientation` | 分割方向 | radio | 'horizontal' | 水平(horizontal) / 垂直(vertical) | 分割线方向 |
| 5 | `divider.style` | 线条样式 | radio | 'solid' | 实线(solid) / 虚线(dashed) / 点线(dotted) | 线条样式 |
| 6 | `divider.color` | 线条颜色 | color | '#e5e7eb' | 预设颜色选项 | 分割线颜色 |
| 7 | `divider.thickness` | 线条粗细 | radio | '1' | 1px / 2px / 3px | 线条粗细 |
| 8 | `divider.label` | 中间文本 | text | '' | - | 分割线中间显示的文本 |
| 9 | `divider.labelPosition` | 标签位置 | radio | 'center' | 居中(center) / 左对齐(left) / 右对齐(right) | 标签位置 |
| 10 | `layout.margin` | 外边距 | radio | 'sm' | 无 / 小(sm) / 中(md) / 大(lg) | 分割线外边距 |
| 11 | `layout.width` | 宽度 | radio | 'full' | 自适应 / 100%宽度 | 分割线宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "divider_001",
    "customName": "章节分割线",
    "visible": true
  },
  "divider": {
    "orientation": "horizontal",
    "style": "solid",
    "color": "#d1d5db",
    "thickness": "1",
    "label": "或",
    "labelPosition": "center"
  },
  "layout": {
    "margin": "md",
    "width": "full"
  }
}
```

## 使用场景

1. **章节分割** - 文章或页面章节之间的分割
2. **表单分组** - 表单区域之间的视觉分割
3. **列表分隔** - 列表项目之间的分隔线
4. **内容分组** - 相关内容与无关内容的分割
5. **按钮分组** - 不同功能按钮组的分割

## 扩展配置（MVP阶段暂不实现）

- `divider.variant` - 预设样式变体
- `divider.animation` - 分割线动画
- `divider.icon` - 图标分割线
- `divider.gradient` - 渐变分割线

## 设计说明

- 简洁的线条设计
- 适度的视觉干扰
- 灵活的样式选择
- 清晰的分割效果

## 最佳实践

1. 避免过度使用分割线
2. 保持分割线样式的一致性
3. 选择合适的间距大小
4. 重要分割可以使用标签文本
5. 颜色要与内容协调统一