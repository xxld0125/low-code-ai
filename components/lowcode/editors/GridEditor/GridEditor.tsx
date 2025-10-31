/**
 * 栅格系统可视化编辑器
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 任务: T135 - 实现栅格系统的可视化编辑器
 * 创建日期: 2025-10-31
 */

import React, { useState, useCallback, useMemo } from 'react'
import { cn } from '@/lib/utils'
import {
  GridSystemUtils,
  type Breakpoint,
  type ResponsiveValue,
} from '@/lib/lowcode/layout/grid-system'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Plus, Copy, Move, Eye, EyeOff } from 'lucide-react'

// 栅格列配置
export interface GridColumnConfig {
  id: string
  span: ResponsiveValue<number>
  offset?: ResponsiveValue<number>
  order?: ResponsiveValue<number>
  hidden?: ResponsiveValue<boolean>
  flex?: ResponsiveValue<string>
  flexGrow?: ResponsiveValue<number>
  flexShrink?: ResponsiveValue<number>
  flexBasis?: ResponsiveValue<string>
  alignSelf?: ResponsiveValue<'auto' | 'start' | 'end' | 'center' | 'stretch' | 'baseline'>
  content?: string
  backgroundColor?: string
}

// 栅格行配置
export interface GridRowConfig {
  id: string
  gutter: ResponsiveValue<{ x: number; y: number }>
  justify: ResponsiveValue<'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'>
  align: ResponsiveValue<'start' | 'end' | 'center' | 'stretch' | 'baseline'>
  wrap: ResponsiveValue<boolean>
  direction: ResponsiveValue<'row' | 'row-reverse' | 'column' | 'column-reverse'>
  columns: GridColumnConfig[]
}

// 栅格编辑器属性
export interface GridEditorProps {
  config?: GridRowConfig
  onChange?: (config: GridRowConfig) => void
  showPreview?: boolean
  showControls?: boolean
  className?: string
}

// 断点配置
const BREAKPOINTS: { value: Breakpoint; label: string; width: string }[] = [
  { value: 'mobile', label: '移动端', width: '375px' },
  { value: 'tablet', label: '平板', width: '768px' },
  { value: 'desktop', label: '桌面', width: '1200px' },
]

// 默认行配置
const DEFAULT_ROW_CONFIG: GridRowConfig = {
  id: 'row-1',
  gutter: { mobile: { x: 16, y: 16 }, tablet: { x: 24, y: 24 }, desktop: { x: 24, y: 24 } },
  justify: { mobile: 'start', tablet: 'start', desktop: 'start' },
  align: { mobile: 'start', tablet: 'start', desktop: 'start' },
  wrap: { mobile: false, tablet: false, desktop: false },
  direction: { mobile: 'row', tablet: 'row', desktop: 'row' },
  columns: [
    {
      id: 'col-1',
      span: { mobile: 24, tablet: 12, desktop: 12 },
      content: '列 1',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
    },
    {
      id: 'col-2',
      span: { mobile: 24, tablet: 12, desktop: 12 },
      content: '列 2',
      backgroundColor: 'hsl(var(--secondary) / 0.1)',
    },
  ],
}

/**
 * 栅格系统可视化编辑器
 */
