/**
 * 页面设计器布局约束验证器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-27
 */

import {
  ComponentType,
  ComponentInstance,
  ComponentValidationResult,
  ValidationError,
  ValidationWarning,
  LayoutComponentType,
} from '@/types/page-designer/component'
import {
  LayoutConstraints,
  LayoutValidationResult,
  LayoutValidationError,
  LayoutValidationWarning,
  LayoutValidationSuggestion,
} from '@/types/page-designer/layout'

// 验证错误代码定义
export const VALIDATION_ERROR_CODES = {
  // 基础约束错误
  INVALID_PARENT: 'INVALID_PARENT',
  INVALID_CHILD: 'INVALID_CHILD',
  MAX_DEPTH_EXCEEDED: 'MAX_DEPTH_EXCEEDED',
  MAX_CHILDREN_EXCEEDED: 'MAX_CHILDREN_EXCEEDED',
  CIRCULAR_REFERENCE: 'CIRCULAR_REFERENCE',

  // 布局约束错误
  ROW_WITHOUT_COLS: 'ROW_WITHOUT_COLS',
  COL_WITHOUT_PARENT: 'COL_WITHOUT_PARENT',
  EMPTY_CONTAINER: 'EMPTY_CONTAINER',

  // 响应式约束错误
  RESPONSIVE_CONFLICT: 'RESPONSIVE_CONFLICT',
  BREAKPOINT_OVERFLOW: 'BREAKPOINT_OVERFLOW',

  // 性能约束错误
  TOO_MANY_COMPONENTS: 'TOO_MANY_COMPONENTS',
  DEEP_NESTING: 'DEEP_NESTING',

  // 栅格系统错误
  INVALID_GRID_SPAN: 'INVALID_GRID_SPAN',
  GRID_OVERFLOW: 'GRID_OVERFLOW',
} as const

export type ValidationErrorCode =
  (typeof VALIDATION_ERROR_CODES)[keyof typeof VALIDATION_ERROR_CODES]

// 默认布局约束配置
export const DEFAULT_LAYOUT_CONSTRAINTS: Record<string, LayoutConstraints> = {
  container: {
    allowedChildren: ['container', 'row', 'col', 'button', 'input', 'text', 'image'],
    canContainLayoutComponents: true,
    canContainBasicComponents: true,
    maxNestingLevel: 5,
    maxDirectChildren: 50,
    maxWidth: 1200,
    minWidth: 100,
  },

  row: {
    allowedChildren: ['col'],
    canContainLayoutComponents: true,
    canContainBasicComponents: false,
    maxNestingLevel: 3,
    maxDirectChildren: 12,
    maxWidth: 1200,
    minWidth: 100,
  },

  col: {
    allowedChildren: ['container', 'row', 'col', 'button', 'input', 'text', 'image'],
    canContainLayoutComponents: true,
    canContainBasicComponents: true,
    maxNestingLevel: 5,
    maxDirectChildren: 20,
    maxWidth: 1200,
    minWidth: 50,
  },
}

// 全局性能约束
export const GLOBAL_PERFORMANCE_CONSTRAINTS = {
  maxTotalComponents: 50, // 页面最大组件数量
  maxNestingDepth: 8, // 最大嵌套深度
  maxRowColumns: 12, // Row中最大列数
  componentRenderTimeout: 100, // 组件渲染超时时间(ms)
  layoutCalculationTimeout: 50, // 布局计算超时时间(ms)
}

// 布局约束验证器类
export class LayoutConstraintsValidator {
  private constraints: Map<string, LayoutConstraints>
  private componentRegistry: Map<string, any> // 组件注册表引用

  constructor() {
    this.constraints = new Map()
    this.componentRegistry = new Map()
    this.initializeDefaultConstraints()
  }

  // 初始化默认约束
  private initializeDefaultConstraints(): void {
    Object.entries(DEFAULT_LAYOUT_CONSTRAINTS).forEach(([type, constraint]) => {
      this.constraints.set(type, constraint)
    })
  }

  // 注册组件约束
  public registerConstraints(type: string, constraints: LayoutConstraints): void {
    this.constraints.set(type, constraints)
  }

  // 注册组件注册表引用
  public setComponentRegistry(registry: Map<string, any>): void {
    this.componentRegistry = registry
  }

  // 获取组件约束
  public getConstraints(type: string): LayoutConstraints | undefined {
    return this.constraints.get(type)
  }

