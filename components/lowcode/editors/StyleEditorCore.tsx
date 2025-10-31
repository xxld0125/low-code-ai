/**
 * StyleEditor 核心逻辑模块
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 提供样式编辑器的核心逻辑，便于测试和复用
 */

import { useState, useCallback, useMemo } from 'react'

// 类型定义
interface StyleDefinition {
  id: string
  name: string
  type: string
  label: string
  required?: boolean
  default_value?: any
  editor_config?: Record<string, any>
  group?: string
  order?: number
}

interface StyleGroup {
  id: string
  name: string
  order: number
  properties: StyleDefinition[]
}

interface StyleValidationRule {
  type: string
  required?: boolean
  min?: number
  max?: number
  pattern?: string
  options?: any[]
}

interface StyleValidationResult {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

interface StyleChangeData {
  component_id?: string
  style_key: string
  value: any
  previous_value: any
  timestamp: number
}

interface Breakpoint {
  id: string
  name: string
  minWidth: number
  maxWidth?: number
}

interface ResponsiveStyles {
  [breakpointId: string]: {
    [styleKey: string]: any
  }
}

// 预设断点
export const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: 'mobile', name: '手机', minWidth: 0, maxWidth: 767 },
  { id: 'tablet', name: '平板', minWidth: 768, maxWidth: 1023 },
  { id: 'desktop', name: '桌面', minWidth: 1024 },
]

// 样式分组 Hook
export const useStyleGroups = (styleSchema: { groups: StyleGroup[] } | null) => {
  const groups = useMemo(() => {
    if (!styleSchema || !styleSchema.groups) {
      return []
    }

    return styleSchema.groups
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        ...group,
        properties: group.properties.sort((a, b) => (a.order || 0) - (b.order || 0)),
      }))
  }, [styleSchema])

  const getGroupById = useCallback((groupId: string) => {
    return groups.find(group => group.id === groupId) || null
  }, [groups])

  const getPropertyById = useCallback((propertyId: string) => {
    for (const group of groups) {
      const property = group.properties.find(prop => prop.id === propertyId)
      if (property) return property
    }
    return null
  }, [groups])

  return {
    groups,
    getGroupById,
    getPropertyById,
  }
}

// 样式验证 Hook
export const useStyleValidation = (styleDefinitions: StyleDefinition[]) => {
  const validateStyleValue = useCallback((
    styleDefinition: StyleDefinition,
    value: any
  ): StyleValidationResult => {
    const errors: string[] = []
    const warnings: string[] = []

    // 必填验证
    if (styleDefinition.required && (value === undefined || value === null || value === '')) {
      errors.push(`${styleDefinition.label}不能为空`)
    }

    // 类型验证
    if (value !== undefined && value !== null && value !== '') {
      switch (styleDefinition.type) {
        case 'color':
          if (typeof value !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(value)) {
            errors.push(`${styleDefinition.label}必须是有效的颜色值`)
          }
          break
        case 'size':
          if (typeof value !== 'string' || !/^\d+(\.\d+)?(px|rem|em|%|vh|vw|auto)$/.test(value)) {
            errors.push(`${styleDefinition.label}必须是有效的尺寸值`)
          }
          break
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`${styleDefinition.label}必须是数字`)
          } else {
            const config = styleDefinition.editor_config || {}
            if (config.min !== undefined && value < config.min) {
              errors.push(`${styleDefinition.label}不能小于 ${config.min}`)
            }
            if (config.max !== undefined && value > config.max) {
              errors.push(`${styleDefinition.label}不能大于 ${config.max}`)
            }
          }
          break
        case 'select':
          const options = styleDefinition.options || styleDefinition.editor_config?.options || []
          if (!options.some((opt: any) => opt.value === value)) {
            errors.push(`${styleDefinition.label}选择了无效的选项`)
          }
          break
        case 'border':
          if (typeof value !== 'string' || !/^\d+px (solid|dashed|dotted|double) #[0-9A-Fa-f]{6}$/.test(value)) {
            errors.push(`${styleDefinition.label}必须是有效的边框值`)
          }
          break
        case 'shadow':
          if (typeof value !== 'string' || !/^[\d\spxrgba%,-]+$/.test(value)) {
            warnings.push(`${styleDefinition.label}可能不是有效的阴影值`)
          }
          break
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }, [])

  const validateAllStyles = useCallback((
    styles: Record<string, any>
  ): Record<string, StyleValidationResult> => {
    const results: Record<string, StyleValidationResult> = {}

    styleDefinitions.forEach(def => {
      const value = styles[def.name]
      results[def.name] = validateStyleValue(def, value)
    })

    return results
  }, [styleDefinitions, validateStyleValue])

  return {
    validateStyleValue,
    validateAllStyles,
  }
}

