/**
 * 属性定义和验证系统实现
 * 功能模块: 基础组件库 (004-basic-component-library) - T006任务
 * 创建日期: 2025-10-29
 * 描述: 完整的属性定义、验证、响应式配置和依赖关系管理系统
 */

import {
  PropSchema,
  PropType,
  PropCategory,
  PropOption,
  PropConstraints,
  ValidationRule,
  ValidationError,
  ValidationWarning,
  PropValidationResult,
  EditorConfig,
  PropertyDependency,
  ResponsiveValue,
  Breakpoint,
  ComponentStatus,
  GetPropValueType,
} from './types'

// 重新导出类型和枚举以供外部使用
export type {
  PropSchema,
  PropOption,
  PropConstraints,
  ValidationRule,
  ValidationError,
  ValidationWarning,
  PropValidationResult,
  EditorConfig,
  PropertyDependency,
  ResponsiveValue,
  GetPropValueType,
}

// 重新导出枚举（需要作为值导出）
export { PropType, PropCategory, Breakpoint, ComponentStatus }

// ============================================================================
// 验证器类 - 处理属性值验证
// ============================================================================

/**
 * 属性验证器类
 * 负责验证属性值是否符合定义的约束和规则
 */
export class PropValidator {
  /**
   * 验证单个属性值
   */
  static validateProp(value: any, schema: PropSchema): PropValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // 类型验证
    const typeValidation = this.validateType(value, schema.type)
    if (!typeValidation.valid) {
      errors.push(...typeValidation.errors)
    }

    // 必填验证
    if (schema.required && this.isEmpty(value)) {
      errors.push({
        code: 'REQUIRED',
        message: `${schema.label}是必填项`,
        path: schema.name,
        value,
      })
    }

    // 约束验证
    if (value !== null && value !== undefined && value !== '') {
      const constraintValidation = this.validateConstraints(value, schema.constraints, schema.type)
      if (!constraintValidation.valid) {
        errors.push(...constraintValidation.errors)
      }
    }

    // 选项验证
    if (schema.options && schema.options.length > 0) {
      const optionValidation = this.validateOptions(value, schema.options, schema.type)
      if (!optionValidation.valid) {
        errors.push(...optionValidation.errors)
      }
    }

    // 自定义验证规则
    if (schema.validation) {
      const customValidation = this.validateCustomRules(value, schema.validation)
      errors.push(...customValidation.errors)
      warnings.push(...customValidation.warnings)
    }

