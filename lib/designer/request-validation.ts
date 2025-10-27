/**
 * Request Validation for Dynamic Endpoints
 *
 * Purpose: Comprehensive request validation system for dynamically generated API endpoints
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { NextRequest } from 'next/server'
import { getTableSchema } from './table-registry'
import type { TableSchema, TableFieldSchema } from './table-registry'

// Validation Context Interface
export interface ValidationContext {
  tableName: string
  operation: 'create' | 'update' | 'list' | 'get' | 'delete'
  request: NextRequest
  params?: Record<string, unknown>
  query?: Record<string, unknown>
  body?: unknown
}

export interface ValidationResult {
  isValid: boolean
  data?: Record<string, unknown>
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: unknown
}

export interface ValidationWarning {
  field: string
  message: string
  code: string
  value?: unknown
}

// Dynamic Request Validator Class
export class DynamicRequestValidator {
  /**
   * Validate incoming request based on table schema and operation
   */
  async validateRequest(context: ValidationContext): Promise<ValidationResult> {
    try {
      const schema = await getTableSchema(context.tableName)

      // Validate different parts of the request
      const results = await Promise.all([
        this.validateParams(context, schema),
        this.validateQuery(context, schema),
        this.validateBody(context, schema),
      ])

      // Combine validation results
      const allErrors = results.flatMap(r => r.errors || [])
      const allWarnings = results.flatMap(r => r.warnings || [])
      const allData = results.reduce((acc, r) => ({ ...acc, ...r.data }), {})

      if (allErrors.length > 0) {
        return {
          isValid: false,
          errors: allErrors,
          warnings: allWarnings,
        }
      }

      return {
        isValid: true,
        data: allData,
        warnings: allWarnings,
      }
    } catch (error) {
      console.error('Request validation error:', error)
      return {
        isValid: false,
        errors: [
          {
            field: 'request',
            message: 'Validation failed due to internal error',
            code: 'VALIDATION_ERROR',
          },
        ],
      }
    }
  }

  /**
   * Validate path parameters
   */
  private async validateParams(
    context: ValidationContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    schema: TableSchema
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const data: Record<string, unknown> = {}

    if (!context.params) {
      return { isValid: true, data }
    }

    // Validate ID parameter for operations that need it
    if (['get', 'update', 'delete'].includes(context.operation)) {
      const id = String(context.params.id || '')

      if (!id) {
        errors.push({
          field: 'id',
          message: 'ID parameter is required',
          code: 'REQUIRED',
        })
      } else if (!this.isValidUUID(id)) {
        errors.push({
          field: 'id',
          message: 'ID must be a valid UUID',
          code: 'INVALID_UUID',
          value: id,
        })
      } else {
        data.id = id
      }
    }

    // Validate table name parameter
    const tableName = String(context.params.tableName || context.tableName)
    if (tableName && !this.isValidTableName(tableName)) {
      errors.push({
        field: 'tableName',
        message: 'Invalid table name format',
        code: 'INVALID_TABLE_NAME',
        value: tableName,
      })
    } else {
      data.tableName = tableName
    }

    return {
      isValid: errors.length === 0,
      data,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Validate query parameters
   */
  private async validateQuery(
    context: ValidationContext,
    schema: TableSchema
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const data: Record<string, unknown> = {}

    if (!context.query) {
      return { isValid: true, data }
    }

    // Validate pagination parameters
    if (context.operation === 'list') {
      const page = parseInt(String(context.query.page)) || 1
      const limit = parseInt(String(context.query.limit)) || 20

      if (page < 1) {
        errors.push({
          field: 'page',
          message: 'Page must be a positive integer',
          code: 'INVALID_PAGE',
          value: context.query.page,
        })
      } else {
        data.page = page
      }

      if (limit < 1 || limit > 100) {
        errors.push({
          field: 'limit',
          message: 'Limit must be between 1 and 100',
          code: 'INVALID_LIMIT',
          value: context.query.limit,
        })
      } else {
        data.limit = limit
      }
    }

    // Validate sort parameter
    if (context.query.sort) {
      const validSortFields = schema.fields.map((f: TableFieldSchema) => f.field_name)
      if (!validSortFields.includes(String(context.query.sort))) {
        errors.push({
          field: 'sort',
          message: `Invalid sort field. Valid fields: ${validSortFields.join(', ')}`,
          code: 'INVALID_SORT_FIELD',
          value: context.query.sort,
        })
      } else {
        data.sort = context.query.sort
      }
    }

    // Validate order parameter
    if (context.query.order && !['asc', 'desc'].includes(String(context.query.order))) {
      errors.push({
        field: 'order',
        message: 'Order must be either "asc" or "desc"',
        code: 'INVALID_ORDER',
        value: context.query.order,
      })
    } else if (context.query.order) {
      data.order = context.query.order
    }

    // Validate search parameter
    if (context.query.search) {
      const searchTerm = context.query.search
      if (typeof searchTerm !== 'string') {
        errors.push({
          field: 'search',
          message: 'Search term must be a string',
          code: 'INVALID_SEARCH_TYPE',
          value: searchTerm,
        })
      } else if (searchTerm.length > 1000) {
        warnings.push({
          field: 'search',
          message: 'Search term is very long and may affect performance',
          code: 'LONG_SEARCH_TERM',
          value: searchTerm,
        })
      } else {
        data.search = searchTerm
      }
    }

    // Validate filter parameters
    const filterErrors = this.validateFilterParameters(context.query, schema)
    errors.push(...filterErrors)

    return {
      isValid: errors.length === 0,
      data,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Validate request body
   */
  private async validateBody(
    context: ValidationContext,
    schema: TableSchema
  ): Promise<ValidationResult> {
    const errors: ValidationError[] = []
    const data: Record<string, unknown> = {}

    if (!context.body || !['create', 'update'].includes(context.operation)) {
      return { isValid: true, data }
    }

    // Validate each field based on table schema
    for (const field of schema.fields) {
      // Skip primary key for create operations
      if (field.is_primary_key && context.operation === 'create') {
        continue
      }

      // Skip immutable fields for update operations
      if (field.immutable && context.operation === 'update') {
        continue
      }

      const bodyRecord = context.body as Record<string, unknown>
      const fieldValue = bodyRecord[field.field_name]
      const fieldValidation = this.validateFieldValue(fieldValue, field, context.operation)

      if (!fieldValidation.isValid) {
        errors.push(...(fieldValidation.errors || []))
      } else if (fieldValidation.value !== undefined) {
        data[field.field_name] = fieldValidation.value
      }

      // Add warnings
      if (fieldValidation.warnings) {
        // Warnings would be handled by the calling function
      }
    }

    // Check for unknown fields
    const knownFields = schema.fields.map((f: TableFieldSchema) => f.field_name)
    const bodyRecord = context.body as Record<string, unknown>
    const unknownFields = Object.keys(bodyRecord).filter(key => !knownFields.includes(key))

    if (unknownFields.length > 0) {
      // Don't treat unknown fields as errors, but log them for debugging
      console.warn(`Unknown fields in request body: ${unknownFields.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      data,
      errors: errors.length > 0 ? errors : undefined,
    }
  }

  /**
   * Validate individual field value
   */
  private validateFieldValue(
    value: unknown,
    field: TableFieldSchema,
    operation: 'create' | 'update' | 'delete' | 'get' | 'list'
  ): {
    isValid: boolean
    value?: unknown
    errors?: ValidationError[]
    warnings?: ValidationWarning[]
  } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Check if field is required
    if (
      field.is_required &&
      operation === 'create' &&
      (value === undefined || value === null || value === '')
    ) {
      errors.push({
        field: field.field_name,
        message: `${field.name} is required`,
        code: 'REQUIRED',
        value,
      })
      return { isValid: false, errors }
    }

    // Skip validation if field is not provided in update operation
    if (operation === 'update' && (value === undefined || value === null)) {
      return { isValid: true }
    }

    // Type-specific validation
    switch (field.data_type) {
      case 'text':
        const textValidation = this.validateTextField(value, field)
        if (!textValidation.isValid) {
          errors.push(...(textValidation.errors || []))
        }
        if (textValidation.warnings) {
          warnings.push(...textValidation.warnings)
        }
        break

      case 'number':
        const numberValidation = this.validateNumberField(value, field)
        if (!numberValidation.isValid) {
          errors.push(...(numberValidation.errors || []))
        }
        if (numberValidation.warnings) {
          warnings.push(...numberValidation.warnings)
        }
        break

      case 'date':
        const dateValidation = this.validateDateField(value, field)
        if (!dateValidation.isValid) {
          errors.push(...(dateValidation.errors || []))
        }
        if (dateValidation.warnings) {
          warnings.push(...dateValidation.warnings)
        }
        break

      case 'boolean':
        const booleanValidation = this.validateBooleanField(value, field)
        if (!booleanValidation.isValid) {
          errors.push(...(booleanValidation.errors || []))
        }
        break
    }

    return {
      isValid: errors.length === 0,
      value,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Validate text field
   */
  private validateTextField(
    value: unknown,
    field: TableFieldSchema
  ): { isValid: boolean; errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof value !== 'string') {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be a string`,
        code: 'TYPE_MISMATCH',
        value,
      })
      return { isValid: false, errors }
    }

    // Length validation
    const maxLength = field.field_config?.max_length as number
    const minLength = field.field_config?.min_length as number

    if (maxLength !== undefined && value.length > maxLength) {
      errors.push({
        field: field.field_name,
        message: `${field.name} cannot exceed ${maxLength} characters`,
        code: 'MAX_LENGTH',
        value,
      })
    }

    if (minLength !== undefined && value.length < minLength) {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be at least ${minLength} characters`,
        code: 'MIN_LENGTH',
        value,
      })
    }

    // Pattern validation
    const pattern = field.field_config?.pattern as string
    if (pattern) {
      try {
        const regex = new RegExp(pattern)
        if (!regex.test(value)) {
          errors.push({
            field: field.field_name,
            message: `${field.name} format is invalid`,
            code: 'PATTERN_MISMATCH',
            value,
          })
        }
      } catch {
        console.warn(`Invalid regex pattern for field ${field.field_name}:`, pattern)
      }
    }

    // Content warnings
    if (value.length > 10000) {
      warnings.push({
        field: field.field_name,
        message: 'Large text field may affect performance',
        code: 'LARGE_TEXT',
        value,
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Validate number field
   */
  private validateNumberField(
    value: unknown,
    field: TableFieldSchema
  ): { isValid: boolean; errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    // Convert string numbers to actual numbers
    let numValue: number
    if (typeof value === 'string') {
      if (value.trim() === '') {
        if (field.is_required) {
          errors.push({
            field: field.field_name,
            message: `${field.name} cannot be empty`,
            code: 'EMPTY_NUMBER',
            value,
          })
        }
        return { isValid: false, errors }
      }

      numValue = parseFloat(String(value))
      if (isNaN(numValue)) {
        errors.push({
          field: field.field_name,
          message: `${field.name} must be a valid number`,
          code: 'INVALID_NUMBER',
          value,
        })
        return { isValid: false, errors }
      }
    } else {
      numValue = typeof value === 'number' ? value : 0
    }

    if (typeof numValue !== 'number' || isNaN(numValue)) {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be a number`,
        code: 'TYPE_MISMATCH',
        value,
      })
      return { isValid: false, errors }
    }

    // Range validation
    const maxValue = field.field_config?.max_value as number
    const minValue = field.field_config?.min_value as number

    if (maxValue !== undefined && numValue > maxValue) {
      errors.push({
        field: field.field_name,
        message: `${field.name} cannot exceed ${maxValue}`,
        code: 'MAX_VALUE',
        value: numValue,
      })
    }

    if (minValue !== undefined && numValue < minValue) {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be at least ${minValue}`,
        code: 'MIN_VALUE',
        value: numValue,
      })
    }

    // Precision validation
    const precision = field.field_config?.precision as number
    const scale = field.field_config?.scale as number

    if (precision !== undefined && scale !== undefined) {
      const decimalPlaces = numValue.toString().split('.')[1]?.length || 0
      if (decimalPlaces > scale) {
        warnings.push({
          field: field.field_name,
          message: `Number has more decimal places than allowed (${scale})`,
          code: 'PRECISION_WARNING',
          value: numValue,
        })
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Validate date field
   */
  private validateDateField(
    value: unknown,
    field: TableFieldSchema
  ): { isValid: boolean; errors?: ValidationError[]; warnings?: ValidationWarning[] } {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []

    if (typeof value !== 'string') {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be a string`,
        code: 'TYPE_MISMATCH',
        value,
      })
      return { isValid: false, errors }
    }

    // Check for common date functions
    const dateFunctions = ['CURRENT_TIMESTAMP', 'NOW()', 'CURRENT_DATE', 'CURRENT_TIME']
    const upperValue = value.toUpperCase()

    if (dateFunctions.some(func => upperValue === func)) {
      return { isValid: true } // Date functions are valid
    }

    // Validate ISO date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
    if (!dateRegex.test(value)) {
      errors.push({
        field: field.field_name,
        message: `${field.name} must be a valid ISO date string (YYYY-MM-DDTHH:mm:ss.sssZ)`,
        code: 'INVALID_DATE_FORMAT',
        value,
      })
      return { isValid: false, errors }
    }

    // Try to parse the date
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      errors.push({
        field: field.field_name,
        message: `${field.name} is not a valid date`,
        code: 'INVALID_DATE',
        value,
      })
      return { isValid: false, errors }
    }

    // Date range warnings
    const now = new Date()
    if (date > new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000)) {
      // 100 years in future
      warnings.push({
        field: field.field_name,
        message: 'Date is far in the future',
        code: 'FUTURE_DATE',
        value,
      })
    }

    if (date < new Date(now.getTime() - 100 * 365 * 24 * 60 * 60 * 1000)) {
      // 100 years in past
      warnings.push({
        field: field.field_name,
        message: 'Date is far in the past',
        code: 'PAST_DATE',
        value,
      })
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }

  /**
   * Validate boolean field
   */
  private validateBooleanField(
    value: unknown,
    field: TableFieldSchema
  ): { isValid: boolean; errors?: ValidationError[] } {
    const errors: ValidationError[] = []

    // Accept various boolean representations
    if (typeof value === 'boolean') {
      return { isValid: true }
    }

    if (typeof value === 'string') {
      const validBooleanStrings = ['true', 'false', '1', '0', 'TRUE', 'FALSE']
      if (validBooleanStrings.includes(value)) {
        return { isValid: true }
      }
    }

    if (typeof value === 'number') {
      if (value === 0 || value === 1) {
        return { isValid: true }
      }
    }

    errors.push({
      field: field.field_name,
      message: `${field.name} must be a boolean (true/false, 1/0, "true"/"false")`,
      code: 'INVALID_BOOLEAN',
      value,
    })

    return { isValid: false, errors }
  }

  /**
   * Validate filter parameters
   */
  private validateFilterParameters(
    query: Record<string, unknown>,
    schema: TableSchema
  ): ValidationError[] {
    const errors: ValidationError[] = []

    // Look for filter parameters (field__operator=value pattern)
    const filterPattern = /^(\w+)__(eq|ne|gt|gte|lt|lte|like|ilike|in|not_in)$/
    const validFields = schema.fields.map((f: TableFieldSchema) => f.field_name)

    for (const [key, value] of Object.entries(query)) {
      const match = key.match(filterPattern)
      if (match) {
        const [, fieldName, operator] = match

        if (!validFields.includes(fieldName)) {
          errors.push({
            field: key,
            message: `Invalid filter field: ${fieldName}`,
            code: 'INVALID_FILTER_FIELD',
            value,
          })
        }

        // Validate operator-specific constraints
        if (['in', 'not_in'].includes(operator)) {
          if (typeof value !== 'string' && !Array.isArray(value)) {
            errors.push({
              field: key,
              message: `Filter operator ${operator} requires an array or comma-separated values`,
              code: 'INVALID_FILTER_VALUE',
              value,
            })
          }
        }
      }
    }

    return errors
  }

  /**
   * Validate UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Validate table name format
   */
  private isValidTableName(tableName: string): boolean {
    // Allow alphanumeric characters, underscores, and hyphens
    const tableNameRegex = /^[a-zA-Z][a-zA-Z0-9_-]*$/
    return tableNameRegex.test(tableName) && tableName.length <= 63
  }
}

// Export singleton instance
const requestValidator = new DynamicRequestValidator()

// Export convenience functions
export const validateRequest = (context: ValidationContext) =>
  requestValidator.validateRequest(context)

// Export middleware creator
export const createValidationMiddleware = (
  operation: 'create' | 'update' | 'list' | 'get' | 'delete'
) => {
  return async (request: NextRequest, context: { params: Record<string, unknown> }) => {
    const tableName = String(context.params.tableName)
    const query = Object.fromEntries(new URL(request.url).searchParams)
    const body = request.method !== 'GET' ? await request.json().catch(() => null) : null

    const validationContext: ValidationContext = {
      tableName,
      operation,
      request,
      params: context.params,
      query,
      body,
    }

    return await validateRequest(validationContext)
  }
}

export default requestValidator
