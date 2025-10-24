import type { CreateDataFieldRequest, DataFieldType } from '@/types/designer/field'
import type { TableRelationship, DataTableWithFields, DataField } from '@/types/designer'
import { FIELD_TYPES, getPostgresType } from './constants'

// Migration types
export interface CreateTableMigration {
  type: 'create_table'
  table_name: string
  fields: CreateTableMigrationField[]
  constraints?: CreateTableConstraint[]
}

export interface CreateTableMigrationField {
  name: string
  type: string
  nullable: boolean
  default?: string
  is_primary_key?: boolean
}

export interface CreateTableConstraint {
  name: string
  type: 'primary_key' | 'unique' | 'foreign_key' | 'check'
  definition: string
}

export interface AddColumnMigration {
  type: 'add_column'
  table_name: string
  column: CreateTableMigrationField
}

export interface DropColumnMigration {
  type: 'drop_column'
  table_name: string
  column_name: string
}

export interface AlterColumnMigration {
  type: 'alter_column'
  table_name: string
  column_name: string
  new_definition: CreateTableMigrationField
}

export interface AddForeignKeyMigration {
  type: 'add_foreign_key'
  table_name: string
  column_name: string
  references_table: string
  references_column: string
  on_delete?: 'cascade' | 'restrict' | 'set_null'
  on_update?: 'cascade' | 'restrict'
  constraint_name?: string
}

export interface DropIndexMigration {
  type: 'drop_index'
  index_name: string
}

export interface CreateIndexMigration {
  type: 'create_index'
  index_name: string
  table_name: string
  columns: string[]
  unique?: boolean
}

export type MigrationOperation =
  | CreateTableMigration
  | AddColumnMigration
  | DropColumnMigration
  | AlterColumnMigration
  | AddForeignKeyMigration
  | CreateIndexMigration
  | DropIndexMigration

export interface MigrationPlan {
  operations: MigrationOperation[]
  rollback_operations: MigrationOperation[]
  description: string
  estimated_impact: 'low' | 'medium' | 'high'
}

// Migration generation functions
export function generateCreateTableMigration(
  tableName: string,
  fields: CreateDataFieldRequest[]
): CreateTableMigration {
  const migrationFields: CreateTableMigrationField[] = fields.map(field => ({
    name: field.field_name,
    type: getPostgresType(field.data_type, field.field_config),
    nullable: !field.is_required,
    default: field.default_value
      ? getDefaultSqlValue(field.data_type, field.default_value)
      : undefined,
    is_primary_key: field.field_name === 'id',
  }))

  // Add primary key constraint if id field exists
  const constraints: CreateTableConstraint[] = []
  const idField = fields.find(f => f.field_name === 'id')
  if (idField) {
    constraints.push({
      name: `${tableName}_pkey`,
      type: 'primary_key',
      definition: `PRIMARY KEY (id)`,
    })
  }

  return {
    type: 'create_table',
    table_name: tableName,
    fields: migrationFields,
    constraints,
  }
}

export function generateAddColumnMigration(
  tableName: string,
  field: CreateDataFieldRequest
): AddColumnMigration {
  return {
    type: 'add_column',
    table_name: tableName,
    column: {
      name: field.field_name,
      type: getPostgresType(field.data_type, field.field_config),
      nullable: !field.is_required,
      default: field.default_value
        ? getDefaultSqlValue(field.data_type, field.default_value)
        : undefined,
      is_primary_key: field.field_name === 'id',
    },
  }
}

export function generateDropColumnMigration(
  tableName: string,
  columnName: string
): DropColumnMigration {
  return {
    type: 'drop_column',
    table_name: tableName,
    column_name: columnName,
  }
}

export function generateAlterColumnMigration(
  tableName: string,
  columnName: string,
  newField: CreateDataFieldRequest
): AlterColumnMigration {
  return {
    type: 'alter_column',
    table_name: tableName,
    column_name: columnName,
    new_definition: {
      name: newField.field_name,
      type: getPostgresType(newField.data_type, newField.field_config),
      nullable: !newField.is_required,
      default: newField.default_value
        ? getDefaultSqlValue(newField.data_type, newField.default_value)
        : undefined,
      is_primary_key: newField.field_name === 'id',
    },
  }
}

export function generateAddForeignKeyMigration(
  tableName: string,
  columnName: string,
  referencesTable: string,
  referencesColumn: string,
  options?: {
    on_delete?: 'cascade' | 'restrict' | 'set_null'
    on_update?: 'cascade' | 'restrict'
    constraint_name?: string
  }
): AddForeignKeyMigration {
  return {
    type: 'add_foreign_key',
    table_name: tableName,
    column_name: columnName,
    references_table: referencesTable,
    references_column: referencesColumn,
    on_delete: options?.on_delete || 'restrict',
    on_update: options?.on_update || 'cascade',
    constraint_name: options?.constraint_name || `fk_${tableName}_${columnName}_${referencesTable}`,
  }
}