export function GridEditor({
  config = DEFAULT_ROW_CONFIG,
  onChange,
  showPreview = true,
  showControls = true,
  className,
}: GridEditorProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop')
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'visual' | 'code'>('visual')

  // 获取响应式值
  const getResponsiveValue = useCallback(
    <T,>(value: ResponsiveValue<T>): T => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const partialRecord = value as Partial<Record<Breakpoint, T>>
        return (
          partialRecord[activeBreakpoint] ??
          partialRecord.desktop ??
          Object.values(partialRecord)[0] ??
          (value as T)
        )
      }
      return value as T
    },
    [activeBreakpoint]
  )

  // 更新响应式值
  const updateResponsiveValue = useCallback(
    <T,>(value: ResponsiveValue<T>, newValue: T, breakpoint?: Breakpoint): ResponsiveValue<T> => {
      const targetBreakpoint = breakpoint || activeBreakpoint
      return {
        ...value,
        [targetBreakpoint]: newValue,
      }
    },
    [activeBreakpoint]
  )

  // 更新行配置
  const updateRowConfig = useCallback(
    (updates: Partial<GridRowConfig>) => {
      const newConfig = { ...config, ...updates }
      onChange?.(newConfig)
    },
    [config, onChange]
  )

  // 更新列配置
  const updateColumnConfig = useCallback(
    (columnId: string, updates: Partial<GridColumnConfig>) => {
      const newColumns = config.columns.map(col =>
        col.id === columnId ? { ...col, ...updates } : col
      )
      updateRowConfig({ columns: newColumns })
    },
    [config.columns, updateRowConfig]
  )

  // 添加新列
  const addColumn = useCallback(() => {
    const newColumn: GridColumnConfig = {
      id: `col-${Date.now()}`,
      span: { mobile: 24, tablet: 12, desktop: 6 },
      content: `列 ${config.columns.length + 1}`,
      backgroundColor: `hsl(${Math.random() * 360}, 70%, 85%)`,
    }
    updateRowConfig({ columns: [...config.columns, newColumn] })
  }, [config.columns, updateRowConfig])

  // 删除列
  const deleteColumn = useCallback(
    (columnId: string) => {
      const newColumns = config.columns.filter(col => col.id !== columnId)
      updateRowConfig({ columns: newColumns })
      if (selectedColumnId === columnId) {
        setSelectedColumnId(null)
      }
    },
    [config.columns, selectedColumnId, updateRowConfig]
  )

  // 复制列
  const duplicateColumn = useCallback(
    (columnId: string) => {
      const column = config.columns.find(col => col.id === columnId)
      if (column) {
        const newColumn: GridColumnConfig = {
          ...column,
          id: `col-${Date.now()}`,
          content: `${column.content} (副本)`,
        }
        const columnIndex = config.columns.findIndex(col => col.id === columnId)
        const newColumns = [...config.columns]
        newColumns.splice(columnIndex + 1, 0, newColumn)
        updateRowConfig({ columns: newColumns })
      }
    },
    [config.columns, updateRowConfig]
  )

  // 生成代码
  const generateCode = useMemo(() => {
    const rowClasses = GridSystemUtils.generateRowClasses(config)
    const columnCodes = config.columns
      .map(col => {
        const spanClasses = GridSystemUtils.generateSpanClasses(col.span)
        const offsetClasses = GridSystemUtils.generateOffsetClasses(col.offset || 0)
        const orderClasses = GridSystemUtils.generateOrderClasses(col.order || 0)
        const hiddenClasses = GridSystemUtils.generateHiddenClasses(col.hidden || false)

        return `        <Col${col.span !== 12 ? ` span={${JSON.stringify(col.span)}}` : ''}>
          <div className="p-4 border rounded">
            ${col.content || '列内容'}
          </div>
        </Col>`
      })
      .join('\n')

    return `      <Row${JSON.stringify(config) !== JSON.stringify(DEFAULT_ROW_CONFIG) ? ` gutter={${JSON.stringify(config.gutter)}} justify="${getResponsiveValue(config.justify)}" align="${getResponsiveValue(config.align)}"` : ''}>
${columnCodes}
      </Row>`
  }, [config, getResponsiveValue])

  const selectedColumn = config.columns.find(col => col.id === selectedColumnId)

  return (
    <div className={cn('grid-editor space-y-6', className)}>
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">预览模式:</Label>
          <Tabs
            value={previewMode}
            onValueChange={value => setPreviewMode(value as 'visual' | 'code')}
          >
            <TabsList>
              <TabsTrigger value="visual" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                可视化
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                代码
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <Label className="text-sm font-medium">断点:</Label>
          <Select
            value={activeBreakpoint}
            onValueChange={value => setActiveBreakpoint(value as Breakpoint)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BREAKPOINTS.map(bp => (
                <SelectItem key={bp.value} value={bp.value}>
                  {bp.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 左侧：预览区域 */}
        {showPreview && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">预览</CardTitle>
              <div className="text-sm text-muted-foreground">
                当前断点: {BREAKPOINTS.find(bp => bp.value === activeBreakpoint)?.label} (
                {BREAKPOINTS.find(bp => bp.value === activeBreakpoint)?.width})
              </div>
            </CardHeader>
            <CardContent>
              {previewMode === 'visual' ? (
                <div
                  className="rounded-lg border bg-muted/20 p-4"
                  style={{ maxWidth: BREAKPOINTS.find(bp => bp.value === activeBreakpoint)?.width }}
                >
                  <div className={cn('grid-preview', GridSystemUtils.generateRowClasses(config))}>
                    {config.columns.map((col, index) => {
                      const span = getResponsiveValue(col.span)
                      const offset = getResponsiveValue(col.offset || 0)
                      const isHidden = getResponsiveValue(col.hidden || false)

                      if (isHidden) return null

                      return (
                        <div
                          key={col.id}
                          className={cn(
                            'grid-column-preview cursor-pointer rounded-lg border-2 border-dashed p-4 transition-all',
                            'hover:border-primary hover:shadow-md',
                            selectedColumnId === col.id && 'border-primary shadow-md',
                            GridSystemUtils.generateSpanClasses(col.span),
                            GridSystemUtils.generateOffsetClasses(col.offset || 0)
                          )}
                          style={{
                            backgroundColor: col.backgroundColor,
                            marginLeft: offset > 0 ? `${(offset / 24) * 100}%` : undefined,
                          }}
                          onClick={() => setSelectedColumnId(col.id)}
                        >
                          <div className="text-center">
                            <div className="mb-1 text-sm font-medium">
                              {col.content || `列 ${index + 1}`}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              span={String(span)}
                            </Badge>
                            {offset > 0 && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                offset={String(offset)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="code-preview">
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{generateCode}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 右侧：控制面板 */}
        {showControls && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 行配置 */}
              <div className="space-y-4">
                <h4 className="font-medium">行配置</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">水平对齐</Label>
                    <Select
                      value={getResponsiveValue(config.justify)}
                      onValueChange={value =>
                        updateRowConfig({
                          justify: updateResponsiveValue(config.justify, value as any),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">左对齐</SelectItem>
                        <SelectItem value="center">居中</SelectItem>
                        <SelectItem value="end">右对齐</SelectItem>
                        <SelectItem value="between">两端对齐</SelectItem>
                        <SelectItem value="around">环绕对齐</SelectItem>
                        <SelectItem value="evenly">均匀对齐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">垂直对齐</Label>
                    <Select
                      value={getResponsiveValue(config.align)}
                      onValueChange={value =>
                        updateRowConfig({
                          align: updateResponsiveValue(config.align, value as any),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="start">顶部对齐</SelectItem>
                        <SelectItem value="center">居中对齐</SelectItem>
                        <SelectItem value="end">底部对齐</SelectItem>
                        <SelectItem value="stretch">拉伸对齐</SelectItem>
                        <SelectItem value="baseline">基线对齐</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">间距X</Label>
                    <Slider
                      value={[getResponsiveValue(config.gutter).x || 16]}
                      onValueChange={([value]) => {
                        const currentGutter = getResponsiveValue(config.gutter) as {
                          x: number
                          y: number
                        }
                        updateRowConfig({
                          gutter: updateResponsiveValue(config.gutter, {
                            ...currentGutter,
                            x: value,
                          }),
                        })
                      }}
                      max={48}
                      step={4}
                      className="mt-2"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {String(getResponsiveValue(config.gutter).x || 16)}px
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm">间距Y</Label>
                    <Slider
                      value={[getResponsiveValue(config.gutter).y || 16]}
                      onValueChange={([value]) => {
                        const currentGutter = getResponsiveValue(config.gutter) as {
                          x: number
                          y: number
                        }
                        updateRowConfig({
                          gutter: updateResponsiveValue(config.gutter, {
                            ...currentGutter,
                            y: value,
                          }),
                        })
                      }}
                      max={48}
                      step={4}
                      className="mt-2"
                    />
                    <div className="mt-1 text-xs text-muted-foreground">
                      {String(getResponsiveValue(config.gutter).y || 16)}px
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={getResponsiveValue(config.wrap)}
                    onCheckedChange={checked =>
                      updateRowConfig({
                        wrap: updateResponsiveValue(config.wrap, checked),
                      })
                    }
                  />
                  <Label className="text-sm">允许换行</Label>
                </div>
              </div>

              {/* 列管理 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">列管理</h4>
                  <Button onClick={addColumn} size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    添加列
                  </Button>
                </div>

                <div className="space-y-2">
                  {config.columns.map((col, index) => (
                    <div
                      key={col.id}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-lg border p-3',
                        'transition-colors hover:bg-muted/50',
                        selectedColumnId === col.id && 'border-primary bg-muted'
                      )}
                      onClick={() => setSelectedColumnId(col.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: col.backgroundColor }}
                        />
                        <span className="font-medium">{col.content || `列 ${index + 1}`}</span>
                        <Badge variant="secondary" className="text-xs">
                          span={getResponsiveValue(col.span)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            duplicateColumn(col.id)
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={e => {
                            e.stopPropagation()
                            deleteColumn(col.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 选中列的详细配置 */}
              {selectedColumn && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">列配置: {selectedColumn.content}</h4>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm">列内容</Label>
                      <Input
                        value={selectedColumn.content || ''}
                        onChange={e =>
                          updateColumnConfig(selectedColumn.id, { content: e.target.value })
                        }
                        placeholder="输入列内容"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">栅格宽度 (1-24)</Label>
                      <Slider
                        value={[getResponsiveValue(selectedColumn.span)]}
                        onValueChange={([value]) =>
                          updateColumnConfig(selectedColumn.id, {
                            span: updateResponsiveValue(selectedColumn.span, value),
                          })
                        }
                        min={1}
                        max={24}
                        step={1}
                        className="mt-2"
                      />
                      <div className="mt-1 text-xs text-muted-foreground">
                        {getResponsiveValue(selectedColumn.span)} / 24
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">左侧偏移 (0-23)</Label>
                      <Slider
                        value={[getResponsiveValue(selectedColumn.offset || 0)]}
                        onValueChange={([value]) =>
                          updateColumnConfig(selectedColumn.id, {
                            offset: updateResponsiveValue(selectedColumn.offset || 0, value),
                          })
                        }
                        min={0}
                        max={23}
                        step={1}
                        className="mt-2"
                      />
                      <div className="mt-1 text-xs text-muted-foreground">
                        {getResponsiveValue(selectedColumn.offset || 0)} 列
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">排序</Label>
                      <Input
                        type="number"
                        value={getResponsiveValue(selectedColumn.order || 0)}
                        onChange={e =>
                          updateColumnConfig(selectedColumn.id, {
                            order: updateResponsiveValue(
                              selectedColumn.order || 0,
                              parseInt(e.target.value) || 0
                            ),
                          })
                        }
                        min={0}
                        max={100}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={getResponsiveValue(selectedColumn.hidden || false)}
                        onCheckedChange={checked =>
                          updateColumnConfig(selectedColumn.id, {
                            hidden: updateResponsiveValue(selectedColumn.hidden || false, checked),
                          })
                        }
                      />
                      <Label className="text-sm">隐藏列</Label>
                    </div>

                    <div>
                      <Label className="text-sm">背景颜色</Label>
                      <Input
                        type="color"
                        value={selectedColumn.backgroundColor || '#f0f0f0'}
                        onChange={e =>
                          updateColumnConfig(selectedColumn.id, { backgroundColor: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default GridEditor
