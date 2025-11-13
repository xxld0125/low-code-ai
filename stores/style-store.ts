/**
 * 样式属性状态管理
 * 扩展属性配置store，专门处理组件样式相关功能
 */

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { enableMapSet } from 'immer'
import type { StylePreset, CSSProperties, PropertyValue } from '@/types/designer'
import { StyleUpdateOptimizer } from '@/lib/utils/performance'

// 在模块加载时启用MapSet插件
enableMapSet()

// 样式属性类型定义
export type StylePropertyType =
  | 'color'
  | 'size'
  | 'spacing'
  | 'typography'
  | 'border'
  | 'shadow'
  | 'layout'
  | 'position'
  | 'animation'

// 样式属性配置
export interface StylePropertyConfig {
  type: StylePropertyType
  property: string
  label: string
  defaultValue?: PropertyValue
  unit?: string
  min?: number
  max?: number
  step?: number
  options?: Array<{ value: PropertyValue; label: string }>
  validation?: {
    pattern?: string
    message?: string
  }
}

// 响应式样式断点
export interface ResponsiveBreakpoint {
  name: string
  min: number
  max?: number
  default: boolean
}

// 响应式样式配置
export interface ResponsiveStyleConfig {
  base: CSSProperties
  sm?: CSSProperties
  md?: CSSProperties
  lg?: CSSProperties
  xl?: CSSProperties
  '2xl'?: CSSProperties
}

// 样式验证结果
export interface StyleValidationResult {
  valid: boolean
  property: string
  value: PropertyValue
  message?: string
  normalized?: PropertyValue
}

// 样式配置状态
export interface StyleConfigState {
  // 当前编辑的样式属性
  currentStyles: CSSProperties
  previewStyles: CSSProperties
  dirtyStyleProperties: Set<string>

  // 响应式样式
  responsiveStyles: ResponsiveStyleConfig
  currentBreakpoint: string
  breakpoints: ResponsiveBreakpoint[]

  // 样式验证
  styleValidationErrors: Record<string, string>
  styleValidationResults: StyleValidationResult[]

  // 样式预设
  stylePresets: StylePreset[]
  customStylePresets: StylePreset[]
  appliedPreset: string | null

  // 样式历史
  styleHistory: StyleHistoryState

  // 样式编辑器状态
  editorState: {
    activeTab: 'styles' | 'presets' | 'responsive'
    collapsedSections: Set<string>
    advancedMode: boolean
  }

  // 加载状态
  loadingPresets: boolean
  savingStyles: boolean
  validatingStyles: boolean

  // 错误状态
  styleError: string | null
}

// 样式配置操作
export interface StyleConfigActions {
  // 样式操作
  updateStyle: (property: string, value: PropertyValue, breakpoint?: string) => void
  updateStyles: (updates: Record<string, PropertyValue>, breakpoint?: string) => void
  resetStyle: (property: string) => void
  resetAllStyles: () => void

  // 性能优化的样式操作
  updateStyleOptimized: (componentId: string, property: string, value: PropertyValue, breakpoint?: string) => void
  updateStylesOptimized: (componentId: string, updates: Record<string, PropertyValue>, breakpoint?: string) => void

  // 预览管理
  applyPreviewStyles: () => void
  discardPreviewStyles: () => void
  setPreviewStyle: (property: string, value: PropertyValue) => void

  // 响应式样式管理
  setCurrentBreakpoint: (breakpoint: string) => void
  getBreakpointStyles: (breakpoint?: string) => CSSProperties
  setResponsiveStyle: (property: string, value: PropertyValue, breakpoint: string) => void

  // 样式验证
  validateStyleProperty: (property: string, value: PropertyValue) => StyleValidationResult
  validateAllStyles: () => StyleValidationResult[]
  clearStyleValidationErrors: () => void

