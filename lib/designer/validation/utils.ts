/**
 * 验证工具函数
 * 提供验证相关的辅助函数
 */

import type { PropertyValue, PropertyDependency, ValidationContext } from '@/types/designer'
import type { ValidationError } from './ValidationEngine'

/**
 * 验证属性依赖条件
 */
export async function validateDependencies(
  propertyPath: string,
  value: PropertyValue,
  dependencies: PropertyDependency[],
  context: ValidationContext
): Promise<ValidationError[]> {
  const errors: ValidationError[] = []

  for (const dependency of dependencies) {
    const isConditionMet = evaluateCondition(dependency.condition, context.allProperties || {})

    switch (dependency.effect) {
      case 'require':
        if (isConditionMet && isEmpty(value)) {
          errors.push({
            propertyPath,
            message: `${propertyPath}在当前条件下是必填的`,
            code: 'DEPENDENCY_REQUIRED',
            severity: 'error',
          })
        }
        break

      case 'show':
        // 显示逻辑由UI层处理，这里不需要验证
        break

      case 'hide':
        // 隐藏逻辑由UI层处理，这里不需要验证
        break

      case 'enable':
        // 启用逻辑由UI层处理，这里不需要验证
        break

      case 'disable':
        // 禁用逻辑由UI层处理，这里不需要验证
        break

      case 'optional':
        // 可选逻辑由UI层处理，这里不需要验证
        break
    }
  }

  return errors
}

/**
 * 评估条件表达式
 */
export function evaluateCondition(
  condition: import('@/types/designer').PropertyCondition,
  allProperties: Record<string, PropertyValue>
): boolean {
  const conditionValue = allProperties[condition.property]

  switch (condition.operator) {
    case 'eq':
      return conditionValue === condition.value

    case 'ne':
      return conditionValue !== condition.value

    case 'gt':
      return typeof conditionValue === 'number' &&
             typeof condition.value === 'number' &&
             conditionValue > condition.value

    case 'gte':
      return typeof conditionValue === 'number' &&
             typeof condition.value === 'number' &&
             conditionValue >= condition.value

    case 'lt':
      return typeof conditionValue === 'number' &&
             typeof condition.value === 'number' &&
             conditionValue < condition.value

    case 'lte':
      return typeof conditionValue === 'number' &&
             typeof condition.value === 'number' &&
             conditionValue <= condition.value

    case 'contains':
      if (Array.isArray(conditionValue)) {
        return conditionValue.includes(condition.value)
      }
      if (typeof conditionValue === 'string') {
        return conditionValue.includes(String(condition.value))
      }
      return false

    case 'startsWith':
      if (typeof conditionValue === 'string') {
        return conditionValue.startsWith(String(condition.value))
      }
      return false

    case 'endsWith':
      if (typeof conditionValue === 'string') {
        return conditionValue.endsWith(String(condition.value))
      }
      return false

    case 'in':
      if (Array.isArray(condition.value)) {
        return condition.value.includes(conditionValue)
      }
      return false

    case 'notIn':
      if (Array.isArray(condition.value)) {
        return !condition.value.includes(conditionValue)
      }
      return true

    case 'between':
      if (typeof conditionValue === 'number' &&
          typeof condition.value === 'number' &&
          typeof condition.value2 === 'number') {
        return conditionValue >= condition.value && conditionValue <= condition.value2
      }
      return false

    case 'regex':
      if (typeof conditionValue === 'string' && typeof condition.value === 'string') {
        return new RegExp(condition.value).test(conditionValue)
      }
      return false

    case 'exists':
      return conditionValue !== undefined && conditionValue !== null

    case 'empty':
      return isEmpty(conditionValue)

    case 'notEmpty':
      return !isEmpty(conditionValue)

    default:
      return false
  }
}

/**
 * 检查值是否为空
 */
export function isEmpty(value: PropertyValue): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  )
}

/**
 * 格式化验证错误消息
 */
export function formatValidationError(error: ValidationError, propertyDefinitions?: Record<string, import('@/types/designer').PropertyDefinition>): string {
  const propertyDef = propertyDefinitions?.[error.propertyPath]
  const propertyName = propertyDef?.name || error.propertyPath

  return error.message.replace(/{property}/g, propertyName)
}

/**
 * 将验证错误转换为表单错误格式
 */
export function convertToFormErrors(
  validationErrors: ValidationError[]
): Record<string, string> {
  const formErrors: Record<string, string> = {}

  validationErrors.forEach(error => {
    if (error.severity === 'error') {
      formErrors[error.propertyPath] = error.message
    }
  })

  return formErrors
}

/**
 * 检查验证是否通过
 */
export function isValidationValid(errors: ValidationError[]): boolean {
  return errors.filter(error => error.severity === 'error').length === 0
}

/**
 * 按严重程度分组验证错误
 */
export function groupErrorsBySeverity(errors: ValidationError[]): {
  errors: ValidationError[]
  warnings: ValidationError[]
} {
  return {
    errors: errors.filter(error => error.severity === 'error'),
    warnings: errors.filter(error => error.severity === 'warning'),
  }
}

/**
 * 获取错误摘要
 */
export function getErrorSummary(errors: ValidationError[]): {
  totalErrors: number
  totalWarnings: number
  properties: string[]
  criticalErrors: ValidationError[]
} {
  const { errors, warnings } = groupErrorsBySeverity(errors)
  const properties = Array.from(new Set(errors.map(error => error.propertyPath)))
  const criticalErrors = errors.filter(error =>
    error.code === 'REQUIRED' || error.code === 'VALIDATION_ERROR'
  )

  return {
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    properties,
    criticalErrors,
  }
}