  // 验证单个组件的布局约束
  public validateComponent(
    component: ComponentInstance,
    parentComponent?: ComponentInstance,
    siblings?: ComponentInstance[]
  ): LayoutValidationResult {
    const errors: LayoutValidationError[] = []
    const warnings: LayoutValidationWarning[] = []
    const suggestions: LayoutValidationSuggestion[] = []

    const componentType = component.component_type
    const constraints = this.getConstraints(componentType)

    if (!constraints) {
      // 如果没有找到约束，创建一个默认的宽松约束
      return this.createDefaultValidationResult(component)
    }

    // 1. 验证父子关系约束
    if (parentComponent) {
      this.validateParentChildRelation(component, parentComponent, errors, warnings)
    }

    // 2. 验证子组件约束
    if (siblings) {
      this.validateChildrenConstraints(
        component,
        siblings,
        constraints,
        errors,
        warnings,
        suggestions
      )
    }

    // 3. 验证嵌套深度
    this.validateNestingDepth(component, errors, warnings)

    // 4. 验证特定布局组件的约束
    this.validateSpecificLayoutConstraints(component, constraints, errors, warnings, suggestions)

    // 5. 验证性能约束
    this.validatePerformanceConstraints(component, errors, warnings)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    }
  }

  // 验证整个组件树的布局约束
  public validateComponentTree(
    components: Record<string, ComponentInstance>,
    rootId: string
  ): LayoutValidationResult {
    const allErrors: LayoutValidationError[] = []
    const allWarnings: LayoutValidationWarning[] = []
    const allSuggestions: LayoutValidationSuggestion[] = []

    // 检查全局性能约束
    const totalComponents = Object.keys(components).length
    if (totalComponents > GLOBAL_PERFORMANCE_CONSTRAINTS.maxTotalComponents) {
      allErrors.push({
        code: VALIDATION_ERROR_CODES.TOO_MANY_COMPONENTS,
        message: `页面组件数量 (${totalComponents}) 超过最大限制 (${GLOBAL_PERFORMANCE_CONSTRAINTS.maxTotalComponents})`,
        componentId: rootId,
        severity: 'error',
      })
    }

    // 验证每个组件
    Object.values(components).forEach(component => {
      const parentComponent = component.parent_id ? components[component.parent_id] : undefined
      const siblings = parentComponent
        ? Object.values(components).filter(
            c => c.parent_id === component.parent_id && c.id !== component.id
          )
        : []

      const result = this.validateComponent(component, parentComponent, siblings)
      allErrors.push(...result.errors)
      allWarnings.push(...result.warnings)
      if (result.suggestions) {
        allSuggestions.push(...result.suggestions)
      }
    })

    // 验证循环引用
    const circularCheck = this.detectCircularReferences(components, rootId)
    if (circularCheck.hasCircularReference) {
      allErrors.push({
        code: VALIDATION_ERROR_CODES.CIRCULAR_REFERENCE,
        message: '检测到循环引用，这会导致无限递归',
        componentId: circularCheck.componentId || rootId,
        severity: 'error',
      })
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      suggestions: allSuggestions,
    }
  }

  // 验证父子关系约束
  private validateParentChildRelation(
    component: ComponentInstance,
    parentComponent: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[]
  ): void {
    const parentConstraints = this.getConstraints(parentComponent.component_type)

    if (!parentConstraints) return

    // 检查子组件类型是否被允许
    if (parentConstraints.allowedChildren && parentConstraints.allowedChildren.length > 0) {
      const isAllowed = parentConstraints.allowedChildren.includes(component.component_type as any)

      if (!isAllowed) {
        errors.push({
          code: VALIDATION_ERROR_CODES.INVALID_CHILD,
          message: `组件类型 "${component.component_type}" 不能放置在 "${parentComponent.component_type}" 中`,
          componentId: component.id,
          parentId: parentComponent.id,
          severity: 'error',
          field: 'component_type',
        })
      }
    }

    // 特殊约束检查
    if (parentComponent.component_type === 'row' && component.component_type !== 'col') {
      errors.push({
        code: VALIDATION_ERROR_CODES.INVALID_CHILD,
        message: 'Row组件只能包含Col组件',
        componentId: component.id,
        parentId: parentComponent.id,
        severity: 'error',
      })
    }
  }

  // 验证子组件约束
  private validateChildrenConstraints(
    component: ComponentInstance,
    siblings: ComponentInstance[],
    constraints: LayoutConstraints,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[],
    suggestions: LayoutValidationSuggestion[]
  ): void {
    // 检查直接子组件数量
    if (constraints.maxDirectChildren && siblings.length >= constraints.maxDirectChildren) {
      errors.push({
        code: VALIDATION_ERROR_CODES.MAX_CHILDREN_EXCEEDED,
        message: `直接子组件数量 (${siblings.length + 1}) 超过最大限制 (${constraints.maxDirectChildren})`,
        componentId: component.id,
        severity: 'error',
      })
    }

    // Row组件特殊验证：检查Col数量
    if (component.component_type === 'row') {
      const colCount = siblings.filter(sibling => sibling.component_type === 'col').length + 1

      if (colCount > GLOBAL_PERFORMANCE_CONSTRAINTS.maxRowColumns) {
        errors.push({
          code: VALIDATION_ERROR_CODES.GRID_OVERFLOW,
          message: `Row中的Col数量 (${colCount}) 超过最大限制 (${GLOBAL_PERFORMANCE_CONSTRAINTS.maxRowColumns})`,
          componentId: component.id,
          severity: 'error',
        })

        suggestions.push({
          type: 'modify',
          target: component.id,
          description: '考虑使用多个Row来组织更多列',
          action: 'split_row_into_multiple',
          priority: 'medium',
        })
      }

      if (colCount === 0) {
        warnings.push({
          code: VALIDATION_ERROR_CODES.ROW_WITHOUT_COLS,
          message: 'Row组件应该包含至少一个Col组件',
          componentId: component.id,
          impact: 'best_practice',
          suggestion: '添加Col组件或删除空的Row组件',
        })
      }
    }
  }

  // 验证嵌套深度
  private validateNestingDepth(
    component: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[]
  ): void {
    // 这里需要从组件树中计算实际深度
    // 由于没有完整的组件树结构，我们给出警告而不是错误
    const constraints = this.getConstraints(component.component_type)

    if (constraints?.maxNestingLevel && constraints.maxNestingLevel > 5) {
      warnings.push({
        code: VALIDATION_ERROR_CODES.DEEP_NESTING,
        message: `组件 "${component.component_type}" 的最大嵌套深度 (${constraints.maxNestingLevel}) 可能影响性能`,
        componentId: component.id,
        impact: 'performance',
        suggestion: '考虑简化布局结构，减少嵌套层级',
      })
    }
  }

  // 验证特定布局组件的约束
  private validateSpecificLayoutConstraints(
    component: ComponentInstance,
    constraints: LayoutConstraints,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[],
    suggestions: LayoutValidationSuggestion[]
  ): void {
    switch (component.component_type) {
      case 'col':
        this.validateColConstraints(component, errors, warnings, suggestions)
        break

      case 'row':
        this.validateRowConstraints(component, errors, warnings, suggestions)
        break

      case 'container':
        this.validateContainerConstraints(component, errors, warnings, suggestions)
        break
    }
  }

  // 验证Col组件约束
  private validateColConstraints(
    component: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[],
    suggestions: LayoutValidationSuggestion[]
  ): void {
    const colProps = component.props.col

    if (colProps) {
      // 检查span值
      const span = typeof colProps.span === 'number' ? colProps.span : 12
      if (span < 1 || span > 12) {
        errors.push({
          code: VALIDATION_ERROR_CODES.INVALID_GRID_SPAN,
          message: `Col的span值 (${span}) 必须在1-12之间`,
          componentId: component.id,
          severity: 'error',
          field: 'props.col.span',
        })
      }

      // 检查offset值
      const offset = typeof colProps.offset === 'number' ? colProps.offset : 0
      if (offset < 0 || offset > 11) {
        errors.push({
          code: VALIDATION_ERROR_CODES.INVALID_GRID_SPAN,
          message: `Col的offset值 (${offset}) 必须在0-11之间`,
          componentId: component.id,
          severity: 'error',
          field: 'props.col.offset',
        })
      }

      // 检查span + offset是否超过12
      if (span + offset > 12) {
        warnings.push({
          code: VALIDATION_ERROR_CODES.GRID_OVERFLOW,
          message: `Col的span (${span}) + offset (${offset}) 超过了12，可能导致布局异常`,
          componentId: component.id,
          impact: 'responsive',
          suggestion: '调整span或offset值，确保总和不超过12',
        })
      }
    }

    // 检查Col是否有父组件（应该有）
    if (!component.parent_id) {
      warnings.push({
        code: VALIDATION_ERROR_CODES.COL_WITHOUT_PARENT,
        message: 'Col组件应该有父组件（通常是Row组件）',
        componentId: component.id,
        impact: 'best_practice',
        suggestion: '将Col组件放置在Row或其他布局组件中',
      })
    }
  }

  // 验证Row组件约束
  private validateRowConstraints(
    component: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[],
    suggestions: LayoutValidationSuggestion[]
  ): void {
    const rowProps = component.props.row

    if (rowProps?.gap && typeof rowProps.gap === 'number' && rowProps.gap < 0) {
      errors.push({
        code: VALIDATION_ERROR_CODES.INVALID_CHILD,
        message: 'Row的gap值不能为负数',
        componentId: component.id,
        severity: 'error',
        field: 'props.row.gap',
      })
    }
  }

  // 验证Container组件约束
  private validateContainerConstraints(
    component: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[],
    suggestions: LayoutValidationSuggestion[]
  ): void {
    const containerProps = component.props.container

    if (containerProps?.gap && typeof containerProps.gap === 'number' && containerProps.gap < 0) {
      errors.push({
        code: VALIDATION_ERROR_CODES.INVALID_CHILD,
        message: 'Container的gap值不能为负数',
        componentId: component.id,
        severity: 'error',
        field: 'props.container.gap',
      })
    }
  }

  // 验证性能约束
  private validatePerformanceConstraints(
    component: ComponentInstance,
    errors: LayoutValidationError[],
    warnings: LayoutValidationWarning[]
  ): void {
    // 这里可以添加更多的性能相关验证
    // 比如检查组件的复杂度、渲染时间等

    const componentComplexity = this.calculateComponentComplexity(component)

    if (componentComplexity > 100) {
      warnings.push({
        code: VALIDATION_ERROR_CODES.DEEP_NESTING,
        message: `组件复杂度 (${componentComplexity}) 较高，可能影响渲染性能`,
        componentId: component.id,
        impact: 'performance',
        suggestion: '考虑简化组件结构或拆分成多个组件',
      })
    }
  }

  // 计算组件复杂度
  private calculateComponentComplexity(component: ComponentInstance): number {
    let complexity = 10 // 基础复杂度

    // 根据组件类型调整复杂度
    switch (component.component_type) {
      case 'container':
        complexity += 20
        break
      case 'row':
        complexity += 15
        break
      case 'col':
        complexity += 10
        break
      default:
        complexity += 5
    }

    // 根据属性数量调整复杂度
    const propCount = Object.keys(component.props).length
    complexity += propCount * 2

    // 根据样式数量调整复杂度
    const styleCount = Object.keys(component.styles).length
    complexity += styleCount * 1

    return complexity
  }

  // 检测循环引用
  private detectCircularReferences(
    components: Record<string, ComponentInstance>,
    rootId: string
  ): { hasCircularReference: boolean; componentId?: string } {
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const dfs = (componentId: string): boolean => {
      if (recursionStack.has(componentId)) {
        return true // 发现循环引用
      }

      if (visited.has(componentId)) {
        return false
      }

      visited.add(componentId)
      recursionStack.add(componentId)

      const component = components[componentId]
      if (component) {
        // 检查所有子组件
        for (const childId of Object.values(components)
          .filter(c => c.parent_id === componentId)
          .map(c => c.id)) {
          if (dfs(childId)) {
            return true
          }
        }
      }

      recursionStack.delete(componentId)
      return false
    }

    const hasCircularReference = dfs(rootId)
    return { hasCircularReference }
  }

  // 创建默认验证结果
  private createDefaultValidationResult(component: ComponentInstance): LayoutValidationResult {
    return {
      isValid: true,
      errors: [],
      warnings: [
        {
          code: 'NO_CONSTRAINTS_DEFINED',
          message: `组件类型 "${component.component_type}" 没有定义约束规则`,
          componentId: component.id,
          impact: 'best_practice',
          suggestion: '为该组件类型定义约束规则以获得更好的验证',
        },
      ],
    }
  }
}

// 导出单例实例
export const layoutConstraintsValidator = new LayoutConstraintsValidator()

// 导出工具函数
export const validateComponent = (
  component: ComponentInstance,
  parentComponent?: ComponentInstance,
  siblings?: ComponentInstance[]
): LayoutValidationResult => {
  return layoutConstraintsValidator.validateComponent(component, parentComponent, siblings)
}

export const validateComponentTree = (
  components: Record<string, ComponentInstance>,
  rootId: string
): LayoutValidationResult => {
  return layoutConstraintsValidator.validateComponentTree(components, rootId)
}

export const registerLayoutConstraints = (type: string, constraints: LayoutConstraints) => {
  layoutConstraintsValidator.registerConstraints(type, constraints)
}
