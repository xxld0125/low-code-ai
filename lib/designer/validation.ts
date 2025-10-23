import { z } from 'zod'
import type { DataFieldType } from '@/types/designer'

// Regex patterns for validation
const TABLE_NAME_REGEX = /^[a-z][a-z0-9_]*$/
const FIELD_NAME_REGEX = /^[a-z][a-z0-9_]*$/
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Base validation schemas
const uuidSchema = z.string().regex(UUID_REGEX, 'Invalid UUID format')

const tableNameSchema = z
  .string()
  .min(1, 'Table name is required')
  .max(63, 'Table name must be 63 characters or less')
  .regex(
    TABLE_NAME_REGEX,
    'Table name must start with a letter and contain only lowercase letters, numbers, and underscores'
  )

const fieldNameSchema = z
  .string()
  .min(1, 'Field name is required')
  .max(63, 'Field name must be 63 characters or less')
  .regex(
    FIELD_NAME_REGEX,
    'Field name must start with a letter and contain only lowercase letters, numbers, and underscores'
  )

const displayNameSchema = z
  .string()
  .min(1, 'Display name is required')
  .max(100, 'Display name must be 100 characters or less')

const descriptionSchema = z
  .string()
  .max(500, 'Description must be 500 characters or less')
  .optional()

// Data type specific schemas
const textFieldConfigSchema = z.object({
  max_length: z.number().min(1).max(65535).optional(),
  min_length: z.number().min(0).optional(),
  pattern: z.string().optional(),
  validation: z.string().optional(),
})

const numberFieldConfigSchema = z.object({
  precision: z.number().min(1).max(65).optional(),
  scale: z.number().min(0).max(30).optional(),
  min_value: z.number().optional(),
  max_value: z.number().optional(),
  validation: z.string().optional(),
})

const dateFieldConfigSchema = z.object({
  format: z.string().optional(),
  default_now: z.boolean().optional(),
  validation: z.string().optional(),
})

const booleanFieldConfigSchema = z.object({
  validation: z.string().optional(),
})

const fieldConfigSchema = z.object({}).catchall(z.unknown())

// Data field validation schema
const dataFieldSchema = z.object({
  id: uuidSchema,
  table_id: uuidSchema,
  name: displayNameSchema,
  field_name: fieldNameSchema,
  data_type: z.enum(['text', 'number', 'date', 'boolean']),
  is_required: z.boolean(),
  default_value: z.string().optional(),
  field_config: fieldConfigSchema,
  sort_order: z.number().int().min(0),
  created_at: z.string(),
  updated_at: z.string(),
})

// Create data field request schema
const createDataFieldRequestSchema = z
  .object({
    name: displayNameSchema,
    field_name: fieldNameSchema,
    data_type: z.enum(['text', 'number', 'date', 'boolean']),
    is_required: z.boolean().optional().default(false),
    default_value: z.string().optional(),
    field_config: fieldConfigSchema.optional().default({}),
    sort_order: z.number().int().min(0).optional(),
  })
  .refine(
    data => {
      // Data type specific validation
      switch (data.data_type) {
        case 'text':
          const textConfig = textFieldConfigSchema.safeParse(data.field_config)
          if (!textConfig.success) {
            return false
          }
          // Validate min/max length relationship
          const { min_length, max_length } = textConfig.data
          if (min_length !== undefined && max_length !== undefined && min_length > max_length) {
            return false
          }
          break

        case 'number':
          const numberConfig = numberFieldConfigSchema.safeParse(data.field_config)
          if (!numberConfig.success) {
            return false
          }
          // Validate precision/scale relationship
          const { precision, scale } = numberConfig.data
          if (precision !== undefined && scale !== undefined && scale > precision) {
            return false
          }
          // Validate min/max value relationship
          const { min_value, max_value } = numberConfig.data
          if (min_value !== undefined && max_value !== undefined && min_value > max_value) {
            return false
          }
          break

        case 'date':
          const dateConfig = dateFieldConfigSchema.safeParse(data.field_config)
          if (!dateConfig.success) {
            return false
          }
          break

        case 'boolean':
          const booleanConfig = booleanFieldConfigSchema.safeParse(data.field_config)
          if (!booleanConfig.success) {
            return false
          }
          break
      }
      return true
    },
    {
      message: 'Invalid field configuration for the specified data type',
    }
  )

// Update data field request schema
const updateDataFieldRequestSchema = z.object({
  name: displayNameSchema.optional(),
  field_name: fieldNameSchema.optional(),
  data_type: z.enum(['text', 'number', 'date', 'boolean']).optional(),
  is_required: z.boolean().optional(),
  default_value: z.string().optional(),
  field_config: fieldConfigSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
})

