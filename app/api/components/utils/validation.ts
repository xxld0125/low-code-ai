import { z } from 'zod'
import { NextRequest } from 'next/server'
import {
  ComponentsQueryParams,
  PropsQueryParams,
  CreateComponentRequest,
  UpdateComponentRequest,
  CreatePropRequest,
  isValidComponentCategory,
  isValidPropDataType,
  isValidPropGroup,
} from '../types'

// 从 error-handler 导入 ValidationError 类型
interface ValidationError {
  issues?: Array<{
    path: (string | number)[]
    message: string
    code: string
  }>
  message?: string
}

// 类型定义
type ComponentDataInput = Partial<CreateComponentRequest | UpdateComponentRequest>
type ComponentDataOutput = ComponentDataInput
type PropDataInput = Record<string, unknown>
type PropDataOutput = Record<string, unknown>
interface PropOption {
  value: string | number | boolean
  label: string
  description?: string
}
import { ApiErrorHandler } from './error-handler'

// =============================================================================
// 请求参数验证模式
// =============================================================================

/**
 * 组件列表查询参数验证模式
 */
export const ComponentsQuerySchema = z.object({
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).default('active'),
  search: z.string().max(100, '搜索关键词不能超过100个字符').optional(),
  page: z.coerce.number().min(1, '页码必须大于0').max(1000, '页码不能超过1000').default(1),
  limit: z.coerce.number().min(1, '每页数量必须大于0').max(100, '每页数量不能超过100').default(20),
})

/**
 * 属性查询参数验证模式
 */
export const PropsQuerySchema = z.object({
  group: z.enum(['basic', 'style', 'layout', 'advanced']).optional(),
})

/**
 * 创建组件请求验证模式
 */
export const CreateComponentSchema = z.object({
  name: z
    .string()
    .min(1, '组件名称不能为空')
    .max(50, '组件名称不能超过50个字符')
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '组件名称只能包含字母、数字、中文、下划线和连字符'),
  description: z.string().max(500, '组件描述不能超过500个字符').optional(),
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']),
  subcategory: z
    .string()
    .max(50, '子分类名称不能超过50个字符')
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '子分类名称只能包含字母、数字、中文、下划线和连字符')
    .optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, '标签不能为空')
        .max(30, '标签长度不能超过30个字符')
        .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '标签只能包含字母、数字、中文、下划线和连字符')
    )
    .max(10, '标签数量不能超过10个')
    .optional(),
  component_path: z
    .string()
    .min(1, '组件路径不能为空')
    .max(200, '组件路径不能超过200个字符')
    .regex(
      /^\/[\w\-\/]*$/,
      '组件路径格式不正确，应以/开头，只包含字母、数字、下划线、连字符和斜杠'
    ),
  preview_path: z
    .string()
    .min(1, '预览路径不能为空')
    .max(200, '预览路径不能超过200个字符')
    .regex(
      /^\/[\w\-\/]*$/,
      '预览路径格式不正确，应以/开头，只包含字母、数字、下划线、连字符和斜杠'
    ),
  icon_path: z
    .string()
    .min(1, '图标路径不能为空')
    .max(200, '图标路径不能超过200个字符')
    .regex(
      /^\/[\w\-\/]*$/,
      '图标路径格式不正确，应以/开头，只包含字母、数字、下划线、连字符和斜杠'
    ),
  props_schema: z.array(z.unknown()).optional(),
  default_props: z.record(z.string(), z.unknown()).optional(),
  default_styles: z.record(z.string(), z.unknown()).optional(),
})

/**
 * 更新组件请求验证模式
 */
export const UpdateComponentSchema = z.object({
  name: z
    .string()
    .min(1, '组件名称不能为空')
    .max(50, '组件名称不能超过50个字符')
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '组件名称只能包含字母、数字、中文、下划线和连字符')
    .optional(),
  description: z.string().max(500, '组件描述不能超过500个字符').optional(),
  category: z.enum(['basic', 'display', 'layout', 'form', 'advanced', 'custom']).optional(),
  tags: z
    .array(
      z
        .string()
        .min(1, '标签不能为空')
        .max(30, '标签长度不能超过30个字符')
        .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, '标签只能包含字母、数字、中文、下划线和连字符')
    )
    .max(10, '标签数量不能超过10个')
    .optional(),
  props_schema: z.array(z.unknown()).optional(),
  default_props: z.record(z.string(), z.unknown()).optional(),
  default_styles: z.record(z.string(), z.unknown()).optional(),
  status: z.enum(['draft', 'active', 'deprecated', 'archived']).optional(),
})

/**
 * 创建属性请求验证模式
 */
