# 属性面板设计文档

## 📋 项目概述

本文档详细描述了低代码平台六个核心组件的属性面板功能设计，基于MVP版本要求，提供完整的用户交互配置能力。

## 🎯 设计原则

1. **MVP优先**: 聚焦核心功能，避免过度复杂化
2. **分页设计**: 属性(Props) + 样式(Styles) + 高级(Advanced)三个标签页
3. **实时预览**: 所有修改即时反映在画布上
4. **类型安全**: 完整的TypeScript类型支持
5. **用户体验**: 直观的分组和清晰的中文标签

## 🧩 组件清单

| 序号 | 组件名称 | 组件类型 | 图标         | 主要用途               |
| ---- | -------- | -------- | ------------ | ---------------------- |
| 1    | Text     | 文本展示 | Type         | 显示各种格式的文本内容 |
| 2    | Button   | 操作按钮 | MousePointer | 用户交互操作           |
| 3    | Input    | 输入框   | FileText     | 文本信息输入           |
| 4    | Image    | 图片展示 | Image        | 图片内容显示           |
| 5    | Card     | 卡片容器 | Square       | 内容分组展示           |
| 6    | Checkbox | 复选框   | CheckSquare  | 选择操作               |

## 📝 详细功能设计

### 1. Text 组件属性面板

#### 基础属性 (Properties)

| 配置项   | 类型           | 可选值                          | 默认值    | 说明                 |
| -------- | -------------- | ------------------------------- | --------- | -------------------- |
| 文本内容 | RichText       | -                               | ""        | 支持多行富文本输入   |
| 文本类型 | Select         | heading/paragraph/label/quote   | paragraph | 预设文本样式         |
| 字体大小 | Select + Input | xs/sm/base/lg/xl/2xl/3xl/custom | base      | 预设尺寸或自定义数值 |
| 字体粗细 | Select         | 100-900                         | 400       | CSS font-weight      |
| 文本对齐 | Radio          | left/center/right/justify       | left      | 文本水平对齐方式     |
| 最大行数 | Number         | 1-10                            | -1        | -1表示不限制         |

#### 样式配置 (Styles)

| 配置项   | 类型           | 可选值                        | 默认值      | 说明               |
| -------- | -------------- | ----------------------------- | ----------- | ------------------ |
| 文字颜色 | ColorPicker    | 预设主题色 + 自定义           | #000000     | 支持透明度         |
| 字体样式 | MultiSelect    | italic/underline/line-through | []          | 可组合选择         |
| 行高     | Slider         | 1.0-3.0                       | 1.5         | CSS line-height    |
| 字间距   | Select         | normal/compact/loose/custom   | normal      | CSS letter-spacing |
| 背景颜色 | ColorPicker    | 预设主题色 + 自定义           | transparent | 支持透明度         |
| 内边距   | SpacingControl | -                             | 8px         | 四方向独立设置     |
| 边框     | BorderControl  | -                             | none        | 宽度、样式、颜色   |

#### 高级功能 (Advanced)

| 配置项     | 类型              | 可选值 | 默认值 | 说明                |
| ---------- | ----------------- | ------ | ------ | ------------------- |
| 文本截断   | Switch            | -      | false  | 超出部分显示省略号  |
| 是否可编辑 | Switch            | -      | false  | contenteditable属性 |
| HTML支持   | Switch            | -      | false  | 是否渲染HTML标签    |
| 响应式字体 | ResponsiveControl | -      | {}     | 不同断点的字体大小  |

### 2. Button 组件属性面板

#### 基础属性 (Properties)

| 配置项   | 类型       | 可选值                                        | 默认值  | 说明              |
| -------- | ---------- | --------------------------------------------- | ------- | ----------------- |
| 按钮文字 | Input      | -                                             | "按钮"  | 单行文本输入      |
| 按钮类型 | Select     | primary/secondary/success/warning/danger/link | primary | 预设主题样式      |
| 按钮尺寸 | Select     | sm/md/lg/custom                               | md      | 预设尺寸或自定义  |
| 图标选择 | IconPicker | -                                             | none    | 从图标库选择      |
| 图标位置 | Radio      | left/right                                    | left    | 相对于文字的位置  |
| 是否禁用 | Switch     | -                                             | false   | disabled属性      |
| 加载状态 | Switch     | -                                             | false   | 显示loading指示器 |

#### 样式配置 (Styles)