// Table relationship validation schemas
const cascadeConfigSchema = z.object({
  on_delete: z.enum(['cascade', 'restrict', 'set_null']),
  on_update: z.enum(['cascade', 'restrict']),
})

const tableRelationshipSchema = z
  .object({
    id: uuidSchema,
    project_id: uuidSchema,
    source_table_id: uuidSchema,
    target_table_id: uuidSchema,
    source_field_id: uuidSchema,
    target_field_id: uuidSchema,
    relationship_name: z.string().min(1).max(100),
    relationship_type: z.enum(['one_to_many']),
    cascade_config: cascadeConfigSchema,
    status: z.enum(['active', 'inactive']),
    created_by: uuidSchema,
    created_at: z.string(),
    updated_at: z.string(),
  })
  .refine(data => data.source_table_id !== data.target_table_id, {
    message: 'Source and target tables must be different',
  })
  .refine(data => data.source_field_id !== data.target_field_id, {
    message: 'Source and target fields must be different',
  })

const createTableRelationshipRequestSchema = z
  .object({
    source_table_id: uuidSchema,
    target_table_id: uuidSchema,
    source_field_id: uuidSchema,
    target_field_id: uuidSchema,
    relationship_name: z.string().min(1).max(100),
    relationship_type: z.enum(['one_to_many']),
    cascade_config: cascadeConfigSchema.optional().default({
      on_delete: 'restrict',
      on_update: 'cascade',
    }),
  })
  .refine(data => data.source_table_id !== data.target_table_id, {
    message: 'Source and target tables must be different',
  })
  .refine(data => data.source_field_id !== data.target_field_id, {
    message: 'Source and target fields must be different',
  })

const updateTableRelationshipRequestSchema = z.object({
  relationship_name: z.string().min(1).max(100).optional(),
  cascade_config: cascadeConfigSchema.optional(),
  status: z.enum(['active', 'inactive']).optional(),
})

// Data table validation schemas
const dataTableSchema = z.object({
  id: uuidSchema,
  project_id: uuidSchema,
  name: displayNameSchema,
  description: descriptionSchema,
  table_name: tableNameSchema,
  schema_definition: z.record(z.unknown()),
  status: z.enum(['draft', 'active', 'deprecated', 'deleted']),
  created_by: uuidSchema,
  created_at: z.string(),
  updated_at: z.string(),
})

const createTableRequestSchema = z
  .object({
    name: displayNameSchema,
    description: descriptionSchema,
    table_name: tableNameSchema,
    fields: z.array(createDataFieldRequestSchema).optional().default([]),
  })
  .refine(data => data.fields!.length > 0, {
    message: 'Table must have at least one field',
  })
  .refine(
    data => {
      // Check for duplicate field names
      const fieldNames = data.fields!.map(f => f.field_name)
      const uniqueFieldNames = new Set(fieldNames)
      return fieldNames.length === uniqueFieldNames.size
    },
    {
      message: 'Field names must be unique within a table',
    }
  )

const updateDataTableRequestSchema = z.object({
  name: displayNameSchema.optional(),
  description: descriptionSchema.optional(),
  table_name: tableNameSchema.optional(),
})

// Table lock validation schemas
const tableLockSchema = z
  .object({
    id: uuidSchema,
    table_id: uuidSchema,
    user_id: uuidSchema,
    lock_token: uuidSchema,
    lock_type: z.enum(['optimistic', 'pessimistic', 'critical']),
    locked_at: z.string(),
    expires_at: z.string(),
    reason: z.string().min(1).max(200),
  })
  .refine(data => new Date(data.expires_at) > new Date(data.locked_at), {
    message: 'Expiration time must be after lock time',
  })

const acquireLockRequestSchema = z.object({
  lock_type: z.enum(['optimistic', 'pessimistic', 'critical']),
  reason: z.string().min(1).max(200),
  duration_minutes: z.number().int().min(1).max(1440).optional().default(30), // Max 24 hours
})

// List request validation schemas
const dataTableListRequestSchema = z.object({
  projectId: uuidSchema,
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  status: z.enum(['draft', 'active', 'deprecated', 'deleted']).optional(),
})

const dataFieldListRequestSchema = z.object({
  projectId: uuidSchema,
  tableId: uuidSchema,
})

const tableRelationshipListRequestSchema = z.object({
  projectId: uuidSchema,
  sourceTableId: uuidSchema.optional(),
  targetTableId: uuidSchema.optional(),
})