// SQL generation functions
export function generateSQLFromMigration(operation: MigrationOperation): string[] {
  const sqlStatements: string[] = []

  switch (operation.type) {
    case 'create_table': {
      const fieldDefinitions = operation.fields.map(field => {
        let definition = `    ${field.name} ${field.type}`

        if (!field.nullable) {
          definition += ' NOT NULL'
        }

        if (field.default !== undefined) {
          definition += ` DEFAULT ${field.default}`
        }

        return definition
      })

      let createTableSQL = `CREATE TABLE ${operation.table_name} (\n${fieldDefinitions.join(',\n')}`

      if (operation.constraints && operation.constraints.length > 0) {
        const constraintDefinitions = operation.constraints.map(constraint => {
          switch (constraint.type) {
            case 'primary_key':
              return `    CONSTRAINT ${constraint.name} PRIMARY KEY (${constraint.definition.replace('PRIMARY KEY (', '').replace(')', '')})`
            default:
              return `    CONSTRAINT ${constraint.name} ${constraint.definition.toUpperCase()}`
          }
        })
        createTableSQL += `,\n${constraintDefinitions.join(',\n')}`
      }

      createTableSQL += '\n);'
      sqlStatements.push(createTableSQL)
      break
    }

    case 'add_column': {
      const { table_name, column } = operation
      let alterSQL = `ALTER TABLE ${table_name} ADD COLUMN ${column.name} ${column.type}`

      if (!column.nullable) {
        alterSQL += ' NOT NULL'
      }

      if (column.default !== undefined) {
        alterSQL += ` DEFAULT ${column.default}`
      }

      sqlStatements.push(`${alterSQL};`)
      break
    }

    case 'drop_column': {
      const { table_name, column_name } = operation
      sqlStatements.push(`ALTER TABLE ${table_name} DROP COLUMN ${column_name};`)
      break
    }

    case 'alter_column': {
      const { table_name, column_name, new_definition } = operation
      const alterSQL = `ALTER TABLE ${table_name} ALTER COLUMN ${column_name} TYPE ${new_definition.type}`

      // For complex column changes, we might need multiple statements
      if (new_definition.nullable) {
        sqlStatements.push(`ALTER TABLE ${table_name} ALTER COLUMN ${column_name} DROP NOT NULL;`)
      } else {
        sqlStatements.push(`ALTER TABLE ${table_name} ALTER COLUMN ${column_name} SET NOT NULL;`)
      }

      if (new_definition.default !== undefined) {
        sqlStatements.push(
          `ALTER TABLE ${table_name} ALTER COLUMN ${column_name} SET DEFAULT ${new_definition.default};`
        )
      }

      sqlStatements.push(`${alterSQL};`)
      break
    }

    case 'add_foreign_key': {
      const {
        table_name,
        column_name,
        references_table,
        references_column,
        on_delete,
        on_update,
        constraint_name,
      } = operation

      let constraintSQL = `ALTER TABLE ${table_name} ADD CONSTRAINT ${constraint_name} `
      constraintSQL += `FOREIGN KEY (${column_name}) REFERENCES ${references_table}(${references_column})`

      if (on_delete) {
        constraintSQL += ` ON DELETE ${on_delete.toUpperCase()}`
      }

      if (on_update) {
        constraintSQL += ` ON UPDATE ${on_update.toUpperCase()}`
      }

      constraintSQL += ';'
      sqlStatements.push(constraintSQL)
      break
    }

    case 'create_index': {
      const { index_name, table_name, columns, unique } = operation
      const indexType = unique ? 'CREATE UNIQUE INDEX' : 'CREATE INDEX'
      sqlStatements.push(`${indexType} ${index_name} ON ${table_name}(${columns.join(', ')});`)
      break
    }

    case 'drop_index': {
      const { index_name } = operation
      sqlStatements.push(`DROP INDEX ${index_name};`)
      break
    }

    default:
      throw new Error(
        `Unsupported migration operation type: ${(operation as MigrationOperation).type}`
      )
  }

  return sqlStatements
}

