// Constants and configuration for the Data Model Designer

// Application constants
export const APP_NAME = 'Data Model Designer'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Visual data model designer for low-code development platform'

// Supported field types
export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
} as const

export type FieldType = (typeof FIELD_TYPES)[keyof typeof FIELD_TYPES]

// Supported field types for UI components
export const SUPPORTED_FIELD_TYPES = [
  {
    value: FIELD_TYPES.TEXT,
    label: 'Text',
    description: 'Text, numbers, and characters',
  },
  {
    value: FIELD_TYPES.NUMBER,
    label: 'Number',
    description: 'Numeric values with optional precision',
  },
  {
    value: FIELD_TYPES.DATE,
    label: 'Date',
    description: 'Date and timestamp values',
  },
  {
    value: FIELD_TYPES.BOOLEAN,
    label: 'Boolean',
    description: 'True/false values',
  },
] as const

// Field type display information
export const FIELD_TYPE_INFO = {
  [FIELD_TYPES.TEXT]: {
    label: 'Text',
    description: 'Text, numbers, and characters',
    icon: 'Type',
    color: 'blue',
    defaultConfig: {
      max_length: 255,
    },
  },
  [FIELD_TYPES.NUMBER]: {
    label: 'Number',
    description: 'Numeric values with optional precision',
    icon: 'Hash',
    color: 'green',
    defaultConfig: {
      precision: 10,
      scale: 2,
    },
  },
  [FIELD_TYPES.DATE]: {
    label: 'Date',
    description: 'Date and timestamp values',
    icon: 'Calendar',
    color: 'purple',
    defaultConfig: {
      format: 'YYYY-MM-DD',
    },
  },
  [FIELD_TYPES.BOOLEAN]: {
    label: 'Boolean',
    description: 'True/false values',
    icon: 'ToggleLeft',
    color: 'orange',
    defaultConfig: {},
  },
} as const

// Table status constants
export const TABLE_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  DELETED: 'deleted',
} as const

export type TableStatus = (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS]

export const TABLE_STATUS_INFO = {
  [TABLE_STATUS.DRAFT]: {
    label: 'Draft',
    description: 'Table is being designed',
    color: 'gray',
    icon: 'Edit',
  },
  [TABLE_STATUS.ACTIVE]: {
    label: 'Active',
    description: 'Table is deployed and ready for use',
    color: 'green',
    icon: 'CheckCircle',
  },
  [TABLE_STATUS.DEPRECATED]: {
    label: 'Deprecated',
    description: 'Table is marked for removal',
    color: 'yellow',
    icon: 'AlertTriangle',
  },
  [TABLE_STATUS.DELETED]: {
    label: 'Deleted',
    description: 'Table has been deleted',
    color: 'red',
    icon: 'Trash2',
  },
} as const

// Relationship types
export const RELATIONSHIP_TYPES = {
  ONE_TO_MANY: 'one_to_many',
} as const

export type RelationshipType = (typeof RELATIONSHIP_TYPES)[keyof typeof RELATIONSHIP_TYPES]

export const RELATIONSHIP_TYPE_INFO = {
  [RELATIONSHIP_TYPES.ONE_TO_MANY]: {
    label: 'One to Many',
    description:
      'One record in the source table can be related to many records in the target table',
    icon: 'ArrowRight',
    color: 'blue',
  },
} as const

// Cascade options for relationships
export const CASCADE_OPTIONS = {
  ON_DELETE: {
    CASCADE: 'cascade',
    RESTRICT: 'restrict',
    SET_NULL: 'set_null',
  },
  ON_UPDATE: {
    CASCADE: 'cascade',
    RESTRICT: 'restrict',
  },
} as const

export type OnDeleteOption =
  (typeof CASCADE_OPTIONS.ON_DELETE)[keyof typeof CASCADE_OPTIONS.ON_DELETE]
export type OnUpdateOption =
  (typeof CASCADE_OPTIONS.ON_UPDATE)[keyof typeof CASCADE_OPTIONS.ON_UPDATE]

