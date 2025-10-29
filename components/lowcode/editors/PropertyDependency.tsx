/**
 * 属性依赖管理组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 */

import React, { useMemo, useCallback } from 'react'
import { PropertyDefinition, PropertyCondition } from '@/types/lowcode/property'
import { ComponentProps } from '@/types/lowcode/component'

// 依赖条件操作符
export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_equal'
  | 'less_equal'
  | 'in'
  | 'not_in'
  | 'empty'
  | 'not_empty'

// 扩展的条件接口
export interface ExtendedPropertyCondition {
  property: string
  operator?: ConditionOperator
  value?: unknown
  values?: unknown[]
  customCheck?: (value: unknown) => boolean
}

// 依赖规则
export interface DependencyRule {
  // 目标属性（需要显示/隐藏的属性）
  targetProperty: string

  // 条件列表（AND关系）
  conditions: ExtendedPropertyCondition[]

  // 条件逻辑（AND或OR）
  logic?: 'and' | 'or'

  // 满足条件时的行为
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional'

  // 自定义判断函数
  customCheck?: (properties: ComponentProps) => boolean
}

// 依赖管理Hook
export function usePropertyDependency(
  properties: ComponentProps,
  propertyDefinitions: PropertyDefinition[]
) {
  // 构建依赖关系图
  const dependencyGraph = useMemo(() => {
    const graph: Record<string, DependencyRule[]> = {}

    propertyDefinitions.forEach(definition => {
      if (definition.conditional) {
        const rule: DependencyRule = {
          targetProperty: definition.key,
          conditions: [definition.conditional],
          action: 'show',
        }

        const sourceProperty = definition.conditional.property
        if (!graph[sourceProperty]) {
          graph[sourceProperty] = []
        }
        graph[sourceProperty].push(rule)
      }
    })

    return graph
  }, [propertyDefinitions])

  // 检查单个条件
  const checkCondition = useCallback(
    (propertyValue: unknown, condition: ExtendedPropertyCondition): boolean => {
      const { operator = 'equals', value, values } = condition

      switch (operator) {
        case 'equals':
          return propertyValue === value

        case 'not_equals':
          return propertyValue !== value

        case 'contains':
          return String(propertyValue).includes(String(value))

        case 'not_contains':
          return !String(propertyValue).includes(String(value))

        case 'greater_than':
          return Number(propertyValue) > Number(value)

        case 'less_than':
          return Number(propertyValue) < Number(value)

        case 'greater_equal':
          return Number(propertyValue) >= Number(value)

        case 'less_equal':
          return Number(propertyValue) <= Number(value)

        case 'in':
          return values ? values.includes(propertyValue) : false

        case 'not_in':
          return values ? !values.includes(propertyValue) : true

        case 'empty':
          return propertyValue === undefined || propertyValue === null || propertyValue === ''

        case 'not_empty':
          return propertyValue !== undefined && propertyValue !== null && propertyValue !== ''

        default:
          return propertyValue === value
      }
    },
    []
  )

  // 检查依赖规则
  const checkDependencyRule = useCallback(
    (rule: DependencyRule, currentProperties: ComponentProps): boolean => {
      // 如果有自定义检查函数，优先使用
      if (rule.customCheck) {
        return rule.customCheck(currentProperties)
      }

      const { conditions, logic = 'and' } = rule

      if (logic === 'or') {
        // OR关系：任一条件满足即可
        return conditions.some(condition => {
          const propertyValue = (currentProperties as any)[condition.property]
          return checkCondition(propertyValue, condition)
        })
      } else {
        // AND关系：所有条件都需要满足
        return conditions.every(condition => {
          const propertyValue = (currentProperties as any)[condition.property]
          return checkCondition(propertyValue, condition)
        })
      }
    },
    [checkCondition]
  )

  // 获取属性的可见性
  const getPropertyVisibility = useCallback(
    (propertyKey: string): boolean => {
      const definition = propertyDefinitions.find(def => def.key === propertyKey)
      if (!definition || !definition.conditional) {
        return true
      }

      const condition = definition.conditional
      const propertyValue = (properties as any)[condition.property]
      return checkCondition(propertyValue, condition)
    },
    [properties, propertyDefinitions, checkCondition]
  )

  // 获取属性的可用性
  const getPropertyEnabled = useCallback((propertyKey: string): boolean => {
    // 这里可以扩展实现disable逻辑
    return true
  }, [])

  // 获取属性的必填性
  const getPropertyRequired = useCallback(
    (propertyKey: string): boolean => {
      const definition = propertyDefinitions.find(def => def.key === propertyKey)
      if (!definition) {
        return false
      }

      // 基础必填属性
      if (definition.required) {
        return true
      }

      // 检查是否有条件必填规则
      // 这里可以扩展实现更复杂的必填逻辑
      return false
    },
    [propertyDefinitions]
  )

  // 获取受影响的属性列表
  const getAffectedProperties = useCallback(
    (changedProperty: string): string[] => {
      const affected = dependencyGraph[changedProperty] || []
      return affected.map(rule => rule.targetProperty)
    },
    [dependencyGraph]
  )

  // 获取依赖的属性列表
  const getDependencyProperties = useCallback(
    (targetProperty: string): string[] => {
      const definition = propertyDefinitions.find(def => def.key === targetProperty)
      if (!definition || !definition.conditional) {
        return []
      }

      return [definition.conditional.property]
    },
    [propertyDefinitions]
  )

  // 过滤可见属性
  const getVisibleProperties = useCallback(
    (definitions: PropertyDefinition[]): PropertyDefinition[] => {
      return definitions.filter(definition => getPropertyVisibility(definition.key))
    },
    [getPropertyVisibility]
  )

  // 获取属性状态
  const getPropertyStates = useCallback(() => {
    const states: Record<
      string,
      {
        visible: boolean
        enabled: boolean
        required: boolean
      }
    > = {}

    propertyDefinitions.forEach(definition => {
      states[definition.key] = {
        visible: getPropertyVisibility(definition.key),
        enabled: getPropertyEnabled(definition.key),
        required: getPropertyRequired(definition.key),
      }
    })

    return states
  }, [propertyDefinitions, getPropertyVisibility, getPropertyEnabled, getPropertyRequired])

  return {
    // 核心方法
    getPropertyVisibility,
    getPropertyEnabled,
    getPropertyRequired,
    checkDependencyRule,
    getAffectedProperties,
    getDependencyProperties,
    getVisibleProperties,
    getPropertyStates,

    // 工具方法
    checkCondition,
    dependencyGraph,
  }
}