  // 样式预设管理
  loadStylePresets: () => Promise<void>
  saveStylePreset: (preset: Omit<StylePreset, 'id'>) => Promise<StylePreset>
  applyStylePreset: (presetId: string) => void
  deleteStylePreset: (presetId: string) => Promise<void>
  createCustomPreset: (name: string, description?: string) => StylePreset

  // 样式历史
  saveStyleToHistory: (description?: string) => void
  undoStyleChange: () => void
  redoStyleChange: () => void
  canUndoStyle: () => boolean
  canRedoStyle: () => boolean

  // 编辑器状态管理
  setActiveTab: (tab: 'styles' | 'presets' | 'responsive') => void
  toggleSectionCollapsed: (section: string) => void
  setAdvancedMode: (enabled: boolean) => void

  // 状态管理
  setLoadingPresets: (loading: boolean) => void
  setSavingStyles: (saving: boolean) => void
  setValidatingStyles: (validating: boolean) => void
  setStyleError: (error: string | null) => void

  // 样式转换和标准化
  normalizeStyleValue: (property: string, value: PropertyValue) => PropertyValue
  convertToCSS: (styles: CSSProperties) => string
  getStyleDifference: (styles1: CSSProperties, styles2: CSSProperties) => CSSProperties

  // 重置操作
  resetStyleState: () => void
}

// 样式历史状态
export interface StyleHistoryState {
  past: StyleHistorySnapshot[]
  present: StyleHistorySnapshot | null
  future: StyleHistorySnapshot[]
}

// 样式历史快照
export interface StyleHistorySnapshot {
  styles: CSSProperties
  responsiveStyles: ResponsiveStyleConfig
  timestamp: number
  description?: string
}

// 预定义断点
const DEFAULT_BREAKPOINTS: ResponsiveBreakpoint[] = [
  { name: 'base', min: 0, default: true },
  { name: 'sm', min: 640 },
  { name: 'md', min: 768 },
  { name: 'lg', min: 1024 },
  { name: 'xl', min: 1280 },
  { name: '2xl', min: 1536 },
]

