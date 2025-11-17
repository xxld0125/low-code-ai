# 🏷️ 标题组件

## 组件概述

标题组件用于显示不同层级的标题文本，提供清晰的页面结构层次。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `heading.content` | 标题内容 | text | '标题' | - | 显示的标题文本 |
| 5 | `heading.level` | 标题层级 | radio | 'h2' | H1 / H2 / H3 / H4 / H5 / H6 | HTML标题层级 |
| 6 | `heading.size` | 字体大小 | radio | 'lg' | 特小(xs) / 小(sm) / 中(md) / 大(lg) / 特大(xl) | 字体显示大小 |
| 7 | `heading.weight` | 字体粗细 | radio | 'semibold' | 细体(light) / 常规(normal) / 半粗(semibold) / 粗体(bold) | 字体粗细程度 |
| 8 | `heading.align` | 对齐方式 | radio | 'left' | 左对齐(left) / 居中(center) / 右对齐(right) | 文本水平对齐 |
| 9 | `heading.color` | 文字颜色 | color | '#000000' | 预设颜色选项 | 文字颜色值 |
| 10 | `heading.truncate` | 文本截断 | switch | false | - | 超长文本是否截断 |
| 11 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 12 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "heading_001",
    "customName": "页面主标题",
    "visible": true
  },
  "heading": {
    "content": "欢迎使用低代码平台",
    "level": "h1",
    "size": "xl",
    "weight": "bold",
    "align": "center",
    "color": "#1e40af",
    "truncate": false
  },
  "layout": {
    "margin": "lg",
    "width": "full"
  }
}
```

## 层级说明

- **H1**: 页面主标题，每个页面最多使用一次
- **H2**: 章节标题，主要的区块划分
- **H3**: 小节标题，次级区块划分
- **H4**: 段落标题，具体内容标题
- **H5**: 次要标题，辅助性标题
- **H6**: 最小标题，补充性标题

## 使用场景

1. **页面标题** - 网站首页、产品页面主标题
2. **文章标题** - 博客文章、新闻标题
3. **章节标题** - 表单标题、区块标题
4. **卡片标题** - 功能卡片、信息卡片标题
5. **列表标题** - 分类标题、分组标题

## 扩展配置（MVP阶段暂不实现）

- `heading.link` - 标题链接
- `heading.icon` - 标题图标
- `heading.subtitle` - 副标题
- `heading.decoration` - 装饰线条
- `heading.animation` - 标题动画

## 设计说明

- 层级清晰，大小递减
- 颜色对比度符合标准
- 响应式字体大小
- SEO友好的语义化标签

## 最佳实践

1. 按照内容重要性选择标题层级
2. 避免跳级使用标题（如H1直接跳到H3）
3. 每个页面只使用一个H1标题
4. 标题文字要简洁明了
5. 保持标题风格的一致性