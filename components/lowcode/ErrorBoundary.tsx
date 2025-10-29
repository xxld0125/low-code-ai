/**
 * 组件错误边界
 * 功能模块: 基础组件库 (004-basic-component-library) - T011任务
 * 创建日期: 2025-10-29
 * 用途: 为低代码组件提供错误捕获和优雅的错误展示
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Info } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  componentId?: string
  showRetry?: boolean
  showDetails?: boolean
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  retryCount: number
}

export class ComponentErrorBoundary extends Component<Props, State> {
  static displayName = 'ComponentErrorBoundary'

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      retryCount: 0,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ComponentRenderer Error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 在开发环境下将错误信息发送到控制台
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Component Error: ${this.props.componentId || 'Unknown'}`)
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.groupEnd()
    }
  }

  handleRetry = () => {
    const maxRetries = 3

    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }))
    }
  }

  render() {
    if (this.state.hasError) {
      // 自定义错误回退组件
      if (this.props.fallback) {
        return this.props.fallback
      }

      const {
        componentId,
        showRetry = true,
        showDetails = process.env.NODE_ENV === 'development',
      } = this.props
      const { error, errorInfo, retryCount } = this.state
      const maxRetries = 3

      return (
        <div className="component-error-boundary">
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-red-800">组件渲染错误</h3>

              <p className="mt-1 text-sm text-red-600">
                {componentId ? `组件 "${componentId}" 渲染失败` : '组件渲染失败'}
              </p>

              {error && <p className="mt-1 truncate text-xs text-red-500">{error.message}</p>}

              {showRetry && retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-red-700 hover:text-red-800"
                >
                  <RefreshCw className="h-3 w-3" />
                  重试 ({retryCount + 1}/{maxRetries})
                </button>
              )}

              {retryCount >= maxRetries && (
                <p className="mt-1 text-xs text-red-500">已达到最大重试次数</p>
              )}
            </div>

            {showDetails && error && (
              <details className="mt-3 text-xs">
                <summary className="flex cursor-pointer items-center gap-1 text-red-700 hover:text-red-800">
                  <Info className="h-3 w-3" />
                  查看详细错误
                </summary>
                <div className="mt-2 rounded border border-red-200 bg-red-100 p-2">
                  <div className="font-mono text-red-800">
                    <strong>错误信息:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.message}</pre>
                  </div>

                  {error.stack && (
                    <div className="mt-2 font-mono text-red-700">
                      <strong>堆栈跟踪:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{error.stack}</pre>
                    </div>
                  )}

                  {errorInfo && (
                    <div className="mt-2 font-mono text-red-700">
                      <strong>组件堆栈:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 函数式错误边界包装器
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
): React.FC<P & { componentId?: string }> => {
  const WrappedComponent = (props: P & { componentId?: string }) => (
    <ComponentErrorBoundary {...errorBoundaryProps} componentId={props.componentId}>
      <Component {...props} />
    </ComponentErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// 默认错误回退组件
export const DefaultErrorFallback: React.FC<{
  componentId?: string
  error?: Error
  onRetry?: () => void
}> = ({ componentId, error, onRetry }) => (
  <div className="component-error-fallback rounded border border-gray-200 bg-gray-50 p-3">
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <AlertTriangle className="h-4 w-4" />
      <span>{componentId ? `组件 "${componentId}" 加载失败` : '组件加载失败'}</span>
    </div>

    {error && <p className="mt-1 text-xs text-gray-500">{error.message}</p>}

    {onRetry && (
      <button onClick={onRetry} className="mt-2 text-xs text-blue-600 hover:text-blue-800">
        重试
      </button>
    )}
  </div>
)