export const CASCADE_OPTION_INFO = {
  [`DELETE_${CASCADE_OPTIONS.ON_DELETE.CASCADE}`]: {
    label: 'Cascade',
    description: 'Delete related records when the source record is deleted',
  },
  [`DELETE_${CASCADE_OPTIONS.ON_DELETE.RESTRICT}`]: {
    label: 'Restrict',
    description: 'Prevent deletion if related records exist',
  },
  [`DELETE_${CASCADE_OPTIONS.ON_DELETE.SET_NULL}`]: {
    label: 'Set Null',
    description: 'Set foreign key to null when source record is deleted',
  },
  [`UPDATE_${CASCADE_OPTIONS.ON_UPDATE.CASCADE}`]: {
    label: 'Cascade',
    description: 'Update related records when the source record is updated',
  },
  [`UPDATE_${CASCADE_OPTIONS.ON_UPDATE.RESTRICT}`]: {
    label: 'Restrict',
    description: 'Prevent update if it would break relationships',
  },
} as const

// Lock types for collaboration
export const LOCK_TYPES = {
  OPTIMISTIC: 'optimistic',
  PESSIMISTIC: 'pessimistic',
  CRITICAL: 'critical',
} as const

export type LockType = (typeof LOCK_TYPES)[keyof typeof LOCK_TYPES]

export const LOCK_TYPE_INFO = {
  [LOCK_TYPES.OPTIMISTIC]: {
    label: 'Optimistic',
    description: 'Short-term lock for field edits',
    defaultDuration: 15, // minutes
    color: 'blue',
  },
  [LOCK_TYPES.PESSIMISTIC]: {
    label: 'Pessimistic',
    description: 'Long-term lock for schema changes',
    defaultDuration: 60, // minutes
    color: 'orange',
  },
  [LOCK_TYPES.CRITICAL]: {
    label: 'Critical',
    description: 'Lock for breaking changes',
    defaultDuration: 120, // minutes
    color: 'red',
  },
} as const

// Canvas configuration
export const CANVAS_CONFIG = {
  DEFAULT_ZOOM: 1,
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 3,
  ZOOM_STEP: 0.1,
  GRID_SIZE: 20,
  TABLE_MIN_WIDTH: 200,
  TABLE_MIN_HEIGHT: 100,
  TABLE_DEFAULT_WIDTH: 250,
  TABLE_DEFAULT_HEIGHT: 150,
  FIELD_HEIGHT: 32,
  FIELD_PADDING: 8,
  TABLE_HEADER_HEIGHT: 40,
  TABLE_FOOTER_HEIGHT: 32,
  RELATIONSHIP_LINE_WIDTH: 2,
  RELATIONSHIP_ARROW_SIZE: 8,
  CANVAS_PADDING: 50,
} as const

// Validation limits
export const VALIDATION_LIMITS = {
  TABLE_NAME_MAX_LENGTH: 63,
  FIELD_NAME_MAX_LENGTH: 63,
  DISPLAY_NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  RELATIONSHIP_NAME_MAX_LENGTH: 100,
  LOCK_REASON_MAX_LENGTH: 200,
  TEXT_FIELD_MAX_LENGTH: 65535,
  NUMBER_FIELD_MAX_PRECISION: 65,
  NUMBER_FIELD_MAX_SCALE: 30,
  TABLES_PER_PROJECT_MAX: 20,
  FIELDS_PER_TABLE_MAX: 50,
  RELATIONSHIPS_PER_TABLE_MAX: 20,
  LOCK_DURATION_MAX_MINUTES: 1440, // 24 hours
} as const

// Default values
export const DEFAULT_VALUES = {
  TABLE_POSITION: { x: 100, y: 100 },
  TABLE_STATUS: TABLE_STATUS.DRAFT,
  FIELD_REQUIRED: false,
  FIELD_SORT_ORDER: 0,
  RELATIONSHIP_STATUS: 'active',
  CASCADE_ON_DELETE: CASCADE_OPTIONS.ON_DELETE.RESTRICT,
  CASCADE_ON_UPDATE: CASCADE_OPTIONS.ON_UPDATE.CASCADE,
  LOCK_DURATION: 30, // minutes
  GRID_SNAPPING: true,
  CANVAS_ZOOM: 1,
  CANVAS_PAN: { x: 0, y: 0 },
  PAGINATION_PAGE: 1,
  PAGINATION_LIMIT: 20,
  PAGINATION_LIMIT_MAX: 100,
} as const

