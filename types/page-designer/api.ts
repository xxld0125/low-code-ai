// 页面设计器API类型定义

import { PageDesign, ComponentInstance, DesignHistory } from './designer'

// 通用API响应类型
export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: string
  details?: any
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

// 排序参数
export interface SortParams {
  field: string
  order: 'asc' | 'desc'
}

// 过滤参数
export interface FilterParams {
  search?: string
  status?: string
  category?: string
  dateFrom?: string
  dateTo?: string
  [key: string]: any
}

// 查询参数组合
export interface QueryParams extends PaginationParams {
  sort?: SortParams
  filter?: FilterParams
}

// 页面设计API参数和响应
export interface PageDesignListParams extends QueryParams {
  user_id?: string
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
  shared_with?: string[]
}

export interface CreatePageDesignParams {
  name: string
  description?: string
  config: {
    title: string
    meta?: {
      description?: string
      keywords?: string[]
      author?: string
    }
    styles?: {
      theme: 'light' | 'dark' | 'auto'
      backgroundColor?: string
      backgroundImage?: string
      spacing: 'compact' | 'normal' | 'relaxed'
    }
    layout?: {
      maxWidth?: number
      padding: { top: number; right: number; bottom: number; left: number }
      centered: boolean
    }
  }
  tags?: string[]
}

export interface UpdatePageDesignParams extends Partial<CreatePageDesignParams> {
  status?: 'draft' | 'published' | 'archived'
  thumbnail_url?: string
  shared_with?: string[]
}

export interface PageDesignListResponse extends ApiResponse<PageDesign[]> {
  pagination: PaginationInfo
}

// 组件API参数和响应
export interface ComponentListParams extends QueryParams {
  page_design_id: string
  component_type?: string
  parent_id?: string
  meta?: Record<string, any>
}

export interface CreateComponentParams {
  page_design_id: string
  component_type: string
  parent_id?: string
  position: {
    z_index: number
    order: number
  }
  props: Record<string, any>
  styles: Record<string, any>
  events: Record<string, any>
  responsive: Record<string, any>
  layout_props?: Record<string, any>
  meta: {
    locked: boolean
    hidden: boolean
    custom_name?: string
    notes?: string
  }
}

export interface UpdateComponentParams extends Partial<CreateComponentParams> {
  id: string
}

export interface MoveComponentParams {
  component_id: string
  new_parent_id?: string
  new_position: number
  operation: 'move' | 'reorder'
}

export type ComponentListResponse = ApiResponse<ComponentInstance[]>

// 布局API参数和响应
export interface LayoutCalculationParams {
  page_design_id: string
  component_id?: string
  operation: 'calculate' | 'validate' | 'optimize'
  options?: {
    include_responsive?: boolean
    viewport_width?: number
    viewport_height?: number
    force_recalculate?: boolean
  }
}

export interface LayoutCalculationResponse extends ApiResponse {
  data: {
    layout: LayoutInfo
    validation?: ValidationResult
    optimization?: OptimizationResult
  }
}

export interface LayoutInfo {
  viewport: {
    width: number
    height: number
  }
  components: Record<string, ComponentLayoutInfo>
  constraints: {
    maxWidth: number
    grid: number
  }
  responsive?: Record<string, LayoutInfo>
}

export interface ComponentLayoutInfo {
  id: string
  type: string
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  styles: Record<string, any>
  calculatedStyles: Record<string, any>
  children: string[]
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  componentId: string
  type: string
  message: string
  field?: string
  severity: 'error'
}

export interface ValidationWarning {
  componentId: string
  type: string
  message: string
  suggestion?: string
  severity: 'warning'
}

export interface OptimizationResult {
  optimized: boolean
  changes: OptimizationChange[]
  performance: {
    renderTime: string
    memoryUsage: string
    componentCount: number
  }
}

export interface OptimizationChange {
  type: 'merge' | 'remove' | 'reorder' | 'simplify'
  componentId: string
  description: string
  impact: 'low' | 'medium' | 'high'
}

// 历史API参数和响应
export interface DesignHistoryParams extends QueryParams {
  page_design_id: string
  user_id?: string
  action?: string
  session_id?: string
}

export interface CreateHistoryParams {
  page_design_id: string
  action: string
  description: string
  before_state: any
  after_state: any
  affected_components: string[]
  session_id?: string
}

