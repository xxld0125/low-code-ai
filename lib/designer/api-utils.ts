/**
 * API Utilities for Dynamic Tables
 *
 * Purpose: Provide utilities for response formatting, validation, and error handling
 * Author: Data Model Designer System
 * Version: 1.0.0
 */

import { NextResponse } from 'next/server'
import type { DataField } from '@/types/designer/field'
import type { TableFieldSchema } from './table-registry'

// Extended type definitions for better type safety
interface DatabaseError extends Error {
  code?: string
  constraint?: string
  hint?: string
  detail?: string
  table?: string
  column?: string
}

interface TableSchema {
  tableName: string
  fields: DataField[]
  relationships: unknown[]
}

interface CreateRequestData {
  [key: string]: unknown
}

interface UpdateRequestData {
  [key: string]: unknown
}

interface ListRequestData {
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
  search?: string
}

interface ParamsRequestData {
  id: string
}

type QueryRequestData = ListRequestData

interface APIRequestOptions {
  requestId?: string
  details?: unknown
  fieldErrors?: ValidationError[]
  stack?: string
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: string
  requestId?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export interface ValidationResult {
  isValid: boolean
  data?: unknown
  error?: string
  fieldErrors?: ValidationError[]
}

// Error Response Types
export interface ErrorResponse extends APIResponse {
  success: false
  error: string
  details?: unknown
  stack?: string // Only in development
}

export interface ValidationErrorResponse extends ErrorResponse {
  fieldErrors: ValidationError[]
}

// Standard Response Formatter
export function formatAPIResponse<T = unknown>(
  operation: 'create' | 'read' | 'update' | 'delete' | 'list' | 'get',
  data: {
    data?: T
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    deleted?: boolean
  },
  options: {
    requestId?: string
    message?: string
    includeMetadata?: boolean
  } = {}
): APIResponse<T> | PaginatedResponse<T> {
  const timestamp = new Date().toISOString()
  const requestId = options.requestId || generateRequestId()

  const baseResponse: APIResponse<T> = {
    success: true,
    timestamp,
    requestId,
  }

  // Add success message based on operation
  if (options.message) {
    baseResponse.message = options.message
  } else {
    baseResponse.message = getDefaultSuccessMessage(operation)
  }

  // Handle different response types
  if (operation === 'list') {
    const paginatedResponse: PaginatedResponse<T> = {
      ...baseResponse,
      data: data.data as T[],
      pagination: {
        ...data.pagination!,
        hasNext: data.pagination!.page < data.pagination!.totalPages,
        hasPrev: data.pagination!.page > 1,
      },
    }
    return paginatedResponse
  } else if (operation === 'delete') {
    return {
      ...baseResponse,
      data: { deleted: data.deleted } as T,
    }
  } else {
    return {
      ...baseResponse,
      data: data.data,
    }
  }
}

// Error Response Formatter
export function formatErrorResponse(error: string, options: APIRequestOptions = {}): ErrorResponse {
  const timestamp = new Date().toISOString()
  const requestId = options.requestId || generateRequestId()

  const errorResponse: ErrorResponse = {
    success: false,
    error,
    timestamp,
    requestId,
  }

  if (options.details) {
    errorResponse.details = options.details
  }

  if (process.env.NODE_ENV === 'development' && options.stack) {
    errorResponse.stack = options.stack
  }

  return errorResponse
}

// Validation Error Response Formatter
export function formatValidationErrorResponse(
  error: string,
  fieldErrors: ValidationError[],
  options: {
    requestId?: string
    details?: unknown
  } = {}
): ValidationErrorResponse {
  const baseErrorResponse = formatErrorResponse(error, options)

  return {
    ...baseErrorResponse,
    fieldErrors,
  }
}

// Generic API Error Handler
export function handleAPIError(
  error: DatabaseError,
  operation: 'create' | 'read' | 'update' | 'delete' | 'fetch',
  tableName: string,
  options: {
    requestId?: string
    includeStack?: boolean
  } = {}
): NextResponse {
  console.error(`API Error in ${operation} for ${tableName}:`, error)

  const statusCode = getErrorStatusCode(error)
  const errorMessage = getErrorMessage(error, operation, tableName)

  let errorResponse: ErrorResponse

  // Handle validation errors
  if (error.code === '23514' || error.code === '23505') {
    // Foreign key or unique constraint violation
    errorResponse = formatErrorResponse(errorMessage, {
      requestId: options.requestId,
      details: {
        constraint: error.constraint,
        table: tableName,
        operation,
      },
      stack: options.includeStack ? error.stack : undefined,
    })
  } else if (error.code === '23502') {
    // Not null constraint violation
    errorResponse = formatErrorResponse(errorMessage, {
      requestId: options.requestId,
      details: {
        constraint: error.constraint,
        table: tableName,
        operation,
      },
      stack: options.includeStack ? error.stack : undefined,
    })
  } else {
    errorResponse = formatErrorResponse(errorMessage, {
      requestId: options.requestId,
      details: {
        code: error.code,
        hint: error.hint,
        table: tableName,
        operation,
      },
      stack: options.includeStack ? error.stack : undefined,
    })
  }

  return NextResponse.json(errorResponse, { status: statusCode })
}

// Request Validation
export function validateTableRequest(
  operation: 'create' | 'update' | 'list' | 'params' | 'query',
  tableName: string,
  data: unknown
): ValidationResult {
  try {
    // In a real implementation, you'd fetch the table schema
    // and generate validation schemas dynamically
    const tableSchema = getTableSchemaForValidation(tableName)

    if (!tableSchema) {
      return {
        isValid: false,
        error: `Table '${tableName}' not found or is not active`,
      }
    }

    switch (operation) {
      case 'create':
        return validateCreateRequest(data as CreateRequestData, tableSchema)
      case 'update':
        return validateUpdateRequest(data as UpdateRequestData, tableSchema)
      case 'list':
        return validateListRequest(data as ListRequestData, tableSchema)
      case 'params':
        return validateParamsRequest(data as ParamsRequestData)
      case 'query':
        return validateQueryRequest(data as QueryRequestData, tableSchema)
      default:
        return {
          isValid: false,
          error: `Unsupported operation: ${operation}`,
        }
    }
  } catch (error) {
    console.error('Validation error:', error)
    return {
      isValid: false,
      error: 'Validation failed due to internal error',
    }
  }
}

// Validation Functions
function validateCreateRequest(data: CreateRequestData, schema: TableSchema): ValidationResult {
  const fieldErrors: ValidationError[] = []

  // Validate required fields
  for (const field of schema.fields) {
    if (field.is_required && !field.is_primary_key) {
      if (data[field.field_name] === undefined || data[field.field_name] === null) {
        fieldErrors.push({
          field: field.field_name,
          message: `${field.name} is required`,
          code: 'REQUIRED',
        })
      }
    }
  }

  // Validate field types and constraints
  for (const field of schema.fields) {
    const value = data[field.field_name]
    if (value !== undefined && value !== null) {
      const fieldValidation = validateFieldValue(value, field)
      if (!fieldValidation.isValid) {
        fieldErrors.push(...(fieldValidation.fieldErrors || []))
      }
    }
  }

  if (fieldErrors.length > 0) {
    return {
      isValid: false,
      error: 'Validation failed',
      fieldErrors,
    }
  }

  return {
    isValid: true,
    data,
  }
}

function validateUpdateRequest(data: UpdateRequestData, schema: TableSchema): ValidationResult {
  const fieldErrors: ValidationError[] = []

  // Validate field types and constraints (but allow partial updates)
  for (const field of schema.fields) {
    if (
      field.is_primary_key ||
      (field as unknown as TableFieldSchema & { immutable?: boolean }).immutable
    ) {
      continue // Skip primary key and immutable fields
    }

    const value = data[field.field_name]
    if (value !== undefined && value !== null) {
      const fieldValidation = validateFieldValue(value, field)
      if (!fieldValidation.isValid) {
        fieldErrors.push(...(fieldValidation.fieldErrors || []))
      }
    }
  }

  if (fieldErrors.length > 0) {
    return {
      isValid: false,
      error: 'Validation failed',
      fieldErrors,
    }
  }

  return {
    isValid: true,
    data,
  }
}

function validateListRequest(data: ListRequestData, schema: TableSchema): ValidationResult {
  const { page, limit, sort, order, search } = data

  // Validate pagination
  if (page !== undefined && (isNaN(page) || page < 1)) {
    return {
      isValid: false,
      error: 'Page must be a positive integer',
    }
  }

  if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    return {
      isValid: false,
      error: 'Limit must be between 1 and 100',
    }
  }