export function generateRollbackSQL(operation: MigrationOperation): string[] {
  const sqlStatements: string[] = []

  switch (operation.type) {
    case 'create_table': {
      sqlStatements.push(`DROP TABLE ${operation.table_name};`)
      break
    }

    case 'add_column': {
      sqlStatements.push(
        `ALTER TABLE ${operation.table_name} DROP COLUMN ${operation.column.name};`
      )
      break
    }

    case 'drop_column': {
      // Rollback would require knowing the original column definition
      throw new Error('Cannot automatically rollback DROP COLUMN operations')
    }

    case 'alter_column': {
      // Rollback would require knowing the original column definition
      throw new Error('Cannot automatically rollback ALTER COLUMN operations')
    }

    case 'add_foreign_key': {
      sqlStatements.push(
        `ALTER TABLE ${operation.table_name} DROP CONSTRAINT ${operation.constraint_name || `fk_${operation.table_name}_${operation.column_name}_${operation.references_table}`};`
      )
      break
    }

    case 'create_index': {
      sqlStatements.push(`DROP INDEX ${operation.index_name};`)
      break
    }

    case 'drop_index': {
      // Rollback would require knowing the original index definition
      throw new Error('Cannot automatically rollback DROP INDEX operations')
    }

    default:
      throw new Error(
        `Unsupported migration operation type for rollback: ${(operation as MigrationOperation).type}`
      )
  }

  return sqlStatements
}

// Helper functions
function getDefaultSqlValue(dataType: string, value: string): string {
  switch (dataType) {
    case FIELD_TYPES.TEXT:
      return `'${value.replace(/'/g, "''")}'`

    case FIELD_TYPES.NUMBER:
      return value

    case FIELD_TYPES.DATE:
      if (value.toLowerCase() === 'now') {
        return 'NOW()'
      }
      return `'${value}'`

    case FIELD_TYPES.BOOLEAN:
      return value.toLowerCase() === 'true' ? 'TRUE' : 'FALSE'

    default:
      return `'${value}'`
  }
}

// Migration plan generation
export function generateMigrationPlan(
  currentSchema: { tables: Array<{ name: string; fields: CreateDataFieldRequest[] }> },
  targetSchema: { tables: Array<{ name: string; fields: CreateDataFieldRequest[] }> }
): MigrationPlan {
  const operations: MigrationOperation[] = []
  const rollbackOperations: MigrationOperation[] = []

  const currentTableMap = new Map(currentSchema.tables.map(t => [t.name, t]))
  const targetTableMap = new Map(targetSchema.tables.map(t => [t.name, t]))

  // Find tables to create
  for (const [tableName, targetTable] of targetTableMap) {
    if (!currentTableMap.has(tableName)) {
      const createMigration = generateCreateTableMigration(tableName, targetTable.fields)
      operations.push(createMigration)
      rollbackOperations.push(...generateRollbackOperations(createMigration))
    }
  }

  // Find tables to drop
  for (const tableName of currentTableMap.keys()) {
    if (!targetTableMap.has(tableName)) {
      operations.push({
        type: 'drop_index',
        index_name: tableName, // This is a placeholder - actual table drop would need more complex logic
      })
    }
  }

  // Find table modifications
  for (const [tableName, currentTable] of currentTableMap) {
    const targetTable = targetTableMap.get(tableName)
    if (!targetTable) continue

    const currentFieldMap = new Map(currentTable.fields.map(f => [f.field_name, f]))
    const targetFieldMap = new Map(targetTable.fields.map(f => [f.field_name, f]))

    // Find columns to add
    for (const [fieldName, targetField] of targetFieldMap) {
      if (!currentFieldMap.has(fieldName)) {
        operations.push(generateAddColumnMigration(tableName, targetField))
        rollbackOperations.push({
          type: 'drop_column',
          table_name: tableName,
          column_name: fieldName,
        })
      }
    }

    // Find columns to drop
    for (const fieldName of currentFieldMap.keys()) {
      if (!targetFieldMap.has(fieldName)) {
        operations.push({
          type: 'drop_column',
          table_name: tableName,
          column_name: fieldName,
        })
      }
    }

    // Find column modifications
    for (const [fieldName, currentField] of currentFieldMap) {
      const targetField = targetFieldMap.get(fieldName)
      if (!targetField) continue

      // Check if field definition changed
      if (hasFieldChanged(currentField, targetField)) {
        operations.push(generateAlterColumnMigration(tableName, fieldName, targetField))
        // Note: Rollback for ALTER COLUMN would need original field definition
      }
    }
  }

  return {
    operations,
    rollback_operations: rollbackOperations,
    description: generateMigrationDescription(operations),
    estimated_impact: estimateMigrationImpact(operations),
  }
}

function generateRollbackOperations(operation: MigrationOperation): MigrationOperation[] {
  try {
    return generateRollbackSQL(operation).map(sql => {
      // Convert SQL back to operation (simplified approach)
      if (sql.startsWith('DROP TABLE')) {
        const tableName = sql.match(/DROP TABLE (\w+)/)?.[1]
        if (tableName) {
          return {
            type: 'drop_index',
            index_name: tableName, // Placeholder
          }
        }
      }
      throw new Error('Cannot generate rollback operation')
    })
  } catch {
    return []
  }
}

