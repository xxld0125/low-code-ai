# 🏷️ 徽章组件

## 组件概述

徽章组件用于显示状态信息、数量提示或分类标签，通常与其它组件配合使用。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `badge.text` | 徽章文本 | text | 'New' | - | 显示的徽章内容 |
| 5 | `badge.variant` | 徽章类型 | radio | 'default' | 默认(default) / 主要(primary) / 成功(success) / 警告(warning) / 错误(error) | 徽章样式类型 |
| 6 | `badge.size` | 徽章大小 | radio | 'md' | 小(sm) / 中(md) / 大(lg) | 徽章尺寸 |
| 7 | `badge.shape` | 徽章形状 | radio | 'rounded' | 圆角(rounded) / 方形(square) / 圆形(circle) | 徽章外形 |
| 8 | `badge.dot` | 点状显示 | switch | false | - | 是否显示为圆点 |
| 9 | `badge.count` | 数量显示 | number | 0 | - | 数字徽章显示 |
| 10 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 徽章外边距 |

## 配置示例

```typescript
{
  "component": {
    "id": "badge_001",
    "customName": "消息数量徽章",
    "visible": true
  },
  "badge": {
    "text": "5",
    "variant": "error",
    "size": "sm",
    "shape": "circle",
    "dot": false,
    "count": 5
  },
  "layout": {
    "margin": "none",
    "width": "auto"
  }
}
```

## 徽章类型说明

- **default**: 默认灰色徽章，用于一般信息
- **primary**: 主要蓝色徽章，用于重要信息
- **success**: 绿色徽章，用于成功状态
- **warning**: 橙色徽章，用于警告信息
- **error**: 红色徽章，用于错误状态

## 使用场景

1. **数量提示** - 未读消息、购物车商品数量
2. **状态标识** - 在线/离线状态、启用/禁用状态
3. **分类标签** - 文章分类、产品标签
4. **版本信息** - 新版本、Beta版本标识
5. **认证徽章** - 官方认证、VIP标识

## 扩展配置（MVP阶段暂不实现）

- `badge.position` - 相对定位
- `badge.animation` - 动画效果
- `badge.overflow` - 数字溢出处理
- `badge.icon` - 图标徽章

## 设计说明

- 紧凑的尺寸设计
- 醒目的颜色区分
- 清晰的文字显示
- 适当的间距控制