export interface DesignHistoryListResponse extends ApiResponse<DesignHistory[]> {
  pagination: PaginationInfo
}

// 自动保存API参数和响应
export interface AutoSaveParams {
  page_design_id: string
  component_tree: any
  timestamp: string
  session_id?: string
}

export interface AutoSaveResponse extends ApiResponse {
  data: {
    saved: boolean
    timestamp: string
    version: number
  }
}

// 导出API参数和响应
export interface ExportParams {
  page_design_id: string
  format: 'json' | 'html' | 'react' | 'vue' | 'angular'
  options?: {
    include_styles?: boolean
    include_assets?: boolean
    minify?: boolean
    inline_images?: boolean
    responsive_images?: boolean
  }
}

export interface ExportResponse extends ApiResponse {
  data: {
    url?: string
    content?: string
    filename?: string
    size?: number
    format: string
  }
}

// 预览API参数和响应
export interface PreviewParams {
  page_design_id: string
  mode: 'desktop' | 'tablet' | 'mobile'
  viewport?: {
    width: number
    height: number
  }
  theme?: 'light' | 'dark' | 'auto'
}

export interface PreviewResponse extends ApiResponse {
  data: {
    url: string
    expires_at: string
    access_token?: string
  }
}

// 缩略图API参数和响应
export interface ThumbnailParams {
  page_design_id: string
  width?: number
  height?: number
  quality?: number
  format?: 'png' | 'jpg' | 'webp'
}

export interface ThumbnailResponse extends ApiResponse {
  data: {
    url: string
    width: number
    height: number
    size: number
    format: string
  }
}

// 模板API参数和响应
export interface TemplateListParams extends QueryParams {
  category?: string
  tags?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  thumbnail_url: string
  preview_url: string
  download_count: number
  rating: number
  created_at: string
  updated_at: string
  author: {
    id: string
    name: string
    avatar_url?: string
  }
  page_design: PageDesign
}

export interface TemplateListResponse extends ApiResponse<Template[]> {
  pagination: PaginationInfo
}

// 统计API响应
export interface DesignStatsResponse extends ApiResponse {
  data: {
    total_designs: number
    published_designs: number
    draft_designs: number
    total_components: number
    avg_components_per_design: number
    most_used_components: Array<{
      type: string
      count: number
    }>
    recent_activity: Array<{
      action: string
      timestamp: string
      page_design_id: string
      page_design_name: string
    }>
  }
}

// 搜索API参数和响应
export interface SearchParams extends QueryParams {
  query: string
  type?: 'page_design' | 'component' | 'template'
  filters?: Record<string, any>
}

export interface SearchResult {
  type: 'page_design' | 'component' | 'template'
  id: string
  title: string
  description?: string
  url: string
  score: number
  highlights?: Array<{
    field: string
    fragments: string[]
  }>
  metadata?: Record<string, any>
}

export interface SearchResponse extends ApiResponse<SearchResult[]> {
  pagination: PaginationInfo
  facets: Record<
    string,
    Array<{
      value: string
      count: number
    }>
  >
}

// 错误响应类型
export interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: string
  path: string
  method: string
  request_id?: string
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'page_update' | 'component_update' | 'collaboration' | 'notification'
  payload: any
  user_id?: string
  session_id?: string
  timestamp: number
}

export interface CollaborationMessage extends WebSocketMessage {
  type: 'collaboration'
  payload: {
    action: 'join' | 'leave' | 'cursor_move' | 'selection_change'
    user: {
      id: string
      name: string
      avatar_url?: string
      color: string
    }
    data?: any
  }
}

// 上传API参数和响应
export interface UploadParams {
  file: File
  type: 'image' | 'font' | 'asset'
  folder?: string
}

export interface UploadResponse extends ApiResponse {
  data: {
    url: string
    filename: string
    size: number
    mime_type: string
    width?: number
    height?: number
  }
}

// 健康检查响应
export interface HealthCheckResponse extends ApiResponse {
  data: {
    status: 'healthy' | 'degraded' | 'unhealthy'
    version: string
    uptime: number
    checks: Record<
      string,
      {
        status: 'pass' | 'fail' | 'warn'
        duration: number
        message?: string
      }
    >
  }
}