    return {
      valid: errors.length === 0,
      value: this.normalizeValue(value, schema),
      errors,
      warnings,
    }
  }

  /**
   * 验证属性值类型
   */
  private static validateType(value: any, type: PropType): PropValidationResult {
    const errors: ValidationError[] = []

    if (value === null || value === undefined || value === '') {
      return { valid: true, value, errors: [], warnings: [] }
    }

    let isValid = false
    let expectedType = ''

    switch (type) {
      case PropType.STRING:
      case PropType.COLOR:
      case PropType.DATE:
      case PropType.TIME:
      case PropType.URL:
      case PropType.EMAIL:
        isValid = typeof value === 'string'
        expectedType = 'string'
        break

      case PropType.NUMBER:
        isValid = typeof value === 'number' && !isNaN(value)
        expectedType = 'number'
        break

      case PropType.BOOLEAN:
        isValid = typeof value === 'boolean'
        expectedType = 'boolean'
        break

      case PropType.SELECT:
      case PropType.RADIO:
        isValid = typeof value === 'string' || typeof value === 'number'
        break

      case PropType.MULTI_SELECT:
      case PropType.CHECKBOX:
        isValid = Array.isArray(value)
        break

      case PropType.ARRAY:
        isValid = Array.isArray(value)
        expectedType = 'array'
        break

      case PropType.OBJECT:
        isValid = typeof value === 'object' && !Array.isArray(value) && value !== null
        expectedType = 'object'
        break

      case PropType.JSON:
        try {
          JSON.parse(JSON.stringify(value))
          isValid = true
        } catch {
          isValid = false
        }
        expectedType = 'JSON serializable'
        break

      case PropType.SIZE:
      case PropType.SPACING:
      case PropType.BORDER:
      case PropType.SHADOW:
        // 这些类型通常是字符串或对象，接受多种格式
        isValid = typeof value === 'string' || typeof value === 'object'
        break

      default:
        isValid = true // 对于未知类型，默认通过
    }

    if (!isValid && expectedType) {
      errors.push({
        code: 'INVALID_TYPE',
        message: `期望${expectedType}类型，实际为${typeof value}`,
        value,
        constraint: type,
      })
    }

    return {
      valid: errors.length === 0,
      value,
      errors,
      warnings: [],
    }
  }

  /**
   * 验证属性约束
   */
  private static validateConstraints(
    value: any,
    constraints?: PropConstraints,
    type?: PropType
  ): PropValidationResult {
    const errors: ValidationError[] = []

    if (!constraints) {
      return { valid: true, value, errors: [], warnings: [] }
    }

    // 字符串约束
    if (typeof value === 'string') {
      if (constraints.minLength !== undefined && value.length < constraints.minLength) {
        errors.push({
          code: 'MIN_LENGTH',
          message: `长度不能少于${constraints.minLength}个字符`,
          value,
          constraint: `minLength: ${constraints.minLength}`,
        })
      }

      if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
        errors.push({
          code: 'MAX_LENGTH',
          message: `长度不能超过${constraints.maxLength}个字符`,
          value,
          constraint: `maxLength: ${constraints.maxLength}`,
        })
      }

      if (constraints.pattern) {
        const regex = new RegExp(constraints.pattern)
        if (!regex.test(value)) {
          errors.push({
            code: 'PATTERN',
            message: constraints.patternMessage || '格式不正确',
            value,
            constraint: `pattern: ${constraints.pattern}`,
          })
        }
      }
    }

    // 数字约束
    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        errors.push({
          code: 'MIN_VALUE',
          message: `值不能小于${constraints.min}`,
          value,
          constraint: `min: ${constraints.min}`,
        })
      }

      if (constraints.max !== undefined && value > constraints.max) {
        errors.push({
          code: 'MAX_VALUE',
          message: `值不能大于${constraints.max}`,
          value,
          constraint: `max: ${constraints.max}`,
        })
      }

      if (constraints.step !== undefined && value % constraints.step !== 0) {
        errors.push({
          code: 'STEP',
          message: `值必须是${constraints.step}的倍数`,
          value,
          constraint: `step: ${constraints.step}`,
        })
      }

      if (constraints.precision !== undefined) {
        const decimalPlaces = value.toString().split('.')[1]?.length || 0
        if (decimalPlaces > constraints.precision) {
          errors.push({
            code: 'PRECISION',
            message: `小数位数不能超过${constraints.precision}位`,
            value,
            constraint: `precision: ${constraints.precision}`,
          })
        }
      }
    }

    // 数组约束
    if (Array.isArray(value)) {
      if (constraints.minItems !== undefined && value.length < constraints.minItems) {
        errors.push({
          code: 'MIN_ITEMS',
          message: `项目数量不能少于${constraints.minItems}个`,
          value,
          constraint: `minItems: ${constraints.minItems}`,
        })
      }

      if (constraints.maxItems !== undefined && value.length > constraints.maxItems) {
        errors.push({
          code: 'MAX_ITEMS',
          message: `项目数量不能超过${constraints.maxItems}个`,
          value,
          constraint: `maxItems: ${constraints.maxItems}`,
        })
      }

      if (constraints.uniqueItems && new Set(value).size !== value.length) {
        errors.push({
          code: 'UNIQUE_ITEMS',
          message: '所有项目必须是唯一的',
          value,
          constraint: 'uniqueItems: true',
        })
      }
    }

    // 对象约束
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const keys = Object.keys(value)

      if (constraints.requiredKeys) {
        const missingKeys = constraints.requiredKeys.filter(key => !keys.includes(key))
        if (missingKeys.length > 0) {
          errors.push({
            code: 'REQUIRED_KEYS',
            message: `缺少必需的属性: ${missingKeys.join(', ')}`,
            value,
            constraint: `requiredKeys: [${constraints.requiredKeys.join(', ')}]`,
          })
        }
      }

      if (constraints.allowedKeys) {
        const invalidKeys = keys.filter(key => !constraints.allowedKeys!.includes(key))
        if (invalidKeys.length > 0) {
          errors.push({
            code: 'ALLOWED_KEYS',
            message: `包含不允许的属性: ${invalidKeys.join(', ')}`,
            value,
            constraint: `allowedKeys: [${constraints.allowedKeys.join(', ')}]`,
          })
        }
      }
    }

    return {
      valid: errors.length === 0,
      value,
      errors,
      warnings: [],
    }
  }

  /**
   * 验证选项值
   */
  private static validateOptions(
    value: any,
    options: PropOption[],
    type: PropType
  ): PropValidationResult {
    const errors: ValidationError[] = []
    const optionValues = options.map(option => option.value)

    if (type === PropType.MULTI_SELECT) {
      if (Array.isArray(value)) {
        const invalidValues = value.filter(v => !optionValues.includes(v))
        if (invalidValues.length > 0) {
          errors.push({
            code: 'INVALID_OPTIONS',
            message: `包含无效的选项值: ${invalidValues.join(', ')}`,
            value,
            constraint: `options: [${optionValues.join(', ')}]`,
          })
        }
      }
    } else {
      if (!optionValues.includes(value)) {
        errors.push({
          code: 'INVALID_OPTION',
          message: `选项值无效，有效值为: ${optionValues.join(', ')}`,
          value,
          constraint: `options: [${optionValues.join(', ')}]`,
        })
      }
    }

    return {
      valid: errors.length === 0,
      value,
      errors,
      warnings: [],
    }
  }

  /**
   * 验证自定义规则
   */
  private static validateCustomRules(
    value: any,
    rules: ValidationRule[]
  ): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    for (const rule of rules) {
      try {
        // 这里可以根据规则类型进行不同的验证
        // 实际实现中可能需要注册自定义验证函数
        const isValid = this.evaluateValidationRule(value, rule)

        if (!isValid) {
          if (rule.severity === 'warning' || rule.severity === 'info') {
            warnings.push({
              code: rule.name,
              message: rule.message,
              value,
            })
          } else {
            errors.push({
              code: rule.name,
              message: rule.message,
              value,
              constraint: rule.type,
            })
          }
        }
      } catch (error) {
        errors.push({
          code: 'VALIDATION_ERROR',
          message: `验证规则执行失败: ${rule.name}`,
          value,
        })
      }
    }

    return { errors, warnings }
  }

  /**
   * 评估验证规则
   */
  private static evaluateValidationRule(value: any, rule: ValidationRule): boolean {
    switch (rule.type) {
      case 'required':
        return !this.isEmpty(value)

      case 'type':
        // 类型验证已在validateType中处理
        return true

      case 'format':
        // 格式验证逻辑
        if (rule.condition) {
          const regex = new RegExp(rule.condition)
          return regex.test(String(value))
        }
        return true

      case 'range':
        // 范围验证逻辑
        if (rule.condition) {
          const [min, max] = rule.condition.split(',').map(Number)
          const numValue = Number(value)
          return numValue >= min && numValue <= max
        }
        return true

      case 'custom':
        // 自定义验证逻辑
        // 这里可以调用注册的自定义验证函数
        return true

      default:
        return true
    }
  }

  /**
   * 检查值是否为空
   */
  private static isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0)
    )
  }

  /**
   * 标准化属性值
   */
  private static normalizeValue(value: any, schema: PropSchema): any {
    if (this.isEmpty(value)) {
      return schema.defaultValue !== undefined ? schema.defaultValue : value
    }

    // 根据类型进行值标准化
    switch (schema.type) {
      case PropType.NUMBER:
        const numValue = Number(value)
        return isNaN(numValue) ? value : numValue

      case PropType.BOOLEAN:
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true' || value === '1'
        }
        return Boolean(value)

      case PropType.STRING:
      case PropType.COLOR:
      case PropType.URL:
      case PropType.EMAIL:
        return String(value)

      default:
        return value
    }
  }
}

