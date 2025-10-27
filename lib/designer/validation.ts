import { z } from 'zod'
import type { DataFieldType, DataField } from '@/types/designer'

// Type definitions for refine callbacks
interface CreateDataFieldRequestType {
  name: string
  field_name: string
  data_type: 'text' | 'number' | 'date' | 'boolean'
  is_required?: boolean
  default_value?: string
  field_config: Record<string, unknown>
  sort_order?: number
}

interface TableRelationshipType {
  source_table_id: string
  target_table_id: string
  source_field_id: string
  target_field_id: string
}

interface CreateTableRequestType {
  name: string
  description?: string
  table_name: string
  fields?: CreateDataFieldRequestType[]
}

interface TableLockType {
  locked_at: string
  expires_at: string
}

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
    (data: CreateDataFieldRequestType) => {
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
  .refine((data: TableRelationshipType) => data.source_table_id !== data.target_table_id, {
    message: 'Source and target tables must be different',
  })
  .refine((data: TableRelationshipType) => data.source_field_id !== data.target_field_id, {
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
  .refine((data: TableRelationshipType) => data.source_table_id !== data.target_table_id, {
    message: 'Source and target tables must be different',
  })
  .refine((data: TableRelationshipType) => data.source_field_id !== data.target_field_id, {
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
  schema_definition: z.record(z.string(), z.unknown()),
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
  .refine((data: CreateTableRequestType) => data.fields!.length > 0, {
    message: 'Table must have at least one field',
  })
  .refine(
    (data: CreateTableRequestType) => {
      // Check for duplicate field names
      const fieldNames = data.fields!.map((f: CreateDataFieldRequestType) => f.field_name)
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
  .refine((data: TableLockType) => new Date(data.expires_at) > new Date(data.locked_at), {
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

// Enhanced relationship validation functions
export const validateRelationshipCreation = async (
  projectId: string,
  sourceTableId: string,
  targetTableId: string,
  sourceFieldId: string,
  targetFieldId: string,
  existingRelationships: Array<{ source_table_id: string; target_table_id: string }>
): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> => {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic validation
  if (!projectId || !sourceTableId || !targetTableId || !sourceFieldId || !targetFieldId) {
    errors.push('All relationship fields are required')
  }

  // Self-relationship check
  if (sourceTableId === targetTableId) {
    errors.push('Cannot create a relationship between a table and itself')
  }

  // Duplicate relationship check
  const existingRelationship = existingRelationships.find(
    r => r.source_table_id === sourceTableId && r.target_table_id === targetTableId
  )
  if (existingRelationship) {
    errors.push('A relationship already exists between these tables')
  }

  // Reverse relationship check (potential circular dependency)
  const reverseRelationship = existingRelationships.find(
    r => r.source_table_id === targetTableId && r.target_table_id === sourceTableId
  )
  if (reverseRelationship) {
    warnings.push(
      'A reverse relationship exists between these tables. This may create a circular dependency.'
    )
  }

  // Check for circular dependency using graph traversal
  const hasCircularDependency = await checkCircularDependency(
    projectId,
    sourceTableId,
    targetTableId,
    existingRelationships
  )
  if (hasCircularDependency) {
    errors.push('This relationship would create a circular dependency')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const checkCircularDependency = async (
  projectId: string,
  sourceTableId: string,
  targetTableId: string,
  existingRelationships: Array<{ source_table_id: string; target_table_id: string }>
): Promise<boolean> => {
  // Build adjacency list for the relationship graph
  const graph = new Map<string, string[]>()

  // Add existing relationships
  existingRelationships.forEach(rel => {
    if (!graph.has(rel.source_table_id)) {
      graph.set(rel.source_table_id, [])
    }
    graph.get(rel.source_table_id)!.push(rel.target_table_id)
  })

  // Add the new relationship we're checking
  if (!graph.has(sourceTableId)) {
    graph.set(sourceTableId, [])
  }
  graph.get(sourceTableId)!.push(targetTableId)

  // Use DFS to detect cycles
  const visited = new Set<string>()
  const recursionStack = new Set<string>()

  const hasCycle = (node: string): boolean => {
    if (recursionStack.has(node)) {
      return true // Cycle detected
    }
    if (visited.has(node)) {
      return false
    }

    visited.add(node)
    recursionStack.add(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (hasCycle(neighbor)) {
        return true
      }
    }

    recursionStack.delete(node)
    return false
  }

  // Check for cycles starting from the source table
  return hasCycle(sourceTableId)
}

export const validateRelationshipUpdate = async (
  relationshipId: string,
  updates: Partial<{
    relationship_name: string
    cascade_config: { on_delete: string; on_update: string }
    status: string
  }>,
  existingRelationships: Array<{ id: string; relationship_name: string }>
): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = []

  // Validate relationship name uniqueness if it's being updated
  if (updates.relationship_name) {
    const duplicate = existingRelationships.find(
      r => r.id !== relationshipId && r.relationship_name === updates.relationship_name
    )
    if (duplicate) {
      errors.push('Relationship name must be unique within the project')
    }
  }

  // Validate cascade configuration
  if (updates.cascade_config) {
    const validOnDelete = ['cascade', 'restrict', 'set_null']
    const validOnUpdate = ['cascade', 'restrict']

    if (!validOnDelete.includes(updates.cascade_config.on_delete)) {
      errors.push('Invalid cascade delete configuration')
    }

    if (!validOnUpdate.includes(updates.cascade_config.on_update)) {
      errors.push('Invalid cascade update configuration')
    }
  }

  // Validate status
  if (updates.status && !['active', 'inactive'].includes(updates.status)) {
    errors.push('Invalid relationship status')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateRelationshipDeletion = async (
  relationshipId: string,
  existingRelationships: Array<{ id: string; source_table_id: string; target_table_id: string }>
): Promise<{ canDelete: boolean; warnings: string[] }> => {
  const warnings: string[] = []

  const relationship = existingRelationships.find(r => r.id === relationshipId)
  if (!relationship) {
    return { canDelete: false, warnings: ['Relationship not found'] }
  }

  // Check if this relationship is part of a chain
  const dependentRelationships = existingRelationships.filter(
    r => r.source_table_id === relationship.target_table_id
  )

  if (dependentRelationships.length > 0) {
    warnings.push(
      `Deleting this relationship may affect ${dependentRelationships.length} other relationship(s) that depend on the target table`
    )
  }

  return { canDelete: true, warnings }
}

export const validateFieldForRelationship = (
  field: DataField,
  isSourceField: boolean
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // All relationship fields should have valid names
  if (!field.field_name || !/^[a-z][a-z0-9_]*$/.test(field.field_name)) {
    errors.push('Field name is invalid for relationship')
  }

  // Source fields should typically be primary keys or unique identifiers
  if (isSourceField) {
    if (!field.is_required) {
      errors.push('Source field for relationship should be required')
    }

    // Check if field name suggests it's a primary key
    const isPrimaryKey = field.field_name === 'id' || field.field_name.endsWith('_id')
    if (!isPrimaryKey) {
      errors.push('Source field should be a primary key or unique identifier')
    }
  }

  // Target fields should typically be foreign key fields
  if (!isSourceField) {
    const isForeignKey = field.field_name.endsWith('_id')
    if (!isForeignKey) {
      errors.push("Target field name should end with _id to indicate it's a foreign key")
    }
  }

  // Validate data type compatibility
  const validRelationshipTypes = ['number', 'text']
  if (!validRelationshipTypes.includes(field.data_type)) {
    errors.push(
      `Field type ${field.data_type} is not suitable for relationships. Use number or text.`
    )
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const getRelationshipValidationSummary = (validationResult: {
  isValid: boolean
  errors: string[]
  warnings: string[]
}): { type: 'success' | 'warning' | 'error'; message: string } => {
  if (!validationResult.isValid) {
    return {
      type: 'error',
      message: `Validation failed: ${validationResult.errors.join(', ')}`,
    }
  }

  if (validationResult.warnings.length > 0) {
    return {
      type: 'warning',
      message: `Warning: ${validationResult.warnings.join(', ')}`,
    }
  }

  return {
    type: 'success',
    message: 'Relationship validation passed',
  }
}

// Error message helpers
export const getValidationErrorMessage = (error: z.ZodError): string => {
  return error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
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
    errors.push(...result.error.issues.map(e => `${field}: ${e.message}`))
  }

  return errors
}

// Enhanced field validation functions

export const validateTextFieldConfig = (
  config: Record<string, unknown>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { max_length, min_length, pattern } = config

  if (max_length != null) {
    if (typeof max_length !== 'number' || max_length < 1 || max_length > 65535) {
      errors.push('Max length must be a number between 1 and 65535')
    }
  }

  if (min_length != null) {
    if (typeof min_length !== 'number' || min_length < 0) {
      errors.push('Min length must be a non-negative number')
    }
  }

  if (max_length != null && min_length != null) {
    if (min_length > max_length) {
      errors.push('Min length cannot be greater than max length')
    }
  }

  if (pattern !== undefined) {
    if (typeof pattern !== 'string') {
      errors.push('Pattern must be a string')
    } else {
      try {
        new RegExp(pattern)
      } catch {
        errors.push('Pattern must be a valid regular expression')
      }
    }
  }

  return { isValid: errors.length === 0, errors }
}

export const validateNumberFieldConfig = (
  config: Record<string, unknown>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { precision, scale, min_value, max_value } = config

  if (precision != null) {
    if (typeof precision !== 'number' || precision < 1 || precision > 65) {
      errors.push('Precision must be a number between 1 and 65')
    }
  }

  if (scale != null) {
    if (typeof scale !== 'number' || scale < 0 || scale > 30) {
      errors.push('Scale must be a number between 0 and 30')
    }
  }

  if (precision != null && scale != null) {
    if (scale > precision) {
      errors.push('Scale cannot be greater than precision')
    }
  }

  if (min_value != null) {
    if (typeof min_value !== 'number') {
      errors.push('Min value must be a number')
    }
  }

  if (max_value != null) {
    if (typeof max_value !== 'number') {
      errors.push('Max value must be a number')
    }
  }

  if (min_value != null && max_value != null) {
    if (min_value > max_value) {
      errors.push('Min value cannot be greater than max value')
    }
  }

  return { isValid: errors.length === 0, errors }
}

export const validateDateFieldConfig = (
  config: Record<string, unknown>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  const { format, default_now } = config

  if (format != null) {
    if (typeof format !== 'string') {
      errors.push('Format must be a string')
    } else {
      const validFormats = ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'HH:mm:ss']
      if (!validFormats.includes(format)) {
        errors.push('Format must be one of: YYYY-MM-DD, YYYY-MM-DD HH:mm:ss, HH:mm:ss')
      }
    }
  }

  if (default_now != null && typeof default_now !== 'boolean') {
    errors.push('Default now must be a boolean')
  }

  return { isValid: errors.length === 0, errors }
}

export const validateFieldConstraints = (
  data_type: DataFieldType,
  field_config: Record<string, unknown>,
  default_value?: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate field configuration based on type
  switch (data_type) {
    case 'text': {
      const textValidation = validateTextFieldConfig(field_config)
      if (!textValidation.isValid) {
        errors.push(...textValidation.errors)
      }
      break
    }
    case 'number': {
      const numberValidation = validateNumberFieldConfig(field_config)
      if (!numberValidation.isValid) {
        errors.push(...numberValidation.errors)
      }
      break
    }
    case 'date': {
      const dateValidation = validateDateFieldConfig(field_config)
      if (!dateValidation.isValid) {
        errors.push(...dateValidation.errors)
      }
      break
    }
    case 'boolean':
      // Boolean fields have no additional configuration
      break
    default:
      errors.push(`Unsupported field type: ${data_type}`)
  }

  // Validate default value if provided
  if (default_value && default_value.trim()) {
    const defaultValidation = validateDefaultValue(data_type, default_value.trim(), field_config)
    if (!defaultValidation.isValid) {
      errors.push(...defaultValidation.errors)
    }
  }

  return { isValid: errors.length === 0, errors }
}

export const validateDefaultValue = (
  data_type: DataFieldType,
  default_value: string,
  field_config: Record<string, unknown>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  switch (data_type) {
    case 'text': {
      const max_length = field_config.max_length as number
      const min_length = field_config.min_length as number
      const pattern = field_config.pattern as string

      if (max_length != null && default_value.length > max_length) {
        errors.push(`Default value exceeds maximum length of ${max_length}`)
      }

      if (min_length != null && default_value.length < min_length) {
        errors.push(`Default value is shorter than minimum length of ${min_length}`)
      }

      if (pattern) {
        try {
          const regex = new RegExp(pattern)
          if (!regex.test(default_value)) {
            errors.push('Default value does not match the specified pattern')
          }
        } catch {
          errors.push('Invalid pattern specified for field configuration')
        }
      }
      break
    }
    case 'number': {
      if (isNaN(Number(default_value))) {
        errors.push('Default value must be a valid number')
      } else {
        const numValue = Number(default_value)
        const min_value = field_config.min_value as number
        const max_value = field_config.max_value as number

        if (min_value != null && numValue < min_value) {
          errors.push(`Default value is less than minimum value of ${min_value}`)
        }

        if (max_value != null && numValue > max_value) {
          errors.push(`Default value is greater than maximum value of ${max_value}`)
        }
      }
      break
    }
    case 'date': {
      const validDateDefaults = ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE', 'CURRENT_TIME']
      const lowerDefault = default_value.toLowerCase()

      if (
        !validDateDefaults.includes(default_value) &&
        !validDateDefaults.some(v => v.toLowerCase() === lowerDefault)
      ) {
        errors.push(
          'Date default value must be a valid date function (e.g., CURRENT_TIMESTAMP, NOW())'
        )
      }
      break
    }
    case 'boolean': {
      const validDefaults = ['true', 'false', 'TRUE', 'FALSE', '1', '0']
      if (!validDefaults.includes(default_value)) {
        errors.push('Boolean default value must be true, false, 1, or 0')
      }
      break
    }
  }

  return { isValid: errors.length === 0, errors }
}

export const validateFieldNaming = (
  name: string,
  field_name: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate display name
  if (!name || !name.trim()) {
    errors.push('Display name is required')
  } else if (name.length > 100) {
    errors.push('Display name cannot exceed 100 characters')
  }

  // Validate field name
  if (!field_name || !field_name.trim()) {
    errors.push('Field name is required')
  } else if (!/^[a-z][a-z0-9_]*$/.test(field_name)) {
    errors.push(
      'Field name must start with a letter and contain only lowercase letters, numbers, and underscores'
    )
  } else if (field_name.length > 63) {
    errors.push('Field name cannot exceed 63 characters')
  }

  return { isValid: errors.length === 0, errors }
}

export const validateFieldCompatibilityForRelationship = (
  sourceType: DataFieldType,
  targetType: DataFieldType
): { isCompatible: boolean; warnings: string[] } => {
  const warnings: string[] = []

  // Exact matches are always compatible
  if (sourceType === targetType) {
    return { isCompatible: true, warnings: [] }
  }

  // Text to Text compatibility
  if (sourceType === 'text' && targetType === 'text') {
    return { isCompatible: true, warnings: [] }
  }

  // Number to Number compatibility (with warnings about precision)
  if (sourceType === 'number' && targetType === 'number') {
    warnings.push('Ensure the precision and scale of both fields are compatible')
    return { isCompatible: true, warnings }
  }

  // Date to Date compatibility
  if (sourceType === 'date' && targetType === 'date') {
    warnings.push('Ensure both fields use the same date format')
    return { isCompatible: true, warnings }
  }

  // Boolean to Boolean compatibility
  if (sourceType === 'boolean' && targetType === 'boolean') {
    return { isCompatible: true, warnings: [] }
  }

  return {
    isCompatible: false,
    warnings: [`Field types ${sourceType} and ${targetType} are not compatible for relationships`],
  }
}

export const validateFieldForMigration = (
  oldField: DataField,
  newField: Partial<DataField>
): { canMigrate: boolean; warnings: string[]; errors: string[] } => {
  const warnings: string[] = []
  const errors: string[] = []

  // Check if data type is changing
  if (newField.data_type && newField.data_type !== oldField.data_type) {
    const compatibility = validateFieldCompatibilityForRelationship(
      oldField.data_type,
      newField.data_type
    )

    if (!compatibility.isCompatible) {
      errors.push(`Cannot change field type from ${oldField.data_type} to ${newField.data_type}`)
    } else {
      warnings.push(...compatibility.warnings)
      warnings.push('Changing field type may result in data loss')
    }
  }

  // Check if required status is changing from false to true
  if (newField.is_required && !oldField.is_required) {
    warnings.push('Making field required may fail if existing records have null values')
  }

  // Check if max length is being reduced
  if (newField.field_config?.max_length && oldField.field_config?.max_length) {
    const newMaxLength = newField.field_config.max_length as number
    const oldMaxLength = oldField.field_config.max_length as number

    if (newMaxLength < oldMaxLength) {
      warnings.push('Reducing max length may truncate existing data')
    }
  }

  return { canMigrate: errors.length === 0, warnings, errors }
}

export default schemas
