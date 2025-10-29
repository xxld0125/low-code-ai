# 属性编辑器框架

属性编辑器框架为低代码平台提供了一套完整的属性配置解决方案，支持动态属性编辑、验证和依赖管理。

## 功能特性

### 核心功能

- ✅ **动态属性编辑**: 支持多种数据类型的属性编辑
- ✅ **属性验证**: 完整的属性验证规则和错误提示
- ✅ **属性分组**: 灵活的属性分组和布局管理
- ✅ **依赖管理**: 属性间的条件依赖和动态显示/隐藏
- ✅ **响应式设计**: 适配不同屏幕尺寸的编辑界面

### 支持的字段类型

- **基础类型**: string, number, boolean
- **选择类型**: select, multiselect
- **样式类型**: color, spacing, border, shadow
- **媒体类型**: image
- **复合类型**: array, object
- **自定义类型**: custom

## 组件结构

```
components/lowcode/editors/
├── PropertyEditor.tsx          # 主编辑器组件
├── PropertyField.tsx           # 属性字段组件
├── PropertyGroup.tsx           # 属性分组组件
├── PropertyValidator.tsx       # 属性验证组件
├── PropertyDependency.tsx      # 属性依赖管理
├── FieldTypes/                 # 字段类型编辑器
│   ├── StringFieldEditor.tsx   # 字符串编辑器
│   ├── NumberFieldEditor.tsx   # 数字编辑器
│   ├── BooleanFieldEditor.tsx  # 布尔编辑器
│   ├── SelectFieldEditor.tsx   # 选择编辑器
│   ├── ColorFieldEditor.tsx    # 颜色编辑器
│   ├── ImageFieldEditor.tsx    # 图片编辑器
│   ├── SpacingFieldEditor.tsx  # 间距编辑器
│   ├── BorderFieldEditor.tsx   # 边框编辑器
│   ├── ShadowFieldEditor.tsx   # 阴影编辑器
│   └── index.ts
├── index.ts                    # 导出文件
└── README.md                   # 文档
```

## 使用示例

### 基础使用

```tsx
import { PropertyEditor } from '@/components/lowcode/editors'
import { PropertyDefinition } from '@/types/lowcode/property'

// 定义属性配置
const propertyDefinitions: PropertyDefinition[] = [
  {
    key: 'text',
    type: 'string',
    label: '文本内容',
    required: true,
    default: '按钮',
    validation: [{ type: 'required' }, { type: 'max_length', params: { maxLength: 20 } }],
  },
  {
    key: 'variant',
    type: 'select',
    label: '按钮样式',
    default: 'primary',
    options: [
      { value: 'primary', label: '主要' },
      { value: 'secondary', label: '次要' },
      { value: 'outline', label: '边框' },
    ],
  },
  {
    key: 'size',
    type: 'select',
    label: '按钮大小',
    default: 'medium',
    options: [
      { value: 'small', label: '小' },
      { value: 'medium', label: '中' },
      { value: 'large', label: '大' },
    ],
  },
]

// 使用编辑器
const MyComponent = () => {
  const [properties, setProperties] = useState({})

  const handlePropertyChange = event => {
    console.log('属性变更:', event)
  }

  return (
    <PropertyEditor
      componentType="button"
      componentId="btn-001"
      properties={properties}
      propertyDefinitions={propertyDefinitions}
      onPropertyChange={handlePropertyChange}
    />
  )
}
```

### 属性分组

```tsx
const propertyDefinitions: PropertyDefinition[] = [
  // 基础属性组
  {
    key: 'text',
    type: 'string',
    label: '文本内容',
    group: '基础属性',
    order: 1,
  },
  {
    key: 'disabled',
    type: 'boolean',
    label: '禁用状态',
    group: '基础属性',
    order: 2,
  },

  // 样式属性组
  {
    key: 'backgroundColor',
    type: 'color',
    label: '背景颜色',
    group: '样式属性',
    order: 10,
  },
  {
    key: 'borderColor',
    type: 'color',
    label: '边框颜色',
    group: '样式属性',
    order: 11,
  },
]
```

### 属性依赖

```tsx
const propertyDefinitions: PropertyDefinition[] = [
  {
    key: 'hasIcon',
    type: 'boolean',
    label: '显示图标',
    default: false,
  },
  {
    key: 'iconType',
    type: 'select',
    label: '图标类型',
    options: [
      { value: 'arrow', label: '箭头' },
      { value: 'check', label: '勾选' },
      { value: 'close', label: '关闭' },
    ],
    // 条件显示：只有在 hasIcon 为 true 时显示
    conditional: {
      property: 'hasIcon',
      operator: 'equals',
      value: true,
    },
  },
]
```

### 属性验证