// ============================================================================
// 响应式属性管理器
// ============================================================================

/**
 * 响应式属性管理器
 * 处理不同断点下的属性配置
 */
export class ResponsivePropManager {
  /**
   * 创建响应式属性配置
   */
  static createResponsiveProp<T>(
    baseValue: T,
    breakpointValues: ResponsiveValue<T> = {}
  ): ResponsiveValue<T> {
    return {
      [Breakpoint.XS]: baseValue,
      ...breakpointValues,
    }
  }

  /**
   * 获取指定断点的属性值
   */
  static getValueForBreakpoint<T>(
    responsiveValue: ResponsiveValue<T> | T,
    breakpoint: Breakpoint
  ): T {
    if (
      typeof responsiveValue !== 'object' ||
      responsiveValue === null ||
      !('xs' in responsiveValue)
    ) {
      return responsiveValue as T
    }

    const respValue = responsiveValue as ResponsiveValue<T>
    const breakpoints = [
      Breakpoint.XXL,
      Breakpoint.XL,
      Breakpoint.LG,
      Breakpoint.MD,
      Breakpoint.SM,
      Breakpoint.XS,
    ]

    for (const bp of breakpoints) {
      if (respValue[bp] !== undefined && bp <= breakpoint) {
        return respValue[bp]!
      }
    }

    // 返回基础值 (XS断点的值)
    return (
      respValue[Breakpoint.XS] ??
      respValue[Breakpoint.SM] ??
      respValue[Breakpoint.MD] ??
      respValue[Breakpoint.LG] ??
      respValue[Breakpoint.XL] ??
      respValue[Breakpoint.XXL]!
    )
  }

