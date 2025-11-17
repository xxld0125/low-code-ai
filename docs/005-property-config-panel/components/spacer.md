# ⬜ 间距组件

## 组件概述

间距组件用于在页面元素之间创建可控的空白区域，提供精确的布局控制和视觉呼吸感。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `spacer.size` | 间距大小 | radio | 'md' | 特小(xs) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 间距高度 |
| 5 | `spacer.direction` | 间距方向 | radio | 'vertical' | 垂直(vertical) / 水平(horizontal) | 间距创建方向 |
| 6 | `spacer.height` | 自定义高度 | number | - | - | 自定义间距高度（像素） |
| 7 | `spacer.width` | 自定义宽度 | number | - | - | 自定义间距宽度（像素） |

## 配置示例

```typescript
{
  "component": {
    "id": "spacer_001",
    "customName": "段落间距",
    "visible": true
  },
  "spacer": {
    "size": "lg",
    "direction": "vertical",
    "height": 32
  }
}
```

## 间距尺寸

- **xs**: 4px - 最小间距
- **sm**: 8px - 小间距
- **md**: 16px - 中等间距
- **lg**: 24px - 大间距
- **xl**: 32px - 特大间距

## 使用场景

1. **段落间距** - 文章段落之间的空白
2. **组件间距** - 组件之间的视觉分离
3. **页面边距** - 页面内容与边缘的距离
4. **列表间距** - 列表项之间的间隔
5. **表单间距** - 表单控件之间的空白

## 扩展配置（MVP阶段暂不实现）

- `spacer.responsive` - 响应式间距
- `spacer.visible` - 开发模式可见标记
- `spacer.minHeight` - 最小高度限制

## 设计说明

- 简单纯粹的间距控制
- 标准化的尺寸系统
- 灵活的方向选择
- 精确的自定义控制