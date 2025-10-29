import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { ApiErrorHandler } from './error-handler'
import { ErrorResponse } from '../types'
import { checkRateLimit, getClientIdentifier, checkUserPermission } from './validation'

/**
 * 通用错误接口
 */
interface GenericError {
  message: string
  stack?: string
  cause?: unknown
}

/**
 * 用户接口
 */
interface User {
  id: string
  email?: string
  name?: string
  role?: string
  permissions?: string[]
}

// =============================================================================
// 中间件类型定义
// =============================================================================

export interface MiddlewareContext {
  request: NextRequest
  user?: User | null
  startTime: number
  requestId: string
}

export interface MiddlewareOptions {
  requireAuth?: boolean
  checkRateLimit?: boolean
  logRequests?: boolean
  validateUser?: boolean
}

// =============================================================================
// 认证中间件
// =============================================================================

/**
 * 验证用户身份
 */
export async function authenticateUser(): Promise<User | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      throw ApiErrorHandler.handleAuthError()
    }

    return user
  } catch (error) {
    console.error('用户认证失败:', error)
    throw ApiErrorHandler.handleAuthError()
  }
}

/**
 * 验证用户权限
 */
export function authorizeUser(user: User | null | undefined, requiredPermission?: string): void {
  if (
    !user ||
    !checkUserPermission({ id: user.id, permissions: user.permissions }, requiredPermission)
  ) {
    throw ApiErrorHandler.handleForbiddenError('权限不足，无法访问此资源')
  }
}

// =============================================================================
// 速率限制中间件
// =============================================================================

/**
 * 检查请求速率限制
 */
export function checkRateLimitMiddleware(request: NextRequest): void {
  const clientId = getClientIdentifier(request)

  if (!checkRateLimit(clientId)) {
    throw ApiErrorHandler.createErrorResponse(
      'INTERNAL_SERVER_ERROR',
      '请求过于频繁，请稍后再试',
      { limit: 100, window: '60秒' },
      'BAD_REQUEST'
    )
  }
}

// =============================================================================
// 日志记录中间件
// =============================================================================

/**
 * 生成请求ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 记录请求开始
 */
export function logRequestStart(context: MiddlewareContext, endpoint: string): void {
  const { request, requestId } = context
  const { method, url } = request

  console.log(`[${requestId}] ${method} ${url} - 开始处理`, {
    method,
    url,
    userAgent: request.headers.get('user-agent'),
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    timestamp: new Date().toISOString(),
    endpoint,
  })
}

/**
 * 记录请求成功
 */
export function logRequestSuccess(
  context: MiddlewareContext,
  endpoint: string,
  response: NextResponse
): void {
  const { requestId, startTime } = context
  const duration = Date.now() - startTime
  const status = response.status

  console.log(`[${requestId}] 请求处理成功`, {
    status,
    duration: `${duration}ms`,
    timestamp: new Date().toISOString(),
    endpoint,
  })
}

/**
 * 记录请求失败
 */
export function logRequestError(
  context: MiddlewareContext,
  endpoint: string,
  error: Error | unknown
): void {
  const { requestId, startTime } = context
  const duration = Date.now() - startTime

  console.error(`[${requestId}] 请求处理失败`, {
    duration: `${duration}ms`,
    error: error instanceof Error ? error.message : '未知错误',
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
    endpoint,
  })
}

/**
 * 记录API访问日志到数据库
 */
export async function logApiAccess(
  context: MiddlewareContext,
  endpoint: string,
  response: NextResponse,
  componentId?: string,
  action?: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient()
    const { request, user, requestId } = context

    const logData = {
      request_id: requestId,
      user_id: user?.id || null,
      endpoint,
      method: request.method,
      status_code: response.status,
      duration: Date.now() - context.startTime,
      ip_address:
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      component_id: componentId || null,
      action: action || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    }

    // 异步记录日志，不阻塞主流程
    ;(async () => {
      try {
        await supabase.from('api_access_logs').insert(logData)
      } catch (error: unknown) {
        console.warn('记录API访问日志失败:', error)
      }
    })()
  } catch (error) {
    console.warn('记录API访问日志时发生错误:', error)
  }
}

// =============================================================================
// 请求头和安全检查中间件
// =============================================================================

/**
 * 设置安全响应头
 */
export function setSecurityHeaders(response: NextResponse): NextResponse {
  // 设置CORS头
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )

  // 设置安全头
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
}

/**
 * 验证请求头
 */