// 响应式样式管理 Hook
export const useResponsiveStyles = (
  initialStyles: ResponsiveStyles = {},
  breakpoints: Breakpoint[] = DEFAULT_BREAKPOINTS
) => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>(breakpoints[0])
  const [styles, setStyles] = useState<ResponsiveStyles>(initialStyles)

  const updateStyle = useCallback((
    breakpointId: string,
    styleKey: string,
    value: any
  ) => {
    setStyles(prev => ({
      ...prev,
      [breakpointId]: {
        ...prev[breakpointId],
        [styleKey]: value,
      },
    }))
  }, [])

  const getCurrentStyles = useCallback(() => {
    const currentStyles: Record<string, any> = {}

    // 按断点顺序合并样式（后面的断点覆盖前面的）
    breakpoints.forEach(bp => {
      if (styles[bp.id]) {
        Object.assign(currentStyles, styles[bp.id])
      }
    })

    return currentStyles
  }, [styles, breakpoints])

  const getStyleAtBreakpoint = useCallback((breakpointId: string) => {
    return styles[breakpointId] || {}
  }, [styles])

  const resetBreakpointStyles = useCallback((breakpointId: string) => {
    setStyles(prev => ({
      ...prev,
      [breakpointId]: {},
    }))
  }, [])

  const resetAllStyles = useCallback(() => {
    setStyles({})
  }, [])

  const inheritFromBreakpoint = useCallback((
    fromBreakpointId: string,
    toBreakpointId: string,
    styleKeys?: string[]
  ) => {
    const fromStyles = styles[fromBreakpointId] || {}
    const toStyles = styles[toBreakpointId] || {}

    const stylesToInherit = styleKeys || Object.keys(fromStyles)
    const inheritedStyles: Record<string, any> = {}

    stylesToInherit.forEach(key => {
      if (fromStyles[key] !== undefined) {
        inheritedStyles[key] = fromStyles[key]
      }
    })

    setStyles(prev => ({
      ...prev,
      [toBreakpointId]: {
        ...toStyles,
        ...inheritedStyles,
      },
    }))
  }, [styles])

  return {
    currentBreakpoint,
    styles,
    setCurrentBreakpoint,
    updateStyle,
    getCurrentStyles,
    getStyleAtBreakpoint,
    resetBreakpointStyles,
    resetAllStyles,
    inheritFromBreakpoint,
  }
}

// 样式预设管理 Hook
export const useStylePresets = (presets: Array<{ name: string; styles: Record<string, any> }> = []) => {
  const [customPresets, setCustomPresets] = useState(presets)

  const applyPreset = useCallback((
    preset: { name: string; styles: Record<string, any> },
    onUpdate: (styles: Record<string, any>) => void
  ) => {
    onUpdate(preset.styles)
  }, [])

  const savePreset = useCallback((
    name: string,
    styles: Record<string, any>,
    description?: string
  ) => {
    const newPreset = {
      name,
      description,
      styles: { ...styles },
      createdAt: new Date().toISOString(),
    }

    setCustomPresets(prev => [...prev, newPreset])
    return newPreset
  }, [])

  const deletePreset = useCallback((presetName: string) => {
    setCustomPresets(prev => prev.filter(preset => preset.name !== presetName))
  }, [])

  const getAllPresets = useCallback(() => {
    return customPresets
  }, [customPresets])

  const getPresetByName = useCallback((name: string) => {
    return customPresets.find(preset => preset.name === name)
  }, [customPresets])

  return {
    customPresets,
    applyPreset,
    savePreset,
    deletePreset,
    getAllPresets,
    getPresetByName,
  }
}

