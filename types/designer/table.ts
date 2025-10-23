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

export interface CreateTableRequest {
  projectId: string
  name: string
  description?: string
  tableName: string
}

export interface UpdateTableRequest {
  id: string
  name?: string
  description?: string
  status?: DataTable['status']
  schemaDefinition?: Record<string, unknown>
}