| 配置项   | 类型        | 可选值                   | 默认值  | 说明              |
| -------- | ----------- | ------------------------ | ------- | ----------------- |
| 按钮变体 | Select      | solid/outline/ghost/link | solid   | 视觉样式变体      |
| 背景颜色 | ColorPicker | 预设主题色 + 自定义      | 主题色  | 自定义类型时可用  |
| 文字颜色 | ColorPicker | 预设主题色 + 自定义      | #ffffff | 自定义类型时可用  |
| 边框颜色 | ColorPicker | 预设主题色 + 自定义      | 主题色  | outline类型时使用 |
| 圆角大小 | Slider      | 0-20px                   | 6px     | CSS border-radius |
| 按钮宽度 | Select      | auto/fit/full/custom     | auto    | 宽度模式          |
| 阴影效果 | Switch      | -                        | true    | box-shadow        |

#### 交互功能 (Advanced)

| 配置项       | 类型           | 可选值              | 默认值 | 说明             |
| ------------ | -------------- | ------------------- | ------ | ---------------- |
| 点击事件     | EventConfig    | -                   | {}     | 预留数据绑定接口 |
| 表单提交类型 | Select         | button/submit/reset | button | form type属性    |
| 确认对话框   | Switch + Input | -                   | false  | 危险操作确认     |
| 快捷键绑定   | HotkeyPicker   | -                   | none   | 键盘快捷键       |
| 全角显示     | Switch         | -                   | false  | width: 100%      |

### 3. Input 组件属性面板

#### 基础属性 (Properties)

| 配置项     | 类型   | 可选值                         | 默认值 | 说明            |
| ---------- | ------ | ------------------------------ | ------ | --------------- |
| 输入框类型 | Select | text/password/email/tel/number | text   | HTML input type |
| 占位符文本 | Input  | -                              | ""     | placeholder属性 |
| 默认值     | Input  | -                              | ""     | value属性       |
| 是否必填   | Switch | -                              | false  | required属性    |
| 最大长度   | Number | 1-500                          | -1     | maxlength属性   |
| 最小长度   | Number | 0-500                          | 0      | minlength属性   |
| 输入限制   | Select | all/alpha/numeric/alphanumeric | all    | 字符类型限制    |

#### 样式配置 (Styles)

| 配置项     | 类型        | 可选值            | 默认值  | 说明              |
| ---------- | ----------- | ----------------- | ------- | ----------------- |
| 输入框尺寸 | Select      | sm/md/lg/custom   | md      | 预设高度尺寸      |
| 前缀内容   | Input       | -                 | none    | 文字或图标        |
| 后缀内容   | Input       | -                 | none    | 文字或图标        |
| 边框样式   | Select      | solid/dashed/none | solid   | 边框样式          |
| 圆角大小   | Slider      | 0-10px            | 4px     | CSS border-radius |
| 背景颜色   | ColorPicker | 预设 + 自定义     | #ffffff |                   |
| 文字颜色   | ColorPicker | 预设 + 自定义     | #000000 |                   |

#### 验证功能 (Advanced)

| 配置项       | 类型   | 可选值 | 默认值 | 说明              |
| ------------ | ------ | ------ | ------ | ----------------- |
| 实时验证     | Switch | -      | true   | 输入时即时验证    |
| 错误提示文本 | Input  | -      | ""     | 验证失败时显示    |
| 正则表达式   | Input  | -      | ""     | 自定义验证规则    |
| 显示字符计数 | Switch | -      | false  | 当前长度/最大长度 |
| 清空按钮     | Switch | -      | false  | 一键清空内容      |

### 4. Image 组件属性面板

#### 基础属性 (Properties)

| 配置项   | 类型      | 可选值                 | 默认值 | 说明           |
| -------- | --------- | ---------------------- | ------ | -------------- |
| 图片地址 | UrlPicker | URL输入 + 本地上传预留 | ""     | src属性        |
| 图片描述 | Input     | -                      | ""     | alt属性        |
| 图片标题 | Input     | -                      | ""     | title属性      |
| 点击行为 | Select    | none/zoom/link/preview | none   | 点击图片的响应 |

#### 样式配置 (Styles)

| 配置项   | 类型          | 可选值                             | 默认值   | 说明               |
| -------- | ------------- | ---------------------------------- | -------- | ------------------ |
| 图片尺寸 | Select        | original/contain/cover/fill/custom | original | object-fit属性     |
| 圆角大小 | Slider        | 0-50%                              | 0        | CSS border-radius  |
| 边框样式 | BorderControl | -                                  | none     | 宽度、样式、颜色   |
| 阴影效果 | ShadowControl | -                                  | none     | 阴影级别和颜色     |
| 透明度   | Slider        | 0-100%                             | 100%     | CSS opacity        |
| 滤镜效果 | FilterControl | -                                  | none     | 模糊、亮度、对比度 |

#### 布局设置 (Advanced)

