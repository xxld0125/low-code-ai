# 数据模型设计

**功能**: 基础组件库
**日期**: 2025-10-28
**分支**: 004-basic-component-library

## 核心实体定义

### 1. 组件定义实体 (ComponentDefinition)

存储组件的元数据和配置信息。

```typescript
interface ComponentDefinition {
  // 基础标识
  id: string // 唯一标识符，格式: "component-{category}-{name}"
  name: string // 组件显示名称
  description: string // 组件描述
  version: string // 组件版本号 (semver)
  author: string // 作者

  // 分类信息
  category: ComponentCategory // 组件分类
  subcategory?: string // 子分类
  tags: string[] // 标签，用于搜索和过滤

  // 组件实现
  component_path: string // React组件文件路径
  preview_path: string // 预览组件文件路径
  icon_path: string // 图标组件文件路径

  // 属性配置
  props_schema: PropSchema[] // 属性定义数组
  default_props: Record<string, any> // 默认属性值
  default_styles: ComponentStyles // 默认样式配置

  // 约束和验证
  constraints: ComponentConstraints // 布局约束
  validation_rules: ValidationRule[] // 验证规则

  // 状态管理
  status: ComponentStatus // 组件状态
  deprecated?: boolean // 是否已废弃
  deprecated_reason?: string // 废弃原因
  deprecated_alternative?: string // 替代组件

  // 元数据
  created_at: timestamp
  updated_at: timestamp
  created_by: string // 创建者用户ID
  updated_by: string // 更新者用户ID
}
```

### 2. 属性定义实体 (PropSchema)

定义组件可配置属性的详细信息和验证规则。

```typescript
interface PropSchema {
  id: string // 属性唯一标识
  component_id: string // 关联的组件ID

  // 基础属性
  name: string // 属性名称
  type: PropType // 属性数据类型
  label: string // 显示标签
  description?: string // 属性描述
  required: boolean // 是否必填
  default_value?: any // 默认值

  // 分组和显示
  group: string // 属性分组 (基础/样式/布局/高级)
  category: PropCategory // 属性类别
  order: number // 显示顺序
  display_hints?: DisplayHint[] // 显示提示

  // 选项和约束
  options?: PropOption[] // 可选值列表 (用于select/radio等)
  constraints?: PropConstraints // 属性约束

  // 验证规则
  validation?: ValidationRule[] // 验证规则

  // 编辑器配置
  editor_config: EditorConfig // 编辑器配置

  // 响应式支持
  responsive: boolean // 是否支持响应式配置
  breakpoints?: string[] // 支持的断点列表

  // 依赖关系
  dependencies?: PropertyDependency[] // 属性依赖关系

  // 状态
  created_at: timestamp
  updated_at: timestamp
}
```

### 3. 页面组件实例实体 (PageComponentInstance)

存储页面中具体使用的组件实例及其配置。

```typescript
interface PageComponentInstance {
  id: string // 实例唯一标识
  page_id: string // 所属页面ID
  component_id: string // 组件定义ID

  // 实例配置
  props: Record<string, any> // 属性配置值
  styles: ComponentStyles // 样式配置
  responsive_styles?: Record<string, ComponentStyles> // 响应式样式

  // 布局信息
  parent_id?: string // 父组件实例ID (用于嵌套组件)
  children_order: number // 在父组件中的排序
  layout: LayoutInfo // 布局位置信息

  // 状态信息
  visible: boolean // 是否可见
  locked: boolean // 是否锁定 (防止编辑)

  // 事件绑定
  event_bindings: EventBinding[] // 事件绑定配置

  // 数据绑定
  data_bindings: DataBinding[] // 数据绑定配置

  // 元数据
  created_at: timestamp
  updated_at: timestamp
  created_by: string
  updated_by: string
}
```

### 4. 组件样式配置实体 (ComponentStyles)

定义组件的样式属性和响应式配置。

```typescript
interface ComponentStyles {
  // 显示属性
  display?: CSSDisplayProperty
  position?: CSSPositionProperty
  visibility?: CSSVisibilityProperty
  opacity?: number
  zIndex?: number

  // 尺寸控制
  width?: string | number
  height?: string | number
  minWidth?: string | number
  minHeight?: string | number
  maxWidth?: string | number
  maxHeight?: string | number

  // 间距控制
  margin?: SpacingValue
  padding?: SpacingValue

  // 布局属性
  flex?: FlexProperties
  grid?: GridProperties

  // 文字样式
  color?: string
  backgroundColor?: string
  fontSize?: string | number
  fontWeight?: string | number
  fontFamily?: string
  lineHeight?: string | number
  textAlign?: CSSTextAlignProperty
  textDecoration?: CSSTextDecorationProperty

  // 边框和圆角
  border?: BorderProperties
  borderRadius?: BorderRadiusValue
  boxShadow?: string

  // 变换
  transform?: TransformProperties

  // 动画
  transition?: TransitionProperties

  // 自定义CSS
  customCSS?: string

  // 响应式样式
  responsive?: Record<Breakpoint, Partial<ComponentStyles>>
}
```

