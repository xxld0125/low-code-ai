// Error types for the data model designer

// Base error class
export class DesignerError extends Error {
  public readonly code: string
  public readonly details?: Record<string, unknown>

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message)
    this.name = 'DesignerError'
    this.code = code
    this.details = details

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DesignerError)
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      stack: this.stack,
    }
  }
}

// Validation errors
export class ValidationError extends DesignerError {
  constructor(message: string, field?: string, value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value })
    this.name = 'ValidationError'
  }
}

export class TableValidationError extends ValidationError {
  constructor(message: string, tableName?: string) {
    super(message, 'table_name', tableName)
    this.name = 'TableValidationError'
  }
}

export class FieldValidationError extends ValidationError {
  constructor(message: string, fieldName?: string, fieldType?: string) {
    super(message, 'field_name', { fieldName, fieldType })
    this.name = 'FieldValidationError'
  }
}

export class RelationshipValidationError extends ValidationError {
  constructor(message: string, relationshipDetails?: Record<string, unknown>) {
    super(message, 'relationship', relationshipDetails)
    this.name = 'RelationshipValidationError'
  }
}

// API errors
export class ApiError extends DesignerError {
  public readonly status?: number
  public readonly endpoint?: string

  constructor(
    message: string,
    code: string,
    status?: number,
    endpoint?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code, details)
    this.name = 'ApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network connection failed', endpoint?: string) {
    super(message, 'NETWORK_ERROR', undefined, endpoint)
    this.name = 'NetworkError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Authentication required', endpoint?: string) {
    super(message, 'UNAUTHORIZED', 401, endpoint)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Insufficient permissions', endpoint?: string) {
    super(message, 'FORBIDDEN', 403, endpoint)
    this.name = 'ForbiddenError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found', resource?: string, endpoint?: string) {
    super(message, 'NOT_FOUND', 404, endpoint, { resource })
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, conflictType?: string, endpoint?: string) {
    super(message, 'CONFLICT', 409, endpoint, { conflictType })
    this.name = 'ConflictError'
  }
}

export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error', endpoint?: string) {
    super(message, 'SERVER_ERROR', 500, endpoint)
    this.name = 'ServerError'
  }
}

// Database errors
export class DatabaseError extends DesignerError {
  constructor(message: string, query?: string, details?: Record<string, unknown>) {
    super(message, 'DATABASE_ERROR', { query, ...details })
    this.name = 'DatabaseError'
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string = 'Database connection failed') {
    super(message, 'CONNECTION_ERROR')
    this.name = 'ConnectionError'
  }
}

export class QueryError extends DatabaseError {
  constructor(message: string, query?: string) {
    super(message, 'QUERY_ERROR', { query })
    this.name = 'QueryError'
  }
}

export class ConstraintError extends DatabaseError {
  constructor(message: string, constraint?: string) {
    super(message, 'CONSTRAINT_ERROR', { constraint })
    this.name = 'ConstraintError'
  }
}

// Business logic errors
export class BusinessLogicError extends DesignerError {
  constructor(message: string, businessRule?: string, details?: Record<string, unknown>) {
    super(message, 'BUSINESS_LOGIC_ERROR', { businessRule, ...details })
    this.name = 'BusinessLogicError'
  }
}

export class CircularDependencyError extends BusinessLogicError {
  constructor(sourceTable: string, targetTable: string) {
    super(
      `Creating relationship from '${sourceTable}' to '${targetTable}' would create a circular dependency`,
      'CIRCULAR_DEPENDENCY',
      { sourceTable, targetTable }
    )
    this.name = 'CircularDependencyError'
  }
}

export class TableLockError extends BusinessLogicError {
  constructor(message: string, tableId: string, lockHolder?: string) {
    super(message, 'TABLE_LOCKED', { tableId, lockHolder })
    this.name = 'TableLockError'
  }
}

export class DeploymentError extends BusinessLogicError {
  constructor(message: string, tableId?: string, deploymentStep?: string) {
    super(message, 'DEPLOYMENT_ERROR', { tableId, deploymentStep })
    this.name = 'DeploymentError'
  }
}

// State management errors
export class StateError extends DesignerError {
  constructor(message: string, stateKey?: string, details?: Record<string, unknown>) {
    super(message, 'STATE_ERROR', { stateKey, ...details })
    this.name = 'StateError'
  }
}

