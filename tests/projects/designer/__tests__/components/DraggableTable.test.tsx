/**
 * Unit test for DraggableTable component
 *
 * Test: T056 [US3] Unit test for drag-and-drop table functionality
 * Purpose: Validate table drag-and-drop functionality, field interactions, and relationship creation triggers
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { DraggableTable } from '@/components/designer/DraggableTable'
import { DataTableWithFields } from '@/types/designer/table'

// Mock @dnd-kit
const mockUseDraggable = jest.fn()
jest.mock('@dnd-kit/core', () => ({
  useDraggable: () => mockUseDraggable(),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Database: () => <div data-testid="database-icon" />,
  GripVertical: () => <div data-testid="grip-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Settings: () => <div data-testid="settings-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  Edit: () => <div data-testid="edit-icon" />,
  Trash2: () => <div data-testid="trash-icon" />,
}))

describe('DraggableTable', () => {
  const mockTable: DataTableWithFields = {
    id: 'table-1',
    name: 'Users',
    table_name: 'users',
    status: 'draft',
    project_id: 'project-1',
    description: 'Users table',
    schema_definition: {},
    created_by: 'test-user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    fields: [
      {
        id: 'field-1',
        name: 'id',
        field_name: 'id',
        table_id: 'table-1',
        data_type: 'integer',
        is_required: true,
        is_primary_key: true,
        order: 1,
        field_config: {},
        sort_order: 1,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'field-2',
        name: 'email',
        field_name: 'email',
        table_id: 'table-1',
        data_type: 'text',
        is_required: true,
        order: 2,
        field_config: { max_length: 255 },
        sort_order: 2,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'field-3',
        name: 'name',
        field_name: 'name',
        table_id: 'table-1',
        data_type: 'text',
        is_required: false,
        order: 3,
        field_config: { max_length: 100 },
        sort_order: 3,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    relationships: {
      outgoing: [],
      incoming: [],
    },
  }

  const defaultProps = {
    table: mockTable,
    position: { x: 100, y: 200 },
    isSelected: false,
    onPositionChange: jest.fn(),
    onSelect: jest.fn(),
    onFieldSelect: jest.fn(),
    onEditTable: jest.fn(),
    onDeleteTable: jest.fn(),
    onAddField: jest.fn(),
    onDeployTable: jest.fn(),
    onRelationshipCreate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock for useDraggable
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {
        onMouseDown: jest.fn(),
        onTouchStart: jest.fn(),
      },
      setNodeRef: jest.fn(),
      transform: null,
      isDragging: false,
    })
  })

  test('should render table with correct information', () => {
    render(<DraggableTable {...defaultProps} />)

    // Check table name and database name
    expect(screen.getByText('Users')).toBeTruthy()
    expect(screen.getByText('users')).toBeTruthy()

    // Check status badge
    expect(screen.getByText('draft')).toBeTruthy()

    // Check field count and relationship count
    expect(screen.getByText('3 个字段')).toBeTruthy()
    expect(screen.getByText('0 个关系')).toBeTruthy()
  })

  test('should display all table fields', () => {
    render(<DraggableTable {...defaultProps} />)

    // Check field names are displayed
    expect(screen.getByText('id')).toBeTruthy()
    expect(screen.getByText('email')).toBeTruthy()
    expect(screen.getByText('name')).toBeTruthy()

    // Check field types
    expect(screen.getByText('integer')).toBeTruthy()
    expect(screen.getByText('text')).toBeTruthy()

    // Check required field indicators (should have 2 required fields)
    const requiredIndicators = screen.getAllByTestId('required-indicator')
    expect(requiredIndicators.length).toBe(2)
  })

  test('should handle table selection', async () => {
    const mockOnSelect = jest.fn()
    render(<DraggableTable {...defaultProps} onSelect={mockOnSelect} />)

    // Click on table header to select
    const tableHeader = screen.getByText('Users').closest('.table-header')
    await userEvent.click(tableHeader!)

    expect(mockOnSelect).toHaveBeenCalledWith(mockTable)
  })

  test('should handle field selection', async () => {
    const mockOnFieldSelect = jest.fn()
    render(<DraggableTable {...defaultProps} onFieldSelect={mockOnFieldSelect} />)

    // Click on a field
    const emailField = screen.getByText('email').closest('[data-testid*="field"]')
    await userEvent.click(emailField!)

    expect(mockOnFieldSelect).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'email',
        data_type: 'text',
      })
    )
  })

  test('should show selected state when table is selected', () => {
    render(<DraggableTable {...defaultProps} isSelected={true} />)

    // Check for selected styling
    const tableCard = screen.getByRole('article')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(expect(tableCard) as any).toHaveClass('border-primary')
  })

  test('should show selected field when field is selected', () => {
    render(<DraggableTable {...defaultProps} selectedFieldId="field-2" />)

    // Check for selected field styling
    const emailField = screen.getByText('email').closest('[data-testid*="field"]')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(expect(emailField!) as any).toHaveClass('border-accent-foreground/20')
  })

  test('should handle relationship creation trigger', async () => {
    const mockOnRelationshipCreate = jest.fn()
    render(<DraggableTable {...defaultProps} onRelationshipCreate={mockOnRelationshipCreate} />)

    // Find and click relationship button on a field
    const relationshipButtons = screen.getAllByTestId('relationship-button')
    await userEvent.click(relationshipButtons[0])

    expect(mockOnRelationshipCreate).toHaveBeenCalledWith(
      mockTable,
      expect.objectContaining({
        name: 'id',
      })
    )
  })

  test('should handle drag and drop initialization', () => {
    render(<DraggableTable {...defaultProps} />)

    // Verify useDraggable was called with correct parameters
    expect(mockUseDraggable).toHaveBeenCalledWith({
      id: 'table-table-1',
      data: {
        tableId: 'table-1',
        table: mockTable,
        type: 'table',
      },
      disabled: false,
    })
  })

  test('should disable drag when disabled prop is true', () => {
    render(<DraggableTable {...defaultProps} disabled={true} />)

    expect(mockUseDraggable).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
      })
    )
  })

  test('should disable drag when isDragging is true', () => {
    render(<DraggableTable {...defaultProps} isDragging={true} />)

    expect(mockUseDraggable).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
      })
    )
  })

  test('should handle add field button click', async () => {
    const mockOnAddField = jest.fn()
    render(<DraggableTable {...defaultProps} onAddField={mockOnAddField} />)

    const addFieldButton = screen.getByText('添加字段')
    await userEvent.click(addFieldButton)

    expect(mockOnAddField).toHaveBeenCalledWith(mockTable)
  })

  test('should show settings dropdown menu', async () => {
    render(<DraggableTable {...defaultProps} />)

    // Click settings button to open dropdown
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    await userEvent.click(settingsButton!)

    // Check dropdown menu items
    expect(screen.getByText('查看详情')).toBeTruthy()
    expect(screen.getByText('编辑表')).toBeTruthy()
    expect(screen.getByText('部署到数据库')).toBeTruthy()
    expect(screen.getByText('删除表')).toBeTruthy()
  })

  test('should handle view details action', async () => {
    const mockOnSelect = jest.fn()
    render(<DraggableTable {...defaultProps} onSelect={mockOnSelect} />)

    // Open settings menu
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    await userEvent.click(settingsButton!)

    // Click view details
    const viewDetailsItem = screen.getByText('查看详情')
    await userEvent.click(viewDetailsItem)

    expect(mockOnSelect).toHaveBeenCalledWith(mockTable)
  })

  test('should handle edit table action', async () => {
    const mockOnEditTable = jest.fn()
    render(<DraggableTable {...defaultProps} onEditTable={mockOnEditTable} />)

    // Open settings menu
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    await userEvent.click(settingsButton!)

    // Click edit table
    const editTableItem = screen.getByText('编辑表')
    await userEvent.click(editTableItem)

    expect(mockOnEditTable).toHaveBeenCalledWith(mockTable)
  })

  test('should handle deploy table action', async () => {
    const mockOnDeployTable = jest.fn()
    render(<DraggableTable {...defaultProps} onDeployTable={mockOnDeployTable} />)

    // Open settings menu
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    await userEvent.click(settingsButton!)

    // Click deploy table
    const deployTableItem = screen.getByText('部署到数据库')
    await userEvent.click(deployTableItem)

    expect(mockOnDeployTable).toHaveBeenCalledWith(mockTable)
  })

  test('should handle delete table action', async () => {
    const mockOnDeleteTable = jest.fn()
    render(<DraggableTable {...defaultProps} onDeleteTable={mockOnDeleteTable} />)

    // Open settings menu
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    await userEvent.click(settingsButton!)

    // Click delete table
    const deleteTableItem = screen.getByText('删除表')
    await userEvent.click(deleteTableItem)

    expect(mockOnDeleteTable).toHaveBeenCalledWith(mockTable)
  })

  test('should not show deploy option for active tables', () => {
    const activeTable = {
      ...mockTable,
      status: 'active' as const,
    }

    render(<DraggableTable {...defaultProps} table={activeTable} />)

    // Open settings menu
    const settingsButton = screen.getByTestId('settings-icon').closest('button')
    userEvent.click(settingsButton!)

    // Deploy option should not be visible
    expect(screen.queryByText('部署到数据库')).toBeNull()
  })

  test('should show empty state when table has no fields', () => {
    const emptyTable = {
      ...mockTable,
      fields: [],
    }

    render(<DraggableTable {...defaultProps} table={emptyTable} />)

    expect(screen.getByText('暂无字段')).toBeTruthy()
    expect(screen.getByText('点击下方按钮添加字段')).toBeTruthy()
  })

  test('should apply correct positioning styles', () => {
    const { container } = render(<DraggableTable {...defaultProps} position={{ x: 150, y: 250 }} />)

    const draggableElement = container.querySelector('[style*="left"]')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(expect(draggableElement!) as any).toHaveStyle({
      left: '150px',
      top: '250px',
      width: '280px',
    })
  })

  test('should apply drag transform when dragging', () => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {
        onMouseDown: jest.fn(),
        onTouchStart: jest.fn(),
      },
      setNodeRef: jest.fn(),
      transform: { x: 50, y: 30 },
      isDragging: true,
    })

    const { container } = render(<DraggableTable {...defaultProps} position={{ x: 100, y: 200 }} />)

    const draggableElement = container.querySelector('[style*="transform"]')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(expect(draggableElement!) as any).toHaveStyle({
      transform: 'translate(50px, 30px)',
    })
  })

  test('should apply dragging styles when isDragging is true', () => {
    mockUseDraggable.mockReturnValue({
      attributes: {},
      listeners: {
        onMouseDown: jest.fn(),
        onTouchStart: jest.fn(),
      },
      setNodeRef: jest.fn(),
      transform: null,
      isDragging: true,
    })

    render(<DraggableTable {...defaultProps} isDragging={true} />)

    const tableCard = screen.getByRole('article')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(expect(tableCard) as any).toHaveClass('opacity-90', 'shadow-xl')
  })
})