  /**
   * 设置指定断点的属性值
   */
  static setValueForBreakpoint<T>(
    responsiveValue: ResponsiveValue<T>,
    breakpoint: Breakpoint,
    value: T
  ): ResponsiveValue<T> {
    return {
      ...responsiveValue,
      [breakpoint]: value,
    }
  }

  /**
   * 合并两个响应式属性配置
   */
  static mergeResponsiveProps<T>(
    base: ResponsiveValue<T> | T,
    override: ResponsiveValue<T> | T
  ): ResponsiveValue<T> {
    const baseResponsive =
      typeof base === 'object' && base !== null && 'xs' in base
        ? (base as ResponsiveValue<T>)
        : { [Breakpoint.XS]: base as T }
    const overrideResponsive =
      typeof override === 'object' && override !== null && 'xs' in override
        ? (override as ResponsiveValue<T>)
        : { [Breakpoint.XS]: override as T }

    return {
      ...baseResponsive,
      ...overrideResponsive,
    }
  }

  /**
   * 生成响应式CSS样式
   */
  static generateResponsiveCSS(
    property: string,
    responsiveValue: ResponsiveValue<string | number>
  ): string {
    const cssRules: string[] = []

    const breakpoints = [
      { name: 'xs', query: '', value: responsiveValue[Breakpoint.XS] },
      { name: 'sm', query: '@media (min-width: 640px)', value: responsiveValue[Breakpoint.SM] },
      { name: 'md', query: '@media (min-width: 768px)', value: responsiveValue[Breakpoint.MD] },
      { name: 'lg', query: '@media (min-width: 1024px)', value: responsiveValue[Breakpoint.LG] },
      { name: 'xl', query: '@media (min-width: 1280px)', value: responsiveValue[Breakpoint.XL] },
      { name: '2xl', query: '@media (min-width: 1536px)', value: responsiveValue[Breakpoint.XXL] },
    ]

    for (const bp of breakpoints) {
      if (bp.value !== undefined) {
        const cssRule = `${bp.query ? `${bp.query} { ` : ''}${property}: ${bp.value}${bp.query ? ' }' : ''}`
        cssRules.push(cssRule)
      }
    }

    return cssRules.join('\n')
  }
}

// ============================================================================
// 属性依赖关系管理器
// ============================================================================

/**
 * 属性依赖关系管理器
 * 处理属性间的依赖关系和联动效果
 */
export class PropDependencyManager {
  /**
   * 评估属性依赖条件
   */
  static evaluateDependency(sourceValue: any, condition: PropertyDependency['condition']): boolean {
    if (!condition) return false

    const { operator, value, customFunction } = condition

    // 如果有自定义函数，优先使用
    if (customFunction) {
      try {
        // 这里需要调用注册的自定义函数
        // return customFunction(sourceValue, value)
        return true // 简化实现
      } catch (error) {
        console.warn(`自定义依赖函数执行失败: ${customFunction}`, error)
        return false
      }
    }

    // 根据操作符进行条件判断
    switch (operator) {
      case 'eq':
        return sourceValue === value

      case 'ne':
        return sourceValue !== value

      case 'gt':
        return Number(sourceValue) > Number(value)

      case 'gte':
        return Number(sourceValue) >= Number(value)

      case 'lt':
        return Number(sourceValue) < Number(value)

      case 'lte':
        return Number(sourceValue) <= Number(value)

      case 'in':
        return Array.isArray(value) && value.includes(sourceValue)

      case 'not_in':
        return Array.isArray(value) && !value.includes(sourceValue)

      case 'contains':
        return String(sourceValue).includes(String(value))

      case 'not_contains':
        return !String(sourceValue).includes(String(value))

      case 'regex':
        try {
          const regex = new RegExp(String(value))
          return regex.test(String(sourceValue))
        } catch {
          return false
        }

      default:
        return false
    }
  }