### 5. 布局信息实体 (LayoutInfo)

定义组件在画布中的位置和布局信息。

```typescript
interface LayoutInfo {
  // 位置信息
  x: number // X坐标
  y: number // Y坐标

  // 尺寸信息
  width: number // 宽度 (像素)
  height: number // 高度 (像素)

  // 栅格布局 (当使用栅格系统时)
  grid_column?: {
    start: number
    end: number
  }
  grid_row?: {
    start: number
    end: number
  }

  // 响应式布局
  responsive_layout?: Record<Breakpoint, Partial<LayoutInfo>>

  // 锚定和对齐
  anchor?: LayoutAnchor // 布局锚点
  alignment?: LayoutAlignment // 对齐方式

  // 约束信息
  constraints?: LayoutConstraints // 布局约束
}
```

## 枚举类型定义

### 组件分类 (ComponentCategory)

```typescript
enum ComponentCategory {
  BASIC = 'basic', // 基础组件 (Button, Input等)
  DISPLAY = 'display', // 展示组件 (Text, Image等)
  LAYOUT = 'layout', // 布局组件 (Container, Grid等)
  FORM = 'form', // 表单组件 (FormField, FormSection等)
  ADVANCED = 'advanced', // 高级组件
  CUSTOM = 'custom', // 自定义组件
}
```

### 属性类型 (PropType)

```typescript
enum PropType {
  // 基础类型
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',

  // 特殊类型
  COLOR = 'color',
  DATE = 'date',
  TIME = 'time',
  URL = 'url',
  EMAIL = 'email',

  // 选择类型
  SELECT = 'select',
  MULTI_SELECT = 'multi_select',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',

  // 复杂类型
  ARRAY = 'array',
  OBJECT = 'object',
  JSON = 'json',

  // 样式类型
  SIZE = 'size',
  SPACING = 'spacing',
  BORDER = 'border',
  SHADOW = 'shadow',

  // 响应式类型
  RESPONSIVE_SIZE = 'responsive_size',
  RESPONSIVE_SPACING = 'responsive_spacing',
}
```

### 组件状态 (ComponentStatus)

```typescript
enum ComponentStatus {
  DRAFT = 'draft', // 草稿
  ACTIVE = 'active', // 激活
  DEPRECATED = 'deprecated', // 废弃
  ARCHIVED = 'archived', // 归档
}
```

## 关系定义

### 主要关系

1. **ComponentDefinition** 1→N **PropSchema**
   - 一个组件定义有多个属性定义
   - 通过 `component_id` 关联

2. **ComponentDefinition** 1→N **PageComponentInstance**
   - 一个组件定义可以创建多个实例
   - 通过 `component_id` 关联

3. **PageComponentInstance** 1→N **PageComponentInstance**
   - 支持组件嵌套 (父子关系)
   - 通过 `parent_id` 关联

4. **PageComponentInstance** 1→N **EventBinding**
   - 一个组件实例可以有多个事件绑定

5. **PageComponentInstance** 1→N **DataBinding**
   - 一个组件实例可以有多个数据绑定

### 关系图

```
ComponentDefinition
├── PropSchema[] (1:N)
└── PageComponentInstance[] (1:N)
    ├── EventBinding[] (1:N)
    ├── DataBinding[] (1:N)
    └── PageComponentInstance[] (自引用, 1:N)
```

## 验证规则

### 组件定义验证

```typescript
interface ComponentDefinitionValidation {
  // 基础验证
  id_required: boolean // ID必填
  id_unique: boolean // ID唯一
  name_required: boolean // 名称必填
  name_length: { min: 1; max: 100 }

  // 分类验证
  category_valid: boolean // 分类有效
  tags_array: boolean // 标签为数组

  // 路径验证
  component_path_exists: boolean // 组件文件存在
  preview_path_exists: boolean // 预览文件存在

  // 配置验证
  props_schema_valid: boolean // 属性模式有效
  default_props_match_schema: boolean // 默认属性匹配模式
}
```

### 属性配置验证

