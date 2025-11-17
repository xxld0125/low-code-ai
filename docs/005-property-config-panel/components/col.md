# ↕️ 列容器组件

## 组件概述

列容器组件用于垂直排列子组件，提供灵活的垂直布局功能，支持内容对齐和间距控制。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `col.gap` | 间距大小 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 子组件之间的间距 |
| 5 | `col.justify` | 垂直对齐 | radio | 'start' | 顶部(start) / 居中(center) / 底部(end) / 两端对齐(between) / 分散对齐(around) | 子组件垂直对齐方式 |
| 6 | `col.align` | 水平对齐 | radio | 'stretch' | 左对齐(start) / 居中(center) / 右对齐(end) / 拉伸(stretch) | 子组件水平对齐方式 |
| 7 | `container.padding` | 内边距 | radio | 'none' | 无(none) / 小(sm) / 中(md) / 大(lg) | 容器内边距 |
| 8 | `container.backgroundColor` | 背景颜色 | color | 'transparent' | 预设颜色选项 | 容器背景色 |
| 9 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 10 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "col_001",
    "customName": "表单列",
    "visible": true
  },
  "col": {
    "gap": "sm",
    "justify": "start",
    "align": "stretch"
  },
  "container": {
    "padding": "md",
    "backgroundColor": "#ffffff"
  },
  "layout": {
    "margin": "sm",
    "width": "auto"
  }
}
```

## 对齐方式说明

### 垂直对齐 (justify)

- **start**: 子组件顶部对齐排列
- **center**: 子组件居中对齐排列
- **end**: 子组件底部对齐排列
- **between**: 子组件两端对齐，平均分布
- **around**: 子组件分散对齐，上下留有相等间距

### 水平对齐 (align)

- **start**: 子组件左对齐
- **center**: 子组件居中对齐
- **end**: 子组件右对齐
- **stretch**: 子组件拉伸至容器宽度

## 使用场景

1. **表单布局** - 表单控件垂直排列
2. **侧边栏** - 导航菜单垂直布局
3. **卡片内容** - 卡片内信息垂直排列
4. **文章内容** - 文章段落和标题布局
5. **列表项** - 列表项内容的垂直排列

## 扩展配置（MVP阶段暂不实现）

- `col.reverse` - 反向排列
- `col.height` - 容器高度设置
- `col.overflow` - 内容溢出处理
- `col.breakpoints` - 响应式断点配置

## 设计说明

- 简洁的垂直布局
- 统一的间距控制
- 灵活的对齐选项
- 良好的内容组织

## 最佳实践

1. 保持垂直间距的一致性
2. 根据内容类型选择合适的对齐方式
3. 避免过多的嵌套层级
4. 考虑内容的高度差异
5. 移动端优先的布局设计