// Database configuration
export const DATABASE_CONFIG = {
  // PostgreSQL type mappings
  TYPE_MAPPINGS: {
    [FIELD_TYPES.TEXT]: {
      type: 'VARCHAR',
      defaultLength: 255,
      maxLength: 65535,
    },
    [FIELD_TYPES.NUMBER]: {
      type: 'DECIMAL',
      defaultPrecision: 10,
      defaultScale: 2,
      maxPrecision: 65,
      maxScale: 30,
    },
    [FIELD_TYPES.DATE]: {
      type: 'TIMESTAMP',
      defaultFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    [FIELD_TYPES.BOOLEAN]: {
      type: 'BOOLEAN',
    },
  },
  // Reserved keywords that cannot be used as table or field names
  RESERVED_KEYWORDS: [
    'SELECT',
    'FROM',
    'WHERE',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
    'TABLE',
    'INDEX',
    'PRIMARY',
    'FOREIGN',
    'KEY',
    'REFERENCES',
    'UNIQUE',
    'NOT',
    'NULL',
    'DEFAULT',
    'CHECK',
    'CONSTRAINT',
    'UNION',
    'JOIN',
    'INNER',
    'OUTER',
    'LEFT',
    'RIGHT',
    'GROUP',
    'BY',
    'ORDER',
    'HAVING',
    'LIMIT',
    'OFFSET',
    'AND',
    'OR',
    'IN',
    'EXISTS',
    'BETWEEN',
    'LIKE',
    'ILIKE',
    'IS',
    'NULLS',
    'FIRST',
    'LAST',
    'ASC',
    'DESC',
    'DISTINCT',
    'ALL',
    'ANY',
    'SOME',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'CAST',
    'AS',
    'TRUE',
    'FALSE',
    'UNKNOWN',
    'NULL',
    'CURRENT_DATE',
    'CURRENT_TIME',
    'CURRENT_TIMESTAMP',
    'USER',
    'CURRENT_USER',
    'SESSION_USER',
    'SYSTEM_USER',
    'DATABASE',
    'SCHEMA',
    'TABLE',
    'COLUMN',
    'INDEX',
    'SEQUENCE',
    'TRIGGER',
    'VIEW',
    'FUNCTION',
    'PROCEDURE',
  ],
} as const

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Debounce times (in milliseconds)
  DEBOUNCE_FIELD_UPDATE: 1000,
  DEBOUNCE_TABLE_POSITION_UPDATE: 100,
  DEBOUNCE_AUTO_SAVE: 5000,

  // Throttle times (in milliseconds)
  THROTTLE_CANVAS_RENDER: 16, // ~60fps
  THROTTLE_RELATIONSHIP_RENDER: 50,

  // Cache times (in milliseconds)
  CACHE_TABLE_DATA: 300000, // 5 minutes
  CACHE_RELATIONSHIP_DATA: 300000, // 5 minutes
  CACHE_LOCK_DATA: 60000, // 1 minute

  // Virtualization thresholds
  VIRTUALIZE_TABLES_COUNT: 50,
  VIRTUALIZE_FIELDS_COUNT: 20,

  // Lazy loading thresholds
  LAZY_LOAD_RELATIONSHIPS_COUNT: 100,
} as const

// UI Configuration
export const UI_CONFIG = {
  // Animation durations (in milliseconds)
  ANIMATION_DURATION_FAST: 150,
  ANIMATION_DURATION_NORMAL: 300,
  ANIMATION_DURATION_SLOW: 500,

  // Modal dimensions
  MODAL_MIN_WIDTH: 400,
  MODAL_MAX_WIDTH: 800,
  MODAL_MIN_HEIGHT: 300,
  MODAL_MAX_HEIGHT: 600,

  // Sidebar widths
  SIDEBAR_WIDTH_MIN: 250,
  SIDEBAR_WIDTH_DEFAULT: 300,
  SIDEBAR_WIDTH_MAX: 400,

  // Panel sizes
  PROPERTIES_PANEL_WIDTH: 300,
  COMPONENT_PANEL_WIDTH: 280,

  // Colors (CSS variables)
  COLORS: {
    PRIMARY: 'hsl(221, 83%, 53%)',
    PRIMARY_FOREGROUND: 'hsl(210, 40%, 98%)',
    SECONDARY: 'hsl(210, 40%, 96%)',
    SECONDARY_FOREGROUND: 'hsl(222.2, 84%, 4.9%)',
    MUTED: 'hsl(210, 40%, 96%)',
    MUTED_FOREGROUND: 'hsl(215.4, 16.3%, 46.9%)',
    ACCENT: 'hsl(210, 40%, 96%)',
    ACCENT_FOREGROUND: 'hsl(222.2, 84%, 4.9%)',
    DESTRUCTIVE: 'hsl(0, 84.2%, 60.2%)',
    DESTRUCTIVE_FOREGROUND: 'hsl(210, 40%, 98%)',
    BORDER: 'hsl(214.3, 31.8%, 91.4%)',
    INPUT: 'hsl(214.3, 31.8%, 91.4%)',
    RING: 'hsl(221, 83%, 53%)',
    CHART_1: 'hsl(12, 76%, 61%)',
    CHART_2: 'hsl(173, 58%, 39%)',
    CHART_3: 'hsl(197, 37%, 24%)',
    CHART_4: 'hsl(43, 74%, 66%)',
    CHART_5: 'hsl(27, 87%, 67%)',
  },

  // Icon sizes
  ICON_SIZES: {
    XS: 12,
    SM: 16,
    MD: 20,
    LG: 24,
    XL: 32,
  },

  // Breakpoints
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  },
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_REALTIME_COLLABORATION: false,
  ENABLE_AUTO_LAYOUT: false,
  ENABLE_ADVANCED_VALIDATION: true,
  ENABLE_EXPORT_IMPORT: false,
  ENABLE_SCHEMA_HISTORY: false,
  ENABLE_ADVANCED_RELATIONSHIPS: false,
  ENABLE_PERFORMANCE_MONITORING: false,
} as const