export class StoreError extends StateError {
  constructor(message: string, storeName?: string, action?: string) {
    super(message, 'store', { storeName, action })
    this.name = 'StoreError'
  }
}

// Component errors
export class ComponentError extends DesignerError {
  constructor(message: string, component?: string, props?: Record<string, unknown>) {
    super(message, 'COMPONENT_ERROR', { component, props })
    this.name = 'ComponentError'
  }
}

export class RenderError extends ComponentError {
  constructor(message: string, component?: string) {
    super(`Render error in ${component}: ${message}`, component)
    this.name = 'RenderError'
  }
}

export class PropValidationError extends ComponentError {
  constructor(message: string, component?: string, prop?: string) {
    super(`Invalid prop '${prop}' in ${component}: ${message}`, component, { prop })
    this.name = 'PropValidationError'
  }
}

// Error code constants
export const ERROR_CODES = {
  // General errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // API errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER_ERROR: 'SERVER_ERROR',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',
  CONSTRAINT_ERROR: 'CONSTRAINT_ERROR',

  // Business logic errors
  BUSINESS_LOGIC_ERROR: 'BUSINESS_LOGIC_ERROR',
  CIRCULAR_DEPENDENCY: 'CIRCULAR_DEPENDENCY',
  TABLE_LOCKED: 'TABLE_LOCKED',
  DEPLOYMENT_ERROR: 'DEPLOYMENT_ERROR',

  // State management errors
  STATE_ERROR: 'STATE_ERROR',
  STORE_ERROR: 'STORE_ERROR',

  // Component errors
  COMPONENT_ERROR: 'COMPONENT_ERROR',
  RENDER_ERROR: 'RENDER_ERROR',
  PROP_VALIDATION_ERROR: 'PROP_VALIDATION_ERROR',
} as const

// Error message templates
export const ERROR_MESSAGES = {
  // Table related
  TABLE_NAME_REQUIRED: 'Table name is required',
  TABLE_NAME_INVALID:
    'Table name must start with a letter and contain only lowercase letters, numbers, and underscores',
  TABLE_NAME_TOO_LONG: 'Table name must be 63 characters or less',
  TABLE_NAME_EXISTS: 'A table with this name already exists',
  TABLE_NOT_FOUND: 'Table not found',
  TABLE_HAS_RELATIONSHIPS: 'Cannot delete table that has relationships',

  // Field related
  FIELD_NAME_REQUIRED: 'Field name is required',
  FIELD_NAME_INVALID:
    'Field name must start with a letter and contain only lowercase letters, numbers, and underscores',
  FIELD_NAME_TOO_LONG: 'Field name must be 63 characters or less',
  FIELD_NAME_EXISTS: 'A field with this name already exists in this table',
  FIELD_NOT_FOUND: 'Field not found',
  FIELD_HAS_RELATIONSHIPS: 'Cannot delete field that is used in relationships',
  FIELD_TYPE_INVALID: 'Invalid field type',
  FIELD_CONFIG_INVALID: 'Invalid field configuration',

  // Relationship related
  RELATIONSHIP_INVALID: 'Invalid relationship configuration',
  RELATIONSHIP_CIRCULAR: 'This relationship would create a circular dependency',
  RELATIONSHIP_EXISTS: 'A relationship already exists between these tables/fields',
  RELATIONSHIP_NOT_FOUND: 'Relationship not found',
  RELATIONSHIP_INCOMPATIBLE_TYPES: 'Source and target fields have incompatible data types',

  // Lock related
  TABLE_LOCKED: 'Table is currently locked by another user',
  LOCK_EXPIRED: 'Lock has expired',
  LOCK_NOT_FOUND: 'Lock not found',
  LOCK_INVALID: 'Invalid lock token',

  // Deployment related
  DEPLOYMENT_FAILED: 'Table deployment failed',
  DEPLOYMENT_INVALID_SCHEMA: 'Invalid table schema for deployment',
  DEPLOYMENT_MISSING_FIELDS: 'Table must have at least one field',

  // Validation related
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',

  // API related
  NETWORK_ERROR: 'Network connection failed',
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Insufficient permissions',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
} as const

// Error factory functions
export const createValidationError = (
  message: string,
  field?: string,
  value?: unknown
): ValidationError => {
  return new ValidationError(message, field, value)
}