// 条件构建器
export class ConditionBuilder {
  static equals(property: string, value: unknown): ExtendedPropertyCondition {
    return { property, operator: 'equals', value }
  }

  static notEquals(property: string, value: unknown): ExtendedPropertyCondition {
    return { property, operator: 'not_equals', value }
  }

  static contains(property: string, value: string): ExtendedPropertyCondition {
    return { property, operator: 'contains', value }
  }

  static greaterThan(property: string, value: number): ExtendedPropertyCondition {
    return { property, operator: 'greater_than', value }
  }

  static lessThan(property: string, value: number): ExtendedPropertyCondition {
    return { property, operator: 'less_than', value }
  }

  static in(property: string, values: unknown[]): ExtendedPropertyCondition {
    return { property, operator: 'in', values }
  }

  static notIn(property: string, values: unknown[]): ExtendedPropertyCondition {
    return { property, operator: 'not_in', values }
  }

  static empty(property: string): ExtendedPropertyCondition {
    return { property, operator: 'empty' }
  }

  static notEmpty(property: string): ExtendedPropertyCondition {
    return { property, operator: 'not_empty' }
  }

  static custom(property: string, check: (value: unknown) => boolean): ExtendedPropertyCondition {
    return {
      property,
      operator: 'equals',
      customCheck: check,
    }
  }
}

// 常用依赖规则
export const COMMON_DEPENDENCIES = {
  // 按钮类型相关
  buttonType: {
    showLoading: ConditionBuilder.equals('variant', 'loading'),
    showIcon: ConditionBuilder.notEquals('icon', ''),
    showOnClick: ConditionBuilder.notEmpty('onClick'),
  },

  // 图片相关
  imageSrc: {
    showAlt: ConditionBuilder.notEmpty('src'),
    showObjectFit: ConditionBuilder.notEmpty('src'),
  },

  // 输入框相关
  inputType: {
    showPattern: ConditionBuilder.equals('type', 'text'),
    showMaxLength: ConditionBuilder.in('type', ['text', 'password', 'email']),
    showPlaceholder: ConditionBuilder.in('type', ['text', 'email', 'password', 'number']),
  },

  // 布局相关
  flexDirection: {
    showJustifyContent: ConditionBuilder.in('direction', ['row', 'column']),
    showAlignItems: ConditionBuilder.in('direction', ['row', 'column']),
    showWrap: ConditionBuilder.notEmpty('direction'),
  },

  // 边框相关
  borderEnabled: {
    showBorderOptions: ConditionBuilder.equals('enabled', true),
  },

  // 阴影相关
  shadowEnabled: {
    showShadowOptions: ConditionBuilder.equals('enabled', true),
  },
} as const

// 依赖规则验证器
export function validateDependencyRules(
  rules: DependencyRule[],
  propertyDefinitions: PropertyDefinition[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  rules.forEach((rule, index) => {
    // 检查目标属性是否存在
    const targetExists = propertyDefinitions.some(def => def.key === rule.targetProperty)
    if (!targetExists) {
      errors.push(`规则 ${index + 1}: 目标属性 "${rule.targetProperty}" 不存在`)
    }

    // 检查条件属性是否存在
    rule.conditions.forEach((condition, conditionIndex) => {
      const sourceExists = propertyDefinitions.some(def => def.key === condition.property)
      if (!sourceExists) {
        errors.push(
          `规则 ${index + 1}, 条件 ${conditionIndex + 1}: 源属性 "${condition.property}" 不存在`
        )
      }

      // 检查操作符是否有效
      if (condition.operator && !isValidOperator(condition.operator)) {
        errors.push(
          `规则 ${index + 1}, 条件 ${conditionIndex + 1}: 无效的操作符 "${condition.operator}"`
        )
      }
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function isValidOperator(operator: string): operator is ConditionOperator {
  return [
    'equals',
    'not_equals',
    'contains',
    'not_contains',
    'greater_than',
    'less_than',
    'greater_equal',
    'less_equal',
    'in',
    'not_in',
    'empty',
    'not_empty',
  ].includes(operator)
}
