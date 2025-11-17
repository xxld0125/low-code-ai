# 🖼️ 图片组件

## 组件概述

图片组件用于显示和配置图片内容，支持多种显示模式和样式。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `image.src` | 图片地址 | text | '' | - | 图片的URL或路径 |
| 5 | `image.alt` | 替代文本 | text | '图片' | - | 图片加载失败时显示的文本 |
| 6 | `image.width` | 图片宽度 | number | 200 | - | 图片显示宽度（像素） |
| 7 | `image.height` | 图片高度 | number | 200 | - | 图片显示高度（像素） |
| 8 | `image.objectFit` | 适应模式 | radio | 'cover' | 覆盖(cover) / 包含(contain) / 填充(fill) / 拉伸(stretch) | 图片适应容器的方式 |
| 9 | `image.borderRadius` | 圆角大小 | radio | 'none' | 无(none) / 小(sm) / 中(md) / 大(lg) / 圆形(full) | 图片圆角样式 |
| 10 | `image.lazy` | 懒加载 | switch | true | - | 是否启用懒加载 |
| 11 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 12 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "image_001",
    "customName": "产品图片",
    "visible": true
  },
  "image": {
    "src": "/api/placeholder/product.jpg",
    "alt": "产品展示图片",
    "width": 300,
    "height": 200,
    "objectFit": "cover",
    "borderRadius": "md",
    "lazy": true
  },
  "layout": {
    "margin": "md",
    "width": "auto"
  }
}
```

## 使用场景

1. **产品展示** - 电商商品图片
2. **用户头像** - 个人资料图片
3. **文章配图** - 博客文章插图
4. **品牌标识** - Logo和图标展示
5. **背景装饰** - 页面装饰图片

## 适应模式说明

- **cover**: 保持宽高比，覆盖整个容器，可能会裁剪
- **contain**: 保持宽高比，完整显示在容器内
- **fill**: 拉伸填满容器，可能会变形
- **stretch**: 强制拉伸，不保持宽高比

## 扩展配置（MVP阶段暂不实现）

- `image.loading` - 加载状态显示
- `image.error` - 错误状态处理
- `image.zoom` - 图片缩放功能
- `image.gallery` - 图片轮播模式
- `image.watermark` - 水印配置

## 设计说明

- 加载占位符设计
- 错误状态的友好提示
- 响应式图片尺寸
- 无障碍访问支持

## 性能优化

- 建议启用懒加载
- 合理设置图片尺寸
- 提供多种格式支持
- 使用CDN加速