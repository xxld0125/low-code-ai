/**
 * 样式预设管理系统
 * 提供样式预设的创建、存储、应用、验证等功能
 */

import type { StylePreset, CSSProperties } from '@/types/designer'

// 预定义样式预设
export const BUILTIN_STYLE_PRESETS: StylePreset[] = [
  // 基础预设
  {
    id: 'default',
    name: '默认样式',
    description: '组件的默认样式配置',
    category: 'basic',
    styles: {
      colors: {},
      typography: {},
      spacing: {},
      borders: {},
    },
    applicableTypes: ['*'],
    isDefault: true,
  },
  {
    id: 'minimal',
    name: '极简风格',
    description: '简洁干净的极简设计风格',
    category: 'minimalist',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#000000',
        borderColor: '#E5E7EB',
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '8px 16px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '4px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button', 'card', 'input'],
    isDefault: false,
  },
  {
    id: 'modern',
    name: '现代风格',
    description: '现代设计风格，强调阴影和圆角',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderColor: '#E5E7EB',
      },
      typography: {
        fontSize: '14px',
        fontWeight: '500',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '12px 24px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '8px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button', 'card', 'modal'],
    isDefault: false,
  },
  {
    id: 'classic',
    name: '经典风格',
    description: '经典的设计风格，适合传统应用',
    category: 'classic',
    styles: {
      colors: {
        backgroundColor: '#F9FAFB',
        color: '#374151',
        borderColor: '#D1D5DB',
      },
      typography: {
        fontSize: '14px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        lineHeight: '1.4',
      },
      spacing: {
        padding: '10px 20px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '2px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button', 'form', 'table'],
    isDefault: false,
  },
  {
    id: 'colorful',
    name: '多彩风格',
    description: '鲜艳的色彩搭配，适合活泼的应用',
    category: 'colorful',
    styles: {
      colors: {
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        borderColor: '#2563EB',
      },
      typography: {
        fontSize: '14px',
        fontWeight: '600',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '12px 24px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '6px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button', 'badge', 'alert'],
    isDefault: false,
  },

  // 按钮预设
  {
    id: 'button-primary',
    name: '主按钮',
    description: '主要操作按钮样式',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: '#3B82F6',
        color: '#FFFFFF',
        borderColor: '#2563EB',
      },
      typography: {
        fontSize: '14px',
        fontWeight: '500',
      },
      spacing: {
        padding: '8px 16px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '6px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button'],
    isDefault: false,
  },
  {
    id: 'button-secondary',
    name: '次按钮',
    description: '次要操作按钮样式',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#374151',
        borderColor: '#D1D5DB',
      },
      typography: {
        fontSize: '14px',
        fontWeight: '500',
      },
      spacing: {
        padding: '8px 16px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '6px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button'],
    isDefault: false,
  },
  {
    id: 'button-outline',
    name: '边框按钮',
    description: '只有边框的按钮样式',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: 'transparent',
        color: '#3B82F6',
        borderColor: '#3B82F6',
      },
      typography: {
        fontSize: '14px',
        fontWeight: '500',
      },
      spacing: {
        padding: '8px 16px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '6px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['button'],
    isDefault: false,
  },

  // 卡片预设
  {
    id: 'card-default',
    name: '默认卡片',
    description: '标准卡片容器样式',
    category: 'basic',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderColor: '#E5E7EB',
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '16px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '8px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['card', 'panel'],
    isDefault: false,
  },
  {
    id: 'card-elevated',
    name: '阴影卡片',
    description: '带阴影效果的卡片样式',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderColor: 'transparent',
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '20px',
        margin: '0',
      },
      borders: {
        borderWidth: '0px',
        borderRadius: '12px',
        borderStyle: 'solid',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
    applicableTypes: ['card', 'panel'],
    isDefault: false,
  },

  // 输入框预设
  {
    id: 'input-default',
    name: '默认输入框',
    description: '标准输入框样式',
    category: 'basic',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderColor: '#D1D5DB',
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '8px 12px',
        margin: '0',
      },
      borders: {
        borderWidth: '1px',
        borderRadius: '6px',
        borderStyle: 'solid',
      },
    },
    applicableTypes: ['input', 'textarea', 'select'],
    isDefault: false,
  },
  {
    id: 'input-focused',
    name: '聚焦输入框',
    description: '输入框聚焦状态样式',
    category: 'modern',
    styles: {
      colors: {
        backgroundColor: '#FFFFFF',
        color: '#1F2937',
        borderColor: '#3B82F6',
      },
      typography: {
        fontSize: '14px',
        lineHeight: '1.5',
      },
      spacing: {
        padding: '8px 12px',
        margin: '0',
      },
      borders: {
        borderWidth: '2px',
        borderRadius: '6px',
        borderStyle: 'solid',
        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
      },
    },
    applicableTypes: ['input', 'textarea', 'select'],
    isDefault: false,
  },
]

// 样式预设管理器类
export class StylePresetManager {
  private presets: Map<string, StylePreset> = new Map()
  private customPresets: Map<string, StylePreset> = new Map()
  private storageKey = 'style-presets-custom'

  constructor() {
    this.loadBuiltinPresets()
    this.loadCustomPresets()
  }

  // 加载内置预设
  private loadBuiltinPresets(): void {
    BUILTIN_STYLE_PRESETS.forEach(preset => {
      this.presets.set(preset.id, preset)
    })
  }

  // 加载自定义预设
  private loadCustomPresets(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const customPresets = JSON.parse(stored) as StylePreset[]
        customPresets.forEach(preset => {
          this.customPresets.set(preset.id, preset)
        })
      }
    } catch (error) {
      console.warn('Failed to load custom style presets:', error)
    }
  }

  // 保存自定义预设
  private saveCustomPresets(): void {
    if (typeof window === 'undefined') return

    try {
      const customPresets = Array.from(this.customPresets.values())
      localStorage.setItem(this.storageKey, JSON.stringify(customPresets))
    } catch (error) {
      console.warn('Failed to save custom style presets:', error)
    }
  }

  // 获取所有预设
  getAllPresets(): StylePreset[] {
    return [
      ...Array.from(this.presets.values()),
      ...Array.from(this.customPresets.values())
    ]
  }

  // 获取内置预设
  getBuiltinPresets(): StylePreset[] {
    return Array.from(this.presets.values())
  }

  // 获取自定义预设
  getCustomPresets(): StylePreset[] {
    return Array.from(this.customPresets.values())
  }

  // 根据ID获取预设
  getPreset(id: string): StylePreset | null {
    return this.presets.get(id) || this.customPresets.get(id) || null
  }

  // 根据类型获取适用的预设
  getApplicablePresets(componentType: string): StylePreset[] {
    const allPresets = this.getAllPresets()
    return allPresets.filter(preset =>
      preset.applicableTypes.includes('*') ||
      preset.applicableTypes.includes(componentType)
    )
  }

  // 根据分类获取预设
  getPresetsByCategory(category: string): StylePreset[] {
    const allPresets = this.getAllPresets()
    return allPresets.filter(preset => preset.category === category)
  }

  // 添加自定义预设
  addCustomPreset(preset: Omit<StylePreset, 'id'>): StylePreset {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const newPreset: StylePreset = {
      ...preset,
      id,
      isDefault: false,
    }

    this.customPresets.set(id, newPreset)
    this.saveCustomPresets()
    return newPreset
  }

  // 更新自定义预设
  updateCustomPreset(id: string, updates: Partial<StylePreset>): StylePreset | null {
    const preset = this.customPresets.get(id)
    if (!preset) return null

    const updatedPreset = { ...preset, ...updates }
    this.customPresets.set(id, updatedPreset)
    this.saveCustomPresets()
    return updatedPreset
  }

  // 删除自定义预设
  deleteCustomPreset(id: string): boolean {
    const deleted = this.customPresets.delete(id)
    if (deleted) {
      this.saveCustomPresets()
    }
    return deleted
  }

  // 应用预设到样式对象
  applyPreset(presetId: string, currentStyles: CSSProperties = {}): CSSProperties {
    const preset = this.getPreset(presetId)
    if (!preset) return currentStyles

    const appliedStyles = { ...currentStyles }

    // 应用颜色样式
    if (preset.styles.colors) {
      Object.entries(preset.styles.colors).forEach(([property, value]) => {
        if (value) {
          appliedStyles[property] = value
        }
      })
    }

    // 应用文字样式
    if (preset.styles.typography) {
      Object.entries(preset.styles.typography).forEach(([property, value]) => {
        if (value) {
          appliedStyles[property] = String(value)
        }
      })
    }

    // 应用间距样式
    if (preset.styles.spacing) {
      Object.entries(preset.styles.spacing).forEach(([property, value]) => {
        if (value) {
          appliedStyles[property] = String(value)
        }
      })
    }

    // 应用边框样式
    if (preset.styles.borders) {
      Object.entries(preset.styles.borders).forEach(([property, value]) => {
        if (value) {
          appliedStyles[property] = String(value)
        }
      })
    }

    return appliedStyles
  }

  // 从当前样式创建预设
  createPresetFromStyles(
    name: string,
    styles: CSSProperties,
    options: {
      description?: string
      category?: StylePreset['category']
      applicableTypes?: string[]
    } = {}
  ): StylePreset {
    const presetColors: Record<string, string> = {}
    const presetTypography: Record<string, string | number> = {}
    const presetSpacing: Record<string, string | number> = {}
    const presetBorders: Record<string, string | number> = {}

    // 分类样式属性
    Object.entries(styles).forEach(([property, value]) => {
      if (!value) return

      const colorProperties = ['backgroundColor', 'color', 'borderColor', 'outlineColor']
      const typographyProperties = ['fontSize', 'fontFamily', 'fontWeight', 'lineHeight', 'letterSpacing', 'textAlign']
      const spacingProperties = ['padding', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']
      const borderProperties = ['borderWidth', 'borderRadius', 'borderStyle', 'boxShadow']

      if (colorProperties.includes(property)) {
        presetColors[property] = String(value)
      } else if (typographyProperties.includes(property)) {
        presetTypography[property] = value
      } else if (spacingProperties.includes(property)) {
        presetSpacing[property] = value
      } else if (borderProperties.includes(property)) {
        presetBorders[property] = value
      }
    })

    const preset: StylePreset = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: options.description,
      category: options.category || 'basic',
      styles: {
        colors: presetColors,
        typography: presetTypography,
        spacing: presetSpacing,
        borders: presetBorders,
      },
      applicableTypes: options.applicableTypes || ['*'],
      isDefault: false,
    }

    this.customPresets.set(preset.id, preset)
    this.saveCustomPresets()
    return preset
  }

  // 验证预设
  validatePreset(preset: StylePreset): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!preset.name || preset.name.trim() === '') {
      errors.push('预设名称不能为空')
    }

    if (!preset.category) {
      errors.push('预设分类不能为空')
    }

    if (preset.applicableTypes?.length === 0) {
      errors.push('适用组件类型不能为空')
    }

    if (!preset.styles) {
      errors.push('样式配置不能为空')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // 搜索预设
  searchPresets(query: string): StylePreset[] {
    const allPresets = this.getAllPresets()
    const lowerQuery = query.toLowerCase()

    return allPresets.filter(preset =>
      preset.name.toLowerCase().includes(lowerQuery) ||
      (preset.description?.toLowerCase().includes(lowerQuery)) ||
      preset.category.toLowerCase().includes(lowerQuery)
    )
  }

  // 导出预设
  exportPresets(presetIds?: string[]): string {
    const presetsToExport = presetIds
      ? presetIds.map(id => this.getPreset(id)).filter(Boolean) as StylePreset[]
      : this.getAllPresets()

    return JSON.stringify(presetsToExport, null, 2)
  }

  // 导入预设
  importPresets(presetData: string, overwrite = false): { success: StylePreset[]; errors: string[] } {
    try {
      const importedPresets = JSON.parse(presetData) as StylePreset[]
      const success: StylePreset[] = []
      const errors: string[] = []

      importedPresets.forEach((preset, index) => {
        const validation = this.validatePreset(preset)
        if (!validation.valid) {
          errors.push(`预设 ${index + 1}: ${validation.errors.join(', ')}`)
          return
        }

        const existingPreset = this.getPreset(preset.id)
        if (existingPreset && !overwrite) {
          errors.push(`预设 ${index + 1}: ID ${preset.id} 已存在`)
          return
        }

        if (existingPreset) {
          this.updateCustomPreset(preset.id, preset)
        } else {
          this.customPresets.set(preset.id, { ...preset, isDefault: false })
        }

        success.push(preset)
      })

      this.saveCustomPresets()
      return { success, errors }
    } catch (error) {
      return {
        success: [],
        errors: [`导入失败: ${error instanceof Error ? error.message : '未知错误'}`]
      }
    }
  }

  // 获取预设统计信息
  getStatistics(): {
    total: number
    builtin: number
    custom: number
    byCategory: Record<string, number>
  } {
    const allPresets = this.getAllPresets()
    const builtinCount = this.presets.size
    const customCount = this.customPresets.size

    const byCategory: Record<string, number> = {}
    allPresets.forEach(preset => {
      byCategory[preset.category] = (byCategory[preset.category] || 0) + 1
    })

    return {
      total: allPresets.length,
      builtin: builtinCount,
      custom: customCount,
      byCategory,
    }
  }
}

// 创建全局实例
export const stylePresetManager = new StylePresetManager()

// 便捷函数
export const getAllStylePresets = () => stylePresetManager.getAllPresets()
export const getStylePreset = (id: string) => stylePresetManager.getPreset(id)
export const createStylePreset = (preset: Omit<StylePreset, 'id'>) => stylePresetManager.addCustomPreset(preset)
export const applyStylePreset = (presetId: string, styles: CSSProperties) => stylePresetManager.applyPreset(presetId, styles)

export default stylePresetManager