// 预定义样式属性配置
const STYLE_PROPERTY_CONFIGS: Record<string, StylePropertyConfig> = {
  // 尺寸属性
  width: { type: 'size', property: 'width', label: '宽度', unit: 'px' },
  height: { type: 'size', property: 'height', label: '高度', unit: 'px' },
  minWidth: { type: 'size', property: 'minWidth', label: '最小宽度', unit: 'px' },
  maxWidth: { type: 'size', property: 'maxWidth', label: '最大宽度', unit: 'px' },
  minHeight: { type: 'size', property: 'minHeight', label: '最小高度', unit: 'px' },
  maxHeight: { type: 'size', property: 'maxHeight', label: '最大高度', unit: 'px' },

  // 间距属性
  margin: { type: 'spacing', property: 'margin', label: '外边距', unit: 'px' },
  marginTop: { type: 'spacing', property: 'marginTop', label: '上边距', unit: 'px' },
  marginRight: { type: 'spacing', property: 'marginRight', label: '右边距', unit: 'px' },
  marginBottom: { type: 'spacing', property: 'marginBottom', label: '下边距', unit: 'px' },
  marginLeft: { type: 'spacing', property: 'marginLeft', label: '左边距', unit: 'px' },
  padding: { type: 'spacing', property: 'padding', label: '内边距', unit: 'px' },
  paddingTop: { type: 'spacing', property: 'paddingTop', label: '上内边距', unit: 'px' },
  paddingRight: { type: 'spacing', property: 'paddingRight', label: '右内边距', unit: 'px' },
  paddingBottom: { type: 'spacing', property: 'paddingBottom', label: '下内边距', unit: 'px' },
  paddingLeft: { type: 'spacing', property: 'paddingLeft', label: '左内边距', unit: 'px' },

  // 颜色属性
  backgroundColor: { type: 'color', property: 'backgroundColor', label: '背景颜色' },
  color: { type: 'color', property: 'color', label: '文字颜色' },
  borderColor: { type: 'color', property: 'borderColor', label: '边框颜色' },

  // 边框属性
  borderWidth: { type: 'size', property: 'borderWidth', label: '边框宽度', unit: 'px', min: 0, max: 10, step: 1 },
  borderRadius: { type: 'size', property: 'borderRadius', label: '圆角', unit: 'px', min: 0, max: 50, step: 1 },
  borderStyle: {
    type: 'layout',
    property: 'borderStyle',
    label: '边框样式',
    options: [
      { value: 'solid', label: '实线' },
      { value: 'dashed', label: '虚线' },
      { value: 'dotted', label: '点线' },
      { value: 'none', label: '无' }
    ]
  },

  // 布局属性
  display: {
    type: 'layout',
    property: 'display',
    label: '显示方式',
    options: [
      { value: 'block', label: '块级' },
      { value: 'inline', label: '行内' },
      { value: 'inline-block', label: '行内块' },
      { value: 'flex', label: '弹性布局' },
      { value: 'grid', label: '网格布局' },
      { value: 'none', label: '隐藏' }
    ]
  },
  flexDirection: {
    type: 'layout',
    property: 'flexDirection',
    label: '弹性方向',
    options: [
      { value: 'row', label: '水平' },
      { value: 'column', label: '垂直' },
      { value: 'row-reverse', label: '水平反向' },
      { value: 'column-reverse', label: '垂直反向' }
    ]
  },
  justifyContent: {
    type: 'layout',
    property: 'justifyContent',
    label: '水平对齐',
    options: [
      { value: 'flex-start', label: '左对齐' },
      { value: 'center', label: '居中' },
      { value: 'flex-end', label: '右对齐' },
      { value: 'space-between', label: '两端对齐' },
      { value: 'space-around', label: '环绕对齐' },
      { value: 'space-evenly', label: '均匀对齐' }
    ]
  },
  alignItems: {
    type: 'layout',
    property: 'alignItems',
    label: '垂直对齐',
    options: [
      { value: 'flex-start', label: '顶部对齐' },
      { value: 'center', label: '居中对齐' },
      { value: 'flex-end', label: '底部对齐' },
      { value: 'stretch', label: '拉伸' },
      { value: 'baseline', label: '基线对齐' }
    ]
  },

  // 定位属性
  position: {
    type: 'position',
    property: 'position',
    label: '定位方式',
    options: [
      { value: 'static', label: '静态' },
      { value: 'relative', label: '相对' },
      { value: 'absolute', label: '绝对' },
      { value: 'fixed', label: '固定' },
      { value: 'sticky', label: '粘性' }
    ]
  },
  zIndex: { type: 'size', property: 'zIndex', label: '层级', min: 0, max: 9999, step: 1 },
  top: { type: 'size', property: 'top', label: '顶部位置', unit: 'px' },
  right: { type: 'size', property: 'right', label: '右侧位置', unit: 'px' },
  bottom: { type: 'size', property: 'bottom', label: '底部位置', unit: 'px' },
  left: { type: 'size', property: 'left', label: '左侧位置', unit: 'px' },
}

// 创建全局样式更新优化器
const styleOptimizer = new StyleUpdateOptimizer(60) // 60次更新/秒

// 样式缓存管理器（预留，后续使用）
// const styleCache = new CacheManager<string, CSSProperties>(100, 3000) // 100条缓存，3秒TTL

// 初始状态
const initialStyleState: StyleConfigState = {
  currentStyles: {},
  previewStyles: {},
  dirtyStyleProperties: new Set(),
  responsiveStyles: { base: {} },
  currentBreakpoint: 'base',
  breakpoints: DEFAULT_BREAKPOINTS,
  styleValidationErrors: {},
  styleValidationResults: [],
  stylePresets: [],
  customStylePresets: [],
  appliedPreset: null,
  styleHistory: { past: [], present: null, future: [] },
  editorState: {
    activeTab: 'styles',
    collapsedSections: new Set(),
    advancedMode: false,
  },
  loadingPresets: false,
  savingStyles: false,
  validatingStyles: false,
  styleError: null,
}

