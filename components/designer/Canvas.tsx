'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Maximize2, ZoomIn, ZoomOut, RotateCcw, Grid3X3 } from 'lucide-react'
import { DataTable, DataTableWithFields } from '@/types/designer/table'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { CANVAS_CONFIG } from '@/lib/designer/constants'
import { cn } from '@/lib/utils'

interface CanvasProps {
  onTableSelect?: (table: DataTable) => void
}

interface TablePosition {
  x: number
  y: number
}

interface VisualTable extends DataTableWithFields {
  position: TablePosition
  size: { width: number; height: number }
}

interface TableWithFields extends DataTable {
  fields: Array<{
    id: string
    name: string
    field_name: string
    data_type: string
    is_required: boolean
    default_value?: string
    sort_order: number
  }>
  relationships: {
    outgoing: Array<{ id: string }>
    incoming: Array<{ id: string }>
  }
}

export function Canvas({ onTableSelect }: CanvasProps) {
  const { tables } = useDesignerStore()
  const [zoom, setZoom] = useState<number>(CANVAS_CONFIG.DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({})

  // Generate visual tables with positions
  const visualTables = useMemo(() => {
    return tables.map((table, index) => {
      const position = tablePositions[table.id] || {
        x: 100 + (index % 4) * 300,
        y: 100 + Math.floor(index / 4) * 250,
      }

      // Calculate table size based on fields
      const fieldCount = (table as TableWithFields).fields?.length || 0
      const height = Math.max(
        CANVAS_CONFIG.TABLE_MIN_HEIGHT,
        CANVAS_CONFIG.TABLE_HEADER_HEIGHT +
          CANVAS_CONFIG.TABLE_FOOTER_HEIGHT +
          fieldCount * CANVAS_CONFIG.FIELD_HEIGHT +
          2 * CANVAS_CONFIG.FIELD_PADDING
      )

      return {
        ...table,
        position,
        size: {
          width: CANVAS_CONFIG.TABLE_DEFAULT_WIDTH,
          height,
        },
      } as VisualTable
    })
  }, [tables, tablePositions])

  // Auto-arrange tables in a grid
  const autoArrange = useCallback(() => {
    const newPositions: Record<string, TablePosition> = {}
    const gridCols = Math.ceil(Math.sqrt(visualTables.length))

    visualTables.forEach((table, index) => {
      const row = Math.floor(index / gridCols)
      const col = index % gridCols
      newPositions[table.id] = {
        x: CANVAS_CONFIG.CANVAS_PADDING + col * (CANVAS_CONFIG.TABLE_DEFAULT_WIDTH + 100),
        y: CANVAS_CONFIG.CANVAS_PADDING + row * (table.size.height + 100),
      }
    })

    setTablePositions(newPositions)
  }, [visualTables])

  // Handle canvas panning
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    }
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
  }

  // Handle zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - CANVAS_CONFIG.ZOOM_STEP, CANVAS_CONFIG.MIN_ZOOM))
  }

  const handleZoomReset = () => {
    setZoom(CANVAS_CONFIG.DEFAULT_ZOOM)
    setPan({ x: 0, y: 0 })
  }

  // Handle table selection
  const handleTableClick = (table: DataTable) => {
    onTableSelect?.(table)
  }

  // Handle table dragging (simplified version)
  const handleTableDragStart = (e: React.MouseEvent, tableId: string) => {
    e.preventDefault()
    const startPosition = tablePositions[tableId] || { x: 0, y: 0 }
    const dragStart = { x: e.clientX, y: e.clientY }

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y

      setTablePositions(prev => ({
        ...prev,
        [tableId]: {
          x: startPosition.x + deltaX / zoom,
          y: startPosition.y + deltaY / zoom,
        },
      }))
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  // Initialize table positions when tables load
  const tablePositionKeys = Object.keys(tablePositions)
  useEffect(() => {
    if (tables.length > 0 && tablePositionKeys.length === 0) {
      autoArrange()
    }
  }, [tables, tablePositionKeys.length, autoArrange])

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Canvas Controls */}
      <div className="border-b border-border bg-card px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={cn(showGrid && 'bg-accent')}
            >
              <Grid3X3 className="mr-2 h-4 w-4" />
              Grid
            </Button>
            <Button variant="outline" size="sm" onClick={autoArrange}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Auto Arrange
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= CANVAS_CONFIG.MIN_ZOOM}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="min-w-[4rem] text-center font-mono text-sm">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= CANVAS_CONFIG.MAX_ZOOM}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        className={cn(
          'relative flex-1 overflow-hidden',
          isPanning && 'cursor-grabbing',
          !isPanning && 'cursor-grab'
        )}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
              `,
              backgroundSize: `${CANVAS_CONFIG.GRID_SIZE * zoom}px ${CANVAS_CONFIG.GRID_SIZE * zoom}px`,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          />
        )}

        {/* Canvas Content */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          {visualTables.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Card className="max-w-md">
                <CardHeader className="text-center">
                  <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <CardTitle>Welcome to Data Model Designer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                  <p className="text-muted-foreground">
                    Create database tables visually by defining fields, relationships, and
                    constraints.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Use the left panel to create your first table.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            visualTables.map(table => (
              <div
                key={table.id}
                className={cn(
                  'absolute cursor-move rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md'
                )}
                style={{
                  left: `${table.position.x}px`,
                  top: `${table.position.y}px`,
                  width: `${table.size.width}px`,
                  height: `${table.size.height}px`,
                }}
                onClick={() => handleTableClick(table)}
                onMouseDown={e => handleTableDragStart(e, table.id)}
              >
                {/* Table Header */}
                <div className="rounded-t-lg border-b border-border bg-muted px-3 py-2">
                  <div className="flex items-center justify-between">
                    <h3 className="truncate text-sm font-medium">{table.name}</h3>
                    <Badge
                      variant={table.status === 'active' ? 'default' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {table.status}
                    </Badge>
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {table.table_name}
                  </p>
                </div>

                {/* Table Fields */}
                <div className="overflow-hidden p-2">
                  <div className="space-y-1">
                    {(table as TableWithFields).fields?.map(field => (
                      <div
                        key={field.id}
                        className="flex items-center justify-between rounded p-1.5 text-xs hover:bg-accent/50"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={cn(
                              'h-2 w-2 flex-shrink-0 rounded-full',
                              field.is_required ? 'bg-orange-400' : 'bg-blue-400'
                            )}
                          />
                          <span className="truncate">{field.name}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">
                          {field.data_type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Footer */}
                <div className="rounded-b-lg border-t border-border px-3 py-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{(table as TableWithFields).fields?.length || 0} fields</span>
                    <span>
                      {(table as TableWithFields).relationships?.outgoing?.length || 0}{' '}
                      relationships
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
