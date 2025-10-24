'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Database, Maximize2, ZoomIn, ZoomOut, RotateCcw, Grid3X3 } from 'lucide-react'
import { DataTable, DataTableWithFields } from '@/types/designer/table'
import { DataField } from '@/types/designer/field'
import { useDesignerStore } from '@/stores/designer/useDesignerStore'
import { CANVAS_CONFIG } from '@/lib/designer/constants'
import { cn } from '@/lib/utils'
import { DraggableTable } from './DraggableTable'
import { RelationshipLines } from './RelationshipLine'

interface CanvasProps {
  onTableSelect?: (table: DataTableWithFields) => void
  onRelationshipCreate?: (sourceTable: DataTableWithFields, sourceField: DataField) => void
  onTableEdit?: (table: DataTableWithFields) => void
  onTableDelete?: (table: DataTableWithFields) => void
  onAddField?: (table: DataTableWithFields) => void
  onDeployTable?: (table: DataTableWithFields) => void
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

export function Canvas({
  onTableSelect,
  onRelationshipCreate,
  onTableEdit,
  onTableDelete,
  onAddField,
  onDeployTable,
}: CanvasProps) {
  const { tables, relationships, updateTablePosition } = useDesignerStore()
  const [zoom, setZoom] = useState<number>(CANVAS_CONFIG.DEFAULT_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [tablePositions, setTablePositions] = useState<Record<string, TablePosition>>({})

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [highlightedRelationshipId, setHighlightedRelationshipId] = useState<string | null>(null)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: (event, { context }) => {
        // Handle keyboard drag (optional enhancement)
        if (context?.active) {
          return {
            x: 0,
            y: 0,
          }
        }
        return undefined
      },
    })
  )

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

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const tableId = event.active.id as string
    setActiveId(tableId)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event

    if (delta.x === 0 && delta.y === 0) {
      setActiveId(null)
      return
    }

    if (active) {
      const tableId = active.id as string
      const currentPosition = tablePositions[tableId] || { x: 0, y: 0 }

      // Calculate new position
      const newPosition = {
        x: Math.max(0, currentPosition.x + delta.x / zoom),
        y: Math.max(0, currentPosition.y + delta.y / zoom),
      }

      // Grid snapping (20px grid)
      const snappedPosition = {
        x: Math.round(newPosition.x / CANVAS_CONFIG.GRID_SIZE) * CANVAS_CONFIG.GRID_SIZE,
        y: Math.round(newPosition.y / CANVAS_CONFIG.GRID_SIZE) * CANVAS_CONFIG.GRID_SIZE,
      }

      setTablePositions(prev => ({
        ...prev,
        [tableId]: snappedPosition,
      }))

      // Update store with new position
      updateTablePosition(tableId, snappedPosition)
    }

    setActiveId(null)
  }

  // Handle table selection
  const handleTableSelect = (table: DataTableWithFields) => {
    setSelectedTableId(table.id)
    setSelectedFieldId(null)
    onTableSelect?.(table)
  }

  // Handle field selection
  const handleFieldSelect = (field: DataField) => {
    setSelectedFieldId(field.id)
  }

  // Handle relationship creation
  const handleRelationshipCreate = (sourceTable: DataTableWithFields, sourceField: DataField) => {
    onRelationshipCreate?.(sourceTable, sourceField)
  }

  // Prepare relationship data for rendering
  const relationshipData = useMemo(() => {
    if (!relationships || relationships.length === 0) {
      return []
    }

    return relationships
      .map(relationship => {
        const sourceTable = tables.find(
          t => t.id === relationship.source_table_id
        ) as DataTableWithFields
        const targetTable = tables.find(
          t => t.id === relationship.target_table_id
        ) as DataTableWithFields
        const sourceField = sourceTable?.fields?.find(f => f.id === relationship.source_field_id)
        const targetField = targetTable?.fields?.find(f => f.id === relationship.target_field_id)

        if (!sourceTable || !targetTable || !sourceField || !targetField) {
          return null
        }

        return {
          relationship,
          sourceTable,
          targetTable,
          sourceField,
          targetField,
          sourceTablePosition: tablePositions[sourceTable.id] || { x: 0, y: 0 },
          targetTablePosition: tablePositions[targetTable.id] || { x: 0, y: 0 },
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
  }, [relationships, tables, tablePositions])

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

        {/* Canvas Content with DnD */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
            }}
          >
            {/* Relationship Lines Layer */}
            <RelationshipLines
              relationships={relationshipData}
              selectedRelationshipId={highlightedRelationshipId || undefined}
              highlightedRelationshipId={highlightedRelationshipId || undefined}
              onRelationshipSelect={relationship => {
                setHighlightedRelationshipId(relationship.id)
              }}
              onRelationshipHover={relationship => {
                setHighlightedRelationshipId(relationship?.id || null)
              }}
              className="pointer-events-none absolute inset-0"
            />

            {/* Tables Layer */}
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
                <DraggableTable
                  key={table.id}
                  table={table}
                  position={table.position}
                  isSelected={selectedTableId === table.id}
                  isDragging={activeId === `table-${table.id}`}
                  onPositionChange={(tableId: string, newPosition: { x: number; y: number }) => {
                    setTablePositions((prev: Record<string, TablePosition>) => ({
                      ...prev,
                      [tableId]: newPosition,
                    }))
                    updateTablePosition(tableId, newPosition)
                  }}
                  onSelect={handleTableSelect}
                  onFieldSelect={handleFieldSelect}
                  onEditTable={onTableEdit}
                  onDeleteTable={onTableDelete}
                  onAddField={onAddField}
                  onDeployTable={onDeployTable}
                  onRelationshipCreate={handleRelationshipCreate}
                  selectedFieldId={selectedFieldId || undefined}
                />
              ))
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeId && visualTables.find(t => `table-${t.id}` === activeId) ? (
              <div className="opacity-75">
                <DraggableTable
                  table={visualTables.find(t => `table-${t.id}` === activeId)!}
                  position={tablePositions[activeId.replace('table-', '')] || { x: 0, y: 0 }}
                  isSelected={false}
                  isDragging={true}
                  onPositionChange={() => {}}
                  onSelect={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
