# 005 - 属性配置面板MVP设计文档

## 概述

本文档定义了低代码平台属性配置面板的MVP（最小可行产品）版本设计，涵盖24个核心组件的属性配置，总计133个配置项，平均每个组件5.5个配置。

## 设计原则

### 1. 核心优先
- 只保留实现80%使用场景的配置
- 属性命名直观，分组清晰
- 渐进增强，后续可扩展高级功能

### 2. 学习成本低
- 每个配置项控制在3-6个选项
- 提供直观的中文标签
- 合理的默认值设置

### 3. 一致性强
- 同类组件保持配置模式统一
- 标准化的属性键名规范
- 统一的基础配置和布局配置

## 文档结构

```
005-property-config-panel/
├── README.md                 # 总览文档（本文件）
├── components/               # 组件配置详情
│   ├── text.md              # 📝 文本组件
│   ├── button.md            # 🔘 按钮组件
│   ├── input.md              # 📝 输入框组件
│   ├── textarea.md           # 📄 文本域组件
│   ├── select.md             # 📋 选择器组件
│   ├── checkbox.md           # ☑️ 复选框组件
│   ├── radio.md              # ⚪ 单选框组件
│   ├── image.md              # 🖼️ 图片组件
│   ├── heading.md            # 🏷️ 标题组件
│   ├── container.md          # 📦 容器组件
│   ├── row.md                # ↔️ 行容器组件
│   ├── col.md                # ↕️ 列容器组件
│   ├── card.md               # 🃏 卡片容器组件
│   ├── badge.md              # 🏷️ 徽章组件
│   ├── divider.md            # ➖ 分割线组件
│   ├── spacer.md             # ⬜ 间距组件
│   ├── breadcrumb.md         # 🧭 面包屑组件
│   ├── menu.md               # 📋 菜单组件
│   ├── pagination.md         # 📄 分页组件
│   ├── alert.md              # ⚠️ 警告提示组件
│   ├── loading.md            # ⏳ 加载中组件
│   ├── message.md            # 💬 消息提示组件
│   ├── table.md              # 📊 表格组件
│   ├── list.md               # 📋 列表组件
│   └── timeline.md           # 📅 时间轴组件
├── shared/                  # 通用配置
│   ├── base-properties.md    # 基础配置
│   ├── layout-properties.md  # 布局配置
│   ├── field-types.md        # 字段类型说明
│   └── naming-convention.md  # 命名规范
├── design/                  # 设计文档
│   ├── principles.md         # 设计原则
│   ├── user-experience.md    # 用户体验
│   └── technical-specs.md    # 技术规格
└── implementation/           # 实施指南
    ├── roadmap.md            # 实施路线图
    ├── data-structure.md     # 数据结构
    └── api-design.md         # API设计
```

## 配置统计

### 分类统计

| 分类 | 组件数 | 属性配置数 | 平均属性数 | 完成状态 |
|------|--------|------------|------------|----------|
| 容器组件 | 4 | 19 | 4.8 | ✅ 完成 |
| 内容组件 | 5 | 22 | 4.4 | ✅ 完成 |
| 表单组件 | 6 | 33 | 5.5 | ✅ 完成 |
| 导航组件 | 3 | 18 | 6.0 | ✅ 完成 |
| 反馈组件 | 3 | 21 | 7.0 | ✅ 完成 |
| 数据组件 | 3 | 20 | 6.7 | ✅ 完成 |
| **总计** | **24** | **133** | **5.5** | **✅ 100%完成** |

### 对比分析

| 组件 | 当前配置数 | MVP配置数 | 简化比例 | 说明 |
|------|------------|-----------|----------|------|
| 文本 | ~15个 | 5个 | 67% | 保留核心文本和样式功能 |
| 按钮 | ~12个 | 5个 | 58% | 简化样式和交互配置 |
| 输入框 | ~18个 | 6个 | 67% | 保留验证和基础样式 |
| 容器 | ~20个 | 5个 | 75% | 专注布局和基础样式 |
| 标题 | ~15个 | 4个 | 73% | 简化层级和样式配置 |

## 属性类型定义

### 基础字段类型

1. **text** - 单行文本输入
2. **textarea** - 多行文本输入
3. **number** - 数字输入
4. **radio** - 单选按钮组
5. **select** - 下拉选择框
6. **switch** - 开关切换
7. **color** - 颜色选择器（预定义颜色）

### 高级字段类型