  // Validate sort field
  if (sort !== undefined) {
    const validSortFields = schema.fields.map((f: DataField) => f.field_name)
    if (!validSortFields.includes(sort)) {
      return {
        isValid: false,
        error: `Invalid sort field. Valid fields: ${validSortFields.join(', ')}`,
      }
    }
  }

  // Validate order
  if (order !== undefined && !['asc', 'desc'].includes(order)) {
    return {
      isValid: false,
      error: 'Order must be either "asc" or "desc"',
    }
  }

  return {
    isValid: true,
    data: { page, limit, sort, order, search },
  }
}

function validateParamsRequest(data: ParamsRequestData): ValidationResult {
  const { id } = data

  // Validate UUID format for ID
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      error: 'Valid ID is required',
    }
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    return {
      isValid: false,
      error: 'ID must be a valid UUID',
    }
  }

  return {
    isValid: true,
    data: { id },
  }
}

function validateQueryRequest(data: QueryRequestData, schema: TableSchema): ValidationResult {
  return validateListRequest(data, schema)
}

function validateFieldValue(value: unknown, field: DataField): ValidationResult {
  const errors: ValidationError[] = []

  switch (field.data_type) {
    case 'text':
      if (typeof value !== 'string') {
        errors.push({
          field: field.field_name,
          message: `${field.name} must be a string`,
          code: 'TYPE_MISMATCH',
        })
      } else {
        // Validate length constraints
        const maxLength = field.field_config?.max_length as number
        const minLength = field.field_config?.min_length as number

        if (maxLength !== undefined && value.length > maxLength) {
          errors.push({
            field: field.field_name,
            message: `${field.name} cannot exceed ${maxLength} characters`,
            code: 'MAX_LENGTH',
          })
        }

        if (minLength !== undefined && value.length < minLength) {
          errors.push({
            field: field.field_name,
            message: `${field.name} must be at least ${minLength} characters`,
            code: 'MIN_LENGTH',
          })
        }

        // Validate pattern
        const pattern = field.field_config?.pattern as string
        if (pattern) {
          const regex = new RegExp(pattern)
          if (!regex.test(value)) {
            errors.push({
              field: field.field_name,
              message: `${field.name} format is invalid`,
              code: 'PATTERN_MISMATCH',
            })
          }
        }
      }
      break

    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push({
          field: field.field_name,
          message: `${field.name} must be a valid number`,
          code: 'TYPE_MISMATCH',
        })
      } else {
        // Validate range constraints
        const maxValue = field.field_config?.max_value as number
        const minValue = field.field_config?.min_value as number

        if (maxValue !== undefined && value > maxValue) {
          errors.push({
            field: field.field_name,
            message: `${field.name} cannot exceed ${maxValue}`,
            code: 'MAX_VALUE',
          })
        }

        if (minValue !== undefined && value < minValue) {
          errors.push({
            field: field.field_name,
            message: `${field.name} must be at least ${minValue}`,
            code: 'MIN_VALUE',
          })
        }
      }
      break

    case 'date':
      if (typeof value !== 'string') {
        errors.push({
          field: field.field_name,
          message: `${field.name} must be a string`,
          code: 'TYPE_MISMATCH',
        })
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
        if (!dateRegex.test(value)) {
          errors.push({
            field: field.field_name,
            message: `${field.name} must be a valid ISO date string`,
            code: 'INVALID_DATE',
          })
        }
      }
      break

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push({
          field: field.field_name,
          message: `${field.name} must be a boolean`,
          code: 'TYPE_MISMATCH',
        })
      }
      break

    default:
      errors.push({
        field: field.field_name,
        message: `Unsupported field type: ${field.data_type}`,
        code: 'UNSUPPORTED_TYPE',
      })
  }

  return {
    isValid: errors.length === 0,
    fieldErrors: errors.length > 0 ? errors : undefined,
  }
}