  /**
   * 执行依赖动作
   */
  static executeDependencyAction<T>(
    currentValue: T,
    action: PropertyDependency['action'],
    allProps: Record<string, any>
  ): T {
    switch (action.type) {
      case 'show':
      case 'hide':
      case 'enable':
      case 'disable':
        // 这些动作由UI组件处理，不修改属性值
        return currentValue

      case 'set_value':
        return action.value !== undefined ? action.value : currentValue

      case 'clear_value':
        return null as any

      case 'add_validation':
      case 'remove_validation':
        // 这些动作影响验证规则，由验证系统处理
        return currentValue

      case 'update_options':
        // 这个动作影响选项列表，由编辑器组件处理
        return currentValue

      default:
        return currentValue
    }
  }

  /**
   * 检查属性是否应该显示
   */
  static shouldShowProp(
    propName: string,
    allProps: Record<string, any>,
    dependencies: PropertyDependency[]
  ): boolean {
    const relevantDeps = dependencies.filter(
      dep => dep.sourceProperty === propName && dep.action.type === 'show'
    )

    // 如果有显示依赖，检查是否满足条件
    if (relevantDeps.length > 0) {
      return relevantDeps.some(dep =>
        this.evaluateDependency(allProps[dep.sourceProperty], dep.condition)
      )
    }

    // 检查是否有隐藏依赖
    const hideDeps = dependencies.filter(
      dep => dep.sourceProperty === propName && dep.action.type === 'hide'
    )
    if (hideDeps.length > 0) {
      return !hideDeps.some(dep =>
        this.evaluateDependency(allProps[dep.sourceProperty], dep.condition)
      )
    }

    return true // 默认显示
  }

  /**
   * 检查属性是否应该启用
   */
  static shouldEnableProp(
    propName: string,
    allProps: Record<string, any>,
    dependencies: PropertyDependency[]
  ): boolean {
    const relevantDeps = dependencies.filter(
      dep => dep.sourceProperty === propName && dep.action.type === 'enable'
    )

    // 如果有启用依赖，检查是否满足条件
    if (relevantDeps.length > 0) {
      return relevantDeps.some(dep =>
        this.evaluateDependency(allProps[dep.sourceProperty], dep.condition)
      )
    }

    // 检查是否有禁用依赖
    const disableDeps = dependencies.filter(
      dep => dep.sourceProperty === propName && dep.action.type === 'disable'
    )
    if (disableDeps.length > 0) {
      return !disableDeps.some(dep =>
        this.evaluateDependency(allProps[dep.sourceProperty], dep.condition)
      )
    }

    return true // 默认启用
  }

  /**
   * 处理属性值变化后的依赖更新
   */
  static handlePropChange(
    changedProp: string,
    newValue: any,
    allProps: Record<string, any>,
    schemas: PropSchema[]
  ): Record<string, any> {
    const updatedProps = { ...allProps }

    // 找到所有依赖此属性的其他属性
    for (const schema of schemas) {
      if (schema.dependencies) {
        for (const dep of schema.dependencies) {
          if (dep.sourceProperty === changedProp) {
            const conditionMet = this.evaluateDependency(newValue, dep.condition)

            if (conditionMet) {
              // 执行依赖动作
              updatedProps[schema.name] = this.executeDependencyAction(
                updatedProps[schema.name],
                dep.action,
                updatedProps
              )
            }
          }
        }
      }
    }

    return updatedProps
  }
}

// ============================================================================
// 属性编辑器配置生成器
// ============================================================================

/**
 * 属性编辑器配置生成器
 * 根据属性模式生成编辑器配置
 */
export class PropEditorConfigGenerator {
  /**
   * 生成默认编辑器配置
   */
  static generateDefaultEditorConfig(type: PropType): EditorConfig {
    const baseConfig: EditorConfig = {
      widget: this.getDefaultWidget(type),
      label: '',
      description: '',
    }

    switch (type) {
      case PropType.STRING:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: '请输入文本',
        }

      case PropType.NUMBER:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: '请输入数字',
        }

