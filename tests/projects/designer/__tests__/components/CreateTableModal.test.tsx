/**
 * Unit test for CreateTableModal component (Simplified version)
 *
 * Test: T031 [US1] Unit test for CreateTableModal component
 * Purpose: Validate table creation modal functionality, form interactions, and field management
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CreateTableModal } from '@/components/designer/modals/CreateTableModal'

// Mock the designer store
const mockUseDesignerStore = jest.fn()
jest.mock('@/stores/designer/useDesignerStore', () => ({
  useDesignerStore: () => mockUseDesignerStore(),
}))

describe('CreateTableModal (Simplified)', () => {
  const mockCreateTable = jest.fn()
  const projectId = 'test-project-id'

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseDesignerStore.mockReturnValue({
      createTable: mockCreateTable,
    })
  })

  test('should render modal with basic elements', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Check that basic elements are rendered
    expect(screen.getByText('Create New Table')).toBeTruthy()
    expect(screen.getByText(/Design a new data table with custom fields/)).toBeTruthy()
  })

  test('should have table name input field', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Check for table name input
    const nameInput = screen.getByLabelText(/Table Name \*/)
    expect(nameInput).toBeTruthy()
  })

  test('should have database table name input field', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Check for database table name input
    const tableNameInput = screen.getByLabelText(/Database Table Name \*/)
    expect(tableNameInput).toBeTruthy()
  })

  test('should have add field button', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Check for add field button
    const addFieldButton = screen.getByText('Add Field')
    expect(addFieldButton).toBeTruthy()
  })

  test('should have create and cancel buttons', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Check for action buttons
    const createButton = screen.getByRole('button', { name: 'Create Table' })
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })

    expect(createButton).toBeTruthy()
    expect(cancelButton).toBeTruthy()
  })

  test('should call createTable when form is filled and submitted', async () => {
    mockCreateTable.mockImplementation(() => Promise.resolve())

    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Fill in basic form
    const nameInput = screen.getByLabelText(/Table Name \*/)
    await userEvent.type(nameInput, 'Test Table')

    const createButton = screen.getByRole('button', { name: 'Create Table' })
    await userEvent.click(createButton)

    // Verify createTable was called
    expect(mockCreateTable).toHaveBeenCalledWith(
      projectId,
      expect.objectContaining({
        name: 'Test Table',
        table_name: 'test_table',
      })
    )
  })

  test('should handle cancel button click', async () => {
    const onOpenChange = jest.fn()

    render(<CreateTableModal open={true} onOpenChange={onOpenChange} projectId={projectId} />)

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  test('should start with id field', () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    // Should have at least one field (id) initially
    const fieldInputs = screen.getAllByLabelText(/Field Name \*/)
    expect(fieldInputs.length).toBeGreaterThanOrEqual(1)
  })

  test('should generate table name from display name', async () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Table Name \*/)
    await userEvent.type(nameInput, 'User Profiles')

    const tableNameInput = screen.getByLabelText(/Database Table Name \*/)
    expect((tableNameInput as HTMLInputElement).value).toBe('user_profiles')
  })

  test('should handle special characters in table name generation', async () => {
    render(<CreateTableModal open={true} onOpenChange={jest.fn()} projectId={projectId} />)

    const nameInput = screen.getByLabelText(/Table Name \*/)
    await userEvent.type(nameInput, '123 Product Names!')

    const tableNameInput = screen.getByLabelText(/Database Table Name \*/)
    expect((tableNameInput as HTMLInputElement).value).toBe('table_123_product_names')
  })
})