// Utility Functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getDefaultSuccessMessage(operation: string): string {
  switch (operation) {
    case 'create':
      return 'Resource created successfully'
    case 'read':
    case 'get':
      return 'Resource retrieved successfully'
    case 'update':
      return 'Resource updated successfully'
    case 'delete':
      return 'Resource deleted successfully'
    case 'list':
      return 'Resources retrieved successfully'
    default:
      return 'Operation completed successfully'
  }
}

function getErrorStatusCode(error: DatabaseError): number {
  // PostgreSQL error codes
  switch (error.code) {
    case '23514': // foreign_key_violation
      return 409
    case '23505': // unique_violation
      return 409
    case '23502': // not_null_violation
      return 422
    case '23503': // foreign_key_violation
      return 409
    case '42P01': // undefined_table
      return 404
    case '42703': // undefined_column
      return 400
    case '22P02': // invalid_text_representation
      return 422
    default:
      return 500
  }
}

function getErrorMessage(error: DatabaseError, operation: string, tableName: string): string {
  if (error.message) {
    return error.message
  }

  // Default messages based on error code
  switch (error.code) {
    case '23514':
      return 'Foreign key constraint violation'
    case '23505':
      return 'Unique constraint violation'
    case '23502':
      return 'Required field cannot be null'
    case '42P01':
      return `Table '${tableName}' not found`
    default:
      return `Failed to ${operation} resource in ${tableName}`
  }
}