function hasFieldChanged(
  currentField: CreateDataFieldRequest,
  targetField: CreateDataFieldRequest
): boolean {
  return (
    currentField.name !== targetField.name ||
    currentField.data_type !== targetField.data_type ||
    currentField.is_required !== targetField.is_required ||
    currentField.default_value !== targetField.default_value ||
    JSON.stringify(currentField.field_config) !== JSON.stringify(targetField.field_config)
  )
}

function generateMigrationDescription(operations: MigrationOperation[]): string {
  const operationCounts = operations.reduce(
    (counts, op) => {
      counts[op.type] = (counts[op.type] || 0) + 1
      return counts
    },
    {} as Record<string, number>
  )

  const descriptions: string[] = []

  Object.entries(operationCounts).forEach(([type, count]) => {
    const friendlyType = type.replace(/_/g, ' ')
    descriptions.push(`${count} ${friendlyType}${count > 1 ? 's' : ''}`)
  })

  return `Apply ${descriptions.join(', ')}`
}

function estimateMigrationImpact(operations: MigrationOperation[]): 'low' | 'medium' | 'high' {
  let impact = 0

  operations.forEach(op => {
    switch (op.type) {
      case 'create_table':
        impact += 1
        break
      case 'add_column':
        impact += 0.5
        break
      case 'drop_column':
      case 'alter_column':
        impact += 2
        break
      case 'add_foreign_key':
        impact += 1.5
        break
      case 'create_index':
      case 'drop_index':
        impact += 0.5
        break
    }
  })

  if (impact <= 2) return 'low'
  if (impact <= 5) return 'medium'
  return 'high'
}

// Validation functions
export function validateMigrationOperation(operation: MigrationOperation): string[] {
  const errors: string[] = []

  switch (operation.type) {
    case 'create_table':
      if (!operation.table_name || !/^[a-z][a-z0-9_]*$/.test(operation.table_name)) {
        errors.push('Invalid table name')
      }
      if (!operation.fields || operation.fields.length === 0) {
        errors.push('Table must have at least one field')
      }
      break

    case 'add_column':
      if (!operation.table_name || !operation.column.name) {
        errors.push('Invalid table or column name')
      }
      break

    case 'drop_column':
      if (!operation.table_name || !operation.column_name) {
        errors.push('Invalid table or column name')
      }
      break

    case 'alter_column':
      if (!operation.table_name || !operation.column_name || !operation.new_definition.name) {
        errors.push('Invalid table or column name')
      }
      break

    case 'add_foreign_key':
      if (
        !operation.table_name ||
        !operation.column_name ||
        !operation.references_table ||
        !operation.references_column
      ) {
        errors.push('Invalid foreign key definition')
      }
      break
  }

  return errors
}

export function validateMigrationPlan(plan: MigrationPlan): string[] {
  const errors: string[] = []

  plan.operations.forEach((operation, index) => {
    const operationErrors = validateMigrationOperation(operation)
    operationErrors.forEach(error => {
      errors.push(`Operation ${index + 1}: ${error}`)
    })
  })

  return errors
}

// Enhanced field constraint application functions

export function generateFieldConstraintSQL(
  fieldName: string,
  dataType: string,
  fieldConfig: Record<string, unknown>,
  isRequired: boolean,
  defaultValue?: string
): string {
  const constraints: string[] = []

  // Data type with configuration
  const baseType = getPostgresType(dataType as DataFieldType, fieldConfig)

  // NOT NULL constraint
  if (isRequired) {
    constraints.push('NOT NULL')
  }

  // DEFAULT value
  if (defaultValue && defaultValue.trim()) {
    constraints.push(`DEFAULT ${defaultValue}`)
  }

  // Additional constraints based on type
  switch (dataType) {
    case 'text':
      const maxLength = fieldConfig.max_length as number
      const minLength = fieldConfig.min_length as number
      const pattern = fieldConfig.pattern as string

      if (maxLength) {
        constraints.push(`CHECK (length(${fieldName}) <= ${maxLength})`)
      }

      if (minLength) {
        constraints.push(`CHECK (length(${fieldName}) >= ${minLength})`)
      }

      if (pattern) {
        constraints.push(`CHECK (${fieldName} ~ '${pattern}')`)
      }
      break

    case 'number':
      const precision = fieldConfig.precision as number // eslint-disable-line @typescript-eslint/no-unused-vars
      const scale = fieldConfig.scale as number // eslint-disable-line @typescript-eslint/no-unused-vars
      const minValue = fieldConfig.min_value as number
      const maxValue = fieldConfig.max_value as number

      if (minValue !== undefined) {
        constraints.push(`CHECK (${fieldName} >= ${minValue})`)
      }

      if (maxValue !== undefined) {
        constraints.push(`CHECK (${fieldName} <= ${maxValue})`)
      }
      break

    case 'date':
      // Date fields typically don't need additional constraints
      // The data type and default value are usually sufficient
      break

    case 'boolean':
      // Boolean fields are inherently constrained
      break
  }

  return `${fieldName} ${baseType}${constraints.length > 0 ? ' ' + constraints.join(' ') : ''}`
}

