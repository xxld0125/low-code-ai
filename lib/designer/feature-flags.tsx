import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Feature flag definitions
 */
export interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage?: number
  conditions?: FeatureFlagCondition[]
  metadata?: Record<string, unknown>
}

export interface FeatureFlagCondition {
  type: 'user_id' | 'user_email' | 'user_role' | 'project_id' | 'environment' | 'custom'
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'in' | 'not_in'
  value: string | string[] | number
}

/**
 * Feature flag context
 */
interface FeatureFlagContextType {
  flags: Record<string, boolean>
  isLoading: boolean
  error: string | null
  isEnabled: (key: string) => boolean
  getFlag: (key: string) => FeatureFlag | undefined
  updateFlag: (key: string, enabled: boolean) => void
  reloadFlags: () => Promise<void>
}

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null)

/**
 * Feature flag provider props
 */
interface FeatureFlagProviderProps {
  children: ReactNode
  apiUrl?: string
  enableDebugMode?: boolean
  userId?: string
  userEmail?: string
  userRole?: string
  projectId?: string
  environment?: 'development' | 'staging' | 'production'
}

/**
 * Default feature flags for the data model designer
 */
const DEFAULT_FEATURE_FLAGS: Record<string, Omit<FeatureFlag, 'key'>> = {
  // Core features
  DATA_MODEL_DESIGNER: {
    name: 'Data Model Designer',
    description: 'Main data model designer functionality',
    enabled: true,
    rolloutPercentage: 100,
  },

  // Collaboration features
  TABLE_LOCKING: {
    name: 'Table Locking',
    description: 'Collaborative table locking mechanism',
    enabled: true,
    rolloutPercentage: 100,
  },
  CONFLICT_DETECTION: {
    name: 'Conflict Detection',
    description: 'Real-time conflict detection and resolution',
    enabled: true,
    rolloutPercentage: 100,
  },
  COLLABORATIVE_EDITING: {
    name: 'Collaborative Editing',
    description: 'Real-time collaborative editing with cursors',
    enabled: false,
    rolloutPercentage: 0,
  },

  // Advanced features
  RELATIONSHIP_MANAGEMENT: {
    name: 'Relationship Management',
    description: 'Advanced relationship creation and management',
    enabled: true,
    rolloutPercentage: 100,
  },
  API_GENERATION: {
    name: 'API Generation',
    description: 'Automatic CRUD API endpoint generation',
    enabled: true,
    rolloutPercentage: 100,
  },
  SCHEMA_VALIDATION: {
    name: 'Schema Validation',
    description: 'Advanced schema validation and error checking',
    enabled: true,
    rolloutPercentage: 100,
  },

  // Performance features
  VIRTUAL_SCROLLING: {
    name: 'Virtual Scrolling',
    description: 'Virtual scrolling for large datasets',
    enabled: true,
    rolloutPercentage: 100,
  },
  LAZY_LOADING: {
    name: 'Lazy Loading',
    description: 'Lazy loading of components and data',
    enabled: true,
    rolloutPercentage: 100,
  },
  PERFORMANCE_OPTIMIZATIONS: {
    name: 'Performance Optimizations',
    description: 'Advanced performance optimizations',
    enabled: true,
    rolloutPercentage: 100,
  },

  // UI/UX features
  RESPONSIVE_DESIGN: {
    name: 'Responsive Design',
    description: 'Mobile-friendly responsive design',
    enabled: true,
    rolloutPercentage: 100,
  },
  ACCESSIBILITY_MODE: {
    name: 'Accessibility Mode',
    description: 'Enhanced accessibility features',
    enabled: true,
    rolloutPercentage: 100,
  },
  DARK_MODE: {
    name: 'Dark Mode',
    description: 'Dark theme support',
    enabled: true,
    rolloutPercentage: 100,
  },

  // Experimental features
  AI_SUGGESTIONS: {
    name: 'AI Suggestions',
    description: 'AI-powered field and relationship suggestions',
    enabled: false,
    rolloutPercentage: 10,
  },
  VISUAL_QUERY_BUILDER: {
    name: 'Visual Query Builder',
    description: 'Visual query builder for data exploration',
    enabled: false,
    rolloutPercentage: 0,
  },
  DATA_MIGRATION: {
    name: 'Data Migration',
    description: 'Automated data migration tools',
    enabled: false,
    rolloutPercentage: 5,
  },

  // Beta features
  MULTI_LANGUAGE: {
    name: 'Multi-Language Support',
    description: 'Support for multiple languages',
    enabled: false,
    rolloutPercentage: 20,
  },
  IMPORT_EXPORT: {
    name: 'Import/Export',
    description: 'Import and export schemas',
    enabled: false,
    rolloutPercentage: 30,
  },
  VERSION_CONTROL: {
    name: 'Version Control',
    description: 'Schema version control and history',
    enabled: false,
    rolloutPercentage: 15,
  },
}

