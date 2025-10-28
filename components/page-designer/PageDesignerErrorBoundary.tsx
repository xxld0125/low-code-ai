import React, { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
  errorId: string
}

/**
 * 页面设计器错误边界组件
 * 捕获并处理页面设计器中的错误，提供友好的错误界面
 */
export class PageDesignerErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId(),
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('页面设计器错误:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // 调用自定义错误处理函数
    this.props.onError?.(error, errorInfo)

    // 发送错误报告（可选）
    this.reportError(error, errorInfo)
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    try {
      // 发送错误报告到监控服务
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }

      // 这里可以集成错误监控服务，如 Sentry
      console.log('错误报告:', errorData)

      // 保存到本地存储以供调试
      const errorLogs = JSON.parse(localStorage.getItem('page-designer-error-logs') || '[]')
      errorLogs.push(errorData)

      // 只保留最近10条错误日志
      if (errorLogs.length > 10) {
        errorLogs.shift()
      }

      localStorage.setItem('page-designer-error-logs', JSON.stringify(errorLogs))
    } catch (reportError) {
      console.error('发送错误报告失败:', reportError)
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId(),
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleCopyError = () => {
    if (this.state.error && this.state.errorInfo) {
      const errorText = `
错误ID: ${this.state.errorId}
时间: ${new Date().toISOString()}
错误信息: ${this.state.error.message}
错误堆栈: ${this.state.error.stack}
组件堆栈: ${this.state.errorInfo.componentStack}
页面URL: ${window.location.href}
      `.trim()

      navigator.clipboard
        .writeText(errorText)
        .then(() => {
          // 可以显示一个提示信息
          console.log('错误信息已复制到剪贴板')
        })
        .catch(err => {
          console.error('复制失败:', err)
        })
    }
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用自定义组件
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误界面
      return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                页面设计器遇到了问题
              </CardTitle>
              <CardDescription>
                很抱歉，页面设计器发生了意外错误。您可以尝试重新加载或联系技术支持。
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 错误信息 */}
              {this.state.error && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-gray-900">错误详情</h4>
                  <p className="font-mono text-sm text-gray-600">{this.state.error.message}</p>
                  <p className="mt-2 text-xs text-gray-500">错误ID: {this.state.errorId}</p>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={this.handleRetry} className="flex-1" variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重试
                </Button>

                <Button onClick={this.handleReload} className="flex-1" variant="outline">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  重新加载页面
                </Button>

                <Button onClick={this.handleCopyError} className="flex-1" variant="outline">
                  <Bug className="mr-2 h-4 w-4" />
                  复制错误信息
                </Button>
              </div>

              {/* 帮助信息 */}
              <div className="text-center text-sm text-gray-600">
                <p>如果问题持续存在，请将错误信息发送给技术支持团队。</p>
                <p className="mt-1">您的当前工作已自动保存，重新加载后可以继续编辑。</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default PageDesignerErrorBoundary

/**
 * 用于非React组件的错误处理函数
 */
export function handleAsyncError(error: Error, context?: string) {
  console.error(`异步错误${context ? ` (${context})` : ''}:`, error)

  try {
    const errorData = {
      errorId: `async_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      type: 'async',
    }

    // 保存异步错误日志
    const errorLogs = JSON.parse(localStorage.getItem('page-designer-error-logs') || '[]')
    errorLogs.push(errorData)

    if (errorLogs.length > 10) {
      errorLogs.shift()
    }

    localStorage.setItem('page-designer-error-logs', JSON.stringify(errorLogs))
  } catch (logError) {
    console.error('记录异步错误失败:', logError)
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <PageDesignerErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </PageDesignerErrorBoundary>
    )
  }
}
