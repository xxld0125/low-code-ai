/**
 * 动画样式编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T130 - 添加边框、阴影、动画等高级样式配置
 * 创建日期: 2025-10-31
 */

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Plus, Trash2, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

// 动画类型定义
export interface AnimationProperty {
  name: string
  duration: number // 秒
  timingFunction: string
  delay: number // 秒
  iterationCount: number | 'infinite'
  direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse'
  fillMode: 'none' | 'forwards' | 'backwards' | 'both'
  playState: 'running' | 'paused'
}

export interface AnimationConfig {
  animations: AnimationProperty[]
  keyframes?: Record<string, Record<string, string>>
}

export interface AnimationEditorProps {
  value?: AnimationConfig
  onChange: (config: AnimationConfig) => void
  onPreview?: (animation: AnimationProperty) => void
  className?: string
}

// 预设的缓动函数
const TIMING_FUNCTIONS = [
  { value: 'linear', label: '线性', description: '匀速' },
  { value: 'ease', label: '缓动', description: '慢-快-慢' },
  { value: 'ease-in', label: '缓入', description: '慢-快' },
  { value: 'ease-out', label: '缓出', description: '快-慢' },
  { value: 'ease-in-out', label: '缓入缓出', description: '慢-快-慢' },
  { value: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', label: '弹性', description: '回弹效果' },
  { value: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', label: '超弹性', description: '强烈回弹' },
  { value: 'steps(4)', label: '步骤', description: '分步动画' },
]

// 预设动画
const PRESET_ANIMATIONS = [
  {
    name: '淡入',
    animation: {
      name: 'fadeIn',
      duration: 0.3,
      timingFunction: 'ease-in',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
  {
    name: '滑入',
    animation: {
      name: 'slideInUp',
      duration: 0.4,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
  {
    name: '缩放',
    animation: {
      name: 'scaleIn',
      duration: 0.2,
      timingFunction: 'ease-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
  {
    name: '旋转',
    animation: {
      name: 'rotate',
      duration: 1,
      timingFunction: 'linear',
      delay: 0,
      iterationCount: 'infinite',
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
  {
    name: '脉冲',
    animation: {
      name: 'pulse',
      duration: 2,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 'infinite',
      direction: 'alternate',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
  {
    name: '抖动',
    animation: {
      name: 'shake',
      duration: 0.5,
      timingFunction: 'ease-in-out',
      delay: 0,
      iterationCount: 1,
      direction: 'normal',
      fillMode: 'forwards',
      playState: 'running',
    } as AnimationProperty,
  },
]

export const AnimationEditor: React.FC<AnimationEditorProps> = ({
  value = { animations: [] },
  onChange,
  onPreview,
  className,
}) => {
  const [expandedAnimation, setExpandedAnimation] = useState<string | null>(null)
  const [previewingAnimation, setPreviewingAnimation] = useState<string | null>(null)

  // 添加动画
  const addAnimation = useCallback(
    (preset?: AnimationProperty) => {
      const newAnimation: AnimationProperty = preset || {
        name: 'customAnimation',
        duration: 1,
        timingFunction: 'ease',
        delay: 0,
        iterationCount: 1,
        direction: 'normal',
        fillMode: 'forwards',
        playState: 'running',
      }

      const newConfig = {
        ...value,
        animations: [...value.animations, newAnimation],
      }

      onChange(newConfig)
      setExpandedAnimation(`${value.animations.length}`)
    },
    [value, onChange]
  )

  // 更新动画
  const updateAnimation = useCallback(
    (index: number, updates: Partial<AnimationProperty>) => {
      const newAnimations = [...value.animations]
      newAnimations[index] = { ...newAnimations[index], ...updates }

      onChange({
        ...value,
        animations: newAnimations,
      })
    },
    [value, onChange]
  )

  // 删除动画
  const removeAnimation = useCallback(
    (index: number) => {
      const newAnimations = value.animations.filter((_, i) => i !== index)
      onChange({
        ...value,
        animations: newAnimations,
      })
      setExpandedAnimation(null)
    },
    [value, onChange]
  )

  // 预览动画
  const previewAnimation = useCallback(
    (animation: AnimationProperty, index: number) => {
      setPreviewingAnimation(`${index}`)
      onPreview?.(animation)

      // 3秒后停止预览
      setTimeout(() => {
        setPreviewingAnimation(null)
      }, 3000)
    },
    [onPreview]
  )

  // 渲染单个动画编辑器
  const renderAnimationEditor = (animation: AnimationProperty, index: number) => {
    const isExpanded = expandedAnimation === `${index}`
    const isPreviewing = previewingAnimation === `${index}`

    return (
      <Card key={index} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                value={animation.name}
                onChange={e => updateAnimation(index, { name: e.target.value })}
                placeholder="动画名称"
                className="h-8 w-40"
              />
              <Badge variant={animation.playState === 'running' ? 'default' : 'secondary'}>
                {animation.playState === 'running' ? '运行中' : '已暂停'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => previewAnimation(animation, index)}
                disabled={isPreviewing}
              >
                {isPreviewing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPreviewing ? '预览中...' : '预览'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setExpandedAnimation(isExpanded ? null : `${index}`)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => removeAnimation(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded}>
          <CollapsibleContent className="px-6 pb-4">
            <div className="grid grid-cols-2 gap-4">
              {/* 持续时间 */}
              <div className="space-y-2">
                <Label>持续时间 ({animation.duration}s)</Label>
                <Slider
                  value={[animation.duration]}
                  onValueChange={([duration]) => updateAnimation(index, { duration })}
                  min={0.1}
                  max={10}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* 延迟时间 */}
              <div className="space-y-2">
                <Label>延迟时间 ({animation.delay}s)</Label>
                <Slider
                  value={[animation.delay]}
                  onValueChange={([delay]) => updateAnimation(index, { delay })}
                  min={0}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* 缓动函数 */}
              <div className="space-y-2">
                <Label>缓动函数</Label>
                <Select
                  value={animation.timingFunction}
                  onValueChange={timingFunction => updateAnimation(index, { timingFunction })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMING_FUNCTIONS.map(func => (
                      <SelectItem key={func.value} value={func.value}>
                        <div>
                          <div className="font-medium">{func.label}</div>
                          <div className="text-xs text-muted-foreground">{func.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 迭代次数 */}
              <div className="space-y-2">
                <Label>迭代次数</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={animation.iterationCount === 'infinite'}
                    onCheckedChange={infinite =>
                      updateAnimation(index, { iterationCount: infinite ? 'infinite' : 1 })
                    }
                  />
                  {animation.iterationCount === 'infinite' ? (
                    <span>无限循环</span>
                  ) : (
                    <Input
                      type="number"
                      value={animation.iterationCount}
                      onChange={e =>
                        updateAnimation(index, { iterationCount: parseInt(e.target.value) || 1 })
                      }
                      min={1}
                      max={100}
                      className="w-20"
                    />
                  )}
                </div>
              </div>

              {/* 方向 */}
              <div className="space-y-2">
                <Label>方向</Label>
                <Select
                  value={animation.direction}
                  onValueChange={direction =>
                    updateAnimation(index, { direction: direction as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">正向</SelectItem>
                    <SelectItem value="reverse">反向</SelectItem>
                    <SelectItem value="alternate">交替</SelectItem>
                    <SelectItem value="alternate-reverse">反向交替</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 填充模式 */}
              <div className="space-y-2">
                <Label>填充模式</Label>
                <Select
                  value={animation.fillMode}
                  onValueChange={fillMode => updateAnimation(index, { fillMode: fillMode as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">无</SelectItem>
                    <SelectItem value="forwards"> forwards </SelectItem>
                    <SelectItem value="backwards"> backwards </SelectItem>
                    <SelectItem value="both"> both </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 播放状态 */}
              <div className="space-y-2">
                <Label>播放状态</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={animation.playState === 'running'}
                    onCheckedChange={running =>
                      updateAnimation(index, { playState: running ? 'running' : 'paused' })
                    }
                  />
                  <span>{animation.playState === 'running' ? '运行中' : '已暂停'}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">动画配置</h3>
        <div className="flex items-center gap-2">
          <Select
            onValueChange={presetName => {
              const preset = PRESET_ANIMATIONS.find(p => p.name === presetName)
              if (preset) {
                addAnimation({
                  ...preset.animation,
                  name: `${preset.animation.name}_${Date.now()}`,
                })
              }
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="添加预设" />
            </SelectTrigger>
            <SelectContent>
              {PRESET_ANIMATIONS.map(preset => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => addAnimation()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            自定义动画
          </Button>
        </div>
      </div>

      {value.animations.length > 0 ? (
        <div>
          {value.animations.map((animation, index) => renderAnimationEditor(animation, index))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <div className="space-y-2">
              <p>暂无动画配置</p>
              <p className="text-sm">点击上方按钮添加动画效果</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// CSS动画样式生成器
export const generateAnimationCSS = (config: AnimationConfig): string => {
  if (!config.animations.length) return ''

  const animationRules = config.animations.map(animation => {
    const animationValue = [
      animation.name,
      `${animation.duration}s`,
      animation.timingFunction,
      `${animation.delay}s`,
      typeof animation.iterationCount === 'number'
        ? animation.iterationCount
        : animation.iterationCount,
      animation.direction,
      animation.fillMode,
    ].join(' ')

    return `animation: ${animationValue};`
  })

  return animationRules.join('\n')
}

// 关键帧样式生成器
export const generateKeyframesCSS = (config: AnimationConfig): string => {
  if (!config.keyframes) return ''

  const keyframeRules = Object.entries(config.keyframes).map(([name, frames]) => {
    const frameDeclarations = Object.entries(frames)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n')

    return `@keyframes ${name} {\n${frameDeclarations}\n}`
  })

  return keyframeRules.join('\n\n')
}

export default AnimationEditor