export const CreatePropSchema = z.object({
  name: z
    .string()
    .min(1, '属性名称不能为空')
    .max(50, '属性名称不能超过50个字符')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, '属性名称必须以字母开头，只能包含字母、数字和下划线'),
  type: z.enum(['string', 'number', 'boolean', 'color', 'select', 'array', 'object']),
  label: z.string().min(1, '属性标签不能为空').max(100, '属性标签不能超过100个字符'),
  description: z.string().max(500, '属性描述不能超过500个字符').optional(),
  required: z.boolean().default(false),
  default_value: z.unknown().optional(),
  group: z.enum(['basic', 'style', 'layout', 'advanced']).default('basic'),
  order: z.number().int().min(0, '显示顺序不能小于0').max(1000, '显示顺序不能超过1000').default(0),
  options: z
    .array(
      z.object({
        value: z.string().min(1, '选项值不能为空'),
        label: z.string().min(1, '选项标签不能为空').max(50, '选项标签不能超过50个字符'),
        description: z.string().max(200, '选项描述不能超过200个字符').optional(),
      })
    )
    .optional(),
  validation: z
    .array(
      z.object({
        type: z.enum(['required', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'custom']),
        value: z.unknown(),
        message: z.string().min(1, '验证消息不能为空').max(200, '验证消息不能超过200个字符'),
      })
    )
    .optional(),
  editor_config: z
    .object({
      type: z.enum(['text', 'number', 'color', 'select', 'checkbox', 'radio', 'textarea', 'json']),
      placeholder: z.string().max(100, '占位符不能超过100个字符').optional(),
      help: z.string().max(500, '帮助文本不能超过500个字符').optional(),
      config: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
})

/**
 * 组件ID验证模式
 */
export const ComponentIdSchema = z
  .string()
  .min(1, '组件ID不能为空')
  .max(100, '组件ID不能超过100个字符')
  .regex(/^[a-zA-Z0-9_-]+$/, '组件ID只能包含字母、数字、下划线和连字符')

// =============================================================================
// 验证函数
// =============================================================================

/**
 * 验证组件列表查询参数
 */
export function validateComponentsQuery(searchParams: URLSearchParams): ComponentsQueryParams {
  const result = ComponentsQuerySchema.safeParse({
    category: searchParams.get('category'),
    status: searchParams.get('status'),
    search: searchParams.get('search'),
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
  })

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

/**
 * 验证属性查询参数
 */
export function validatePropsQuery(searchParams: URLSearchParams): PropsQueryParams {
  const result = PropsQuerySchema.safeParse({
    group: searchParams.get('group'),
  })

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

/**
 * 验证创建组件请求
 */
export function validateCreateComponentRequest(body: unknown): CreateComponentRequest {
  const result = CreateComponentSchema.safeParse(body)

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

/**
 * 验证更新组件请求
 */
export function validateUpdateComponentRequest(body: unknown): UpdateComponentRequest {
  const result = UpdateComponentSchema.safeParse(body)

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

/**
 * 验证创建属性请求
 */
export function validateCreatePropRequest(body: unknown): CreatePropRequest {
  const result = CreatePropSchema.safeParse(body)

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

/**
 * 验证组件ID
 */
export function validateComponentId(id: string): string {
  const result = ComponentIdSchema.safeParse(id)

  if (!result.success) {
    throw ApiErrorHandler.handleValidationError(result.error as ValidationError)
  }

  return result.data
}

// =============================================================================
// 安全检查函数
// =============================================================================

/**
 * 检查字符串是否安全（防止XSS攻击）
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // 移除可能的HTML标签
    .replace(/javascript:/gi, '') // 移除javascript协议
    .replace(/on\w+=/gi, '') // 移除事件处理器
    .trim()
}

/**
 * 检查路径是否安全
 */
export function isValidPath(path: string): boolean {
  // 防止路径遍历攻击
  if (path.includes('..') || path.includes('~')) {
    return false
  }

  // 检查路径格式
  const pathRegex = /^\/[a-zA-Z0-9\-_\/]*$/
  return pathRegex.test(path)
}

/**
 * 检查搜索关键词是否安全
 */
export function sanitizeSearchKeyword(keyword: string): string {
  return sanitizeString(keyword)
    .replace(/['"\\]/g, '') // 移除引号和反斜杠
    .substring(0, 100) // 限制长度
}

/**
 * 检查组件名称是否安全
 */
export function sanitizeComponentName(name: string): string {
  return sanitizeString(name)
    .replace(/[^\w\u4e00-\u9fa5\-_]/g, '') // 只保留字母、数字、中文、连字符、下划线
    .substring(0, 50)
}

/**
 * 检查用户权限
 */
export function checkUserPermission(
  user: { id: string; permissions?: string[] } | null,
  requiredPermission?: string
): boolean {
  if (!user) {
    return false
  }

  // 如果没有指定权限要求，只要是登录用户就允许访问
  if (!requiredPermission) {
    return true
  }

  // 检查用户是否有指定权限
  return user.permissions?.includes(requiredPermission) || false
}

/**
 * 限制请求频率（简单的内存限制，生产环境建议使用Redis）
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const windowStart = now - this.windowMs

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }

    const timestamps = this.requests.get(identifier)!

    // 清理过期的请求记录
    const validTimestamps = timestamps.filter(timestamp => timestamp > windowStart)

    if (validTimestamps.length >= this.maxRequests) {
      return false
    }

    validTimestamps.push(now)
    this.requests.set(identifier, validTimestamps)

    return true
  }
}

// 全局速率限制器实例
const rateLimiter = new RateLimiter(100, 60000) // 每分钟最多100个请求

/**
 * 检查请求频率
 */
export function checkRateLimit(identifier: string): boolean {
  return rateLimiter.isAllowed(identifier)
}

/**
 * 从请求中提取客户端标识符用于速率限制
 */
export function getClientIdentifier(request: NextRequest): string {
  // 优先使用用户ID
  const userId = request.headers.get('x-user-id')
  if (userId) {
    return `user:${userId}`
  }

  // 使用IP地址
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

// =============================================================================
// 数据清理和转换函数
// =============================================================================

/**
 * 清理组件数据
 */
export function sanitizeComponentData(data: ComponentDataInput): ComponentDataOutput {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized: ComponentDataOutput = {}

  // 清理字符串字段
  if (data.name) {
    sanitized.name = sanitizeComponentName(data.name)
  }

  if (data.description) {
    sanitized.description = sanitizeString(data.description)
  }

  if (data.category && isValidComponentCategory(data.category)) {
    sanitized.category = data.category
  }

  if (data.subcategory) {
    sanitized.subcategory = sanitizeString(data.subcategory)
  }

  if (data.tags && Array.isArray(data.tags)) {
    sanitized.tags = data.tags
      .filter((tag: unknown) => typeof tag === 'string')
      .map((tag: string) => sanitizeString(tag))
      .filter((tag: string) => tag.length > 0)
      .slice(0, 10)
  }

  // 验证路径字段
  if (data.component_path && isValidPath(data.component_path)) {
    sanitized.component_path = data.component_path
  }

  if (data.preview_path && isValidPath(data.preview_path)) {
    sanitized.preview_path = data.preview_path
  }

  if (data.icon_path && isValidPath(data.icon_path)) {
    sanitized.icon_path = data.icon_path
  }

  // 直接复制其他字段
  if (data.props_schema) {
    sanitized.props_schema = data.props_schema
  }

  if (data.default_props) {
    sanitized.default_props = data.default_props
  }

  if (data.default_styles) {
    sanitized.default_styles = data.default_styles
  }

  return sanitized
}

/**
 * 清理属性数据
 */
export function sanitizePropData(data: PropDataInput): PropDataOutput {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sanitized: PropDataOutput = {}

  // 清理基本字段
  if (data.name && typeof data.name === 'string') {
    sanitized.name = sanitizeString(data.name).replace(/[^a-zA-Z0-9_]/g, '')
  }

  if (data.type && typeof data.type === 'string' && isValidPropDataType(data.type)) {
    sanitized.type = data.type
  }

  if (data.label && typeof data.label === 'string') {
    sanitized.label = sanitizeString(data.label)
  }

  if (data.description && typeof data.description === 'string') {
    sanitized.description = sanitizeString(data.description)
  }

  // 复制布尔值和数字
  if (typeof data.required === 'boolean') {
    sanitized.required = data.required
  }

  if (typeof data.order === 'number') {
    sanitized.order = Math.max(0, Math.min(1000, Math.floor(data.order)))
  }

  if (data.group && typeof data.group === 'string' && isValidPropGroup(data.group)) {
    sanitized.group = data.group
  }

  // 清理选项
  if (data.options && Array.isArray(data.options)) {
    sanitized.options = data.options
      .filter((option: unknown) => option && typeof option === 'object')
      .map((option: PropOption) => ({
        value: sanitizeString(String(option.value || '')),
        label: sanitizeString(option.label || ''),
        description: option.description ? sanitizeString(option.description) : undefined,
      }))
      .filter((option: PropOption) => option.value && option.label)
  }

  // 复制其他字段
  if (data.default_value !== undefined) {
    sanitized.default_value = data.default_value
  }

  if (data.validation) {
    sanitized.validation = data.validation
  }

  if (data.editor_config) {
    sanitized.editor_config = data.editor_config
  }

  return sanitized
}

// =============================================================================