| 配置项     | 类型      | 可选值            | 默认值 | 说明            |
| ---------- | --------- | ----------------- | ------ | --------------- |
| 对齐方式   | Radio     | left/center/right | left   | 水平对齐        |
| 显示模式   | Radio     | inline/block      | inline | CSS display     |
| 最大宽度   | SizeInput | px/%/vw           | 100%   | max-width       |
| 高度自适应 | Switch    | -                 | true   | height: auto    |
| 缩放质量   | Select    | auto/high/low     | auto   | image-rendering |

### 5. Card 组件属性面板

#### 基础属性 (Properties)

| 配置项     | 类型     | 可选值 | 默认值 | 说明                |
| ---------- | -------- | ------ | ------ | ------------------- |
| 卡片标题   | Input    | -      | ""     | CardHeader内容      |
| 卡片描述   | Textarea | -      | ""     | CardDescription内容 |
| 卡片内容   | RichText | -      | ""     | CardContent富文本   |
| 底部操作   | Input    | -      | ""     | CardFooter操作文字  |
| 显示标题栏 | Switch   | -      | true   | 是否显示CardHeader  |
| 显示底部栏 | Switch   | -      | false  | 是否显示CardFooter  |

#### 样式配置 (Styles)

| 配置项   | 类型           | 可选值                           | 默认值            | 说明              |
| -------- | -------------- | -------------------------------- | ----------------- | ----------------- |
| 卡片变体 | Select         | default/elevated/bordered/shadow | default           | 预设视觉样式      |
| 背景颜色 | ColorPicker    | 预设 + 自定义                    | #ffffff           |                   |
| 边框样式 | BorderControl  | -                                | solid 1px #e5e7eb |                   |
| 圆角大小 | Slider         | 0-20px                           | 12px              | CSS border-radius |
| 阴影级别 | Select         | none/sm/md/lg/xl                 | md                | box-shadow预设    |
| 内边距   | SpacingControl | -                                | 24px              | 四方向统一设置    |

#### 布局设置 (Advanced)

| 配置项   | 类型        | 可选值                | 默认值  | 说明           |
| -------- | ----------- | --------------------- | ------- | -------------- |
| 卡片宽度 | Select      | auto/fit/full/custom  | auto    | 宽度模式       |
| 卡片高度 | Select      | auto/min-height/fixed | auto    | 高度模式       |
| 内容对齐 | Radio       | left/center/right     | left    | 文本对齐方式   |
| 头部样式 | StylePicker | -                     | default | CardHeader样式 |
| 底部样式 | StylePicker | -                     | default | CardFooter样式 |

### 6. Checkbox 组件属性面板

#### 基础属性 (Properties)

| 配置项   | 类型   | 可选值 | 默认值  | 说明           |
| -------- | ------ | ------ | ------- | -------------- |
| 选项标签 | Input  | -      | ""      | 显示的文字内容 |
| 默认选中 | Switch | -      | false   | checked属性    |
| 是否禁用 | Switch | -      | false   | disabled属性   |
| 选中值   | Input  | -      | "true"  | 表单提交时的值 |
| 未选中值 | Input  | -      | "false" | 表单提交时的值 |

#### 样式配置 (Styles)

| 配置项     | 类型           | 可选值              | 默认值     | 说明             |
| ---------- | -------------- | ------------------- | ---------- | ---------------- |
| 复选框大小 | Select         | sm/md/lg            | md         | 复选框尺寸       |
| 复选框颜色 | ColorPicker    | 主题色 + 自定义     | 主题色     | 选中状态颜色     |
| 标签颜色   | ColorPicker    | 预设 + 自定义       | #374151    | 文字颜色         |
| 间距设置   | SpacingControl | -                   | 8px        | 复选框与文字间距 |
| 排列方式   | Radio          | horizontal/vertical | horizontal | 多个复选框排列   |

#### 交互功能 (Advanced)

| 配置项       | 类型        | 可选值 | 默认值 | 说明               |
| ------------ | ----------- | ------ | ------ | ------------------ |
| 状态变化事件 | EventConfig | -      | {}     | 预留数据绑定接口   |
| 三态复选框   | Switch      | -      | false  | 支持 indeterminate |
| 切换动画     | Switch      | -      | true   | 状态切换动画效果   |
| 键盘导航     | Switch      | -      | true   | Tab键导航支持      |
| 批量操作     | Switch      | -      | false  | 预留全选功能       |

## 🔧 通用功能模块

### 位置和尺寸 (所有组件)