      case PropType.BOOLEAN:
        return {
          ...baseConfig,
          widget: 'switch',
        }

      case PropType.COLOR:
        return {
          ...baseConfig,
          widget: 'color',
        }

      case PropType.DATE:
        return {
          ...baseConfig,
          widget: 'date',
        }

      case PropType.TIME:
        return {
          ...baseConfig,
          widget: 'time',
        }

      case PropType.URL:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: 'https://example.com',
        }

      case PropType.EMAIL:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: 'user@example.com',
        }

      case PropType.SELECT:
        return {
          ...baseConfig,
          widget: 'select',
          options: [],
        }

      case PropType.MULTI_SELECT:
        return {
          ...baseConfig,
          widget: 'select',
          options: [],
        }

      case PropType.RADIO:
        return {
          ...baseConfig,
          widget: 'radio',
          options: [],
        }

      case PropType.CHECKBOX:
        return {
          ...baseConfig,
          widget: 'checkbox',
        }

      case PropType.ARRAY:
        return {
          ...baseConfig,
          widget: 'custom',
          customWidget: 'ArrayEditor',
        }

      case PropType.OBJECT:
        return {
          ...baseConfig,
          widget: 'custom',
          customWidget: 'ObjectEditor',
        }

      case PropType.JSON:
        return {
          ...baseConfig,
          widget: 'textarea',
          placeholder: '请输入JSON格式的数据',
        }

      case PropType.SIZE:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: '请输入尺寸 (如: 100px, 50%, auto)',
        }

      case PropType.SPACING:
        return {
          ...baseConfig,
          widget: 'custom',
          customWidget: 'SpacingEditor',
        }

      case PropType.BORDER:
        return {
          ...baseConfig,
          widget: 'custom',
          customWidget: 'BorderEditor',
        }

      case PropType.SHADOW:
        return {
          ...baseConfig,
          widget: 'input',
          placeholder: '请输入阴影值 (如: 0 2px 4px rgba(0,0,0,0.1))',
        }

      case PropType.RESPONSIVE_SIZE:
      case PropType.RESPONSIVE_SPACING:
        return {
          ...baseConfig,
          widget: 'custom',
          customWidget: 'ResponsiveEditor',
        }

      default:
        return baseConfig
    }
  }

  /**
   * 根据属性类型获取默认控件
   */
  private static getDefaultWidget(type: PropType): EditorConfig['widget'] {
    const widgetMap: Record<PropType, EditorConfig['widget']> = {
      [PropType.STRING]: 'input',
      [PropType.NUMBER]: 'input',
      [PropType.BOOLEAN]: 'switch',
      [PropType.COLOR]: 'color',
      [PropType.DATE]: 'date',
      [PropType.TIME]: 'time',
      [PropType.URL]: 'input',
      [PropType.EMAIL]: 'input',
      [PropType.SELECT]: 'select',
      [PropType.MULTI_SELECT]: 'select',
      [PropType.RADIO]: 'radio',
      [PropType.CHECKBOX]: 'checkbox',
      [PropType.ARRAY]: 'custom',
      [PropType.OBJECT]: 'custom',
      [PropType.JSON]: 'textarea',
      [PropType.SIZE]: 'input',
      [PropType.SPACING]: 'custom',
      [PropType.BORDER]: 'custom',
      [PropType.SHADOW]: 'input',
      [PropType.RESPONSIVE_SIZE]: 'custom',
      [PropType.RESPONSIVE_SPACING]: 'custom',
    }

    return widgetMap[type] || 'input'
  }

  /**
   * 合并用户配置和默认配置
   */
  static mergeEditorConfig(
    defaultConfig: EditorConfig,
    userConfig?: Partial<EditorConfig>
  ): EditorConfig {
    if (!userConfig) {
      return defaultConfig
    }

    return {
      ...defaultConfig,
      ...userConfig,
      widgetProps: {
        ...defaultConfig.widgetProps,
        ...userConfig.widgetProps,
      },
    }
  }
}