/**
 * 样式配置Store
 * 专门处理组件样式的编辑、预览、保存和历史记录
 */
export const useStyleStore = create<StyleConfigState & StyleConfigActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        ...initialStyleState,

        // 样式操作
        updateStyle: (property: string, value: PropertyValue, breakpoint?: string) => {
          set(state => {
            const targetBreakpoint = breakpoint || state.currentBreakpoint
            const targetStyles = targetBreakpoint === 'base'
              ? state.previewStyles
              : state.responsiveStyles[targetBreakpoint as keyof ResponsiveStyleConfig] || {}

            const oldValue = targetStyles[property]
            targetStyles[property] = value

            // 更新响应式样式
            if (targetBreakpoint !== 'base') {
              state.responsiveStyles[targetBreakpoint as keyof ResponsiveStyleConfig] =
                targetStyles as CSSProperties
            }

            // 标记脏属性
            const propertyKey = targetBreakpoint === 'base'
              ? property
              : `${targetBreakpoint}.${property}`

            if (oldValue !== value) {
              state.dirtyStyleProperties.add(propertyKey)
            } else {
              state.dirtyStyleProperties.delete(propertyKey)
            }

            // 清除验证错误
            delete state.styleValidationErrors[propertyKey]
          })
        },

        // 性能优化的样式更新方法
        updateStyleOptimized: (componentId: string, property: string, value: PropertyValue, breakpoint?: string) => {
          // 使用优化器进行批量更新
          styleOptimizer.addStyleUpdate(componentId, property, value)

          // 立即更新本地状态以保持UI响应性
          get().updateStyle(property, value, breakpoint)
        },

        // 批量优化样式更新
        updateStylesOptimized: (componentId: string, updates: Record<string, PropertyValue>, breakpoint?: string) => {
          // 使用优化器进行批量更新
          styleOptimizer.addStyleUpdates(componentId, updates)

          // 立即更新本地状态
          get().updateStyles(updates, breakpoint)
        },

        updateStyles: (updates: Record<string, PropertyValue>, breakpoint?: string) => {
          set(state => {
            const targetBreakpoint = breakpoint || state.currentBreakpoint
            const targetStyles = targetBreakpoint === 'base'
              ? state.previewStyles
              : state.responsiveStyles[targetBreakpoint as keyof ResponsiveStyleConfig] || {}

            Object.entries(updates).forEach(([property, value]) => {
              const oldValue = targetStyles[property]
              targetStyles[property] = value

              // 标记脏属性
              const propertyKey = targetBreakpoint === 'base'
                ? property
                : `${targetBreakpoint}.${property}`

              if (oldValue !== value) {
                state.dirtyStyleProperties.add(propertyKey)
              } else {
                state.dirtyStyleProperties.delete(propertyKey)
              }

              // 清除验证错误
              delete state.styleValidationErrors[propertyKey]
            })

            // 更新响应式样式
            if (targetBreakpoint !== 'base') {
              state.responsiveStyles[targetBreakpoint as keyof ResponsiveStyleConfig] =
                targetStyles as CSSProperties
            }
          })
        },

        resetStyle: (property: string) => {
          set(state => {
            delete state.previewStyles[property]
            delete state.responsiveStyles.base[property]

            // 重置所有断点的该属性
            state.breakpoints.forEach(breakpoint => {
              if (breakpoint.name !== 'base') {
                delete state.responsiveStyles[breakpoint.name as keyof ResponsiveStyleConfig]
              }
            })

            state.dirtyStyleProperties.delete(property)
            delete state.styleValidationErrors[property]
          })
        },

        resetAllStyles: () => {
          set(state => {
            state.previewStyles = {}
            state.responsiveStyles = { base: {} }
            state.dirtyStyleProperties.clear()
            state.styleValidationErrors = {}
            state.styleValidationResults = []
            state.appliedPreset = null
          })
        },

        // 预览管理
        applyPreviewStyles: () => {
          set(state => {
            state.currentStyles = { ...state.previewStyles }
            state.dirtyStyleProperties.clear()
            state.styleValidationErrors = {}
          })
        },

        discardPreviewStyles: () => {
          set(state => {
            state.previewStyles = { ...state.currentStyles }
            state.responsiveStyles = {
              ...state.responsiveStyles,
              base: state.currentStyles
            }
            state.dirtyStyleProperties.clear()
            state.styleValidationErrors = {}
          })
        },

        setPreviewStyle: (property: string, value: PropertyValue) => {
          set(state => {
            state.previewStyles[property] = value
            state.dirtyStyleProperties.add(property)
          })
        },

        // 响应式样式管理
        setCurrentBreakpoint: (breakpoint: string) => {
          set(state => {
            state.currentBreakpoint = breakpoint
          })
        },

        getBreakpointStyles: (breakpoint?: string) => {
          const state = get()
          const targetBreakpoint = breakpoint || state.currentBreakpoint

          if (targetBreakpoint === 'base') {
            return state.previewStyles
          }

          return state.responsiveStyles[targetBreakpoint as keyof ResponsiveStyleConfig] || {}
        },

        setResponsiveStyle: (property: string, value: PropertyValue, breakpoint: string) => {
          set(state => {
            const targetStyles = state.responsiveStyles[breakpoint as keyof ResponsiveStyleConfig] || {}
            targetStyles[property] = value
            state.responsiveStyles[breakpoint as keyof ResponsiveStyleConfig] = targetStyles as CSSProperties

            const propertyKey = `${breakpoint}.${property}`
            state.dirtyStyleProperties.add(propertyKey)
            delete state.styleValidationErrors[propertyKey]
          })
        },

        // 样式验证
        validateStyleProperty: (property: string, value: PropertyValue): StyleValidationResult => {
          const config = STYLE_PROPERTY_CONFIGS[property]
          if (!config) {
            return { valid: true, property, value }
          }

          // 基础类型验证
          if (config.type === 'color') {
            if (typeof value !== 'string') {
              return { valid: false, property, value, message: '颜色值必须是字符串' }
            }
            const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
            const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'black', 'white', 'gray', 'transparent']
            const isValid = hexRegex.test(value) || namedColors.includes(value.toLowerCase())

            return {
              valid: isValid,
              property,
              value,
              message: isValid ? undefined : '请输入有效的颜色值（十六进制或颜色名称）',
              normalized: isValid ? value : undefined
            }
          }

          if (config.type === 'size' || config.type === 'spacing') {
            const stringValue = String(value)
            const sizeRegex = /^(\d+(\.\d+)?)(px|rem|em|%|vh|vw|auto)?$/
            const isValid = sizeRegex.test(stringValue) || stringValue === 'auto'

            return {
              valid: isValid,
              property,
              value,
              message: isValid ? undefined : '请输入有效的尺寸值（如 10px, 1rem, 100%, auto）',
              normalized: isValid ? value : undefined
            }
          }

          return { valid: true, property, value }
        },

        validateAllStyles: (): StyleValidationResult[] => {
          const state = get()
          const results: StyleValidationResult[] = []
          const errors: Record<string, string> = {}

          // 验证基础样式
          Object.entries(state.previewStyles).forEach(([property, value]) => {
            const result = get().validateStyleProperty(property, value)
            results.push(result)
            if (!result.valid) {
              errors[property] = result.message || '验证失败'
            }
          })

          // 验证响应式样式
          Object.entries(state.responsiveStyles).forEach(([breakpoint, styles]) => {
            if (breakpoint !== 'base' && styles) {
              Object.entries(styles as CSSProperties).forEach(([property, value]) => {
                const result = get().validateStyleProperty(property, value)
                results.push({
                  ...result,
                  property: `${breakpoint}.${property}`
                })
                if (!result.valid) {
                  errors[`${breakpoint}.${property}`] = result.message || '验证失败'
                }
              })
            }
          })

          set(state => {
            state.styleValidationResults = results
            state.styleValidationErrors = errors
          })

          return results
        },

        clearStyleValidationErrors: () => {
          set(state => {
            state.styleValidationErrors = {}
            state.styleValidationResults = []
          })
        },

        // 样式预设管理
        loadStylePresets: async () => {
          set(state => {
            state.loadingPresets = true
            state.styleError = null
          })

          try {
            const response = await fetch('/api/styles/presets')
            if (!response.ok) {
              throw new Error('加载样式预设失败')
            }
            const data = await response.json()

            set(state => {
              state.stylePresets = data.presets || []
              state.customStylePresets = data.customPresets || []
              state.loadingPresets = false
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '加载失败'
            set(state => {
              state.styleError = errorMessage
              state.loadingPresets = false
            })
          }
        },

        saveStylePreset: async (preset: Omit<StylePreset, 'id'>): Promise<StylePreset> => {
          set(state => {
            state.savingStyles = true
            state.styleError = null
          })

          try {
            const response = await fetch('/api/styles/presets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(preset)
            })

            if (!response.ok) {
              throw new Error('保存样式预设失败')
            }

            const savedPreset = await response.json()

            set(state => {
              state.customStylePresets.push(savedPreset)
              state.savingStyles = false
            })

            return savedPreset
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '保存失败'
            set(state => {
              state.styleError = errorMessage
              state.savingStyles = false
            })
            throw error
          }
        },

        applyStylePreset: (presetId: string) => {
          set(state => {
            const preset = [...state.stylePresets, ...state.customStylePresets].find(p => p.id === presetId)
            if (preset) {
              // 应用预设样式到预览状态
              state.previewStyles = { ...preset.styles.colors, ...preset.styles.typography, ...preset.styles.spacing, ...preset.styles.borders }
              state.appliedPreset = presetId

              // 标记所有属性为脏属性
              Object.keys(state.previewStyles).forEach(property => {
                state.dirtyStyleProperties.add(property)
              })
            }
          })
        },

        deleteStylePreset: async (presetId: string) => {
          try {
            const response = await fetch(`/api/styles/presets/${presetId}`, {
              method: 'DELETE'
            })

            if (!response.ok) {
              throw new Error('删除样式预设失败')
            }

            set(state => {
              state.customStylePresets = state.customStylePresets.filter(p => p.id !== presetId)
              if (state.appliedPreset === presetId) {
                state.appliedPreset = null
              }
            })
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '删除失败'
            set(state => {
              state.styleError = errorMessage
            })
            throw error
          }
        },

        createCustomPreset: (name: string, description?: string): StylePreset => {
          const state = get()
          const preset: StylePreset = {
            id: `custom_${Date.now()}`,
            name,
            description,
            category: 'basic',
            styles: {
              colors: {},
              typography: {},
              spacing: {},
              borders: {}
            },
            applicableTypes: ['*'],
            isDefault: false
          }

          // 从当前样式提取值
          Object.entries(state.previewStyles).forEach(([property, value]) => {
            if (property.includes('color')) {
              preset.styles.colors![property] = String(value)
            } else if (property.includes('font') || property.includes('text')) {
              preset.styles.typography![property] = value
            } else if (property.includes('margin') || property.includes('padding')) {
              preset.styles.spacing![property] = value
            } else if (property.includes('border')) {
              preset.styles.borders![property] = value
            }
          })

          return preset
        },

        // 样式历史
        saveStyleToHistory: (description?: string) => {
          set(state => {
            const snapshot: StyleHistorySnapshot = {
              styles: { ...state.previewStyles },
              responsiveStyles: { ...state.responsiveStyles },
              timestamp: Date.now(),
              description
            }

            state.styleHistory = {
              past: [...state.styleHistory.past.slice(-19), state.styleHistory.present].filter(Boolean),
              present: snapshot,
              future: []
            }
          })
        },

        undoStyleChange: () => {
          set(state => {
            const { past, present } = state.styleHistory
            if (past.length > 0) {
              const previous = past[past.length - 1]
              const newPast = past.slice(0, past.length - 1)

              state.styleHistory = {
                past: newPast,
                present: previous,
                future: [present, ...state.styleHistory.future]
              }

              if (previous) {
                state.previewStyles = { ...previous.styles }
                state.responsiveStyles = { ...previous.responsiveStyles }
                state.dirtyStyleProperties.clear()
                state.styleValidationErrors = {}
              }
            }
          })
        },

        redoStyleChange: () => {
          set(state => {
            const { future, present } = state.styleHistory
            if (future.length > 0) {
              const next = future[0]
              const newFuture = future.slice(1)

              state.styleHistory = {
                past: [...state.styleHistory.past, present],
                present: next,
                future: newFuture
              }

              if (next) {
                state.previewStyles = { ...next.styles }
                state.responsiveStyles = { ...next.responsiveStyles }
                state.dirtyStyleProperties.clear()
                state.styleValidationErrors = {}
              }
            }
          })
        },

        canUndoStyle: () => {
          return get().styleHistory.past.length > 0
        },

        canRedoStyle: () => {
          return get().styleHistory.future.length > 0
        },

        // 编辑器状态管理
        setActiveTab: (tab: 'styles' | 'presets' | 'responsive') => {
          set(state => {
            state.editorState.activeTab = tab
          })
        },

        toggleSectionCollapsed: (section: string) => {
          set(state => {
            if (state.editorState.collapsedSections.has(section)) {
              state.editorState.collapsedSections.delete(section)
            } else {
              state.editorState.collapsedSections.add(section)
            }
          })
        },

        setAdvancedMode: (enabled: boolean) => {
          set(state => {
            state.editorState.advancedMode = enabled
          })
        },

        // 状态管理
        setLoadingPresets: (loading: boolean) => {
          set(state => {
            state.loadingPresets = loading
          })
        },

        setSavingStyles: (saving: boolean) => {
          set(state => {
            state.savingStyles = saving
          })
        },

        setValidatingStyles: (validating: boolean) => {
          set(state => {
            state.validatingStyles = validating
          })
        },

        setStyleError: (error: string | null) => {
          set(state => {
            state.styleError = error
          })
        },

        // 样式转换和标准化
        normalizeStyleValue: (property: string, value: PropertyValue): PropertyValue => {
          const config = STYLE_PROPERTY_CONFIGS[property]
          if (!config) {
            return value
          }

          const normalizedValue = String(value)

          // 添加单位（如果需要）
          if ((config.type === 'size' || config.type === 'spacing') &&
              config.unit &&
              !normalizedValue.includes('px') &&
              !normalizedValue.includes('rem') &&
              !normalizedValue.includes('em') &&
              !normalizedValue.includes('%') &&
              !normalizedValue.includes('auto')) {
            return `${normalizedValue}${config.unit}`
          }

          return value
        },

        convertToCSS: (styles: CSSProperties): string => {
          return Object.entries(styles)
            .map(([property, value]) => {
              const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase()
              return `${cssProperty}: ${value};`
            })
            .join('\n')
        },

        getStyleDifference: (styles1: CSSProperties, styles2: CSSProperties): CSSProperties => {
          const difference: CSSProperties = {}

          Object.keys(styles2).forEach(key => {
            if (styles1[key] !== styles2[key]) {
              difference[key] = styles2[key]
            }
          })

          return difference
        },

        // 重置操作
        resetStyleState: () => {
          set(state => {
            Object.assign(state, initialStyleState)
          })
        },
      }))
    ),
    {
      name: 'style-store',
    }
  )
)

// 导出样式属性配置
export { STYLE_PROPERTY_CONFIGS }