| 配置项   | 类型         | 可选值       | 默认值 | 说明                 |
| -------- | ------------ | ------------ | ------ | -------------------- |
| X坐标    | NumberInput  | px           | 0      | 相对于画布的横向位置 |
| Y坐标    | NumberInput  | px           | 0      | 相对于画布的纵向位置 |
| 宽度     | SizeInput    | auto/px/%/vw | auto   | 组件宽度             |
| 高度     | SizeInput    | auto/px/%/vh | auto   | 组件高度             |
| 最小宽度 | SizeInput    | px/%         | -      | min-width            |
| 最大宽度 | SizeInput    | px/%         | -      | max-width            |
| 对齐方式 | AlignControl | -            | left   | 水平和垂直对齐       |
| 层级设置 | NumberInput  | z-index值    | 1      | 组件堆叠顺序         |

### 响应式设计 (所有组件)

| 配置项     | 类型                 | 可选值 | 默认值  | 说明                 |
| ---------- | -------------------- | ------ | ------- | -------------------- |
| 断点显示   | ResponsiveVisibility | -      | visible | 不同屏幕尺寸显示控制 |
| 响应式尺寸 | ResponsiveSize       | -      | {}      | 各断点的尺寸配置     |
| 响应式位置 | ResponsivePosition   | -      | {}      | 各断点的位置配置     |
| 隐藏规则   | DisplayRule          | -      | {}      | 条件隐藏逻辑         |
| 弹性布局   | FlexboxControl       | -      | {}      | flex属性配置         |

### 数据绑定预留接口

| 配置项   | 类型           | 可选值 | 默认值 | 说明             |
| -------- | -------------- | ------ | ------ | ---------------- |
| 属性绑定 | DataBinding    | -      | {}     | 连接到数据源字段 |
| 动态内容 | DynamicContent | -      | {}     | 根据数据动态显示 |
| 表单字段 | FormBinding    | -      | {}     | 表单字段映射     |
| API关联  | ApiBinding     | -      | {}     | API数据关联      |

### 高级功能 (部分组件)

| 配置项    | 类型               | 可选值 | 默认值         | 说明               |
| --------- | ------------------ | ------ | -------------- | ------------------ |
| 动画效果  | AnimationPicker    | -      | none           | 进入/退出动画      |
| 条件显示  | ConditionalDisplay | -      | {}             | 基于条件的显示逻辑 |
| 自定义CSS | CodeEditor         | -      | ""             | 自定义CSS样式      |
| 组件ID    | Input              | -      | auto-generated | 自定义组件标识     |
| ARIA属性  | AriaControl        | -      | {}             | 无障碍访问属性     |

## 📊 实现优先级

### Phase 1: MVP核心功能 (当前版本)

- [x] 基础属性配置 (文本内容、按钮文字等)
- [x] 基本样式配置 (颜色、尺寸、位置)
- [x] 组件删除功能
- [x] 实时预览更新

### Phase 2: 体验优化 (下一版本)

- [ ] 高级样式配置 (边框、阴影、圆角)
- [ ] 交互功能 (点击事件、表单验证)
- [ ] 响应式设计支持
- [ ] 批量操作和快捷键

### Phase 3: 企业级功能 (未来版本)

- [ ] 完整的数据绑定系统
- [ ] 自定义组件支持
- [ ] 动画和过渡效果
- [ ] 无障碍访问完善
- [ ] 国际化支持

## 🛠 技术实现要点

### 组件状态管理

```typescript
interface ComponentProperty {
  // 基础属性
  props: Record<string, any>

  // 样式配置
  styles: {
    position: { x: number; y: number }
    width: string | number
    height: string | number
    backgroundColor?: string
    color?: string
    // ... 其他样式属性
  }

  // 高级配置
  advanced?: {
    animations?: AnimationConfig[]
    dataBinding?: DataBindingConfig
    responsive?: ResponsiveConfig
  }
}
```

### 属性面板组件结构

```typescript
interface PropertyPanelProps {
  selectedComponent: ComponentProperty | null
  onUpdateComponent: (id: string, updates: Partial<ComponentProperty>) => void
  onDeleteComponent: (id: string) => void
}
```

### 扩展性设计

1. **插件化控件**: 支持自定义属性编辑器
2. **类型安全**: 完整的TypeScript类型定义
3. **性能优化**: 防抖更新和虚拟化长列表
4. **主题适配**: 支持深色模式和自定义主题

## 📚 参考资料

- [shadcn/ui 组件库文档](https://ui.shadcn.com/)
- [Tailwind CSS 设计系统](https://tailwindcss.com/)
- [Next.js 15 文档](https://nextjs.org/docs)
- [React 19 特性文档](https://react.dev/)

---

_本文档版本: v1.0_
_最后更新: 2025-11-18_
_维护者: 低代码平台开发团队_