// ============================================================================
// 属性默认值处理器
// ============================================================================

/**
 * 属性默认值处理器
 * 处理属性的默认值设置和获取
 */
export class PropDefaultValueHandler {
  /**
   * 获取属性的默认值
   */
  static getDefaultValue(schema: PropSchema): any {
    if (schema.defaultValue !== undefined) {
      return schema.defaultValue
    }

    // 根据属性类型生成默认值
    switch (schema.type) {
      case PropType.STRING:
      case PropType.COLOR:
      case PropType.URL:
      case PropType.EMAIL:
      case PropType.DATE:
      case PropType.TIME:
      case PropType.SIZE:
      case PropType.SHADOW:
        return ''

      case PropType.NUMBER:
        return 0

      case PropType.BOOLEAN:
      case PropType.CHECKBOX:
        return false

      case PropType.SELECT:
      case PropType.RADIO:
        // 返回第一个选项的值
        return schema.options && schema.options.length > 0 ? schema.options[0].value : ''

      case PropType.MULTI_SELECT:
        return []

      case PropType.ARRAY:
        return []

      case PropType.OBJECT:
        return {}

      case PropType.JSON:
        return null

      case PropType.SPACING:
        return { all: 0 }

      case PropType.BORDER:
        return {
          width: 1,
          style: 'solid',
          color: '#000000',
        }

      case PropType.RESPONSIVE_SIZE:
      case PropType.RESPONSIVE_SPACING:
        return {}

      default:
        return null
    }
  }

  /**
   * 生成完整的默认属性值对象
   */
  static generateDefaultProps(schemas: PropSchema[]): Record<string, any> {
    const defaultProps: Record<string, any> = {}

    for (const schema of schemas) {
      if (!schema.required) {
        // 非必填属性不设置默认值，除非有明确的默认值
        if (schema.defaultValue !== undefined) {
          defaultProps[schema.name] = schema.defaultValue
        }
      } else {
        // 必填属性必须有默认值
        defaultProps[schema.name] = this.getDefaultValue(schema)
      }
    }

    return defaultProps
  }

  /**
   * 合并用户属性值和默认值
   */
  static mergeWithDefaults(
    userProps: Record<string, any>,
    schemas: PropSchema[]
  ): Record<string, any> {
    const defaultProps = this.generateDefaultProps(schemas)

    return {
      ...defaultProps,
      ...userProps,
    }
  }

  /**
   * 清理属性值（移除空值和默认值）
   */
  static cleanProps(props: Record<string, any>, schemas: PropSchema[]): Record<string, any> {
    const cleanedProps: Record<string, any> = {}

    for (const schema of schemas) {
      const value = props[schema.name]
      const defaultValue = this.getDefaultValue(schema)

      // 如果值等于默认值，则不包含在清理后的属性中
      if (value !== undefined && value !== defaultValue) {
        cleanedProps[schema.name] = value
      }
    }

    return cleanedProps
  }
}

// ============================================================================
// 主要导出类 - 属性定义管理器
// ============================================================================

/**
 * 属性定义管理器
 * 整合所有属性定义、验证、响应式配置和依赖管理功能
 */
export class PropDefinitionManager {
  private schemas: Map<string, PropSchema[]> = new Map()
  private customValidators: Map<string, (value: any) => boolean> = new Map()

  /**
   * 注册组件属性模式
   */
  registerComponentSchemas(componentId: string, schemas: PropSchema[]): void {
    this.schemas.set(componentId, schemas)
  }

  /**
   * 获取组件属性模式
   */
  getComponentSchemas(componentId: string): PropSchema[] {
    return this.schemas.get(componentId) || []
  }

  /**
   * 获取单个属性模式
   */
  getPropSchema(componentId: string, propName: string): PropSchema | undefined {
    const schemas = this.getComponentSchemas(componentId)
    return schemas.find(schema => schema.name === propName)
  }