export const createTableValidationError = (tableName?: string): TableValidationError => {
  return new TableValidationError(ERROR_MESSAGES.TABLE_NAME_INVALID, tableName)
}

export const createFieldValidationError = (
  fieldName?: string,
  fieldType?: string
): FieldValidationError => {
  return new FieldValidationError(ERROR_MESSAGES.FIELD_NAME_INVALID, fieldName, fieldType)
}

export const createConflictError = (message: string, conflictType?: string): ConflictError => {
  return new ConflictError(message, conflictType)
}

export const createNotFoundError = (resource?: string): NotFoundError => {
  return new NotFoundError(ERROR_MESSAGES.NOT_FOUND, resource)
}

export const createCircularDependencyError = (
  sourceTable: string,
  targetTable: string
): CircularDependencyError => {
  return new CircularDependencyError(sourceTable, targetTable)
}

export const createTableLockError = (tableId: string, lockHolder?: string): TableLockError => {
  return new TableLockError(ERROR_MESSAGES.TABLE_LOCKED, tableId, lockHolder)
}

export const createDeploymentError = (message: string, tableId?: string): DeploymentError => {
  return new DeploymentError(message, tableId)
}

// Error utilities
export const isDesignerError = (error: unknown): error is DesignerError => {
  return error instanceof DesignerError
}

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError
}

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return error instanceof DatabaseError
}

export const getErrorCode = (error: unknown): string => {
  if (isDesignerError(error)) {
    return error.code
  }
  if (error instanceof Error) {
    return error.name
  }
  return ERROR_CODES.UNKNOWN_ERROR
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return 'An unknown error occurred'
}

export const getErrorDetails = (error: unknown): Record<string, unknown> | undefined => {
  if (isDesignerError(error)) {
    return error.details
  }
  return undefined
}

// Error logging utility
export const logError = (error: unknown, context?: Record<string, unknown>) => {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    details: getErrorDetails(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  }

  console.error('Designer Error:', errorInfo)

  // In a production environment, you might want to send this to a logging service
  // await sendToErrorReporting(errorInfo)
}

// Error recovery utilities
export const getErrorMessageForUser = (error: unknown): string => {
  if (isValidationError(error)) {
    return `Validation error: ${error.message}`
  }

  if (isNetworkError(error)) {
    return 'Network connection failed. Please check your internet connection and try again.'
  }

  if (error instanceof UnauthorizedError) {
    return 'Please log in to continue.'
  }

  if (error instanceof ForbiddenError) {
    return 'You do not have permission to perform this action.'
  }

  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.'
  }

  if (error instanceof ConflictError) {
    return error.details?.conflictType === 'table_name_exists'
      ? 'A table with this name already exists. Please choose a different name.'
      : 'This action conflicts with existing data. Please review and try again.'
  }

  if (error instanceof TableLockError) {
    return 'This table is currently being edited by another user. Please try again later.'
  }

  if (error instanceof CircularDependencyError) {
    return 'This relationship would create a circular dependency. Please review your table relationships.'
  }

  if (isDatabaseError(error)) {
    return 'A database error occurred. Please try again or contact support if the problem persists.'
  }

  if (isApiError(error) && error.status && error.status >= 500) {
    return 'Server error occurred. Please try again later.'
  }

  // Default error message
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
}

const designerErrors = {
  // Error classes
  DesignerError,
  ValidationError,
  TableValidationError,
  FieldValidationError,
  RelationshipValidationError,
  ApiError,
  NetworkError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError,
  DatabaseError,
  ConnectionError,
  QueryError,
  ConstraintError,
  BusinessLogicError,
  CircularDependencyError,
  TableLockError,
  DeploymentError,
  StateError,
  StoreError,
  ComponentError,
  RenderError,
  PropValidationError,

  // Constants and utilities
  ERROR_CODES,
  ERROR_MESSAGES,

  // Factory functions
  createValidationError,
  createTableValidationError,
  createFieldValidationError,
  createConflictError,
  createNotFoundError,
  createCircularDependencyError,
  createTableLockError,
  createDeploymentError,

  // Utilities
  isDesignerError,
  isValidationError,
  isApiError,
  isNetworkError,
  isDatabaseError,
  getErrorCode,
  getErrorMessage,
  getErrorDetails,
  logError,
  getErrorMessageForUser,
}

export default designerErrors
