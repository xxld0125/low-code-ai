/**
 * 属性定义和验证系统使用示例
 * 功能模块: 基础组件库 (004-basic-component-library) - T006任务
 * 创建日期: 2025-10-29
 * 描述: 演示如何使用属性定义和验证系统
 */

import {
  PropDefinitionManager,
  createPropSchema,
  PropType,
  PropCategory,
  Breakpoint,
  ValidationRule,
  PropertyDependency,
} from './property-definitions'

// ============================================================================
// 示例：创建Button组件的属性定义
// ============================================================================

/**
 * 创建Button组件的属性模式示例
 */
export function createButtonPropSchema() {
  const componentId = 'component-basic-button'

  const schemas = [
    // 基础属性
    createPropSchema({
      componentId,
      name: 'text',
      type: PropType.STRING,
      label: '按钮文本',
      description: '按钮上显示的文本内容',
      required: true,
      defaultValue: '按钮',
      group: '基础',
      category: PropCategory.BASIC,
      order: 1,
      constraints: {
        maxLength: 50,
        minLength: 1,
      },
      validation: [
        {
          name: 'no_empty_text',
          type: 'required',
          message: '按钮文本不能为空',
          severity: 'error',
        },
      ],
      editorConfig: {
        widget: 'input',
        placeholder: '请输入按钮文本',
        maxLength: 50,
      },
    }),

    // 样式属性
    createPropSchema({
      componentId,
      name: 'variant',
      type: PropType.SELECT,
      label: '按钮样式',
      description: '按钮的样式变体',
      required: false,
      defaultValue: 'primary',
      group: '样式',
      category: PropCategory.STYLE,
      order: 2,
      options: [
        { value: 'primary', label: '主要按钮', description: '用于主要操作' },
        { value: 'secondary', label: '次要按钮', description: '用于次要操作' },
        { value: 'outline', label: '轮廓按钮', description: '边框样式按钮' },
        { value: 'ghost', label: '幽灵按钮', description: '透明背景按钮' },
        { value: 'link', label: '链接按钮', description: '链接样式按钮' },
      ],
      editorConfig: {
        widget: 'select',
        options: [
          { value: 'primary', label: '主要按钮' },
          { value: 'secondary', label: '次要按钮' },
          { value: 'outline', label: '轮廓按钮' },
          { value: 'ghost', label: '幽灵按钮' },
          { value: 'link', label: '链接按钮' },
        ],
      },
    }),

    createPropSchema({
      componentId,
      name: 'size',
      type: PropType.SELECT,
      label: '按钮尺寸',
      description: '按钮的尺寸大小',
      required: false,
      defaultValue: 'medium',
      group: '样式',
      category: PropCategory.STYLE,
      order: 3,
      options: [
        { value: 'small', label: '小' },
        { value: 'medium', label: '中' },
        { value: 'large', label: '大' },
      ],
      responsive: true,
      breakpoints: [Breakpoint.SM, Breakpoint.MD, Breakpoint.LG],
      editorConfig: {
        widget: 'select',
        options: [
          { value: 'small', label: '小' },
          { value: 'medium', label: '中' },
          { value: 'large', label: '大' },
        ],
      },
    }),

    createPropSchema({
      componentId,
      name: 'disabled',
      type: PropType.BOOLEAN,
      label: '禁用状态',
      description: '是否禁用按钮',
      required: false,
      defaultValue: false,
      group: '状态',
      category: PropCategory.BASIC,
      order: 4,
      editorConfig: {
        widget: 'switch',
      },
    }),

    createPropSchema({
      componentId,
      name: 'loading',
      type: PropType.BOOLEAN,
      label: '加载状态',
      description: '是否显示加载状态',
      required: false,
      defaultValue: false,
      group: '状态',
      category: PropCategory.BASIC,
      order: 5,
      dependencies: [
        {
          type: 'enablement',
          sourceProperty: 'disabled',
          condition: {
            operator: 'eq',
            value: false,
          },
          action: {
            type: 'enable',
          },
        },
      ],
      editorConfig: {
        widget: 'switch',
        showWhen: 'disabled === false',
      },
    }),

    // 高级属性
    createPropSchema({
      componentId,
      name: 'icon',
      type: PropType.STRING,
      label: '图标',
      description: '按钮图标名称或路径',
      required: false,
      group: '高级',
      category: PropCategory.ADVANCED,
      order: 6,
      editorConfig: {
        widget: 'input',
        placeholder: '请输入图标名称',
      },
    }),

    createPropSchema({
      componentId,
      name: 'iconPosition',
      type: PropType.SELECT,
      label: '图标位置',
      description: '图标相对于文本的位置',
      required: false,
      defaultValue: 'left',
      group: '高级',
      category: PropCategory.ADVANCED,
      order: 7,
      options: [
        { value: 'left', label: '左侧' },
        { value: 'right', label: '右侧' },
        { value: 'top', label: '上方' },
        { value: 'bottom', label: '下方' },
      ],
      dependencies: [
        {
          type: 'visibility',
          sourceProperty: 'icon',
          condition: {
            operator: 'ne',
            value: '',
          },
          action: {
            type: 'show',
          },
        },
      ],
      editorConfig: {
        widget: 'select',
        options: [
          { value: 'left', label: '左侧' },
          { value: 'right', label: '右侧' },
          { value: 'top', label: '上方' },
          { value: 'bottom', label: '下方' },
        ],
        showWhen: 'icon && icon.length > 0',
      },
    }),
  ]

  return schemas
}

// ============================================================================
// 示例：创建Input组件的属性定义
// ============================================================================

