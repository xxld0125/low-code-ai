// Core API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

export interface ApiError {
  error: string
  message: string
  details?: Record<string, unknown>
  code?: string
}

// Import domain types
import type {
  DataTable,
  DataTableWithFields,
  CreateTableRequest,
  UpdateDataTableRequest,
  TableDeploymentRequest,
  TableDeploymentResponse,
  DataTableListRequest,
} from './table'
import type {
  DataField,
  CreateDataFieldRequest,
  UpdateDataFieldRequest,
  DataFieldListRequest,
} from './field'
import type {
  TableRelationship,
  CreateTableRelationshipRequest,
  UpdateTableRelationshipRequest,
  TableRelationshipListRequest,
  RelationshipValidationResult,
} from './relationship'

// Re-export domain types for convenience
export type { DataTable, DataTableWithFields, DataField, TableRelationship }

// Table lock types for basic collaboration
export interface TableLock {
  id: string
  table_id: string
  user_id: string
  user: { id: string; email: string; user_metadata: Record<string, unknown> } | null
  lock_token: string
  lock_type: 'optimistic' | 'pessimistic' | 'critical'
  locked_at: string
  expires_at: string
  reason: string
}

export interface AcquireLockRequest {
  lock_type: 'optimistic' | 'pessimistic' | 'critical'
  reason: string
  duration_minutes?: number
}

// API request/response types for data tables
export interface ListTablesResponse {
  data: DataTable[]
  pagination: PaginatedResponse<DataTable>['pagination']
}

export interface GetTableResponse {
  data: DataTableWithFields
}

export interface CreateTableResponse {
  data: DataTable
}

export interface UpdateTableResponse {
  data: DataTable
}

// API request/response types for data fields
export interface ListFieldsResponse {
  data: DataField[]
}

export interface CreateFieldResponse {
  data: DataField
}

export interface UpdateFieldResponse {
  data: DataField
}

// API request/response types for relationships
export interface ListRelationshipsResponse {
  data: TableRelationship[]
}

export interface CreateRelationshipResponse {
  data: TableRelationship
}

export interface UpdateRelationshipResponse {
  data: TableRelationship
}

// API request/response types for table locks
export interface AcquireLockResponse {
  data: TableLock
}

// API client interface
export interface DesignerApiClient {
  // Table operations
  tables: {
    list: (request: DataTableListRequest) => Promise<ListTablesResponse>
    get: (projectId: string, tableId: string) => Promise<GetTableResponse>
    create: (projectId: string, request: CreateTableRequest) => Promise<CreateTableResponse>
    update: (
      projectId: string,
      tableId: string,
      request: UpdateDataTableRequest
    ) => Promise<UpdateTableResponse>
    delete: (projectId: string, tableId: string) => Promise<void>
    deploy: (request: TableDeploymentRequest) => Promise<TableDeploymentResponse>
  }

  // Field operations
  fields: {
    list: (request: DataFieldListRequest) => Promise<ListFieldsResponse>
    create: (
      projectId: string,
      tableId: string,
      request: CreateDataFieldRequest
    ) => Promise<CreateFieldResponse>
    update: (
      projectId: string,
      tableId: string,
      fieldId: string,
      request: UpdateDataFieldRequest
    ) => Promise<UpdateFieldResponse>
    delete: (projectId: string, tableId: string, fieldId: string) => Promise<void>
  }

  // Relationship operations
  relationships: {
    list: (request: TableRelationshipListRequest) => Promise<ListRelationshipsResponse>
    create: (
      projectId: string,
      request: CreateTableRelationshipRequest
    ) => Promise<CreateRelationshipResponse>
    update: (
      projectId: string,
      relationshipId: string,
      request: UpdateTableRelationshipRequest
    ) => Promise<UpdateRelationshipResponse>
    delete: (projectId: string, relationshipId: string) => Promise<void>
    validate: (
      projectId: string,
      request: CreateTableRelationshipRequest
    ) => Promise<RelationshipValidationResult>
  }

  // Lock operations
  locks: {
    acquire: (
      projectId: string,
      tableId: string,
      request: AcquireLockRequest
    ) => Promise<AcquireLockResponse>
    release: (projectId: string, tableId: string, lockToken: string) => Promise<void>
  }
}
