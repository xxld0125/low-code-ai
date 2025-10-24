import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  useAnnouncer,
  useSkipLinks,
  useHighContrastMode,
  useReducedMotion,
  useScreenReader,
  useFocusVisible,
} from '@/lib/designer/accessibility'

/**
 * Accessibility context
 */
interface AccessibilityContextType {
  // Focus management
  trapFocus: (element: HTMLElement) => () => void
  restoreFocus: () => void

  // Screen reader announcements
  announce: (message: string, priority?: 'polite' | 'assertive') => void

  // Skip links
  skipLinks: Array<{ id: string; label: string; target: string }>
  addSkipLink: (id: string, label: string, target: string) => void
  removeSkipLink: (id: string) => void

  // Accessibility preferences
  isHighContrast: boolean
  prefersReducedMotion: boolean
  hasScreenReader: boolean
  isFocusVisible: boolean

  // Accessibility helpers
  generateId: (prefix: string) => string
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null)

/**
 * Accessibility provider component
 */
export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  // Screen reader announcements
  const { announce, announcerRef } = useAnnouncer()

  // Skip links
  const { skipLinks, addSkipLink, removeSkipLink, handleSkipLinkClick } = useSkipLinks()

  // Accessibility preferences
  const isHighContrast = useHighContrastMode()
  const prefersReducedMotion = useReducedMotion()
  const hasScreenReader = useScreenReader()
  const isFocusVisible = useFocusVisible()

  // Focus management
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // ID generation
  const idCounter = useRef(0)

  const trapFocus = (element: HTMLElement) => {
    previousFocusRef.current = document.activeElement as HTMLElement

    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return () => {}

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTabKey)
    firstElement.focus()

    return () => {
      element.removeEventListener('keydown', handleTabKey)
      if (previousFocusRef.current) {
        previousFocusRef.current.focus()
      }
    }
  }

  const restoreFocus = () => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus()
    }
  }

  const generateId = (prefix: string) => {
    return `${prefix}-${++idCounter.current}`
  }

  const contextValue: AccessibilityContextType = {
    trapFocus,
    restoreFocus,
    announce,
    skipLinks,
    addSkipLink,
    removeSkipLink,
    isHighContrast,
    prefersReducedMotion,
    hasScreenReader,
    isFocusVisible,
    generateId,
  }

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {/* Skip links */}
      {skipLinks.length > 0 && (
        <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
          {skipLinks.map(link => (
            <a
              key={link.id}
              href={`#${link.target}`}
              onClick={(e) => {
                e.preventDefault()
                handleSkipLinkClick(link.target)
              }}
              className="block bg-background border border-border px-4 py-2 mb-2 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* Screen reader announcer */}
      <div
        ref={announcerRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Accessibility classes */}
      <div
        className={cn(
          'transition-all',
          prefersReducedMotion && 'transition-none',
          isHighContrast && 'high-contrast'
        )}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

/**
 * Accessible button component
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  loadingText?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props
}: AccessibleButtonProps) {
  const { announce } = useAccessibility()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return

    // Announce action for screen readers
    if (typeof children === 'string') {
      announce(`Activated ${children}`)
    }

    props.onClick?.(e)
  }

  const getVariantClasses = () => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    }

    return cn(baseClasses, variants[variant], sizes[size], className)
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      className={getVariantClasses()}
      aria-disabled={disabled || loading}
      aria-describedby={loading ? `${props.id || 'button'}-loading` : props['aria-describedby']}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
        </div>
      )}

      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2" aria-hidden="true">{icon}</span>
      )}

      <span className={loading ? 'sr-only' : undefined}>
        {loading && loadingText ? loadingText : children}
      </span>

      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2" aria-hidden="true">{icon}</span>
      )}

      {loading && (
        <span id={`${props.id || 'button'}-loading`} className="sr-only" role="status" aria-live="polite">
          {loadingText || 'Loading...'}
        </span>
      )}
    </button>
  )
}

/**
 * Accessible form field component
 */
interface AccessibleFieldProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: React.ReactElement
}

export function AccessibleField({
  label,
  error,
  hint,
  required = false,
  children,
}: AccessibleFieldProps) {
  const { generateId } = useAccessibility()
  const fieldId = generateId('field')
  const errorId = generateId('error')
  const hintId = generateId('hint')

  const clonedChild = React.cloneElement(children, {
    'aria-invalid': !!error,
    'aria-describedby': [
      hint ? hintId : null,
      error ? errorId : null,
    ].filter(Boolean).join(' '),
    'aria-required': required,
  } as React.HTMLAttributes<HTMLElement>)

  return (
    <div className="space-y-2">
      <label
        htmlFor={fieldId}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}

      {clonedChild}

      {error && (
        <p
          id={errorId}
          className="text-xs text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Accessible modal component
 */
interface AccessibleModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  description,
  children,
}: AccessibleModalProps) {
  const { trapFocus, announce, generateId } = useAccessibility()
  const modalRef = useRef<HTMLDivElement>(null)
  const titleId = generateId('modal-title')
  const descriptionId = generateId('modal-description')

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const restoreFocus = trapFocus(modalRef.current)
      announce(`Modal opened: ${title}`)

      return () => {
        restoreFocus()
        announce('Modal closed')
      }
    }
  }, [isOpen, title, trapFocus, announce])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative bg-background rounded-lg shadow-lg border max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-muted"
            aria-label="Close modal"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {description && (
          <p id={descriptionId} className="px-6 pt-4 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

/**
 * Accessible tooltip component
 */
interface AccessibleTooltipProps {
  content: string
  children: React.ReactElement
  placement?: 'top' | 'bottom' | 'left' | 'right'
}

export function AccessibleTooltip({
  content,
  children,
  placement = 'top',
}: AccessibleTooltipProps) {
  const { generateId } = useAccessibility()
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = generateId('tooltip')

  const clonedChild = React.cloneElement(children, {
    'aria-describedby': isVisible ? tooltipId : undefined,
    onMouseEnter: () => setIsVisible(true),
    onMouseLeave: () => setIsVisible(false),
    onFocus: () => setIsVisible(true),
    onBlur: () => setIsVisible(false),
  } as React.HTMLAttributes<HTMLElement>)

  return (
    <>
      {clonedChild}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-50 px-2 py-1 text-xs text-white bg-gray-900 rounded shadow-sm',
            'animate-in fade-in-0 zoom-in-95',
            placement === 'top' && 'bottom-full mb-2',
            placement === 'bottom' && 'top-full mt-2',
            placement === 'left' && 'right-full mr-2',
            placement === 'right' && 'left-full ml-2',
          )}
        >
          {content}
        </div>
      )}
    </>
  )
}

/**
 * Utility function for className merging with accessibility
 */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}