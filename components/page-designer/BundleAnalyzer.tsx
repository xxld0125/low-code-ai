/**
 * 页面设计器Bundle分析器
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 分析和显示Bundle大小信息，帮助优化加载性能
 */

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  bundleOptimizer,
  BundleAnalysisResult,
} from '@/lib/page-designer/performance/bundle-optimizer'

interface BundleAnalyzerProps {
  className?: string
  showDetails?: boolean
  autoAnalyze?: boolean
  onAnalysisComplete?: (results: BundleAnalysisResult) => void
}

export const BundleAnalyzer: React.FC<BundleAnalyzerProps> = ({
  className,
  showDetails = true,
  autoAnalyze = false,
  onAnalysisComplete,
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<BundleAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showRecommendations, setShowRecommendations] = useState(false)

  // 运行Bundle分析
  const runAnalysis = useCallback(async () => {
    setIsAnalyzing(true)

    // 模拟分析过程
    await new Promise(resolve => setTimeout(resolve, 1500))

    const results = bundleOptimizer.analyzeBundle()
    setAnalysisResult(results)
    setIsAnalyzing(false)

    onAnalysisComplete?.(results)
  }, [onAnalysisComplete])

  // 自动分析
  useEffect(() => {
    if (autoAnalyze && isVisible) {
      runAnalysis()
    }
  }, [autoAnalyze, isVisible, runAnalysis])

  // 获取大小显示文本
  const getSizeDisplay = (sizeInBytes: number) => {
    const sizeInKB = Math.round(sizeInBytes / 1024)
    const sizeInMB = (sizeInKB / 1024).toFixed(2)

    if (sizeInKB >= 1024) {
      return `${sizeInMB} MB`
    }
    return `${sizeInKB} KB`
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

  // 获取进度条颜色
  const getProgressColor = (size: number, limit: number) => {
    const percentage = (size / limit) * 100
    if (percentage <= 70) return 'bg-green-500'
    if (percentage <= 90) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className={cn('fixed bottom-4 right-4 z-40', className)}>
      {/* 切换按钮 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="bg-white/90 backdrop-blur-sm"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z"
            clipRule="evenodd"
          />
        </svg>
        <span className="ml-2">Bundle</span>
      </Button>

      {/* 分析结果 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-2 w-96 rounded-lg border bg-white/95 p-4 shadow-lg backdrop-blur-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Bundle分析</h3>
              <Button variant="outline" size="sm" onClick={runAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? '分析中...' : '重新分析'}
              </Button>
            </div>

            {/* 分析中状态 */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-600">正在分析Bundle...</span>
              </div>
            )}

            {/* 分析结果 */}
            <AnimatePresence>
              {analysisResult && !isAnalyzing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {/* 总体得分 */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Bundle得分</span>
                    <div
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-bold',
                        getScoreBgColor(analysisResult.score),
                        getScoreColor(analysisResult.score)
                      )}
                    >
                      {analysisResult.score}/100
                    </div>
                  </div>

                  {/* 大小信息 */}
                  <div className="space-y-3">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-700">总大小</span>
                        <span className="font-medium">
                          {getSizeDisplay(analysisResult.totalSize)}
                        </span>
                      </div>
                      <Progress
                        value={(analysisResult.totalSize / (500 * 1024)) * 100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-700">压缩后</span>
                        <span className="font-medium">
                          {getSizeDisplay(analysisResult.gzippedSize)}
                        </span>
                      </div>
                      <Progress
                        value={(analysisResult.gzippedSize / (500 * 1024)) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>

                  {/* 分块详情 */}
                  {showDetails && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">分块详情</h4>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {analysisResult.chunks.map((chunk, index) => (
                          <div key={index} className="rounded bg-gray-50 p-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">{chunk.name}</span>
                              <span className="text-gray-600">
                                {getSizeDisplay(chunk.gzippedSize)}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {chunk.components.slice(0, 3).join(', ')}
                              {chunk.components.length > 3 && ` 等${chunk.components.length}个组件`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 优化建议 */}
                  {analysisResult.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-700">优化建议</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRecommendations(!showRecommendations)}
                        >
                          {showRecommendations ? '收起' : '展开'}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {showRecommendations && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                          >
                            {analysisResult.recommendations.map((recommendation, index) => (
                              <div
                                key={index}
                                className="rounded border border-yellow-200 bg-yellow-50 p-2"
                              >
                                <div className="flex items-start space-x-2">
                                  <svg
                                    className="mt-0.5 h-4 w-4 text-yellow-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-sm text-yellow-800">{recommendation}</span>
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 状态指示器 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>分析时间: {new Date(analysisResult.timestamp).toLocaleTimeString()}</span>
                    <span
                      className={cn(
                        'font-medium',
                        analysisResult.score >= 90 && 'text-green-600',
                        analysisResult.score >= 70 &&
                          analysisResult.score < 90 &&
                          'text-yellow-600',
                        analysisResult.score < 70 && 'text-red-600'
                      )}
                    >
                      {analysisResult.score >= 90
                        ? '优秀'
                        : analysisResult.score >= 70
                          ? '良好'
                          : '需要优化'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BundleAnalyzer