export function validateRequestHeaders(request: NextRequest): void {
  const contentType = request.headers.get('content-type')

  // 对于POST、PUT请求，验证Content-Type
  if (['POST', 'PUT'].includes(request.method) && !contentType?.includes('application/json')) {
    throw ApiErrorHandler.createErrorResponse(
      'BAD_REQUEST',
      '请求Content-Type必须是application/json',
      undefined,
      'BAD_REQUEST'
    )
  }

  // 检查请求大小（简单检查，实际大小由Web服务器控制）
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 1024 * 1024) {
    // 1MB
    throw ApiErrorHandler.createErrorResponse(
      'BAD_REQUEST',
      '请求体过大，最大支持1MB',
      undefined,
      'BAD_REQUEST'
    )
  }
}

// =============================================================================
// 主要中间件函数
// =============================================================================

/**
 * 创建中间件上下文
 */
export function createMiddlewareContext(request: NextRequest): MiddlewareContext {
  return {
    request,
    startTime: Date.now(),
    requestId: generateRequestId(),
  }
}

/**
 * 应用前置中间件
 */
export async function applyPreMiddleware(
  context: MiddlewareContext,
  options: MiddlewareOptions = {},
  endpoint: string
): Promise<void> {
  const { request } = context

  // 验证请求头
  validateRequestHeaders(request)

  // 速率限制检查
  if (options.checkRateLimit !== false) {
    checkRateLimitMiddleware(request)
  }

  // 用户认证
  if (options.requireAuth) {
    context.user = await authenticateUser()

    // 用户权限验证
    if (options.validateUser) {
      authorizeUser(context.user)
    }
  }

  // 记录请求开始
  if (options.logRequests !== false) {
    logRequestStart(context, endpoint)
  }
}

/**
 * 应用后置中间件
 */
export async function applyPostMiddleware(
  context: MiddlewareContext,
  response: NextResponse,
  options: MiddlewareOptions = {},
  endpoint: string,
  metadata?: {
    componentId?: string
    action?: string
    extra?: Record<string, unknown>
  }
): Promise<NextResponse<ErrorResponse>> {
  // 设置安全响应头
  response = setSecurityHeaders(response)

  // 记录请求成功
  if (options.logRequests !== false) {
    logRequestSuccess(context, endpoint, response)
  }

  // 异步记录API访问日志
  if (options.logRequests !== false) {
    logApiAccess(
      context,
      endpoint,
      response,
      metadata?.componentId,
      metadata?.action,
      metadata?.extra
    )
  }

  return response as NextResponse<ErrorResponse>
}

/**
 * 处理中间件错误
 */
export function handleMiddlewareError(
  context: MiddlewareContext,
  endpoint: string,
  error: Error | unknown
): NextResponse<ErrorResponse> {
  // 记录错误
  logRequestError(context, endpoint, error)

  // 如果已经是NextResponse，直接返回
  if (error instanceof NextResponse) {
    return error
  }

  // 否则返回通用错误响应
  return ApiErrorHandler.handleServerError(error as GenericError)
}

// =============================================================================
// 中间件装饰器
// =============================================================================

/**
 * 高阶函数：为API处理函数应用中间件
 */
export function withMiddleware<TResponse = NextResponse>(
  handler: (context: MiddlewareContext, ...args: unknown[]) => Promise<TResponse>,
  options: MiddlewareOptions = {},
  endpoint: string
) {
  return async (
    request: NextRequest,
    ...args: unknown[]
  ): Promise<TResponse | NextResponse<ErrorResponse>> => {
    const context = createMiddlewareContext(request)

    try {
      // 应用前置中间件
      await applyPreMiddleware(context, options, endpoint)

      // 执行处理函数
      const result = await handler(context, ...args)

      // 应用后置中间件
      if (result instanceof NextResponse) {
        return await applyPostMiddleware(context, result, options, endpoint)
      }

      return result
    } catch (error) {
      return handleMiddlewareError(context, endpoint, error)
    }
  }
}

/**
 * 简化的认证中间件装饰器
 */
export function withAuth<TResponse = NextResponse>(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<TResponse>,
  options: Omit<MiddlewareOptions, 'requireAuth'> = {}
) {
  return withMiddleware(
    async (context, ...args) => {
      // 将用户注入到请求中，以便处理函数使用
      return await handler(context.request, ...args)
    },
    { ...options, requireAuth: true },
    'unknown'
  )
}

/**
 * 简化的日志记录中间件装饰器
 */
export function withLogging<TResponse = NextResponse>(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<TResponse>,
  endpoint: string,
  options: MiddlewareOptions = {}
) {
  return withMiddleware(
    async (context, ...args) => {
      return await handler(context.request, ...args)
    },
    { ...options, logRequests: true },
    endpoint
  )
}