export function generateEnhancedCreateTableMigration(
  tableName: string,
  fields: CreateDataFieldRequest[]
): { migration: CreateTableMigration; constraints: string[] } {
  const migration = generateCreateTableMigration(tableName, fields)
  const additionalConstraints: string[] = []

  // Generate field-level constraints
  const enhancedFields = fields.map(field => {
    const constraintSQL = generateFieldConstraintSQL(
      field.field_name,
      field.data_type,
      field.field_config || {},
      field.is_required || false,
      field.default_value
    )

    // Extract CHECK constraints from the field definition
    const checkConstraints = constraintSQL.match(/CHECK \([^)]+\)/g) || []
    additionalConstraints.push(...checkConstraints)

    return {
      name: field.field_name,
      type: getPostgresType(field.data_type, field.field_config),
      nullable: !field.is_required,
      default: field.default_value
        ? getDefaultSqlValue(field.data_type, field.default_value)
        : undefined,
      is_primary_key: field.field_name === 'id',
    }
  })

  // Update migration with enhanced fields
  migration.fields = enhancedFields

  return { migration, constraints: additionalConstraints }
}

export function generateFieldIndexes(
  tableName: string,
  fields: CreateDataFieldRequest[]
): CreateIndexMigration[] {
  const indexes: CreateIndexMigration[] = []

  fields.forEach(field => {
    const fieldName = field.field_name

    // Index for foreign key fields (usually end with _id)
    if (fieldName.endsWith('_id')) {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_${fieldName}`,
        table_name: tableName,
        columns: [fieldName],
        unique: false,
      })
    }

    // Index for common search fields
    if (fieldName.includes('email') && field.data_type === 'text') {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_${fieldName}`,
        table_name: tableName,
        columns: [fieldName],
        unique: true, // Email should be unique
      })
    }

    if (fieldName.includes('name') && field.data_type === 'text') {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_${fieldName}`,
        table_name: tableName,
        columns: [fieldName],
        unique: false,
      })
    }

    // Index for status fields
    if (fieldName.includes('status') && field.data_type === 'text') {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_${fieldName}`,
        table_name: tableName,
        columns: [fieldName],
        unique: false,
      })
    }

    // Index for date fields (created_at, updated_at)
    if (
      (fieldName.includes('created_at') || fieldName.includes('updated_at')) &&
      field.data_type === 'date'
    ) {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_${fieldName}`,
        table_name: tableName,
        columns: [fieldName],
        unique: false,
      })
    }

    // Composite indexes for common query patterns
    if (fieldName.includes('user_id') && fields.some(f => f.field_name.includes('created_at'))) {
      indexes.push({
        type: 'create_index',
        index_name: `idx_${tableName}_user_created`,
        table_name: tableName,
        columns: [fieldName, 'created_at'],
        unique: false,
      })
    }
  })

  return indexes
}

export function validateFieldConstraints(fields: CreateDataFieldRequest[]): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  fields.forEach(field => {
    // Validate field configuration based on type
    switch (field.data_type) {
      case 'text':
        const maxLength = field.field_config?.max_length as number
        const minLength = field.field_config?.min_length as number
        const pattern = field.field_config?.pattern as string

        if (maxLength !== undefined) {
          if (typeof maxLength !== 'number' || maxLength < 1 || maxLength > 65535) {
            errors.push(`Field "${field.field_name}": max_length must be between 1 and 65535`)
          }
        }

        if (minLength !== undefined) {
          if (typeof minLength !== 'number' || minLength < 0) {
            errors.push(`Field "${field.field_name}": min_length must be a non-negative number`)
          }
        }

        if (maxLength !== undefined && minLength !== undefined && minLength > maxLength) {
          errors.push(`Field "${field.field_name}": min_length cannot be greater than max_length`)
        }

        if (pattern) {
          try {
            new RegExp(pattern)
          } catch {
            errors.push(`Field "${field.field_name}": pattern must be a valid regular expression`)
          }
        }
        break

      case 'number':
        const precision = field.field_config?.precision as number
        const scale = field.field_config?.scale as number
        const minValue = field.field_config?.min_value as number
        const maxValue = field.field_config?.max_value as number

        if (precision !== undefined) {
          if (typeof precision !== 'number' || precision < 1 || precision > 65) {
            errors.push(`Field "${field.field_name}": precision must be between 1 and 65`)
          }
        }

        if (scale !== undefined) {
          if (typeof scale !== 'number' || scale < 0 || scale > 30) {
            errors.push(`Field "${field.field_name}": scale must be between 0 and 30`)
          }
        }

        if (precision !== undefined && scale !== undefined && scale > precision) {
          errors.push(`Field "${field.field_name}": scale cannot be greater than precision`)
        }

        if (minValue !== undefined && maxValue !== undefined && minValue > maxValue) {
          errors.push(`Field "${field.field_name}": min_value cannot be greater than max_value`)
        }
        break

      case 'date':
        const format = field.field_config?.format as string
        const validFormats = ['YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss', 'HH:mm:ss']

        if (format && !validFormats.includes(format)) {
          errors.push(
            `Field "${field.field_name}": format must be one of ${validFormats.join(', ')}`
          )
        }
        break
    }

    // Validate default value
    if (field.default_value) {
      const defaultValidation = validateDefaultValueForType(
        field.data_type,
        field.default_value,
        field.field_config
      )
      if (!defaultValidation.isValid) {
        errors.push(`Field "${field.field_name}": ${defaultValidation.error}`)
      }
    }

    // Warnings for potential issues
    if (field.is_required && !field.default_value && field.field_name !== 'id') {
      warnings.push(`Field "${field.field_name}" is required but has no default value`)
    }

    if (field.data_type === 'text' && field.field_name.toLowerCase().includes('password')) {
      warnings.push(
        `Field "${field.field_name}" appears to store password data - consider proper encryption`
      )
    }
  })

  // Check for duplicate field names
  const fieldNames = fields.map(f => f.field_name)
  const uniqueFieldNames = new Set(fieldNames)
  if (fieldNames.length !== uniqueFieldNames.size) {
    errors.push('Field names must be unique within a table')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

function validateDefaultValueForType(
  dataType: string,
  defaultValue: string,
  _fieldConfig?: Record<string, unknown> // eslint-disable-line @typescript-eslint/no-unused-vars
): { isValid: boolean; error?: string } {
  switch (dataType) {
    case 'text':
      // Allow string literals, functions, or NULL
      if (defaultValue.startsWith("'") && defaultValue.endsWith("'")) {
        return { isValid: true }
      }
      if (isKnownFunction(defaultValue) || isKnownConstant(defaultValue)) {
        return { isValid: true }
      }
      return { isValid: false, error: 'Text default should be in quotes or be a known function' }

    case 'number':
      if (
        isNumeric(defaultValue) ||
        isKnownFunction(defaultValue) ||
        isKnownConstant(defaultValue)
      ) {
        return { isValid: true }
      }
      return { isValid: false, error: 'Number default must be numeric or a known function' }

    case 'date':
      if (
        isKnownFunction(defaultValue) ||
        isKnownConstant(defaultValue) ||
        isDateLiteral(defaultValue)
      ) {
        return { isValid: true }
      }
      return {
        isValid: false,
        error: 'Date default should use functions or be a valid date literal',
      }

    case 'boolean':
      const booleanValues = ['true', 'false', '1', '0', 'TRUE', 'FALSE']
      if (booleanValues.includes(defaultValue) || isKnownConstant(defaultValue)) {
        return { isValid: true }
      }
      return { isValid: false, error: 'Boolean default must be true, false, 1, 0, or NULL' }

    default:
      return { isValid: false, error: `Unsupported data type: ${dataType}` }
  }
}

function isKnownFunction(value: string): boolean {
  const functions = [
    'CURRENT_TIMESTAMP',
    'NOW()',
    'CURRENT_DATE',
    'CURRENT_TIME',
    'gen_random_uuid()',
    'current_user',
    'nextval(',
  ]
  return functions.some(func => value.toUpperCase().includes(func.toUpperCase()))
}

function isKnownConstant(value: string): boolean {
  const constants = ['NULL', 'TRUE', 'FALSE']
  return constants.includes(value.toUpperCase())
}

function isNumeric(value: string): boolean {
  return !isNaN(Number(value)) && value.trim() !== ''
}

function isDateLiteral(value: string): boolean {
  return (
    value.startsWith("'") &&
    value.endsWith("'") &&
    (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(value))
  )
}

// Enhanced relationship migration functions

export function generateRelationshipMigration(
  sourceTableName: string,
  targetTableName: string,
  sourceFieldName: string,
  targetFieldName: string,
  relationshipName: string,
  cascadeConfig?: {
    on_delete?: 'cascade' | 'restrict' | 'set_null'
    on_update?: 'cascade' | 'restrict'
  }
): AddForeignKeyMigration {
  const constraintName = `fk_${relationshipName}_${sourceTableName}_${targetTableName}`

  return generateAddForeignKeyMigration(
    targetTableName, // Foreign key goes on the "many" side (target table)
    sourceFieldName, // The field in the target table that references the source
    sourceTableName, // The table being referenced
    targetFieldName, // The field being referenced in the source table
    {
      on_delete: cascadeConfig?.on_delete || 'restrict',
      on_update: cascadeConfig?.on_update || 'cascade',
      constraint_name: constraintName,
    }
  )
}

export function generateRelationshipConstraintSQL(
  sourceTableName: string,
  targetTableName: string,
  sourceFieldName: string,
  targetFieldName: string,
  relationshipName: string,
  cascadeConfig?: {
    on_delete?: 'cascade' | 'restrict' | 'set_null'
    on_update?: 'cascade' | 'restrict'
  }
): string[] {
  const constraintName = `fk_${relationshipName}_${sourceTableName}_${targetTableName}`
  const sqlStatements: string[] = []

  // Add the foreign key constraint
  let constraintSQL = `ALTER TABLE ${targetTableName} ADD CONSTRAINT ${constraintName} `
  constraintSQL += `FOREIGN KEY (${sourceFieldName}) REFERENCES ${sourceTableName}(${targetFieldName})`

  if (cascadeConfig?.on_delete) {
    constraintSQL += ` ON DELETE ${cascadeConfig.on_delete.toUpperCase()}`
  }

  if (cascadeConfig?.on_update) {
    constraintSQL += ` ON UPDATE ${cascadeConfig.on_update.toUpperCase()}`
  }

  constraintSQL += ';'
  sqlStatements.push(constraintSQL)

  // Add index on foreign key column for performance
  const indexName = `idx_${targetTableName}_${sourceFieldName}`
  sqlStatements.push(`CREATE INDEX ${indexName} ON ${targetTableName}(${sourceFieldName});`)

  return sqlStatements
}

export function generateRelationshipDeletionSQL(
  sourceTableName: string,
  targetTableName: string,
  relationshipName: string
): string[] {
  const constraintName = `fk_${relationshipName}_${sourceTableName}_${targetTableName}`
  const indexName = `idx_${targetTableName}_${sourceTableName}_id`

  const sqlStatements: string[] = []

  // Drop the foreign key constraint
  sqlStatements.push(`ALTER TABLE ${targetTableName} DROP CONSTRAINT ${constraintName};`)

  // Drop the index (might not exist, but DROP INDEX IF EXISTS would be better)
  sqlStatements.push(`DROP INDEX IF EXISTS ${indexName};`)

  return sqlStatements
}

export function generateRelationshipMigrationPlan(
  relationships: Array<{
    relationship: TableRelationship
    sourceTable: DataTableWithFields
    targetTable: DataTableWithFields
    sourceField: DataField
    targetField: DataField
  }>
): {
  createOperations: MigrationOperation[]
  dropOperations: MigrationOperation[]
  indexOperations: MigrationOperation[]
} {
  const createOperations: MigrationOperation[] = []
  const dropOperations: MigrationOperation[] = []
  const indexOperations: MigrationOperation[] = []

  relationships.forEach(({ relationship, sourceTable, targetTable, sourceField, targetField }) => {
    // Generate foreign key constraint
    const fkMigration = generateRelationshipMigration(
      sourceTable.table_name,
      targetTable.table_name,
      targetField.field_name, // Foreign key field in target table
      sourceField.field_name, // Referenced field in source table
      relationship.relationship_name,
      relationship.cascade_config
    )

    createOperations.push(fkMigration)
    dropOperations.push({
      type: 'drop_index',
      index_name:
        fkMigration.constraint_name ||
        `fk_${relationship.relationship_name}_${sourceTable.table_name}_${targetTable.table_name}`,
    })

    // Generate index for foreign key field
    const indexMigration: CreateIndexMigration = {
      type: 'create_index',
      index_name: `idx_${targetTable.table_name}_${targetField.field_name}`,
      table_name: targetTable.table_name,
      columns: [targetField.field_name],
      unique: false,
    }

    indexOperations.push(indexMigration)
  })

  return {
    createOperations,
    dropOperations,
    indexOperations,
  }
}

export function validateRelationshipMigration(
  sourceTable: string,
  targetTable: string,
  sourceField: string,
  targetField: string,
  cascadeConfig?: {
    on_delete?: 'cascade' | 'restrict' | 'set_null'
    on_update?: 'cascade' | 'restrict'
  }
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = []
  const warnings: string[] = []

  // Basic validation
  if (!sourceTable || !targetTable || !sourceField || !targetField) {
    errors.push('All table and field names are required')
  }

  if (sourceTable === targetTable) {
    errors.push('Cannot create foreign key relationship within the same table')
  }

  if (sourceField === targetField) {
    errors.push('Source and target fields must be different')
  }

  // Validate table names
  if (!/^[a-z][a-z0-9_]*$/.test(sourceTable)) {
    errors.push('Invalid source table name')
  }

  if (!/^[a-z][a-z0-9_]*$/.test(targetTable)) {
    errors.push('Invalid target table name')
  }

  // Validate field names
  if (!/^[a-z][a-z0-9_]*$/.test(sourceField)) {
    errors.push('Invalid source field name')
  }

  if (!/^[a-z][a-z0-9_]*$/.test(targetField)) {
    errors.push('Invalid target field name')
  }

  // Validate cascade configuration
  if (cascadeConfig) {
    const validOnDelete = ['cascade', 'restrict', 'set_null']
    const validOnUpdate = ['cascade', 'restrict']

    if (cascadeConfig.on_delete && !validOnDelete.includes(cascadeConfig.on_delete)) {
      errors.push('Invalid ON DELETE cascade configuration')
    }

    if (cascadeConfig.on_update && !validOnUpdate.includes(cascadeConfig.on_update)) {
      errors.push('Invalid ON UPDATE cascade configuration')
    }

    // Warning about CASCADE DELETE
    if (cascadeConfig.on_delete === 'cascade') {
      warnings.push(
        'CASCADE DELETE will automatically delete related records. Ensure this is intended.'
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export function generateRelationshipValidationSQL(
  sourceTable: string,
  targetTable: string,
  sourceField: string,
  targetField: string
): string[] {
  const sqlStatements: string[] = []

  // Add check to ensure referential integrity can be maintained
  sqlStatements.push(`-- Check if source table exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${sourceTable}') THEN`
  )
  sqlStatements.push(`    RAISE EXCEPTION 'Source table ${sourceTable} does not exist';`)
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  sqlStatements.push(`-- Check if target table exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${targetTable}') THEN`
  )
  sqlStatements.push(`    RAISE EXCEPTION 'Target table ${targetTable} does not exist';`)
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  // Check if source field exists
  sqlStatements.push(`-- Check if source field exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${sourceTable}' AND column_name = '${sourceField}') THEN`
  )
  sqlStatements.push(
    `    RAISE EXCEPTION 'Source field ${sourceField} does not exist in table ${sourceTable}';`
  )
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  // Check if target field exists
  sqlStatements.push(`-- Check if target field exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${targetTable}' AND column_name = '${targetField}') THEN`
  )
  sqlStatements.push(
    `    RAISE EXCEPTION 'Target field ${targetField} does not exist in table ${targetTable}';`
  )
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  // Check data type compatibility
  sqlStatements.push(`-- Check data type compatibility`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`DECLARE`)
  sqlStatements.push(`  source_type TEXT;`)
  sqlStatements.push(`  target_type TEXT;`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  SELECT data_type INTO source_type FROM information_schema.columns WHERE table_name = '${sourceTable}' AND column_name = '${sourceField}';`
  )
  sqlStatements.push(
    `  SELECT data_type INTO target_type FROM information_schema.columns WHERE table_name = '${targetTable}' AND column_name = '${targetField}';`
  )
  sqlStatements.push(`  IF source_type != target_type THEN`)
  sqlStatements.push(
    `    RAISE EXCEPTION 'Data type mismatch between ${sourceTable}.${sourceField} (%) and ${targetTable}.${targetField} (%)', source_type, target_type;`
  )
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  return sqlStatements
}

export function generateRelationshipRollbackSQL(
  sourceTableName: string,
  targetTableName: string,
  relationshipName: string
): string[] {
  const constraintName = `fk_${relationshipName}_${sourceTableName}_${targetTableName}`
  const indexName = `idx_${targetTableName}_${sourceTableName}_id` // Typical naming pattern

  const sqlStatements: string[] = []

  // Check if constraint exists before dropping
  sqlStatements.push(`-- Check if foreign key constraint exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(
    `  IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = '${constraintName}') THEN`
  )
  sqlStatements.push(`    ALTER TABLE ${targetTableName} DROP CONSTRAINT ${constraintName};`)
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  // Check if index exists before dropping
  sqlStatements.push(`-- Check if index exists`)
  sqlStatements.push(`DO $$`)
  sqlStatements.push(`BEGIN`)
  sqlStatements.push(`  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = '${indexName}') THEN`)
  sqlStatements.push(`    DROP INDEX ${indexName};`)
  sqlStatements.push(`  END IF;`)
  sqlStatements.push(`END $$;`)

  return sqlStatements
}

const migrations = {
  generateCreateTableMigration,
  generateAddColumnMigration,
  generateDropColumnMigration,
  generateAlterColumnMigration,
  generateAddForeignKeyMigration,
  generateSQLFromMigration,
  generateRollbackSQL,
  generateMigrationPlan,
  validateMigrationOperation,
  validateMigrationPlan,
  // Enhanced field constraint functions
  generateFieldConstraintSQL,
  generateEnhancedCreateTableMigration,
  generateFieldIndexes,
  validateFieldConstraints,
  // Enhanced relationship migration functions
  generateRelationshipMigration,
  generateRelationshipConstraintSQL,
  generateRelationshipDeletionSQL,
  generateRelationshipMigrationPlan,
  validateRelationshipMigration,
  generateRelationshipValidationSQL,
  generateRelationshipRollbackSQL,
}

export default migrations