// 样式历史管理 Hook (撤销/重做)
export const useStyleHistory = (initialStyles: Record<string, any> = {}) => {
  const [history, setHistory] = useState<Record<string, any>[]>([initialStyles])
  const [historyIndex, setHistoryIndex] = useState(0)

  const addToHistory = useCallback((styles: Record<string, any>) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(styles)
      // 限制历史记录数量
      if (newHistory.length > 50) {
        newHistory.shift()
        return newHistory
      }
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 49))
  }, [historyIndex])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1)
      return history[historyIndex - 1]
    }
    return null
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(prev => prev + 1)
      return history[historyIndex + 1]
    }
    return null
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const current = history[historyIndex]

  return {
    history,
    historyIndex,
    current,
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo,
    clearHistory: useCallback(() => {
      setHistory([current])
      setHistoryIndex(0)
    }, [current]),
  }
}

// 样式代码生成 Hook
export const useStyleCodeGeneration = () => {
  const generateCSS = useCallback((
    styles: Record<string, any>,
    selector: string = '.component'
  ): string => {
    const cssRules: string[] = []

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // 转换驼峰属性名为kebab-case
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
        cssRules.push(`  ${cssProperty}: ${value};`)
      }
    })

    if (cssRules.length === 0) {
      return ''
    }

    return `${selector} {\n${cssRules.join('\n')}\n}`
  }, [])

  const generateInlineStyles = useCallback((styles: Record<string, any>): React.CSSProperties => {
    const inlineStyles: React.CSSProperties = {}

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        (inlineStyles as any)[property] = value
      }
    })

    return inlineStyles
  }, [])

  const generateTailwindClasses = useCallback((
    styles: Record<string, any>
  ): string[] => {
    const classes: string[] = []

    // 简单的样式到Tailwind类的映射
    const styleToClassMap: Record<string, any> = {
      backgroundColor: (value: string) => {
        if (value === 'transparent') return 'bg-transparent'
        if (value.startsWith('#')) return `bg-[${value}]`
        return `bg-${value.replace('#', '')}`
      },
      color: (value: string) => {
        if (value.startsWith('#')) return `text-[${value}]`
        return `text-${value.replace('#', '')}`
      },
      fontSize: (value: string) => {
        if (value.endsWith('px')) return `text-[${value}]`
        return `text-${value}`
      },
      padding: (value: string) => {
        if (value.endsWith('px')) return `p-[${value}]`
        return `p-${value}`
      },
      margin: (value: string) => {
        if (value.endsWith('px')) return `m-[${value}]`
        return `m-${value}`
      },
      borderRadius: (value: string) => {
        if (value.endsWith('px')) return `rounded-[${value}]`
        return `rounded-${value}`
      },
    }

    Object.entries(styles).forEach(([property, value]) => {
      const mapper = styleToClassMap[property]
      if (mapper && value) {
        const className = mapper(value)
        if (className) {
          classes.push(className)
        }
      }
    })

    return classes
  }, [])

  return {
    generateCSS,
    generateInlineStyles,
    generateTailwindClasses,
  }
}

// 样式导入导出 Hook
export const useStyleImportExport = () => {
  const exportToJSON = useCallback((
    styles: Record<string, any>,
    metadata?: Record<string, any>
  ): string => {
    const exportData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      styles,
      metadata: {
        totalStyles: Object.keys(styles).length,
        styleKeys: Object.keys(styles),
        ...metadata,
      },
    }

    return JSON.stringify(exportData, null, 2)
  }, [])

  const importFromJSON = useCallback((jsonString: string): Record<string, any> => {
    try {
      const importData = JSON.parse(jsonString)

      if (!importData.styles) {
        throw new Error('导入数据中缺少styles字段')
      }

      return importData.styles
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('无效的JSON格式')
      }
      throw error
    }
  }, [])

  const exportToCSS = useCallback((
    styles: Record<string, any>,
    selector: string = '.custom-component'
  ): string => {
    const cssRules: string[] = []

    Object.entries(styles).forEach(([property, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
        cssRules.push(`  ${cssProperty}: ${value};`)
      }
    })

    if (cssRules.length === 0) {
      return `/* 没有样式配置 */`
    }

    return `/* 导出的样式配置 */\n${selector} {\n${cssRules.join('\n')}\n}`
  }, [])

  return {
    exportToJSON,
    importFromJSON,
    exportToCSS,
  }
}

// 合并所有核心逻辑为 StyleEditorCore
export const StyleEditorCore = {
  useStyleGroups,
  useStyleValidation,
  useResponsiveStyles,
  useStylePresets,
  useStyleHistory,
  useStyleCodeGeneration,
  useStyleImportExport,
  DEFAULT_BREAKPOINTS,
}