// API configuration
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_BACKOFF_MULTIPLIER: 2,
  RETRY_MAX_DELAY: 10000, // 10 seconds
} as const

// Development configuration
export const DEV_CONFIG = {
  ENABLE_DEBUG_LOGGING: process.env.NODE_ENV === 'development',
  ENABLE_PERFORMANCE_MONITORING: false,
  ENABLE_MOCK_DATA: false,
  LOG_LEVEL: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
} as const

// Regular expressions
export const REGEX_PATTERNS = {
  TABLE_NAME: /^[a-z][a-z0-9_]*$/,
  FIELD_NAME: /^[a-z][a-z0-9_]*$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
} as const

// Helper functions
export const isReservedKeyword = (name: string): boolean => {
  const upperName = name.toUpperCase()
  return DATABASE_CONFIG.RESERVED_KEYWORDS.some(keyword => keyword === upperName)
}

export const isValidTableName = (name: string): boolean => {
  return REGEX_PATTERNS.TABLE_NAME.test(name) && !isReservedKeyword(name)
}

export const isValidFieldName = (name: string): boolean => {
  return REGEX_PATTERNS.FIELD_NAME.test(name) && !isReservedKeyword(name)
}

export const getDefaultFieldConfig = (fieldType: FieldType): Record<string, unknown> => {
  return FIELD_TYPE_INFO[fieldType].defaultConfig
}

export const getLockDuration = (lockType: LockType): number => {
  return LOCK_TYPE_INFO[lockType].defaultDuration
}

export const getPostgresType = (fieldType: FieldType, config?: Record<string, unknown>): string => {
  switch (fieldType) {
    case FIELD_TYPES.TEXT:
      const maxLength = (config?.max_length as number) || 255
      return `VARCHAR(${Math.min(maxLength, 65535)})`

    case FIELD_TYPES.NUMBER:
      const precision = (config?.precision as number) || 10
      const scale = (config?.scale as number) || 2
      return `DECIMAL(${precision},${scale})`

    case FIELD_TYPES.DATE:
      return 'TIMESTAMP'

    case FIELD_TYPES.BOOLEAN:
      return 'BOOLEAN'

    default:
      throw new Error(`Unsupported field type: ${fieldType}`)
  }
}

const designerConstants = {
  // Constants
  APP_NAME,
  APP_VERSION,
  FIELD_TYPES,
  FIELD_TYPE_INFO,
  TABLE_STATUS,
  TABLE_STATUS_INFO,
  RELATIONSHIP_TYPES,
  RELATIONSHIP_TYPE_INFO,
  CASCADE_OPTIONS,
  CASCADE_OPTION_INFO,
  LOCK_TYPES,
  LOCK_TYPE_INFO,
  CANVAS_CONFIG,
  VALIDATION_LIMITS,
  DEFAULT_VALUES,
  DATABASE_CONFIG,
  PERFORMANCE_CONFIG,
  UI_CONFIG,
  FEATURE_FLAGS,
  API_CONFIG,
  DEV_CONFIG,
  REGEX_PATTERNS,

  // Helper functions
  isReservedKeyword,
  isValidTableName,
  isValidFieldName,
  getDefaultFieldConfig,
  getLockDuration,
  getPostgresType,
}

export default designerConstants