// Export all validation schemas
export const schemas = {
  // Base schemas
  uuid: uuidSchema,
  tableName: tableNameSchema,
  fieldName: fieldNameSchema,
  displayName: displayNameSchema,
  description: descriptionSchema,

  // Field schemas
  dataField: dataFieldSchema,
  createDataFieldRequest: createDataFieldRequestSchema,
  updateDataFieldRequest: updateDataFieldRequestSchema,
  textFieldConfig: textFieldConfigSchema,
  numberFieldConfig: numberFieldConfigSchema,
  dateFieldConfig: dateFieldConfigSchema,
  booleanFieldConfig: booleanFieldConfigSchema,
  fieldConfig: fieldConfigSchema,

  // Relationship schemas
  tableRelationship: tableRelationshipSchema,
  createTableRelationshipRequest: createTableRelationshipRequestSchema,
  updateTableRelationshipRequest: updateTableRelationshipRequestSchema,
  cascadeConfig: cascadeConfigSchema,

  // Table schemas
  dataTable: dataTableSchema,
  createTableRequest: createTableRequestSchema,
  updateDataTableRequest: updateDataTableRequestSchema,

  // Lock schemas
  tableLock: tableLockSchema,
  acquireLockRequest: acquireLockRequestSchema,

  // List request schemas
  dataTableListRequest: dataTableListRequestSchema,
  dataFieldListRequest: dataFieldListRequestSchema,
  tableRelationshipListRequest: tableRelationshipListRequestSchema,
}

// Validation functions
export const validateDataField = (data: unknown) => {
  return createDataFieldRequestSchema.safeParse(data)
}

export const validateTable = (data: unknown) => {
  return createTableRequestSchema.safeParse(data)
}

export const validateRelationship = (data: unknown) => {
  return createTableRelationshipRequestSchema.safeParse(data)
}

export const validateTableName = (name: string) => {
  return tableNameSchema.safeParse(name)
}

export const validateFieldName = (name: string) => {
  return fieldNameSchema.safeParse(name)
}

export const validateLockRequest = (data: unknown) => {
  return acquireLockRequestSchema.safeParse(data)
}

// Custom validation functions
export const validateUniqueFieldNames = (fields: Array<{ field_name: string }>) => {
  const fieldNames = fields.map(f => f.field_name)
  const uniqueFieldNames = new Set(fieldNames)
  return fieldNames.length === uniqueFieldNames.size
}

export const validateFieldCompatibility = (
  sourceType: DataFieldType,
  targetType: DataFieldType
) => {
  // For MVP, only allow exact matches. In the future, we could allow compatible types
  return sourceType === targetType
}

export const validateTableNameUniqueness = async (): Promise<boolean> => {
  try {
    // This would typically query the database with projectId, tableName, excludeTableId
    // For now, return true (assume it's unique)
    // TODO: Implement actual database check
    return true
  } catch (error) {
    console.error('Error validating table name uniqueness:', error)
    return false
  }
}

export const validateFieldNameUniqueness = async (): Promise<boolean> => {
  try {
    // This would typically query the database with tableId, fieldName, excludeFieldId
    // For now, return true (assume it's unique)
    // TODO: Implement actual database check
    return true
  } catch (error) {
    console.error('Error validating field name uniqueness:', error)
    return false
  }
}

export const validateCircularDependency = async (): Promise<boolean> => {
  try {
    // This would typically perform graph traversal to detect cycles
    // with projectId, sourceTableId, targetTableId
    // For now, return false (assume no circular dependency)
    // TODO: Implement actual circular dependency detection
    return false
  } catch (error) {
    console.error('Error validating circular dependency:', error)
    return false
  }
}

// Error message helpers
export const getValidationErrorMessage = (error: z.ZodError): string => {
  return error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
}

export const getFieldValidationError = (
  field: string,
  type: DataFieldType,
  config: unknown
): string[] => {
  const errors: string[] = []

  let configSchema
  switch (type) {
    case 'text':
      configSchema = textFieldConfigSchema
      break
    case 'number':
      configSchema = numberFieldConfigSchema
      break
    case 'date':
      configSchema = dateFieldConfigSchema
      break
    case 'boolean':
      configSchema = booleanFieldConfigSchema
      break
    default:
      errors.push(`Unsupported field type: ${type}`)
      return errors
  }

  const result = configSchema.safeParse(config)
  if (!result.success) {
    errors.push(...result.error.errors.map(e => `${field}: ${e.message}`))
  }

  return errors
}

export default schemas
