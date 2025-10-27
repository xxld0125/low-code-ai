import React, { memo, useMemo, useCallback, useRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Custom hook for debounced state management
 */
function useDebouncedState<T>(initialValue: T, delay: number): [T, T, (value: T) => void] {
  const [localValue, setLocalValue] = useState<T>(initialValue)
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(localValue)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [localValue, delay])

  return [localValue, debouncedValue, setLocalValue]
}

/**
 * Memoized table field item component
 */
interface TableFieldItemProps {
  field: {
    id: string
    name: string
    field_name: string
    data_type: string
    is_required: boolean
    default_value?: string
  }
  isSelected?: boolean
  onSelect?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export const TableFieldItem = memo<TableFieldItemProps>(
  ({ field, isSelected = false, onSelect, onEdit, onDelete }) => {
    const handleClick = useCallback(() => {
      onSelect?.(field.id)
    }, [field.id, onSelect])

    const handleEdit = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onEdit?.(field.id)
      },
      [field.id, onEdit]
    )

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onDelete?.(field.id)
      },
      [field.id, onDelete]
    )

    return (
      <div
        className={cn(
          'cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50',
          isSelected && 'border-primary bg-primary/5'
        )}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <div className="flex items-start justify-between">
          <div className="flex flex-1 items-start gap-3">
            <div className="mt-0.5">
              <FieldTypeIcon type={field.data_type} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <p className="truncate text-sm font-medium">{field.name}</p>
                {field.is_required && (
                  <span className="text-xs text-muted-foreground">Required</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-muted px-1 py-0.5 text-xs">{field.field_name}</code>
                <span className="text-xs text-muted-foreground">{field.data_type}</span>
              </div>
              {field.default_value && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Default:{' '}
                  <code className="rounded bg-muted px-1 py-0.5">{field.default_value}</code>
                </p>
              )}
            </div>
          </div>
          <div className="ml-2 flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="h-7 w-7 rounded p-0 hover:bg-muted"
              aria-label={`Edit field ${field.name}`}
            >
              <EditIcon className="h-3 w-3" />
            </button>
            <button
              onClick={handleDelete}
              className="h-7 w-7 rounded p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Delete field ${field.name}`}
            >
              <DeleteIcon className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

TableFieldItem.displayName = 'TableFieldItem'

/**
 * Field type icon component
 */
function FieldTypeIcon({ type }: { type: string }) {
  const icons = {
    text: <TypeIcon className="h-4 w-4 text-blue-500" />,
    number: <NumberIcon className="h-4 w-4 text-green-500" />,
    date: <DateIcon className="h-4 w-4 text-purple-500" />,
    boolean: <BooleanIcon className="h-4 w-4 text-orange-500" />,
  }

  return icons[type as keyof typeof icons] || <DefaultIcon className="h-4 w-4 text-gray-500" />
}

// Icon components (simplified for example)
function TypeIcon({ className }: { className?: string }) {
  return <div className={className}>T</div>
}

function NumberIcon({ className }: { className?: string }) {
  return <div className={className}>#</div>
}

function DateIcon({ className }: { className?: string }) {
  return <div className={className}>D</div>
}

function BooleanIcon({ className }: { className?: string }) {
  return <div className={className}>B</div>
}

function DefaultIcon({ className }: { className?: string }) {
  return <div className={className}>?</div>
}

function EditIcon({ className }: { className?: string }) {
  return <div className={className}>✏️</div>
}

function DeleteIcon({ className }: { className?: string }) {
  return <div className={className}>🗑️</div>
}

/**
 * Virtualized field list component
 */
interface VirtualizedFieldListProps {
  fields: Array<{
    id: string
    name: string
    field_name: string
    data_type: string
    is_required: boolean
    default_value?: string
  }>
  selectedFieldId?: string
  onFieldSelect?: (id: string) => void
  onFieldEdit?: (id: string) => void
  onFieldDelete?: (id: string) => void
  height?: number
}

export const VirtualizedFieldList = memo<VirtualizedFieldListProps>(
  ({ fields, selectedFieldId, onFieldSelect, onFieldEdit, onFieldDelete, height = 400 }) => {
    if (fields.length === 0) {
      return (
        <div className="flex items-center justify-center p-8 text-center text-muted-foreground">
          <div>
            <div className="mb-2 text-lg font-medium">No fields yet</div>
            <div className="text-sm">Add your first field to get started</div>
          </div>
        </div>
      )
    }

    return (
      <div style={{ height }} className="overflow-y-auto">
        {fields.map(field => (
          <div key={field.id} style={{ minHeight: 80 }}>
            <TableFieldItem
              field={field}
              isSelected={field.id === selectedFieldId}
              onSelect={onFieldSelect}
              onEdit={onFieldEdit}
              onDelete={onFieldDelete}
            />
          </div>
        ))}
      </div>
    )
  }
)

VirtualizedFieldList.displayName = 'VirtualizedFieldList'

/**
 * Optimized search component
 */
interface OptimizedSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

export const OptimizedSearch = memo<OptimizedSearchProps>(
  ({ value, onChange, placeholder = 'Search...', debounceMs = 300, className }) => {
    const [localValue, debouncedValue, setLocalValue] = useDebouncedState(value, debounceMs)

    useEffect(() => {
      onChange(debouncedValue)
    }, [debouncedValue, onChange])

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value)
      },
      [setLocalValue]
    )

    return (
      <div className="relative">
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
        />
        {localValue && (
          <button
            onClick={() => setLocalValue('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <ClearIcon className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)

OptimizedSearch.displayName = 'OptimizedSearch'

function ClearIcon({ className }: { className?: string }) {
  return <div className={className}>✕</div>
}

/**
 * Optimized filter component
 */
interface FilterOption {
  value: string
  label: string
  count?: number
}

interface OptimizedFilterProps {
  options: FilterOption[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export const OptimizedFilter = memo<OptimizedFilterProps>(
  ({ options, selectedValues, onChange, placeholder = 'Filter...', className }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const dropdownRef = useRef<HTMLDivElement>(null)

    const filteredOptions = useMemo(() => {
      return options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
    }, [options, searchTerm])

    const handleToggle = useCallback(
      (value: string) => {
        const newValues = selectedValues.includes(value)
          ? selectedValues.filter(v => v !== value)
          : [...selectedValues, value]
        onChange(newValues)
      },
      [selectedValues, onChange]
    )

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-left text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <div className="flex items-center justify-between">
            <span className="truncate">
              {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
            </span>
            <ChevronIcon className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search options..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>

            <div className="max-h-60 overflow-y-auto p-2">
              {filteredOptions.length === 0 ? (
                <div className="py-2 text-center text-sm text-muted-foreground">
                  No options found
                </div>
              ) : (
                filteredOptions.map(option => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={() => handleToggle(option.value)}
                      className="rounded"
                    />
                    <span className="flex-1 text-sm">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </label>
                ))
              )}
            </div>

            {selectedValues.length > 0 && (
              <div className="border-t p-2">
                <button
                  onClick={() => onChange([])}
                  className="text-sm text-destructive hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

OptimizedFilter.displayName = 'OptimizedFilter'

function ChevronIcon({ className }: { className?: string }) {
  return <div className={className}>▼</div>
}

/**
 * Optimized pagination component
 */
interface OptimizedPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  pageSize: number
  totalItems: number
  className?: string
}

export const OptimizedPagination = memo<OptimizedPaginationProps>(
  ({ currentPage, totalPages, onPageChange, pageSize, totalItems, className }) => {
    const visiblePages = useMemo(() => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i)
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages)
      } else {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index)
    }, [currentPage, totalPages])

    const handlePageChange = useCallback(
      (page: number) => {
        if (page >= 1 && page <= totalPages) {
          onPageChange(page)
        }
      },
      [onPageChange, totalPages]
    )

    const startItem = (currentPage - 1) * pageSize + 1
    const endItem = Math.min(currentPage * pageSize, totalItems)

    return (
      <div className={cn('flex items-center justify-between', className)}>
        <div className="text-sm text-muted-foreground">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded p-2 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <PrevIcon className="h-4 w-4" />
          </button>

          {visiblePages.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 text-muted-foreground">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={cn(
                    'rounded px-3 py-1 text-sm',
                    currentPage === page ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                  aria-label={`Go to page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded p-2 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <NextIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }
)

OptimizedPagination.displayName = 'OptimizedPagination'

function PrevIcon({ className }: { className?: string }) {
  return <div className={className}>‹</div>
}

function NextIcon({ className }: { className?: string }) {
  return <div className={className}>›</div>
}