// Mock table schema function (in real implementation, this would fetch from database)
function getTableSchemaForValidation(tableName: string): TableSchema | null {
  // This is a placeholder - in a real implementation,
  // you'd fetch the table schema from your database or cache
  return {
    tableName,
    fields: [], // Would contain actual field definitions
    relationships: [],
  }
}

// Response Headers Utility
export function setAPIResponseHeaders(
  response: NextResponse,
  options: {
    requestId?: string
    cacheControl?: string
    contentType?: string
  } = {}
): NextResponse {
  const headers = new Headers(response.headers)

  // Set standard API headers
  headers.set('X-API-Version', '1.0.0')
  headers.set('X-Response-Time', new Date().toISOString())

  if (options.requestId) {
    headers.set('X-Request-ID', options.requestId)
  }

  if (options.cacheControl) {
    headers.set('Cache-Control', options.cacheControl)
  }

  if (options.contentType) {
    headers.set('Content-Type', options.contentType)
  } else {
    headers.set('Content-Type', 'application/json')
  }

  // CORS headers for API routes
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')

  return new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

// Request Context Utility
export function extractRequestContext(request: Request): {
  requestId?: string
  userAgent?: string
  ip?: string
  timestamp: string
} {
  const requestId = request.headers.get('x-request-id') || generateRequestId()
  const userAgent = request.headers.get('user-agent') || undefined
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ip = forwardedFor ? forwardedFor.split(',')[0] : undefined

  return {
    requestId,
    userAgent,
    ip,
    timestamp: new Date().toISOString(),
  }
}
