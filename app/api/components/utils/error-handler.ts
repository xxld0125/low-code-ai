import { NextResponse } from 'next/server'
import { ErrorResponse, ERROR_CODES, HTTP_STATUS } from '../types'

/**
 * 验证错误接口
 */
interface ValidationError {
  issues?: Array<{
    path: (string | number)[]
    message: string
    code: string
  }>
  message?: string
}

/**
 * 数据库错误接口
 */
interface DatabaseError {
  code?: string
  message: string
  details?: string
  hint?: string
  constraint?: string
}

/**
 * 通用错误接口
 */
interface GenericError {
  message: string
  stack?: string
  cause?: unknown
}

/**
 * Zod Schema 接口
 */
interface ZodSchema<T> {
  safeParse: (data: unknown) => {
    success: boolean
    data?: T
    error?: ValidationError
  }
}

/**
 * API错误处理器类
 * 提供统一的错误处理和响应格式
 */
export class ApiErrorHandler {
  /**
   * 创建错误响应
   */
  static createErrorResponse(
    code: keyof typeof ERROR_CODES,
    message?: string,
    details?: unknown,
    status: keyof typeof HTTP_STATUS = 'INTERNAL_SERVER_ERROR'
  ): NextResponse<ErrorResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: ERROR_CODES[code],
          message: message || this.getDefaultMessage(code),
          details,
        },
      } as ErrorResponse,
      { status: HTTP_STATUS[status] }
    )
  }

  /**
   * 处理验证错误
   */
  static handleValidationError(error: ValidationError): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'VALIDATION_ERROR',
      '请求数据验证失败',
      error.issues || error.message,
      'BAD_REQUEST'
    )
  }

  /**
   * 处理认证错误
   */
  static handleAuthError(message?: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'UNAUTHORIZED',
      message || '未授权访问，请先登录',
      undefined,
      'UNAUTHORIZED'
    )
  }

  /**
   * 处理权限错误
   */
  static handleForbiddenError(message?: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'FORBIDDEN',
      message || '权限不足，无法访问此资源',
      undefined,
      'FORBIDDEN'
    )
  }

  /**
   * 处理资源未找到错误
   */
  static handleNotFoundError(resource: string, id?: string): NextResponse<ErrorResponse> {
    const message = id ? `${resource}"${id}"不存在` : `${resource}不存在`
    return this.createErrorResponse('NOT_FOUND', message, { resource, id }, 'NOT_FOUND')
  }

  /**
   * 处理组件未找到错误
   */
  static handleComponentNotFound(id: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'COMPONENT_NOT_FOUND',
      `组件"${id}"不存在`,
      { component_id: id },
      'NOT_FOUND'
    )
  }

  /**
   * 处理属性未找到错误
   */
  static handlePropNotFound(name: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'PROP_NOT_FOUND',
      `属性"${name}"不存在`,
      { prop_name: name },
      'NOT_FOUND'
    )
  }

  /**
   * 处理资源冲突错误
   */
  static handleConflictError(message: string, details?: unknown): NextResponse<ErrorResponse> {
    return this.createErrorResponse('CONFLICT', message, details, 'CONFLICT')
  }

  /**
   * 处理组件已存在错误
   */
  static handleComponentExists(name: string, category?: string): NextResponse<ErrorResponse> {
    const message = category ? `组件"${name}"在"${category}"分类中已存在` : `组件"${name}"已存在`

    return this.createErrorResponse(
      'COMPONENT_ALREADY_EXISTS',
      message,
      { component_name: name, category },
      'CONFLICT'
    )
  }

  /**
   * 处理属性已存在错误
   */
  static handlePropExists(name: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'PROP_ALREADY_EXISTS',
      `属性"${name}"已存在`,
      { prop_name: name },
      'CONFLICT'
    )
  }

  /**
   * 处理组件正在使用错误
   */
  static handleComponentInUse(name: string, usageCount?: number): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'COMPONENT_IN_USE',
      `组件"${name}"正在被使用，无法删除`,
      { component_name: name, usage_count: usageCount },
      'CONFLICT'
    )
  }

  /**
   * 处理组件已废弃错误
   */
  static handleComponentDeprecated(name: string): NextResponse<ErrorResponse> {
    return this.createErrorResponse(
      'COMPONENT_DEPRECATED',
      `组件"${name}"已废弃，无法执行此操作`,
      { component_name: name },
      'CONFLICT'
    )
  }

  /**
   * 处理数据库错误
   */
  static handleDatabaseError(
    error: DatabaseError,
    operation?: string
  ): NextResponse<ErrorResponse> {
    console.error(`数据库${operation || '操作'}失败:`, error)

    // 根据不同的数据库错误类型返回相应的错误
    if (error.code === 'PGRST116') {
      return this.handleNotFoundError('资源')
    }

    if (error.code === '23505') {
      return this.handleConflictError('数据冲突，可能是重复的唯一键')
    }

    if (error.code === '23503') {
      return this.createErrorResponse(
        'BAD_REQUEST',
        '外键约束错误，关联的资源不存在',
        { constraint: error.constraint },
        'BAD_REQUEST'
      )
    }

    return this.createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      `数据库${operation || '操作'}失败`,
      error.message,
      'INTERNAL_SERVER_ERROR'
    )
  }

  /**
   * 处理通用服务器错误
   */
  static handleServerError(error: GenericError, operation?: string): NextResponse<ErrorResponse> {
    console.error(`${operation || 'API'}错误:`, error)

    return this.createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      '服务器内部错误',
      error instanceof Error ? error.message : '未知错误',
      'INTERNAL_SERVER_ERROR'
    )
  }

  /**
   * 获取默认错误消息
   */
  private static getDefaultMessage(code: keyof typeof ERROR_CODES): string {
    const messages: Record<keyof typeof ERROR_CODES, string> = {
      INTERNAL_SERVER_ERROR: '服务器内部错误',
      BAD_REQUEST: '请求参数错误',
      UNAUTHORIZED: '未授权访问',
      FORBIDDEN: '权限不足',
      NOT_FOUND: '资源不存在',
      CONFLICT: '资源冲突',
      VALIDATION_ERROR: '请求数据验证失败',
      INVALID_COMPONENT_ID: '组件ID无效',
      INVALID_PROP_TYPE: '属性类型无效',
      MISSING_REQUIRED_FIELD: '缺少必填字段',
      COMPONENT_NOT_FOUND: '组件不存在',
      COMPONENT_ALREADY_EXISTS: '组件已存在',
      COMPONENT_IN_USE: '组件正在使用中',
      COMPONENT_DEPRECATED: '组件已废弃',
      PROP_NOT_FOUND: '属性不存在',
      PROP_ALREADY_EXISTS: '属性已存在',
      INVALID_PROP_VALUE: '属性值无效',
      INSUFFICIENT_PERMISSIONS: '权限不足',
      COMPONENT_ACCESS_DENIED: '组件访问被拒绝',
    }

    return messages[code] || '未知错误'
  }
}

