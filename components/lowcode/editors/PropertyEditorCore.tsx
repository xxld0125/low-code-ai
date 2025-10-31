/**
 * PropertyEditor 核心逻辑模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 提供属性编辑器的核心逻辑，便于测试和复用
 */

import { useState, useCallback, useMemo } from 'react'

// 类型定义
interface PropertyDefinition {
  key: string
  type: string
  label: string
  required?: boolean
  default?: any
  group: string
  order: number
  options?: Array<{ value: any; label: string }>
  dependencies?: Record<string, any>
}

interface PropertyValidationRule {
  rule: string
  value: any
  message: string
}

interface PropertyValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

interface PropertyChangeData {
  component_id: string
  component_type?: string
  property_key: string
  value: any
  previous_value: any
  timestamp: number
}

interface PropertyBatchChangeData {
  component_id: string
  changes: Record<string, any>
  previous_values: Record<string, any>
  timestamp: number
}

interface PropertyGroupOptions {
  showGroups?: boolean
  showAdvanced?: boolean
  advancedGroups?: string[]
  groupOrder?: string[]
}

interface PropertySearchOptions {
  searchTerm?: string
  groupFilter?: string
  typeFilter?: string
}

interface PropertyImportExportOptions {
  componentType?: string
  componentId?: string
}

// 属性分组 Hook
export const usePropertyGroups = (
  definitions: PropertyDefinition[],
  options: PropertyGroupOptions = {}
) => {
  const {
    showGroups = true,
    showAdvanced = true,
    advancedGroups = ['高级', '高级配置'],
    groupOrder = [],
  } = options

  const groupedProperties = useMemo(() => {
    const groups: Record<string, PropertyDefinition[]> = {}

    definitions.forEach(def => {
      const isAdvanced = advancedGroups.includes(def.group)

      if (!showAdvanced && isAdvanced) {
        return
      }

      if (!groups[def.group]) {
        groups[def.group] = []
      }
      groups[def.group].push(def)
    })

    // 对每个组内的属性按order排序
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => a.order - b.order)
    })

    // 如果有自定义组排序，按自定义顺序排列组
    if (groupOrder.length > 0) {
      const orderedGroups: Record<string, PropertyDefinition[]> = {}
      groupOrder.forEach(groupName => {
        if (groups[groupName]) {
          orderedGroups[groupName] = groups[groupName]
        }
      })
      // 添加不在自定义排序中的组
      Object.keys(groups).forEach(groupName => {
        if (!orderedGroups[groupName]) {
          orderedGroups[groupName] = groups[groupName]
        }
      })
      return orderedGroups
    }

    return groups
  }, [definitions, showAdvanced, advancedGroups, groupOrder])

  return {
    groups: groupedProperties,
    groupNames: Object.keys(groupedProperties),
  }
}

