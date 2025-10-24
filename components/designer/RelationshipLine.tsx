'use client'

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { TableRelationship } from '@/types/designer/relationship'
import { DataTableWithFields } from '@/types/designer/table'
import { DataField } from '@/types/designer/field'

export interface Point {
  x: number
  y: number
}

export interface TableRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

export interface RelationshipLineProps {
  relationship: TableRelationship
  sourceTable: DataTableWithFields
  targetTable: DataTableWithFields
  sourceTablePosition: Point
  targetTablePosition: Point
  sourceField?: DataField
  targetField?: DataField
  isHighlighted?: boolean
  isSelected?: boolean
  onClick?: (relationship: TableRelationship) => void
  onHover?: (relationship: TableRelationship | null) => void
  curveIntensity?: number
  showArrow?: boolean
  animationDuration?: number
}

// Calculate connection points on table rectangles
function getConnectionPoints(
  sourceRect: TableRect,
  targetRect: TableRect,
  curveIntensity = 0.3
): {
  start: Point
  end: Point
  controlPoint1: Point
  controlPoint2: Point
} {
  const sourceCenter = {
    x: sourceRect.x + sourceRect.width / 2,
    y: sourceRect.y + sourceRect.height / 2,
  }

  const targetCenter = {
    x: targetRect.x + targetRect.width / 2,
    y: targetRect.y + targetRect.height / 2,
  }

  // Determine the best connection sides
  const dx = targetCenter.x - sourceCenter.x
  const dy = targetCenter.y - sourceCenter.y

  let startPoint: Point
  let endPoint: Point

  // Calculate start point (source table)
  if (Math.abs(dx) > Math.abs(dy)) {
    // Horizontal connection
    if (dx > 0) {
      // Target is to the right
      startPoint = {
        x: sourceRect.x + sourceRect.width,
        y: sourceCenter.y,
      }
      endPoint = {
        x: targetRect.x,
        y: targetCenter.y,
      }
    } else {
      // Target is to the left
      startPoint = {
        x: sourceRect.x,
        y: sourceCenter.y,
      }
      endPoint = {
        x: targetRect.x + targetRect.width,
        y: targetCenter.y,
      }
    }
  } else {
    // Vertical connection
    if (dy > 0) {
      // Target is below
      startPoint = {
        x: sourceCenter.x,
        y: sourceRect.y + sourceRect.height,
      }
      endPoint = {
        x: targetCenter.x,
        y: targetRect.y,
      }
    } else {
      // Target is above
      startPoint = {
        x: sourceCenter.x,
        y: sourceRect.y,
      }
      endPoint = {
        x: targetCenter.x,
        y: targetRect.y + targetRect.height,
      }
    }
  }

  // Calculate control points for curved path
  const midX = (startPoint.x + endPoint.x) / 2
  const curveOffset =
    Math.max(Math.abs(endPoint.x - startPoint.x), Math.abs(endPoint.y - startPoint.y)) *
    curveIntensity

  const controlPoint1 = {
    x: midX + curveOffset * (startPoint.y > endPoint.y ? 1 : -1),
    y: startPoint.y,
  }

  const controlPoint2 = {
    x: midX + curveOffset * (startPoint.y > endPoint.y ? 1 : -1),
    y: endPoint.y,
  }

  return {
    start: startPoint,
    end: endPoint,
    controlPoint1,
    controlPoint2,
  }
}

// Generate SVG path for relationship line
function generatePath(points: ReturnType<typeof getConnectionPoints>, isCurved = true): string {
  const { start, end, controlPoint1, controlPoint2 } = points

  if (isCurved) {
    // Cubic Bezier curve
    return `M ${start.x},${start.y} C ${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${end.x},${end.y}`
  } else {
    // Straight line
    return `M ${start.x},${start.y} L ${end.x},${end.y}`
  }
}

// Generate arrow marker definition
function generateArrowMarker(id: string, color: string = '#666'): string {
  return `
    <marker
      id="${id}"
      markerWidth="10"
      markerHeight="10"
      refX="9"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path
        d="M0,0 L0,6 L9,3 z"
        fill="${color}"
      />
    </marker>
  `
}

// Calculate relationship label position
function getLabelPosition(points: ReturnType<typeof getConnectionPoints>): Point {
  const { controlPoint1, controlPoint2 } = points

  // Use the midpoint of the control points for label positioning
  return {
    x: (controlPoint1.x + controlPoint2.x) / 2,
    y: (controlPoint1.y + controlPoint2.y) / 2,
  }
}