/**
 * 错误边界装饰器
 * 用于包装API处理函数，提供统一的错误处理
 */
export function withErrorHandler<TRequest = unknown, TResponse = NextResponse>(
  handler: (request: TRequest, ...args: unknown[]) => Promise<TResponse>
) {
  return async (
    request: TRequest,
    ...args: unknown[]
  ): Promise<TResponse | NextResponse<ErrorResponse>> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error('API处理函数执行出错:', error)

      // 如果已经是NextResponse，直接返回
      if (error instanceof NextResponse) {
        return error
      }

      // 否则返回通用错误响应
      return ApiErrorHandler.handleServerError(error as GenericError)
    }
  }
}

/**
 * 异步错误处理包装器
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorHandler?: (error: GenericError) => NextResponse<ErrorResponse>
): Promise<{ data?: T; error?: NextResponse<ErrorResponse> }> {
  try {
    const data = await asyncFn()
    return { data }
  } catch (error) {
    const errorResponse = errorHandler
      ? errorHandler(error as GenericError)
      : ApiErrorHandler.handleServerError(error as GenericError)
    return { error: errorResponse }
  }
}

/**
 * 验证请求参数并处理错误
 */
export function validateAndHandle<T>(
  schema: ZodSchema<T>,
  data: unknown
): { data?: T; error?: NextResponse<ErrorResponse> } {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      error: ApiErrorHandler.handleValidationError(result.error!),
    }
  }

  return { data: result.data! }
}