export function createInputPropSchema() {
  const componentId = 'component-basic-input'

  return [
    createPropSchema({
      componentId,
      name: 'placeholder',
      type: PropType.STRING,
      label: '占位符',
      description: '输入框的占位符文本',
      required: false,
      defaultValue: '',
      group: '基础',
      category: PropCategory.BASIC,
      order: 1,
      constraints: {
        maxLength: 100,
      },
      editorConfig: {
        widget: 'input',
        placeholder: '请输入占位符文本',
      },
    }),

    createPropSchema({
      componentId,
      name: 'type',
      type: PropType.SELECT,
      label: '输入类型',
      description: '输入框的数据类型',
      required: true,
      defaultValue: 'text',
      group: '基础',
      category: PropCategory.BASIC,
      order: 2,
      options: [
        { value: 'text', label: '文本', description: '普通文本输入' },
        { value: 'password', label: '密码', description: '密码输入，显示为星号' },
        { value: 'email', label: '邮箱', description: '邮箱格式验证' },
        { value: 'number', label: '数字', description: '只允许输入数字' },
        { value: 'tel', label: '电话', description: '电话号码格式' },
        { value: 'url', label: '网址', description: '网址格式验证' },
      ],
      editorConfig: {
        widget: 'select',
        options: [
          { value: 'text', label: '文本' },
          { value: 'password', label: '密码' },
          { value: 'email', label: '邮箱' },
          { value: 'number', label: '数字' },
          { value: 'tel', label: '电话' },
          { value: 'url', label: '网址' },
        ],
      },
    }),

    createPropSchema({
      componentId,
      name: 'maxLength',
      type: PropType.NUMBER,
      label: '最大长度',
      description: '输入内容的最大字符数',
      required: false,
      group: '验证',
      category: PropCategory.ADVANCED,
      order: 3,
      constraints: {
        min: 1,
        max: 1000,
        step: 1,
      },
      editorConfig: {
        widget: 'input',
        placeholder: '请输入最大长度',
        type: 'number',
        min: 1,
        max: 1000,
      },
    }),

    createPropSchema({
      componentId,
      name: 'required',
      type: PropType.BOOLEAN,
      label: '必填',
      description: '是否为必填字段',
      required: false,
      defaultValue: false,
      group: '验证',
      category: PropCategory.ADVANCED,
      order: 4,
      editorConfig: {
        widget: 'switch',
      },
    }),
  ]
}

// ============================================================================
// 示例：使用属性定义和验证系统
// ============================================================================

/**
 * 演示如何使用属性定义和验证系统
 */
export function demonstratePropSystem() {
  // 创建属性定义管理器
  const manager = new PropDefinitionManager()

  // 注册Button组件的属性模式
  const buttonSchemas = createButtonPropSchema()
  manager.registerComponentSchemas('component-basic-button', buttonSchemas)

  // 注册Input组件的属性模式
  const inputSchemas = createInputPropSchema()
  manager.registerComponentSchemas('component-basic-input', inputSchemas)

  // 示例1：验证Button组件属性
  console.log('=== Button组件属性验证示例 ===')
  const buttonProps = {
    text: '提交按钮',
    variant: 'primary',
    size: 'large',
    disabled: false,
    loading: true,
    icon: 'check',
    iconPosition: 'left',
  }

  const buttonValidation = manager.validateComponentProps('component-basic-button', buttonProps)
  console.log('验证结果:', buttonValidation.valid)
  console.log('错误信息:', buttonValidation.errors)
  console.log('警告信息:', buttonValidation.warnings)
  console.log('清理后的属性:', buttonValidation.cleanedProps)

  // 示例2：验证无效的属性值
  console.log('\n=== 无效属性验证示例 ===')
  const invalidProps = {
    text: '', // 空文本，应该验证失败
    variant: 'invalid', // 无效的选项
    size: 'invalid', // 无效的尺寸
    disabled: 'not_boolean', // 错误的类型
  }

  const invalidValidation = manager.validateComponentProps('component-basic-button', invalidProps)
  console.log('验证结果:', invalidValidation.valid)
  console.log('错误信息:', invalidValidation.errors)

  // 示例3：生成默认属性值
  console.log('\n=== 默认属性值生成示例 ===')
  const defaultButtonProps = manager.generateDefaultProps('component-basic-button')
  console.log('Button默认属性:', defaultButtonProps)

  const defaultInputProps = manager.generateDefaultProps('component-basic-input')
  console.log('Input默认属性:', defaultInputProps)

  // 示例4：生成编辑器配置
  console.log('\n=== 编辑器配置生成示例 ===')
  const buttonEditorConfigs = manager.generateEditorConfigs('component-basic-button')
  console.log('Button编辑器配置:', JSON.stringify(buttonEditorConfigs, null, 2))

  // 示例5：处理属性依赖关系
  console.log('\n=== 属性依赖关系处理示例 ===')
  const initialProps = {
    text: '测试按钮',
    disabled: true,
    loading: false,
  }

  // 改变disabled属性为false，应该启用loading属性
  const updatedProps = manager.handlePropChange(
    'component-basic-button',
    'disabled',
    false,
    initialProps
  )
  console.log('处理依赖后的属性:', updatedProps)

  return {
    manager,
    buttonValidation,
    defaultButtonProps,
    buttonEditorConfigs,
    updatedProps,
  }
}

/**
 * 响应式属性配置示例
 */
export function demonstrateResponsiveProps() {
  // 这里可以添加响应式属性的使用示例
  // 由于涉及到复杂的响应式逻辑，暂时省略详细实现
  console.log('=== 响应式属性配置示例 ===')
  console.log('响应式属性配置功能已在ResponsivePropManager中实现')
}

// ============================================================================
// 导出示例函数
// ============================================================================

const examples = {
  createButtonPropSchema,
  createInputPropSchema,
  demonstratePropSystem,
  demonstrateResponsiveProps,
}

export default examples
