export interface DataTable {
  id: string
  project_id: string
  name: string
  description: string
  table_name: string
  schema_definition: Record<string, unknown>
  status: 'draft' | 'active' | 'deprecated' | 'deleted'
  created_by: string
  created_at: string
  updated_at: string
}

export interface DataTableWithFields extends DataTable {
  fields: DataField[]
  relationships: {
    outgoing: TableRelationship[]
    incoming: TableRelationship[]
  }
}

export interface CreateTableRequest {
  name: string
  description?: string
  table_name: string
  fields?: CreateDataFieldRequest[]
}

export interface UpdateDataTableRequest {
  name?: string
  description?: string
  table_name?: string
}

export interface DataTableListRequest {
  projectId: string
  page?: number
  limit?: number
  status?: DataTable['status']
}

export interface TableDeploymentRequest {
  projectId: string
  tableId: string
}

export interface TableDeploymentResponse {
  deployment_id: string
  status: 'success' | 'pending' | 'failed'
  sql_statements: string[]
  database_table_name: string
}

// Re-export from field types to maintain compatibility
import type { DataField, CreateDataFieldRequest } from './field'
import type { TableRelationship } from './relationship'