/**
 * Feature flag provider component
 */
export function FeatureFlagProvider({
  children,
  apiUrl = '/api/feature-flags',
  enableDebugMode = false,
  userId,
  userEmail,
  userRole,
  projectId,
  environment = 'production',
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [flagDefinitions, setFlagDefinitions] = useState<Record<string, FeatureFlag>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load feature flags
  const loadFlags = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to load from API first
      let apiFlags: Record<string, FeatureFlag> = {}

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(userId && { 'X-User-ID': userId }),
            ...(userEmail && { 'X-User-Email': userEmail }),
            ...(userRole && { 'X-User-Role': userRole }),
            ...(projectId && { 'X-Project-ID': projectId }),
          },
        })

        if (response.ok) {
          const data = await response.json()
          apiFlags = data.flags || {}
        }
      } catch {
        // API failed, fall back to local storage
        console.warn('Failed to load feature flags from API, using localStorage')
      }

      // Merge with default flags
      const mergedFlags: Record<string, FeatureFlag> = {}
      const enabledFlags: Record<string, boolean> = {}

      Object.entries(DEFAULT_FEATURE_FLAGS).forEach(([key, defaultFlag]) => {
        const apiFlag = apiFlags[key]
        const flag: FeatureFlag = {
          ...defaultFlag,
          ...apiFlag,
        }

        mergedFlags[key] = flag
        enabledFlags[key] = evaluateFlag(flag, {
          userId,
          userEmail,
          userRole,
          projectId,
          environment,
        })
      })

      // Also include any API-only flags
      Object.entries(apiFlags).forEach(([key, flag]) => {
        if (!DEFAULT_FEATURE_FLAGS[key]) {
          mergedFlags[key] = flag
          enabledFlags[key] = evaluateFlag(flag, {
            userId,
            userEmail,
            userRole,
            projectId,
            environment,
          })
        }
      })

      setFlagDefinitions(mergedFlags)
      setFlags(enabledFlags)

      // Store in localStorage for offline use
      localStorage.setItem('feature-flags', JSON.stringify({
        flags: mergedFlags,
        enabledFlags,
        timestamp: Date.now(),
      }))

      if (enableDebugMode) {
        console.log('Feature flags loaded:', mergedFlags)
        console.log('Enabled flags:', enabledFlags)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feature flags')
      console.error('Error loading feature flags:', err)

      // Fall back to cached flags
      try {
        const cached = localStorage.getItem('feature-flags')
        if (cached) {
          const { flags: cachedFlags, enabledFlags: cachedEnabled } = JSON.parse(cached)
          setFlagDefinitions(cachedFlags)
          setFlags(cachedEnabled)
        }
      } catch (cacheError) {
        console.error('Failed to load cached feature flags:', cacheError)
      }
    } finally {
      setIsLoading(false)
    }
  }, [userId, userEmail, userRole, projectId, environment, apiUrl, enableDebugMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Evaluate if a flag should be enabled for the current user
  const evaluateFlag = (
    flag: FeatureFlag,
    context: {
      userId?: string
      userEmail?: string
      userRole?: string
      projectId?: string
      environment?: string
    }
  ): boolean => {
    // If flag is explicitly disabled, return false
    if (!flag.enabled) {
      return false
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = hashCode(
        `${context.userId || 'anonymous'}-${flag.key}`
      )
      const shouldInclude = (hash % 100) < flag.rolloutPercentage

      if (!shouldInclude) {
        return false
      }
    }

    // Check conditions
    if (flag.conditions && flag.conditions.length > 0) {
      return flag.conditions.every(condition => {
        return evaluateCondition(condition, context)
      })
    }

    return true
  }

  // Evaluate a single condition
  const evaluateCondition = (
    condition: FeatureFlagCondition,
    context: {
      userId?: string
      userEmail?: string
      userRole?: string
      projectId?: string
      environment?: string
    }
  ): boolean => {
    let contextValue: string | undefined

    switch (condition.type) {
      case 'user_id':
        contextValue = context.userId
        break
      case 'user_email':
        contextValue = context.userEmail
        break
      case 'user_role':
        contextValue = context.userRole
        break
      case 'project_id':
        contextValue = context.projectId
        break
      case 'environment':
        contextValue = context.environment
        break
      default:
        return true
    }

    if (!contextValue) {
      return false
    }

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value
      case 'contains':
        return contextValue.includes(condition.value as string)
      case 'starts_with':
        return contextValue.startsWith(condition.value as string)
      case 'ends_with':
        return contextValue.endsWith(condition.value as string)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue)
      default:
        return true
    }
  }

  // Simple hash function for rollout
  const hashCode = (str: string): number => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  // Update a flag
  const updateFlag = async (key: string, enabled: boolean) => {
    try {
      const response = await fetch(`${apiUrl}/${key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      if (response.ok) {
        await loadFlags() // Reload all flags
      } else {
        throw new Error('Failed to update flag')
      }
    } catch (err) {
      console.error('Error updating feature flag:', err)
      setError(err instanceof Error ? err.message : 'Failed to update flag')
    }
  }

  // Check if a flag is enabled
  const isEnabled = (key: string): boolean => {
    return flags[key] || false
  }

  // Get flag definition
  const getFlag = (key: string): FeatureFlag | undefined => {
    return flagDefinitions[key]
  }

  // Load flags on mount
  useEffect(() => {
    loadFlags()
  }, [loadFlags, userId, userEmail, userRole, projectId, environment])

  // Set up periodic refresh (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(loadFlags, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadFlags, userId, userEmail, userRole, projectId, environment])

  const contextValue: FeatureFlagContextType = {
    flags,
    isLoading,
    error,
    isEnabled,
    getFlag,
    updateFlag,
    reloadFlags: loadFlags,
  }

  return (
    <FeatureFlagContext.Provider value={contextValue}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

/**
 * Hook to use feature flags
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}

/**
 * Hook to check if a specific feature is enabled
 */
export function useFeatureFlag(key: string): boolean {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(key)
}

/**
 * Hook to get feature flag details
 */
export function useFeatureFlagDetails(key: string): FeatureFlag | undefined {
  const { getFlag } = useFeatureFlags()
  return getFlag(key)
}

/**
 * Higher-order component for feature flags
 */
export function withFeatureFlag<P extends object>(
  Component: React.ComponentType<P>,
  flagKey: string,
  fallbackComponent?: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    const isEnabled = useFeatureFlag(flagKey)

    if (!isEnabled) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent
        return <FallbackComponent {...props} />
      }
      return null
    }

    return <Component {...props} />
  }
}

/**
 * Component for feature flag controlled rendering
 */
interface FeatureFlagWrapperProps {
  flagKey: string
  children: ReactNode
  fallback?: ReactNode
  loadingFallback?: ReactNode
}

export function FeatureFlagWrapper({
  flagKey,
  children,
  fallback = null,
  loadingFallback = null,
}: FeatureFlagWrapperProps) {
  const { isEnabled, isLoading } = useFeatureFlags()

  if (isLoading) {
    return <>{loadingFallback}</>
  }

  if (!isEnabled(flagKey)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * Debug component for feature flags (development only)
 */
export function FeatureFlagDebug() {
  const { flags, isLoading, error } = useFeatureFlags()
  const [isVisible, setIsVisible] = useState(false)

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-black/80 text-white p-2 rounded-lg text-xs"
      >
        🚩 Flags ({Object.values(flags).filter(Boolean).length})
      </button>

      {isVisible && (
        <div className="absolute bottom-10 right-0 w-96 bg-black/90 text-white p-4 rounded-lg text-xs max-h-96 overflow-y-auto">
          <h3 className="font-bold mb-2">Feature Flags</h3>

          {error && (
            <div className="bg-red-500/20 border border-red-500 p-2 rounded mb-2">
              Error: {error}
            </div>
          )}

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {Object.entries(flags).map(([key, flagValue]) => {
                const flag = DEFAULT_FEATURE_FLAGS[key as keyof typeof DEFAULT_FEATURE_FLAGS]
                if (!flag) return null

                return (
                  <div key={key} className="flex items-center justify-between p-2 border border-gray-700 rounded">
                    <div>
                      <div className="font-medium">{flag.name}</div>
                      <div className="text-gray-400">{flag.description}</div>
                      {flag.rolloutPercentage !== undefined && (
                        <div className="text-gray-400">Rollout: {flag.rolloutPercentage}%</div>
                      )}
                    </div>
                    <div className={cn(
                      'px-2 py-1 rounded text-xs',
                      flagValue ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    )}>
                      {flagValue ? 'ON' : 'OFF'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Utility function to check if a feature flag is enabled (for non-React code)
 */
export async function checkFeatureFlag(
  key: string,
  options: {
    apiUrl?: string
    userId?: string
    userEmail?: string
    userRole?: string
    projectId?: string
    environment?: string
  } = {}
): Promise<boolean> {
  const { apiUrl = '/api/feature-flags', ...context } = options

  try {
    const response = await fetch(`${apiUrl}/${key}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(context.userId && { 'X-User-ID': context.userId }),
        ...(context.userEmail && { 'X-User-Email': context.userEmail }),
        ...(context.userRole && { 'X-User-Role': context.userRole }),
        ...(context.projectId && { 'X-Project-ID': context.projectId }),
      },
    })

    if (response.ok) {
      const data = await response.json()
      return data.enabled || false
    }
  } catch (error) {
    console.error('Error checking feature flag:', error)
  }

  // Fall back to default flag
  const defaultFlag = DEFAULT_FEATURE_FLAGS[key]
  return defaultFlag?.enabled || false
}
