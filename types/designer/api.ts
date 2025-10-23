export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface DesignerApiEndpoints {
  'GET /api/designer/tables': {
    query: { projectId: string }
    response: ApiResponse<{ tables: unknown[] }>
  }
  'POST /api/designer/tables': {
    body: {
      projectId: string
      name: string
      description?: string
      tableName: string
    }
    response: ApiResponse<{ table: unknown }>
  }
  'PUT /api/designer/tables/[id]': {
    params: { id: string }
    body: {
      name?: string
      description?: string
      status?: string
    }
    response: ApiResponse<{ table: unknown }>
  }
  'DELETE /api/designer/tables/[id]': {
    params: { id: string }
    response: ApiResponse
  }
}