```typescript
interface PropValidation {
  // 类型验证
  type_valid: boolean // 类型有效
  value_matches_type: boolean // 值匹配类型

  // 约束验证
  constraints_satisfied: boolean // 约束满足
  options_valid: boolean // 选项有效

  // 依赖验证
  dependencies_satisfied: boolean // 依赖满足

  // 响应式验证
  responsive_config_valid: boolean // 响应式配置有效
}
```

## 索引设计

### 主要索引

```sql
-- ComponentDefinition表索引
CREATE INDEX idx_component_definition_category ON component_definitions(category);
CREATE INDEX idx_component_definition_status ON component_definitions(status);
CREATE INDEX idx_component_definition_tags ON component_definitions USING GIN(tags);
CREATE UNIQUE INDEX idx_component_definition_id ON component_definitions(id);

-- PropSchema表索引
CREATE INDEX idx_prop_schema_component_id ON prop_schemas(component_id);
CREATE INDEX idx_prop_schema_group ON prop_schemas(group);
CREATE INDEX idx_prop_schema_type ON prop_schemas(type);

-- PageComponentInstance表索引
CREATE INDEX idx_page_component_instance_page_id ON page_component_instances(page_id);
CREATE INDEX idx_page_component_instance_component_id ON page_component_instances(component_id);
CREATE INDEX idx_page_component_instance_parent_id ON page_component_instances(parent_id);
CREATE INDEX idx_page_component_instance_layout ON page_component_instances USING GIN(layout);
```

## 数据迁移计划

### 阶段1: 创建基础表结构

```sql
-- 创建组件定义表
CREATE TABLE component_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  author TEXT,
  category TEXT NOT NULL CHECK (category IN ('basic', 'display', 'layout', 'form', 'advanced', 'custom')),
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  component_path TEXT NOT NULL,
  preview_path TEXT NOT NULL,
  icon_path TEXT NOT NULL,
  props_schema JSONB DEFAULT '[]',
  default_props JSONB DEFAULT '{}',
  default_styles JSONB DEFAULT '{}',
  constraints JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated', 'archived')),
  deprecated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
```

### 阶段2: 初始化基础组件数据

```sql
-- 插入基础组件定义
INSERT INTO component_definitions (id, name, category, component_path, preview_path, icon_path) VALUES
('component-basic-button', 'Button', 'basic', '/components/lowcode/basic/Button', '/components/lowcode/basic/Button/Preview', '/components/lowcode/basic/Button/Icon'),
('component-basic-input', 'Input', 'basic', '/components/lowcode/basic/Input', '/components/lowcode/basic/Input/Preview', '/components/lowcode/basic/Input/Icon'),
('component-display-text', 'Text', 'display', '/components/lowcode/display/Text', '/components/lowcode/display/Text/Preview', '/components/lowcode/display/Text/Icon'),
-- ... 更多组件
;
```

## 性能考虑

### 查询优化

1. **组件列表查询**: 按分类和状态索引，支持快速过滤
2. **属性查询**: 按组件ID索引，支持批量加载
3. **实例查询**: 按页面ID索引，支持页面组件快速加载
4. **搜索功能**: 使用全文搜索索引支持标签和描述搜索

### 缓存策略

1. **组件定义缓存**: 缓存活跃组件的定义，减少数据库查询
2. **属性模式缓存**: 缓存属性验证模式，提高验证性能
3. **样式配置缓存**: 缓存常用样式配置，支持快速应用

### 数据分区

对于大规模部署，考虑按以下维度分区：

- 按组织ID分区 (多租户场景)
- 按组件分类分区
- 按时间分区 (历史数据归档)

## 安全考虑

### 行级安全策略

```sql
-- 启用行级安全
ALTER TABLE component_definitions ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己组织的组件
CREATE POLICY component_definitions_org_policy ON component_definitions
  FOR ALL TO authenticated_users
  USING (organization_id = current_organization_id());
```

### 数据验证

- 输入数据严格验证，防止注入攻击
- 组件路径验证，防止路径遍历攻击
- JSON数据验证，确保结构正确性

## 总结

本数据模型设计为基础组件库提供了完整的数据结构支持，包括：

1. **灵活的组件定义**: 支持丰富的属性配置和验证规则
2. **强大的样式系统**: 支持响应式设计和复杂样式配置
3. **完善的实例管理**: 支持组件嵌套和复杂布局
4. **高效的查询性能**: 通过合理的索引和缓存策略
5. **良好的扩展性**: 支持未来功能扩展和性能优化

该模型设计充分考虑了低代码平台的特殊需求，能够支持组件的灵活配置、实时预览和高效渲染。
