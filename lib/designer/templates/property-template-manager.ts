/**
 * 属性模板管理系统
 *
 * 提供属性配置模板的创建、管理、应用和存储功能
 */

// 属性模板接口
export interface PropertyTemplate {
  id: string
  name: string
  description?: string
  category?: string
  tags?: string[]
  icon?: string
  version: string
  author?: string
  createdAt: Date
  updatedAt: Date

  // 模板配置
  properties: PropertyTemplateConfig[]

  // 应用条件
  appliesTo?: {
    componentTypes?: string[]
    useCases?: string[]
  }

  // 模板元数据
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    estimatedTime?: number // 分钟
    prerequisites?: string[]
    features?: string[]
  }

  // 预览配置
  preview?: {
    thumbnail?: string
    screenshots?: string[]
    demo?: any
  }
}

// 属性模板配置
export interface PropertyTemplateConfig {
  id: string
  name: string
  type: string
  defaultValue?: any
  required?: boolean
  description?: string
  validation?: any[]
  ui?: {
    group?: string
    order?: number
    label?: string
    help?: string
    placeholder?: string
    options?: any[]
    width?: 'full' | 'half' | 'third' | 'quarter'
    height?: 'auto' | number
  }
  dependencies?: Array<{
    property: string
    condition: (value: any) => boolean
    action: 'show' | 'hide' | 'enable' | 'disable' | 'require'
  }>
}

// 模板应用结果
export interface TemplateApplicationResult {
  success: boolean
  appliedProperties: Record<string, any>
  errors?: string[]
  warnings?: string[]
  skippedProperties?: string[]
}

// 模板存储接口
export interface TemplateStorage {
  save(template: PropertyTemplate): Promise<void>
  load(id: string): Promise<PropertyTemplate | null>
  list(filter?: TemplateFilter): Promise<PropertyTemplate[]>
  delete(id: string): Promise<boolean>
  search(query: string): Promise<PropertyTemplate[]>
}

// 模板过滤器
export interface TemplateFilter {
  category?: string
  tags?: string[]
  componentTypes?: string[]
  author?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  dateRange?: {
    from?: Date
    to?: Date
  }
}

// 本地存储实现
export class LocalTemplateStorage implements TemplateStorage {
  private storageKey = 'property-templates'

  async save(template: PropertyTemplate): Promise<void> {
    const templates = await this.loadAll()
    templates[template.id] = {
      ...template,
      updatedAt: new Date()
    }

    localStorage.setItem(this.storageKey, JSON.stringify(templates))
  }

  async load(id: string): Promise<PropertyTemplate | null> {
    const templates = await this.loadAll()
    const template = templates[id]

    if (template) {
      return {
        ...template,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt)
      }
    }

    return null
  }

  async list(filter?: TemplateFilter): Promise<PropertyTemplate[]> {
    const templates = await this.loadAll()
    let result = Object.values(templates)

    // 应用过滤器
    if (filter) {
      if (filter.category) {
        result = result.filter(t => t.category === filter.category)
      }

      if (filter.tags && filter.tags.length > 0) {
        result = result.filter(t =>
          filter.tags!.some(tag => t.tags?.includes(tag))
        )
      }

      if (filter.author) {
        result = result.filter(t => t.author === filter.author)
      }

      if (filter.difficulty) {
        result = result.filter(t =>
          t.metadata?.difficulty === filter.difficulty
        )
      }

      if (filter.dateRange) {
        result = result.filter(t => {
          const createdAt = new Date(t.createdAt)
          if (filter.dateRange!.from && createdAt < filter.dateRange!.from) {
            return false
          }
          if (filter.dateRange!.to && createdAt > filter.dateRange!.to) {
            return false
          }
          return true
        })
      }
    }

    return result.map(t => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt)
    }))
  }

  async delete(id: string): Promise<boolean> {
    const templates = await this.loadAll()
    if (templates[id]) {
      delete templates[id]
      localStorage.setItem(this.storageKey, JSON.stringify(templates))
      return true
    }
    return false
  }

  async search(query: string): Promise<PropertyTemplate[]> {
    const templates = await this.loadAll()
    const lowerQuery = query.toLowerCase()

    return Object.values(templates)
      .filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      )
      .map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
  }

  private async loadAll(): Promise<Record<string, any>> {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch {
      return {}
    }
  }
}

