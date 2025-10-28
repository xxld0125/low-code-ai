/**
 * 页面设计器无障碍工具栏
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 提供无障碍功能控制和状态显示
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  accessibilityManager,
  AccessibilityAuditResult,
} from '@/lib/page-designer/accessibility/accessibility-manager'

interface AccessibilityToolbarProps {
  className?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  showAuditResults?: boolean
  onAuditComplete?: (results: AccessibilityAuditResult) => void
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  className,
  position = 'top',
  showAuditResults = true,
  onAuditComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [auditResults, setAuditResults] = useState<AccessibilityAuditResult | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [config, setConfig] = useState(accessibilityManager.getConfig())

  // 位置样式
  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2',
    left: 'left-4 top-1/2 -translate-y-1/2 flex-col',
    right: 'right-4 top-1/2 -translate-y-1/2 flex-col',
  }

  // 监听配置变化
  useEffect(() => {
    const updateConfig = () => {
      setConfig(accessibilityManager.getConfig())
    }

    // 定期更新配置
    const interval = setInterval(updateConfig, 1000)
    return () => clearInterval(interval)
  }, [])

  // 运行无障碍审计
  const runAudit = async () => {
    setIsAuditing(true)

    // 模拟审计过程
    await new Promise(resolve => setTimeout(resolve, 2000))

    const results = accessibilityManager.auditAccessibility()
    setAuditResults(results)
    setIsAuditing(false)

    onAuditComplete?.(results)
  }

  // 切换键盘导航
  const toggleKeyboardNavigation = () => {
    const newConfig = { ...config, enableKeyboardNavigation: !config.enableKeyboardNavigation }
    accessibilityManager.updateConfig(newConfig)
  }

  // 切换焦点管理
  const toggleFocusManagement = () => {
    const newConfig = { ...config, enableFocusManagement: !config.enableFocusManagement }
    accessibilityManager.updateConfig(newConfig)
  }

  // 切换屏幕阅读器支持
  const toggleScreenReaderSupport = () => {
    const newConfig = { ...config, enableScreenReaderSupport: !config.enableScreenReaderSupport }
    accessibilityManager.updateConfig(newConfig)
  }

  // 切换高对比度模式
  const toggleHighContrastMode = () => {
    const newConfig = { ...config, enableHighContrastMode: !config.enableHighContrastMode }
    accessibilityManager.updateConfig(newConfig)
  }

  // 获取得分颜色
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  // 获取得分背景色
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className={cn('fixed z-40', positionClasses[position], className)}>
      {/* 切换按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white/90 backdrop-blur-sm"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-2">无障碍</span>
      </Button>

      {/* 工具栏内容 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'mt-2 rounded-lg border bg-white/95 p-4 shadow-lg backdrop-blur-sm',
              'min-w-[320px] max-w-[400px]',
              position === 'left' || position === 'right' ? 'ml-2 mt-0' : 'mt-2'
            )}
          >
            <h3 className="mb-4 font-semibold text-gray-800">无障碍功能控制</h3>

            {/* 功能开关 */}
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">键盘导航</span>
                <Button
                  variant={config.enableKeyboardNavigation ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleKeyboardNavigation}
                >
                  {config.enableKeyboardNavigation ? '已启用' : '已禁用'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">焦点管理</span>
                <Button
                  variant={config.enableFocusManagement ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleFocusManagement}
                >
                  {config.enableFocusManagement ? '已启用' : '已禁用'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">屏幕阅读器</span>
                <Button
                  variant={config.enableScreenReaderSupport ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleScreenReaderSupport}
                >
                  {config.enableScreenReaderSupport ? '已启用' : '已禁用'}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">高对比度</span>
                <Button
                  variant={config.enableHighContrastMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleHighContrastMode}
                >
                  {config.enableHighContrastMode ? '已启用' : '已禁用'}
                </Button>
              </div>
            </div>

            {/* 审计部分 */}
            {showAuditResults && (
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium text-gray-800">无障碍审计</h4>
                  <Button variant="outline" size="sm" onClick={runAudit} disabled={isAuditing}>
                    {isAuditing ? '审计中...' : '运行审计'}
                  </Button>
                </div>

                {/* 审计结果 */}
                <AnimatePresence>
                  {auditResults && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      {/* 得分 */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">无障碍得分</span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={cn(
                              'rounded-full px-2 py-1 text-sm font-semibold',
                              getScoreBgColor(auditResults.score),
                              getScoreColor(auditResults.score)
                            )}
                          >
                            {auditResults.score}/100
                          </div>
                        </div>
                      </div>

                      {/* 统计信息 */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded bg-green-50 p-2">
                          <div className="font-semibold text-green-600">
                            {auditResults.passes.length}
                          </div>
                          <div className="text-xs text-green-600">通过</div>
                        </div>
                        <div className="rounded bg-yellow-50 p-2">
                          <div className="font-semibold text-yellow-600">
                            {auditResults.warnings.length}
                          </div>
                          <div className="text-xs text-yellow-600">警告</div>
                        </div>
                        <div className="rounded bg-red-50 p-2">
                          <div className="font-semibold text-red-600">
                            {auditResults.issues.length}
                          </div>
                          <div className="text-xs text-red-600">错误</div>
                        </div>
                      </div>

                      {/* 问题列表 */}
                      {auditResults.issues.length > 0 && (
                        <div className="max-h-32 overflow-y-auto">
                          <h5 className="mb-2 text-sm font-medium text-gray-700">
                            需要修复的问题:
                          </h5>
                          <div className="space-y-1">
                            {auditResults.issues.slice(0, 3).map((issue, index) => (
                              <div
                                key={index}
                                className="rounded bg-red-50 p-2 text-xs text-red-600"
                              >
                                <div className="font-medium">{issue.message}</div>
                                <div className="mt-1 text-red-500">{issue.suggestion}</div>
                              </div>
                            ))}
                            {auditResults.issues.length > 3 && (
                              <div className="text-center text-xs text-gray-500">
                                还有 {auditResults.issues.length - 3} 个问题...
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 审计时间 */}
                      <div className="text-center text-xs text-gray-500">
                        审计时间: {new Date(auditResults.timestamp).toLocaleTimeString()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* 快捷键提示 */}
            <div className="mt-4 border-t pt-3">
              <h5 className="mb-2 text-sm font-medium text-gray-700">快捷键:</h5>
              <div className="space-y-1 text-xs text-gray-600">
                <div>Tab - 导航到下一个元素</div>
                <div>Shift+Tab - 导航到上一个元素</div>
                <div>Enter/空格 - 激活按钮或链接</div>
                <div>Escape - 退出当前操作</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AccessibilityToolbar
