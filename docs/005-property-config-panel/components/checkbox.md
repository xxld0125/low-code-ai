# ☑️ 复选框组件

## 组件概述

复选框用于在多个选项中选择一个或多个选项的表单控件。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `checkbox.label` | 标签文本 | text | '选项' | - | 显示的标签内容 |
| 5 | `checkbox.checked` | 默认选中 | switch | false | - | 初始状态是否选中 |
| 6 | `checkbox.required` | 必填项 | switch | false | - | 是否必须选择 |
| 7 | `checkbox.disabled` | 禁用状态 | switch | false | - | 是否禁用交互 |
| 8 | `checkbox.size` | 尺寸大小 | radio | 'md' | 小(sm) / 中(md) / 大(lg) | 控件尺寸 |
| 9 | `checkbox.variant` | 显示样式 | radio | 'default' | 默认(default) / 描边(outline) | 视觉样式 |
| 10 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 11 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "checkbox_001",
    "customName": "用户协议复选框",
    "visible": true
  },
  "checkbox": {
    "label": "我已阅读并同意用户协议",
    "checked": false,
    "required": true,
    "disabled": false,
    "size": "md",
    "variant": "default"
  },
  "layout": {
    "margin": "sm",
    "width": "auto"
  }
}
```

## 使用场景

1. **表单验证** - 用户协议、隐私政策确认
2. **多选项选择** - 兴趣爱好、技能标签选择
3. **设置开关** - 功能启用/禁用控制
4. **批量操作** - 列表项选择、批量删除

## 扩展配置（MVP阶段暂不实现）

- `checkbox.indeterminate` - 半选状态
- `checkbox.color` - 自定义颜色
- `checkbox.group` - 复选框分组
- `checkbox.validation` - 验证规则

## 设计说明

- 清晰的选中/未选中状态区分
- 适当的点击区域大小
- 禁用状态的视觉反馈
- 与标签文本的对齐方式