// 属性模板管理器
export class PropertyTemplateManager {
  private storage: TemplateStorage
  private templates: Map<string, PropertyTemplate> = new Map()
  private loaded = false

  constructor(storage?: TemplateStorage) {
    this.storage = storage || new LocalTemplateStorage()
  }

  /**
   * 确保模板已加载
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.loadTemplates()
      this.loaded = true
    }
  }

  /**
   * 加载所有模板
   */
  async loadTemplates(): Promise<void> {
    try {
      const templates = await this.storage.list()
      this.templates.clear()
      templates.forEach(template => {
        this.templates.set(template.id, template)
      })
    } catch (error) {
      console.error('Failed to load templates:', error)
    }
  }

  /**
   * 创建新模板
   */
  async createTemplate(template: Omit<PropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PropertyTemplate> {
    await this.ensureLoaded()

    const newTemplate: PropertyTemplate = {
      ...template,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0'
    }

    await this.storage.save(newTemplate)
    this.templates.set(newTemplate.id, newTemplate)

    return newTemplate
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: string, updates: Partial<PropertyTemplate>): Promise<PropertyTemplate | null> {
    await this.ensureLoaded()

    const existing = this.templates.get(id)
    if (!existing) return null

    const updated: PropertyTemplate = {
      ...existing,
      ...updates,
      id,
      updatedAt: new Date()
    }

    await this.storage.save(updated)
    this.templates.set(id, updated)

    return updated
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: string): Promise<boolean> {
    await this.ensureLoaded()

    const success = await this.storage.delete(id)
    if (success) {
      this.templates.delete(id)
    }

    return success
  }

  /**
   * 获取模板
   */
  async getTemplate(id: string): Promise<PropertyTemplate | null> {
    await this.ensureLoaded()
    return this.templates.get(id) || null
  }

  /**
   * 列出模板
   */
  async listTemplates(filter?: TemplateFilter): Promise<PropertyTemplate[]> {
    await this.ensureLoaded()

    if (!filter) {
      return Array.from(this.templates.values())
    }

    return this.storage.list(filter)
  }

  /**
   * 搜索模板
   */
  async searchTemplates(query: string): Promise<PropertyTemplate[]> {
    await this.ensureLoaded()
    return this.storage.search(query)
  }

  /**
   * 应用模板
   */
  async applyTemplate(
    templateId: string,
    currentProperties: Record<string, any> = {},
    options: {
      overwrite?: boolean
      applyOnlyMissing?: boolean
      excludeProperties?: string[]
    } = {}
  ): Promise<TemplateApplicationResult> {
    await this.ensureLoaded()

    const template = this.templates.get(templateId)
    if (!template) {
      return {
        success: false,
        appliedProperties: {},
        errors: ['Template not found']
      }
    }

    const result: TemplateApplicationResult = {
      success: true,
      appliedProperties: {},
      errors: [],
      warnings: [],
      skippedProperties: []
    }

    const { overwrite = true, applyOnlyMissing = false, excludeProperties = [] } = options

    for (const propConfig of template.properties) {
      // 跳过排除的属性
      if (excludeProperties.includes(propConfig.id)) {
        result.skippedProperties?.push(propConfig.id)
        continue
      }

      // 检查是否应该应用
      if (applyOnlyMissing && currentProperties[propConfig.id] !== undefined) {
        result.skippedProperties?.push(propConfig.id)
        continue
      }

      if (!overwrite && currentProperties[propConfig.id] !== undefined) {
        result.skippedProperties?.push(propConfig.id)
        continue
      }

      // 应用属性值
      const value = propConfig.defaultValue !== undefined ? propConfig.defaultValue : this.getDefaultValue(propConfig.type)
      result.appliedProperties[propConfig.id] = value
    }

    return result
  }

  /**
   * 从当前属性创建模板
   */
  async createTemplateFromProperties(
    properties: Record<string, any>,
    metadata: {
      name: string
      description?: string
      category?: string
      tags?: string[]
      author?: string
      componentTypes?: string[]
    }
  ): Promise<PropertyTemplate> {
    const templateConfigs: PropertyTemplateConfig[] = []

    for (const [propId, propValue] of Object.entries(properties)) {
      const config: PropertyTemplateConfig = {
        id: propId,
        name: this.getPropertyName(propId),
        type: this.getPropertyType(propValue),
        defaultValue: propValue,
        description: `Property ${propId}`
      }

      templateConfigs.push(config)
    }

    return this.createTemplate({
      ...metadata,
      properties: templateConfigs,
      appliesTo: {
        componentTypes: metadata.componentTypes
      },
      version: '1.0.0'
    })
  }

  /**
   * 复制模板
   */
  async duplicateTemplate(id: string, newName?: string): Promise<PropertyTemplate | null> {
    const original = await this.getTemplate(id)
    if (!original) return null

    const duplicate = {
      ...original,
      name: newName || `${original.name} (Copy)`,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.storage.save(duplicate)
    this.templates.set(duplicate.id, duplicate)

    return duplicate
  }

  /**
   * 导出模板
   */
  async exportTemplate(id: string): Promise<string | null> {
    const template = await this.getTemplate(id)
    if (!template) return null

    return JSON.stringify({
      ...template,
      exportDate: new Date().toISOString(),
      exportedBy: 'PropertyTemplateManager'
    }, null, 2)
  }

  /**
   * 导入模板
   */
  async importTemplate(templateData: string, options: {
    overwrite?: boolean
    generateNewId?: boolean
  } = {}): Promise<PropertyTemplate | null> {
    try {
      const data = JSON.parse(templateData)

      const template: PropertyTemplate = {
        ...data,
        id: options.generateNewId ? this.generateId() : data.id,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date()
      }

      // 检查是否已存在
      if (!options.overwrite) {
        const existing = await this.getTemplate(template.id)
        if (existing) {
          throw new Error(`Template with id ${template.id} already exists`)
        }
      }

      await this.storage.save(template)
      this.templates.set(template.id, template)

      return template
    } catch (error) {
      console.error('Failed to import template:', error)
      return null
    }
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStats(): Promise<{
    total: number
    byCategory: Record<string, number>
    byAuthor: Record<string, number>
    recentlyCreated: PropertyTemplate[]
    recentlyUpdated: PropertyTemplate[]
  }> {
    await this.ensureLoaded()

    const templates = Array.from(this.templates.values())
    const byCategory: Record<string, number> = {}
    const byAuthor: Record<string, number> = {}

    templates.forEach(template => {
      // 按分类统计
      if (template.category) {
        byCategory[template.category] = (byCategory[template.category] || 0) + 1
      }

      // 按作者统计
      if (template.author) {
        byAuthor[template.author] = (byAuthor[template.author] || 0) + 1
      }
    })

    // 最近创建的模板
    const recentlyCreated = templates
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    // 最近更新的模板
    const recentlyUpdated = templates
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)

    return {
      total: templates.length,
      byCategory,
      byAuthor,
      recentlyCreated,
      recentlyUpdated
    }
  }

  // 私有辅助方法

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultValue(type: string): any {
    switch (type) {
      case 'string':
        return ''
      case 'number':
        return 0
      case 'boolean':
        return false
      case 'array':
        return []
      case 'object':
        return {}
      default:
        return null
    }
  }

  private getPropertyName(id: string): string {
    return id
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  private getPropertyType(value: any): string {
    if (Array.isArray(value)) return 'array'
    if (typeof value === 'object' && value !== null) return 'object'
    return typeof value
  }
}

// 创建全局模板管理器实例
export const globalTemplateManager = new PropertyTemplateManager()

// 便捷函数
export const createPropertyTemplate = async (
  template: Omit<PropertyTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PropertyTemplate> => {
  return globalTemplateManager.createTemplate(template)
}

export const applyPropertyTemplate = async (
  templateId: string,
  properties: Record<string, any> = {},
  options?: Parameters<PropertyTemplateManager['applyTemplate']>[2]
): Promise<TemplateApplicationResult> => {
  return globalTemplateManager.applyTemplate(templateId, properties, options)
}

export const getPropertyTemplates = async (
  filter?: TemplateFilter
): Promise<PropertyTemplate[]> => {
  return globalTemplateManager.listTemplates(filter)
}

export const searchPropertyTemplates = async (
  query: string
): Promise<PropertyTemplate[]> => {
  return globalTemplateManager.searchTemplates(query)
}