# ↔️ 行容器组件

## 组件概述

行容器组件用于水平排列子组件，提供灵活的水平布局功能，支持内容对齐和间距控制。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `row.gap` | 间距大小 | radio | 'md' | 无(none) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 子组件之间的间距 |
| 5 | `row.justify` | 水平对齐 | radio | 'start' | 左对齐(start) / 居中(center) / 右对齐(end) / 两端对齐(between) / 分散对齐(around) | 子组件水平对齐方式 |
| 6 | `row.align` | 垂直对齐 | radio | 'start' | 顶部(start) / 居中(center) / 底部(end) | 子组件垂直对齐方式 |
| 7 | `row.wrap` | 换行设置 | radio | 'nowrap' | 不换行(nowrap) / 换行(wrap) | 子组件超出时是否换行 |
| 8 | `container.padding` | 内边距 | radio | 'none' | 无(none) / 小(sm) / 中(md) / 大(lg) | 容器内边距 |
| 9 | `container.backgroundColor` | 背景颜色 | color | 'transparent' | 预设颜色选项 | 容器背景色 |
| 10 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 11 | `layout.width` | 宽度 | radio | 'full' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "row_001",
    "customName": "按钮行",
    "visible": true
  },
  "row": {
    "gap": "md",
    "justify": "center",
    "align": "center",
    "wrap": "nowrap"
  },
  "container": {
    "padding": "sm",
    "backgroundColor": "#f3f4f6"
  },
  "layout": {
    "margin": "sm",
    "width": "full"
  }
}
```

## 对齐方式说明

### 水平对齐 (justify)

- **start**: 子组件左对齐排列
- **center**: 子组件居中对齐排列
- **end**: 子组件右对齐排列
- **between**: 子组件两端对齐，平均分布
- **around**: 子组件分散对齐，两侧留有相等间距

### 垂直对齐 (align)

- **start**: 子组件顶部对齐
- **center**: 子组件居中对齐
- **end**: 子组件底部对齐

## 换行设置

- **nowrap**: 所有子组件在一行显示，超出时可能会溢出
- **wrap**: 子组件超出容器宽度时自动换行

## 使用场景

1. **按钮组** - 操作按钮水平排列
2. **表单行** - 表单控件水平布局
3. **导航栏** - 导航菜单水平排列
4. **工具栏** - 工具按钮横向排列
5. **统计卡片** - 数据卡片横向展示

## 扩展配置（MVP阶段暂不实现）

- `row.reverse` - 反向排列
- `row.gapColumn` - 列间距独立设置
- `row.gapRow` - 行间距独立设置
- `row.breakpoints` - 响应式断点配置

## 设计说明

- 灵活的间距系统
- 多种对齐方式选择
- 简洁的布局控制
- 响应式换行支持

## 最佳实践

1. 合理设置间距，避免过于拥挤或松散
2. 根据内容特点选择合适的对齐方式
3. 长度不固定的内容建议启用换行
4. 保持同一页面中行容器的间距一致性
5. 考虑移动端的显示效果