  /**
   * 验证组件属性值
   */
  validateComponentProps(
    componentId: string,
    props: Record<string, any>
  ): {
    valid: boolean
    errors: ValidationError[]
    warnings: ValidationWarning[]
    cleanedProps: Record<string, any>
  } {
    const schemas = this.getComponentSchemas(componentId)
    const allErrors: ValidationError[] = []
    const allWarnings: ValidationWarning[] = []
    const cleanedProps: Record<string, any> = {}

    for (const schema of schemas) {
      const value = props[schema.name]
      const result = PropValidator.validateProp(value, schema)

      if (!result.valid) {
        allErrors.push(...result.errors)
      }
      allWarnings.push(...result.warnings)

      // 使用验证后的值
      cleanedProps[schema.name] = result.value
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      cleanedProps,
    }
  }

  /**
   * 注册自定义验证器
   */
  registerCustomValidator(name: string, validator: (value: any) => boolean): void {
    this.customValidators.set(name, validator)
  }

  /**
   * 处理属性变化和依赖更新
   */
  handlePropChange(
    componentId: string,
    changedProp: string,
    newValue: any,
    currentProps: Record<string, any>
  ): Record<string, any> {
    const schemas = this.getComponentSchemas(componentId)

    // 更新变化的属性
    const updatedProps = { ...currentProps, [changedProp]: newValue }

    // 处理依赖关系
    return PropDependencyManager.handlePropChange(changedProp, newValue, updatedProps, schemas)
  }

  /**
   * 生成属性编辑器配置
   */
  generateEditorConfigs(componentId: string): Record<string, EditorConfig> {
    const schemas = this.getComponentSchemas(componentId)
    const configs: Record<string, EditorConfig> = {}

    for (const schema of schemas) {
      const defaultConfig = PropEditorConfigGenerator.generateDefaultEditorConfig(schema.type)
      configs[schema.name] = PropEditorConfigGenerator.mergeEditorConfig(
        defaultConfig,
        schema.editorConfig
      )
    }

    return configs
  }

  /**
   * 生成组件默认属性值
   */
  generateDefaultProps(componentId: string): Record<string, any> {
    const schemas = this.getComponentSchemas(componentId)
    return PropDefaultValueHandler.generateDefaultProps(schemas)
  }
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 创建属性模式的辅助函数
 */
export function createPropSchema(
  config: Partial<PropSchema> & Required<Pick<PropSchema, 'name' | 'type' | 'componentId'>>
): PropSchema {
  const now = new Date()

  return {
    id: config.id || `${config.componentId}-${config.name}`,
    componentId: config.componentId,
    name: config.name,
    type: config.type,
    label: config.label || config.name,
    description: config.description,
    required: config.required ?? false,
    defaultValue: config.defaultValue,
    group: config.group || 'basic',
    category: config.category ?? PropCategory.BASIC,
    order: config.order ?? 0,
    displayHints: config.displayHints,
    options: config.options,
    constraints: config.constraints,
    validation: config.validation,
    editorConfig:
      config.editorConfig || PropEditorConfigGenerator.generateDefaultEditorConfig(config.type),
    responsive: config.responsive ?? false,
    breakpoints: config.breakpoints,
    dependencies: config.dependencies,
    createdAt: config.createdAt ?? now,
    updatedAt: config.updatedAt ?? now,
  }
}

/**
 * 验证属性模式的有效性
 */
export function validatePropSchema(schema: PropSchema): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 基础字段验证
  if (!schema.id) errors.push('属性ID不能为空')
  if (!schema.name) errors.push('属性名称不能为空')
  if (!schema.label) errors.push('属性标签不能为空')
  if (!schema.componentId) errors.push('组件ID不能为空')

  // 类型验证
  if (!Object.values(PropType).includes(schema.type)) {
    errors.push(`无效的属性类型: ${schema.type}`)
  }

  // 类别验证
  if (!Object.values(PropCategory).includes(schema.category)) {
    errors.push(`无效的属性类别: ${schema.category}`)
  }

  // 选项验证
  if (schema.options && schema.options.length === 0) {
    errors.push('选择类型属性必须有选项')
  }

  // 编辑器配置验证
  if (!schema.editorConfig || !schema.editorConfig.widget) {
    errors.push('编辑器配置无效')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