1. **breadcrumb-editor** - 面包屑编辑器
2. **menu-editor** - 菜单编辑器（支持嵌套）
3. **table-columns-editor** - 表格列编辑器
4. **table-data-editor** - 表格数据编辑器
5. **list-editor** - 列表编辑器
6. **timeline-editor** - 时间轴编辑器

## 通用配置

### 基础配置（所有组件）
```typescript
{
  key: 'component.id',
  label: '组件ID',
  type: 'text',
  disabled: true,
  description: '系统生成的唯一标识符'
},
{
  key: 'component.customName',
  label: '自定义名称',
  type: 'text',
  placeholder: '给组件起个名字',
  description: '用于在组件列表中识别'
},
{
  key: 'component.visible',
  label: '可见性',
  type: 'switch',
  defaultValue: true,
  description: '控制组件是否显示'
}
```

### 布局配置（所有组件）
```typescript
{
  key: 'layout.margin',
  label: '外边距',
  type: 'radio',
  defaultValue: 'none',
  options: [
    { label: '无', value: 'none' },
    { label: '小 (4px)', value: 'sm' },
    { label: '中 (8px)', value: 'md' },
    { label: '大 (16px)', value: 'lg' }
  ]
},
{
  key: 'layout.width',
  label: '宽度',
  type: 'radio',
  defaultValue: 'auto',
  options: [
    { label: '自适应', value: 'auto' },
    { label: '100%宽度', value: 'full' }
  ]
}
```

## 实施路线图

### 第一阶段（MVP核心功能）
- [x] 完成所有24个组件的基础配置
- [x] 统一属性命名规范
- [x] 建立通用配置标准
- [ ] 实现属性配置面板UI
- [ ] 集成属性编辑器组件

### 第二阶段（用户体验优化）
- [ ] 添加属性验证规则
- [ ] 实现配置预设和模板
- [ ] 添加配置历史记录
- [ ] 优化配置面板交互体验

### 第三阶段（高级功能扩展）
- [ ] 支持自定义属性扩展
- [ ] 添加条件显示逻辑
- [ ] 实现配置导入导出
- [ ] 支持配置版本管理

## 技术规格

### 数据结构
```typescript
interface ComponentProperty {
  key: string                    // 属性键名，格式：组件名.属性名
  label: string                  // 显示标签
  type: PropertyFieldType         // 属性类型
  defaultValue?: any              // 默认值
  placeholder?: string            // 占位符文本
  required?: boolean             // 是否必填
  disabled?: boolean             // 是否禁用
  description?: string           // 属性描述
  options?: PropertyOption[]     // 选项列表
  validation?: ValidationRule[]   // 验证规则
  min?: number                   // 最小值
  max?: number                   // 最大值
  maxLength?: number             // 最大长度
}
```

### 属性键名规范
- 格式：`{componentType}.{propertyName}`
- 示例：`text.content`, `button.variant`, `input.required`
- 嵌套属性：`text.size`, `text.weight`, `text.textAlign`

### 事件配置标准
每个组件支持基础事件：
- `onClick` - 点击事件
- `onChange` - 值变更事件
- `onFocus` - 获得焦点事件
- `onBlur` - 失去焦点事件

## 使用说明

### 查看组件配置
每个组件的详细配置在 `components/` 目录下单独的文档中：

```bash
# 查看文本组件配置
cat components/text.md

# 查看按钮组件配置
cat components/button.md
```

### 实现新组件属性
1. 确定组件类型和核心功能
2. 遵循命名规范定义属性键
3. 选择合适的属性类型
4. 提供合理的默认值和选项
5. 添加必要的验证规则

### 扩展属性类型
如需新增属性类型：
1. 在 `shared/field-types.md` 中定义类型
2. 实现对应的编辑器组件
3. 更新类型验证逻辑
4. 添加使用示例

## 更新日志

### v1.0.0 (2025-01-17)
- ✅ 完成24个组件的MVP属性配置
- ✅ 建立133个属性配置项
- ✅ 统一配置规范和命名约定
- ✅ 定义8种基础属性类型
- ✅ 设计6种高级编辑器类型

### 计划更新
- v1.1.0: 属性验证和错误提示
- v1.2.0: 配置预设和模板
- v1.3.0: 高级功能扩展

## 相关文档

- [设计原则](design/principles.md)
- [用户体验设计](design/user-experience.md)
- [技术规格](design/technical-specs.md)
- [实施指南](implementation/roadmap.md)
- [API设计](implementation/api-design.md)

---

**文档版本**: v1.0.0
**最后更新**: 2025-01-17
**维护者**: LowCode Team