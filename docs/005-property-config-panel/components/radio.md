# ⚪ 单选框组件

## 组件概述

单选框用于在一组互斥的选项中选择一个选项的表单控件。

## 属性配置

| 序号 | 属性键名 | 属性标签 | 属性类型 | 默认值 | 选项值 | 说明 |
|------|----------|----------|----------|---------|---------|------|
| 1 | `component.id` | 组件ID | text | - | - | 系统生成的唯一标识符 |
| 2 | `component.customName` | 自定义名称 | text | - | - | 用于在组件列表中识别 |
| 3 | `component.visible` | 可见性 | switch | true | - | 控制组件是否显示 |
| 4 | `radio.groupName` | 选项组名称 | text | 'radioGroup' | - | 用于单选框分组 |
| 5 | `radio.label` | 标签文本 | text | '选项' | - | 显示的标签内容 |
| 6 | `radio.value` | 选项值 | text | 'option1' | - | 选项的实际值 |
| 7 | `radio.checked` | 默认选中 | switch | false | - | 是否为默认选中项 |
| 8 | `radio.required` | 必填项 | switch | false | - | 是否必须选择 |
| 9 | `radio.disabled` | 禁用状态 | switch | false | - | 是否禁用交互 |
| 10 | `radio.size` | 尺寸大小 | radio | 'md' | 小(sm) / 中(md) / 大(lg) | 控件尺寸 |
| 11 | `radio.variant` | 显示样式 | radio | 'default' | 默认(default) / 描边(outline) | 视觉样式 |
| 12 | `radio.direction` | 排列方向 | radio | 'vertical' | 垂直(vertical) / 水平(horizontal) | 选项排列方式 |
| 13 | `layout.margin` | 外边距 | radio | 'none' | 无 / 小(sm) / 中(md) / 大(lg) | 组件外边距 |
| 14 | `layout.width` | 宽度 | radio | 'auto' | 自适应 / 100%宽度 | 组件宽度 |

## 配置示例

```typescript
{
  "component": {
    "id": "radio_001",
    "customName": "性别选择",
    "visible": true
  },
  "radio": {
    "groupName": "gender",
    "label": "男",
    "value": "male",
    "checked": false,
    "required": true,
    "disabled": false,
    "size": "md",
    "variant": "default",
    "direction": "horizontal"
  },
  "layout": {
    "margin": "sm",
    "width": "auto"
  }
}
```

## 使用场景

1. **性别选择** - 男/女/其他
2. **支付方式** - 微信支付/支付宝/银行卡
3. **配送方式** - 快递配送/到店自提
4. **问卷调研** - 单选题答案选择

## 扩展配置（MVP阶段暂不实现）

- `radio.color` - 自定义颜色
- `radio.animation` - 选择动画效果
- `radio.validation` - 验证规则
- `radio.customIcons` - 自定义选中图标

## 设计说明

- 清晰的选中状态指示
- 统一的组内选择行为
- 适当的点击区域
- 良好的键盘导航支持