export function RelationshipLine({
  relationship,
  sourceTable,
  targetTable,
  sourceTablePosition,
  targetTablePosition,
  isHighlighted = false,
  isSelected = false,
  onClick,
  onHover,
  curveIntensity = 0.3,
  showArrow = true,
  animationDuration = 0.3,
}: RelationshipLineProps) {
  const TABLE_WIDTH = 280
  const TABLE_HEIGHT = 200 // Default height, will be adjusted based on field count

  // Calculate table dimensions based on content
  const sourceTableHeight = Math.max(TABLE_HEIGHT, 120 + (sourceTable.fields?.length || 0) * 35)

  const targetTableHeight = Math.max(TABLE_HEIGHT, 120 + (targetTable.fields?.length || 0) * 35)

  const sourceRect: TableRect = {
    id: sourceTable.id,
    x: sourceTablePosition.x,
    y: sourceTablePosition.y,
    width: TABLE_WIDTH,
    height: sourceTableHeight,
  }

  const targetRect: TableRect = {
    id: targetTable.id,
    x: targetTablePosition.x,
    y: targetTablePosition.y,
    width: TABLE_WIDTH,
    height: targetTableHeight,
  }

  const connectionPoints = useMemo(() => {
    const sourceRect: TableRect = {
      // Used in getConnectionPoints
      id: sourceTable.id,
      x: sourceTablePosition.x,
      y: sourceTablePosition.y,
      width: TABLE_WIDTH,
      height: sourceTableHeight,
    }

    const targetRect: TableRect = {
      // Used in getConnectionPoints
      id: targetTable.id,
      x: targetTablePosition.x,
      y: targetTablePosition.y,
      width: TABLE_WIDTH,
      height: targetTableHeight,
    }

    return getConnectionPoints(sourceRect, targetRect, curveIntensity)
  }, [
    sourceTable.id,
    sourceTablePosition.x,
    sourceTablePosition.y,
    sourceTableHeight,
    targetTable.id,
    targetTablePosition.x,
    targetTablePosition.y,
    targetTableHeight,
    curveIntensity,
  ])

  const pathData = useMemo(() => generatePath(connectionPoints, true), [connectionPoints])

  const labelPosition = useMemo(() => getLabelPosition(connectionPoints), [connectionPoints])

  const strokeColor = isSelected
    ? 'hsl(var(--primary))'
    : isHighlighted
      ? 'hsl(var(--accent))'
      : 'hsl(var(--muted-foreground))'

  const strokeWidth = isSelected ? 3 : isHighlighted ? 2.5 : 2

  const handleClick = () => {
    onClick?.(relationship)
  }

  const handleMouseEnter = () => {
    onHover?.(relationship)
  }

  const handleMouseLeave = () => {
    onHover?.(null)
  }

  return (
    <g className="relationship-line">
      <defs>{generateArrowMarker(`arrow-${relationship.id}`, strokeColor)}</defs>

      {/* Relationship line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={showArrow ? `url(#arrow-${relationship.id})` : ''}
        className={cn(
          'cursor-pointer transition-all duration-300',
          isSelected && 'drop-shadow-lg',
          isHighlighted && 'animate-pulse'
        )}
        style={{
          transition: `stroke ${animationDuration}s, stroke-width ${animationDuration}s`,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Relationship label */}
      <g
        transform={`translate(${labelPosition.x}, ${labelPosition.y})`}
        className="pointer-events-none"
      >
        <rect
          x="-40"
          y="-10"
          width="80"
          height="20"
          rx="4"
          fill="hsl(var(--background))"
          stroke={strokeColor}
          strokeWidth="1"
          opacity="0.9"
        />
        <text
          x="0"
          y="4"
          textAnchor="middle"
          className="fill-current text-xs font-medium"
          style={{ stroke: 'none' }}
        >
          {relationship.relationship_name}
        </text>
      </g>

      {/* Cardinality labels */}
      <g className="pointer-events-none">
        {/* Source cardinality (one side) */}
        <text
          x={connectionPoints.start.x}
          y={connectionPoints.start.y - 5}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
          style={{ stroke: 'none' }}
        >
          1
        </text>

        {/* Target cardinality (many side) */}
        <text
          x={connectionPoints.end.x}
          y={connectionPoints.end.y - 5}
          textAnchor="middle"
          className="fill-muted-foreground text-xs"
          style={{ stroke: 'none' }}
        >
          *
        </text>
      </g>

      {/* Hover indicator */}
      {(isHighlighted || isSelected) && (
        <circle
          cx={connectionPoints.start.x}
          cy={connectionPoints.start.y}
          r="4"
          fill={strokeColor}
          className="animate-pulse"
        />
      )}
    </g>
  )
}

// Container component for rendering multiple relationship lines
export interface RelationshipLinesProps {
  relationships: Array<{
    relationship: TableRelationship
    sourceTable: DataTableWithFields
    targetTable: DataTableWithFields
    sourceTablePosition: Point
    targetTablePosition: Point
    sourceField?: DataField
    targetField?: DataField
  }>
  selectedRelationshipId?: string
  highlightedRelationshipId?: string
  onRelationshipSelect?: (relationship: TableRelationship) => void
  onRelationshipHover?: (relationship: TableRelationship | null) => void
  className?: string
}

export function RelationshipLines({
  relationships,
  selectedRelationshipId,
  highlightedRelationshipId,
  onRelationshipSelect,
  onRelationshipHover,
  className,
}: RelationshipLinesProps) {
  if (relationships.length === 0) {
    return null
  }

  return (
    <svg className={cn('pointer-events-none absolute inset-0', className)} style={{ zIndex: 1 }}>
      <g className="pointer-events-auto">
        {relationships.map(
          ({
            relationship,
            sourceTable,
            targetTable,
            sourceTablePosition,
            targetTablePosition,
            sourceField,
            targetField,
          }) => (
            <RelationshipLine
              key={relationship.id}
              relationship={relationship}
              sourceTable={sourceTable}
              targetTable={targetTable}
              sourceTablePosition={sourceTablePosition}
              targetTablePosition={targetTablePosition}
              sourceField={sourceField}
              targetField={targetField}
              isSelected={selectedRelationshipId === relationship.id}
              isHighlighted={highlightedRelationshipId === relationship.id}
              onClick={onRelationshipSelect}
              onHover={onRelationshipHover}
            />
          )
        )}
      </g>
    </svg>
  )
}