```tsx
const propertyDefinitions: PropertyDefinition[] = [
  {
    key: 'email',
    type: 'string',
    label: '邮箱地址',
    required: true,
    validation: [
      { type: 'required', message: '邮箱地址不能为空' },
      { type: 'email', message: '请输入有效的邮箱地址' },
      { type: 'max_length', params: { maxLength: 50 } },
    ],
  },
  {
    key: 'age',
    type: 'number',
    label: '年龄',
    validation: [
      { type: 'min_value', params: { min: 0 } },
      { type: 'max_value', params: { max: 120 } },
    ],
  },
]
```

## 高级功能

### 自定义字段编辑器

```tsx
import { StringFieldEditor } from './FieldTypes'

// 扩展现有编辑器
const CustomFieldEditor = props => {
  // 自定义逻辑
  return <StringFieldEditor {...props} />
}
```

### 属性依赖管理

```tsx
import { usePropertyDependency, ConditionBuilder } from './PropertyDependency'

const MyEditor = ({ properties, propertyDefinitions }) => {
  const {
    getPropertyVisibility,
    getPropertyStates,
    getAffectedProperties
  } = usePropertyDependency(properties, propertyDefinitions)

  // 监听属性变更
  const handleChange = (property, value) => {
    // 获取受影响的属性
    const affected = getAffectedProperties(property)
    console.log('受影响的属性:', affected)
  }

  return (
    // 编辑器内容
  )
}
```

### 验证规则

```tsx
import { usePropertyValidator } from './PropertyValidator'

const MyEditor = ({ properties, propertyDefinitions }) => {
  const { validateProperties } = usePropertyValidator()

  const validateAll = () => {
    const result = validateProperties(properties, propertyDefinitions)

    if (!result.isValid) {
      console.error('验证错误:', result.errors)
      console.warn('警告:', result.warnings)
    }
  }

  return (
    // 编辑器内容
  )
}
```

## API 文档

### PropertyEditor

主要的属性编辑器组件。

**Props:**

- `componentType: string` - 组件类型
- `componentId: string` - 组件ID
- `properties: ComponentProps` - 当前属性值
- `propertyDefinitions: PropertyDefinition[]` - 属性定义
- `onPropertyChange: (event: PropertyUpdateEvent) => void` - 属性变更回调
- `loading?: boolean` - 加载状态
- `disabled?: boolean` - 禁用状态
- `readonly?: boolean` - 只读状态
- `showGroups?: boolean` - 是否显示分组
- `collapsibleGroups?: boolean` - 分组是否可折叠
- `showValidation?: boolean` - 是否显示验证结果
- `showAdvancedToggle?: boolean` - 是否显示高级属性切换

### PropertyDefinition

属性定义接口。

**Properties:**

- `key: string` - 属性键名
- `type: PropertyType` - 属性类型
- `label: string` - 显示标签
- `description?: string` - 描述信息
- `required?: boolean` - 是否必填
- `default?: unknown` - 默认值
- `options?: PropertyOption[]` - 选项列表（用于select类型）
- `validation?: ValidationRule[]` - 验证规则
- `group?: string` - 分组名称
- `order?: number` - 显示顺序
- `conditional?: PropertyCondition` - 条件显示配置

### ValidationRule

验证规则接口。

**Properties:**

- `type: ValidationType` - 验证类型
- `message?: string` - 自定义错误消息
- `params?: Record<string, unknown>` - 验证参数

**验证类型:**

- `required` - 必填验证
- `min_length` - 最小长度
- `max_length` - 最大长度
- `min_value` - 最小值
- `max_value` - 最大值
- `pattern` - 正则表达式
- `email` - 邮箱格式
- `url` - URL格式
- `custom` - 自定义验证

## 最佳实践

1. **属性分组**: 将相关属性分组显示，提高编辑体验
2. **条件显示**: 使用条件依赖来简化复杂配置界面
3. **验证规则**: 为重要属性添加验证规则，确保数据质量
4. **默认值**: 为所有属性提供合理的默认值
5. **描述信息**: 为复杂属性提供清晰的描述信息
6. **响应式设计**: 确保编辑器在不同设备上都能正常使用

## 扩展开发

### 添加新的字段类型

1. 在 `FieldTypes/` 目录下创建新的编辑器组件
2. 实现标准的编辑器接口
3. 在 `FieldTypes/index.ts` 中导出
4. 更新类型定义和组件映射

### 自定义验证规则

1. 在 `PropertyValidator.tsx` 中添加新的验证逻辑
2. 扩展 `ValidationType` 类型定义
3. 实现对应的验证函数

### 自定义依赖规则

1. 使用 `ConditionBuilder` 构建复杂条件
2. 实现自定义检查函数
3. 在组件中使用 `usePropertyDependency` hook
