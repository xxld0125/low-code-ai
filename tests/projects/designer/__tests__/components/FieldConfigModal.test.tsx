/**
 * Unit test for FieldConfigModal component
 *
 * Test: T043 [US2] Unit test for FieldConfigModal component
 * Purpose: Validate field configuration modal functionality, form interactions, and field type-specific configurations
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FieldConfigModal } from '@/components/designer/modals/FieldConfigModal'
import type { DataField } from '@/types/designer/field'

// Mock the API module
const mockApi = {
  fields: {
    update: jest.fn(),
  },
}

jest.mock('@/lib/designer/api', () => ({
  api: mockApi,
}))

// Type assertions for mocked functions
const mockUpdate = mockApi.fields.update as jest.MockedFunction<
  (
    projectId: string,
    tableId: string,
    fieldId: string,
    data: unknown
  ) => Promise<{ data: DataField }>
>

// Mock the validation module
const mockValidateDataField = jest.fn()
jest.mock('@/lib/designer/validation', () => ({
  validateDataField: mockValidateDataField,
}))

// Mock the constants module
jest.mock('@/lib/designer/constants', () => ({
  SUPPORTED_FIELD_TYPES: [
    { value: 'text', label: 'Text', description: 'Single line of text' },
    { value: 'number', label: 'Number', description: 'Numeric values' },
    { value: 'date', label: 'Date', description: 'Date and time values' },
    { value: 'boolean', label: 'Boolean', description: 'True/false values' },
  ],
  FIELD_TYPE_INFO: {
    text: {
      defaultConfig: { max_length: 255, min_length: 0 },
    },
    number: {
      defaultConfig: { precision: 10, scale: 2 },
    },
    date: {
      defaultConfig: { format: 'YYYY-MM-DD' },
    },
    boolean: {
      defaultConfig: {},
    },
  },
}))

describe('FieldConfigModal', () => {
  const mockOnOpenChange = jest.fn()
  const mockOnSave = jest.fn()
  const projectId = 'test-project-id'
  const tableId = 'test-table-id'

  const mockField: DataField = {
    id: 'test-field-id',
    table_id: tableId,
    name: 'Test Field',
    field_name: 'test_field',
    data_type: 'text',
    is_required: false,
    default_value: '',
    field_config: { max_length: 100, min_length: 5 },
    sort_order: 0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateDataField.mockReturnValue({ success: true, data: {} })
    mockUpdate.mockResolvedValue({
      data: { ...mockField, name: 'Updated Field' },
    })
  })

  test('should render modal with basic elements for existing field', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Configure Field')).toBeTruthy()
    expect(
      screen.getByText(/Configure field properties, validation rules, and default values/)
    ).toBeTruthy()
    expect(screen.getByDisplayValue('Test Field')).toBeTruthy()
    expect(screen.getByDisplayValue('test_field')).toBeTruthy()
  })

  test('should render modal with basic elements for new field', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Add New Field')).toBeTruthy()
    expect(screen.getByDisplayValue('')).toBeTruthy()
  })

  test('should populate form with existing field data', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByDisplayValue('Test Field')).toBeTruthy()
    expect(screen.getByDisplayValue('test_field')).toBeTruthy()
    expect(screen.getByDisplayValue('text')).toBeTruthy()

    // Check that required switch is not checked
    const requiredSwitch = screen.getByLabelText(/Required field/)
    expect((requiredSwitch as HTMLInputElement).checked).toBe(false)
  })

  test('should auto-generate field name from display name', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        onSave={mockOnSave}
      />
    )

    const nameInput = screen.getByLabelText(/Display Name \*/)
    await userEvent.type(nameInput, 'User Email Address')

    const fieldNameInput = screen.getByLabelText(/Database Field Name \*/)
    expect((fieldNameInput as HTMLInputElement).value).toBe('user_email_address')
  })

  test('should show field-specific configuration for text type', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'text' }}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Text Field Configuration')).toBeTruthy()
    expect(screen.getByLabelText(/Maximum Length/)).toBeTruthy()
    expect(screen.getByLabelText(/Minimum Length/)).toBeTruthy()
    expect(screen.getByLabelText(/Validation Pattern/)).toBeTruthy()
  })

  test('should show field-specific configuration for number type', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'number' }}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Number Field Configuration')).toBeTruthy()
    expect(screen.getByLabelText(/Precision/)).toBeTruthy()
    expect(screen.getByLabelText(/Scale/)).toBeTruthy()
    expect(screen.getByLabelText(/Minimum Value/)).toBeTruthy()
    expect(screen.getByLabelText(/Maximum Value/)).toBeTruthy()
  })

  test('should show field-specific configuration for date type', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'date' }}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Date Field Configuration')).toBeTruthy()
    expect(screen.getByLabelText(/Date Format/)).toBeTruthy()
    expect(screen.getByLabelText(/Default to current timestamp/)).toBeTruthy()
  })

  test('should show field-specific configuration for boolean type', () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'boolean' }}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByText('Boolean Field Configuration')).toBeTruthy()
    expect(screen.getByText(/Boolean fields store true\/false values/)).toBeTruthy()
  })

  test('should update field configuration when data type changes', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const dataTypeSelect = screen.getByLabelText(/Data Type \*/)
    await userEvent.click(dataTypeSelect)

    const numberOption = screen.getByText('Number')
    await userEvent.click(numberOption)

    expect(screen.getByText('Number Field Configuration')).toBeTruthy()
    expect(screen.getByDisplayValue('10')).toBeTruthy() // precision default
    expect(screen.getByDisplayValue('2')).toBeTruthy() // scale default
  })

  test('should handle field configuration changes for text fields', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'text' }}
        onSave={mockOnSave}
      />
    )

    const maxLengthInput = screen.getByLabelText(/Maximum Length/)
    await userEvent.clear(maxLengthInput)
    await userEvent.type(maxLengthInput, '500')

    expect((maxLengthInput as HTMLInputElement).value).toBe('500')
  })

  test('should handle field configuration changes for number fields', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={{ ...mockField, data_type: 'number' }}
        onSave={mockOnSave}
      />
    )

    const precisionInput = screen.getByLabelText(/Precision/)
    await userEvent.clear(precisionInput)
    await userEvent.type(precisionInput, '20')

    expect((precisionInput as HTMLInputElement).value).toBe('20')
  })

  test('should handle required field toggle', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const requiredSwitch = screen.getByLabelText(/Required field/)
    await userEvent.click(requiredSwitch)

    expect((requiredSwitch as HTMLInputElement).checked).toBe(true)
  })

  test('should handle default value input', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const defaultValueInput = screen.getByLabelText(/Default Value/)
    await userEvent.type(defaultValueInput, 'default value')

    expect((defaultValueInput as HTMLInputElement).value).toBe('default value')
  })

  test('should show validation errors when validation fails', async () => {
    mockValidateDataField.mockReturnValue({
      success: false,
      error: {
        issues: [{ message: 'Field name is required' }, { message: 'Invalid field configuration' }],
      },
    })

    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Field' })
    await userEvent.click(saveButton)

    expect(screen.getByText('• Field name is required')).toBeTruthy()
    expect(screen.getByText('• Invalid field configuration')).toBeTruthy()
  })

  test('should call onSave when field is successfully saved', async () => {
    const updatedField = { ...mockField, name: 'Updated Field' }
    mockUpdate.mockResolvedValue({ data: updatedField })

    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Field' })
    await userEvent.click(saveButton)

    expect(mockUpdate).toHaveBeenCalledWith(
      projectId,
      tableId,
      mockField.id,
      expect.objectContaining({
        name: 'Test Field',
        field_name: 'test_field',
        data_type: 'text',
        is_required: false,
      })
    )

    expect(mockOnSave).toHaveBeenCalledWith(updatedField)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  test('should handle save errors gracefully', async () => {
    const errorMessage = 'Failed to save field'
    mockUpdate.mockRejectedValue(new Error(errorMessage))

    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Field' })
    await userEvent.click(saveButton)

    expect(screen.getByText(`• ${errorMessage}`)).toBeTruthy()
  })

  test('should handle cancel button click', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await userEvent.click(cancelButton)

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  test('should disable inputs while loading', async () => {
    mockUpdate.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Field' })
    await userEvent.click(saveButton)

    expect(screen.getByRole('button', { name: 'Saving...' })).toBeTruthy()
    expect((screen.getByLabelText(/Display Name \*/) as HTMLInputElement).disabled).toBe(true)
  })

  test('should reset form when modal is closed and reopened', async () => {
    const { rerender } = render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    // Change form data
    const nameInput = screen.getByLabelText(/Display Name \*/)
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Changed Name')

    // Close modal
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Reopen modal
    rerender(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    expect(screen.getByDisplayValue('Test Field')).toBeTruthy()
  })

  test('should validate form before saving', async () => {
    mockValidateDataField.mockReturnValue({
      success: false,
      error: {
        issues: [{ message: 'Validation failed' }],
      },
    })

    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        field={mockField}
        onSave={mockOnSave}
      />
    )

    const saveButton = screen.getByRole('button', { name: 'Save Field' })
    await userEvent.click(saveButton)

    expect(mockValidateDataField).toHaveBeenCalled()
    expect(mockApi.fields.update).not.toHaveBeenCalled()
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  test('should handle special characters in field name generation', async () => {
    render(
      <FieldConfigModal
        open={true}
        onOpenChange={mockOnOpenChange}
        projectId={projectId}
        tableId={tableId}
        onSave={mockOnSave}
      />
    )

    const nameInput = screen.getByLabelText(/Display Name \*/)
    await userEvent.type(nameInput, '123 Product Names!')

    const fieldNameInput = screen.getByLabelText(/Database Field Name \*/)
    expect((fieldNameInput as HTMLInputElement).value).toBe('field_123_product_names')
  })
})