// 属性验证 Hook
export const usePropertyValidation = (
  definitions: PropertyDefinition[],
  currentValues: Record<string, any>,
  customRules: Record<string, PropertyValidationRule[]> = {}
) => {
  const validateProperty = useCallback((
    propertyKey: string,
    value: any
  ): PropertyValidationResult => {
    const definition = definitions.find(def => def.key === propertyKey)
    if (!definition) {
      return { isValid: true, errors: [] }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // 必填验证
    if (definition.required && (value === undefined || value === null || value === '')) {
      errors.push(`${definition.label}不能为空`)
    }

    // 类型验证
    if (value !== undefined && value !== null && value !== '') {
      switch (definition.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`${definition.label}必须是字符串`)
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${definition.label}必须是数字`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`${definition.label}必须是布尔值`)
          }
          break
        case 'select':
          if (definition.options && !definition.options.some(opt => opt.value === value)) {
            errors.push(`${definition.label}选择了无效的选项`)
          }
          break
      }
    }

    // 自定义验证规则
    const propertyCustomRules = customRules[propertyKey] || []
    propertyCustomRules.forEach(rule => {
      switch (rule.rule) {
        case 'minLength':
          if (typeof value === 'string' && value.length < rule.value) {
            errors.push(rule.message)
          }
          break
        case 'maxLength':
          if (typeof value === 'string' && value.length > rule.value) {
            errors.push(rule.message)
          }
          break
        case 'min':
          if (typeof value === 'number' && value < rule.value) {
            errors.push(rule.message)
          }
          break
        case 'max':
          if (typeof value === 'number' && value > rule.value) {
            errors.push(rule.message)
          }
          break
        case 'pattern':
          if (typeof value === 'string' && !new RegExp(rule.value).test(value)) {
            errors.push(rule.message)
          }
          break
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }, [definitions, customRules])

  const validateAllProperties = useCallback((): Record<string, PropertyValidationResult> => {
    const results: Record<string, PropertyValidationResult> = {}

    definitions.forEach(def => {
      const value = currentValues[def.key]
      results[def.key] = validateProperty(def.key, value)
    })

    return results
  }, [definitions, currentValues, validateProperty])

  return {
    validateProperty,
    validateAllProperties,
  }
}

// 属性变更处理 Hook
export const usePropertyChange = (
  onChange: (data: PropertyChangeData) => void,
  options: { componentId: string; componentType?: string }
) => {
  const { componentId, componentType } = options

  const handlePropertyChange = useCallback((
    propertyKey: string,
    newValue: any,
    previousValue: any
  ) => {
    const changeData: PropertyChangeData = {
      component_id: componentId,
      component_type: componentType,
      property_key: propertyKey,
      value: newValue,
      previous_value: previousValue,
      timestamp: Date.now(),
    }

    onChange(changeData)
  }, [onChange, componentId, componentType])

  return {
    handlePropertyChange,
  }
}

// 批量属性变更 Hook
export const usePropertyBatchChange = (
  onBatchChange: (data: PropertyBatchChangeData) => void,
  options: { componentId: string }
) => {
  const { componentId } = options

  const handleBatchChange = useCallback((
    changes: Record<string, any>,
    previousValues: Record<string, any>
  ) => {
    const batchChangeData: PropertyBatchChangeData = {
      component_id: componentId,
      changes,
      previous_values: previousValues,
      timestamp: Date.now(),
    }

    onBatchChange(batchChangeData)
  }, [onBatchChange, componentId])

  return {
    handleBatchChange,
  }
}

// 默认值处理 Hook
export const usePropertyDefaults = (definitions: PropertyDefinition[]) => {
  const getDefaultValue = useCallback((propertyKey: string) => {
    const definition = definitions.find(def => def.key === propertyKey)
    return definition?.default
  }, [definitions])

  const resetToDefaults = useCallback(() => {
    const defaults: Record<string, any> = {}
    definitions.forEach(def => {
      if (def.default !== undefined) {
        defaults[def.key] = def.default
      }
    })
    return defaults
  }, [definitions])

  const resetPropertyToDefault = useCallback((propertyKey: string) => {
    return getDefaultValue(propertyKey)
  }, [getDefaultValue])

  return {
    getDefaultValue,
    resetToDefaults,
    resetPropertyToDefault,
  }
}

// 属性搜索和过滤 Hook
export const usePropertySearch = (definitions: PropertyDefinition[]) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filteredProperties = useMemo(() => {
    return definitions.filter(def => {
      // 搜索关键词过滤
      if (searchTerm && !def.label.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // 组过滤
      if (groupFilter && def.group !== groupFilter) {
        return false
      }

      // 类型过滤
      if (typeFilter && def.type !== typeFilter) {
        return false
      }

      return true
    })
  }, [definitions, searchTerm, groupFilter, typeFilter])

  const clearFilters = useCallback(() => {
    setSearchTerm('')
    setGroupFilter('')
    setTypeFilter('')
  }, [])

  return {
    searchTerm,
    groupFilter,
    typeFilter,
    filteredProperties,
    setSearchTerm,
    setGroupFilter,
    setTypeFilter,
    clearFilters,
  }
}

// 属性依赖关系 Hook
export const usePropertyDependencies = (
  definitions: PropertyDefinition[],
  currentValues: Record<string, any>
) => {
  const [localValues, setLocalValues] = useState(currentValues)

  const updatePropertyValue = useCallback((propertyKey: string, value: any) => {
    setLocalValues(prev => ({
      ...prev,
      [propertyKey]: value,
    }))
  }, [])

  const isPropertyVisible = useCallback((propertyKey: string): boolean => {
    const definition = definitions.find(def => def.key === propertyKey)
    if (!definition || !definition.dependencies) {
      return true
    }

    // 检查所有依赖条件
    return Object.entries(definition.dependencies).every(([depKey, depValue]) => {
      const currentValue = localValues[depKey]

      if (Array.isArray(depValue)) {
        return depValue.includes(currentValue)
      }

      return currentValue === depValue
    })
  }, [definitions, localValues])

  // 同步外部传入的值
  useMemo(() => {
    setLocalValues(currentValues)
  }, [currentValues])

  return {
    isPropertyVisible,
    updatePropertyValue,
    currentValues: localValues,
  }
}

// 属性导入导出 Hook
export const usePropertyImportExport = (
  definitions: PropertyDefinition[],
  currentValues: Record<string, any>,
  options: PropertyImportExportOptions = {}
) => {
  const { componentType = 'Unknown', componentId = 'unknown' } = options

  const exportToJSON = useCallback(() => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      component: {
        type: componentType,
        id: componentId,
      },
      properties: currentValues,
      metadata: {
        totalProperties: definitions.length,
        requiredProperties: definitions.filter(def => def.required).length,
        groups: [...new Set(definitions.map(def => def.group))],
      },
    }

    return JSON.stringify(exportData, null, 2)
  }, [definitions, currentValues, componentType, componentId])

  const importFromJSON = useCallback((jsonString: string) => {
    try {
      const importData = JSON.parse(jsonString)

      if (!importData.properties) {
        throw new Error('导入数据中缺少properties字段')
      }

      // 验证导入的属性是否匹配定义
      const validProperties: Record<string, any> = {}
      definitions.forEach(def => {
        if (importData.properties[def.key] !== undefined) {
          validProperties[def.key] = importData.properties[def.key]
        }
      })

      return validProperties
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('无效的JSON格式')
      }
      throw error
    }
  }, [definitions])

  const exportToCSV = useCallback(() => {
    const headers = ['属性名', '标签', '类型', '当前值', '默认值', '必填', '分组']
    const rows = definitions.map(def => [
      def.key,
      def.label,
      def.type,
      currentValues[def.key] || '',
      def.default || '',
      def.required ? '是' : '否',
      def.group,
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    return csvContent
  }, [definitions, currentValues])

  return {
    exportToJSON,
    importFromJSON,
    exportToCSV,
  }
}

// 合并所有核心逻辑为 PropertyEditorCore
export const PropertyEditorCore = {
  usePropertyGroups,
  usePropertyValidation,
  usePropertyChange,
  usePropertyBatchChange,
  usePropertyDefaults,
  usePropertySearch,
  usePropertyDependencies,
  usePropertyImportExport,
}