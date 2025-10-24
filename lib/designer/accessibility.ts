import { useEffect, useRef, useState } from 'react'

/**
 * Accessibility utility functions and hooks for WCAG 2.1 AA compliance
 */

/**
 * ARIA roles and properties
 */
export const ARIA_ROLES = {
  BUTTON: 'button',
  DIALOG: 'dialog',
  ALERT: 'alert',
  STATUS: 'status',
  FORM: 'form',
  TEXTBOX: 'textbox',
  COMBOBOX: 'combobox',
  LISTBOX: 'listbox',
  OPTION: 'option',
  GRID: 'grid',
  GRIDCELL: 'gridcell',
  ROW: 'row',
  ROWHEADER: 'rowheader',
  COLUMNHEADER: 'columnheader',
  TAB: 'tab',
  TABLIST: 'tablist',
  TABPANEL: 'tabpanel',
  TOOLBAR: 'toolbar',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  MENUITEMCHECKBOX: 'menuitemcheckbox',
  MENUITEMRADIO: 'menuitemradio',
  TREE: 'tree',
  TREEITEM: 'treeitem',
  TREEGRID: 'treegrid',
} as const

/**
 * ARIA live regions
 */
export const ARIA_LIVE_REGIONS = {
  POLITE: 'polite',
  ASSERTIVE: 'assertive',
  OFF: 'off',
} as const

/**
 * Keyboard navigation patterns
 */
export const KEYBOARD_NAVIGATION = {
  ARROW_KEYS: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'],
  NAVIGATION_KEYS: ['Home', 'End', 'PageUp', 'PageDown'],
  ACTION_KEYS: ['Enter', ' ', 'Escape'],
  TAB_KEYS: ['Tab'],
  MODIFIER_KEYS: ['Shift', 'Control', 'Alt', 'Meta'],
} as const

/**
 * Color contrast ratios for WCAG compliance
 */
export const COLOR_CONTRAST_RATIOS = {
  WCAG_AA_NORMAL: 4.5,
  WCAG_AA_LARGE: 3.0,
  WCAG_AAA_NORMAL: 7.0,
  WCAG_AAA_LARGE: 4.5,
} as const

/**
 * Focus management utilities
 */

/**
 * Hook to manage focus trap within a container
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    if (focusableElements.length === 0) return

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

    container.addEventListener('keydown', handleTabKey)

    // Focus first element when trap is activated
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }, [isActive])

  return containerRef
}

/**
 * Hook to manage focus restoration
 */
export function useFocusRestoration() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
      previousFocusRef.current.focus()
    }
  }

  return { saveFocus, restoreFocus }
}

/**
 * Keyboard navigation hooks
 */

/**
 * Hook to handle keyboard navigation in a list/grid
 */
export function useKeyboardNavigation(
  items: Array<{ id: string; element?: HTMLElement }>,
  options: {
    orientation?: 'horizontal' | 'vertical'
    loop?: boolean
    onSelectionChange?: (selectedId: string | null) => void
    onAction?: (selectedId: string) => void
  } = {}
) {
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const {
    orientation = 'vertical',
    loop = true,
    onSelectionChange,
    onAction,
  } = options

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isVertical = orientation === 'vertical'
    const incrementKey = isVertical ? 'ArrowDown' : 'ArrowRight'
    const decrementKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

    let newIndex = selectedIndex

    switch (e.key) {
      case incrementKey:
        e.preventDefault()
        newIndex = selectedIndex + 1
        if (newIndex >= items.length) {
          newIndex = loop ? 0 : items.length - 1
        }
        break

      case decrementKey:
        e.preventDefault()
        newIndex = selectedIndex - 1
        if (newIndex < 0) {
          newIndex = loop ? items.length - 1 : 0
        }
        break

      case 'Home':
        e.preventDefault()
        newIndex = 0
        break

      case 'End':
        e.preventDefault()
        newIndex = items.length - 1
        break

      case 'Enter':
      case ' ':
        e.preventDefault()
        if (selectedIndex >= 0 && onAction) {
          onAction(items[selectedIndex].id)
        }
        return

      case 'Escape':
        e.preventDefault()
        setSelectedIndex(-1)
        onSelectionChange?.(null)
        return

      default:
        return
    }

    if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < items.length) {
      setSelectedIndex(newIndex)
      onSelectionChange?.(items[newIndex].id)
      items[newIndex].element?.focus()
    }
  }

  const resetSelection = () => {
    setSelectedIndex(-1)
    onSelectionChange?.(null)
  }

  return {
    selectedIndex,
    selectedId: selectedIndex >= 0 ? items[selectedIndex]?.id : null,
    handleKeyDown,
    resetSelection,
    setSelectedIndex,
  }
}

/**
 * Screen reader announcements
 */

/**
 * Hook to manage screen reader announcements
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement>(null)

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority)
      announcerRef.current.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    }
  }

  return { announce, announcerRef }
}

/**
 * Color contrast utilities
 */

/**
 * Calculate relative luminance of a color
 */
export function calculateRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0

  const [r, g, b] = rgb.map(val => {
    val = val / 255
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const luminance1 = calculateRelativeLuminance(color1)
  const luminance2 = calculateRelativeLuminance(color2)

  const brightest = Math.max(luminance1, luminance2)
  const darkest = Math.min(luminance1, luminance2)

  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Check if color contrast meets WCAG AA standards
 */
export function checkWCAGCompliance(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): {
  ratio: number
  aa: boolean
  aaa: boolean
  level: 'fail' | 'aa' | 'aaa'
} {
  const ratio = calculateContrastRatio(foreground, background)
  const aaThreshold = isLargeText ? COLOR_CONTRAST_RATIOS.WCAG_AA_LARGE : COLOR_CONTRAST_RATIOS.WCAG_AA_NORMAL
  const aaaThreshold = isLargeText ? COLOR_CONTRAST_RATIOS.WCAG_AAA_LARGE : COLOR_CONTRAST_RATIOS.WCAG_AAA_NORMAL

  const aa = ratio >= aaThreshold
  const aaa = ratio >= aaaThreshold

  return {
    ratio,
    aa,
    aaa,
    level: aaa ? 'aaa' : aa ? 'aa' : 'fail',
  }
}

/**
 * Skip link utilities
 */

/**
 * Hook to manage skip links
 */
export function useSkipLinks() {
  const [skipLinks, setSkipLinks] = useState<Array<{
    id: string
    label: string
    target: string
  }>>([])

  const addSkipLink = (id: string, label: string, target: string) => {
    setSkipLinks(prev => [...prev, { id, label, target }])
  }

  const removeSkipLink = (id: string) => {
    setSkipLinks(prev => prev.filter(link => link.id !== id))
  }

  const handleSkipLinkClick = (targetId: string) => {
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.focus()
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return {
    skipLinks,
    addSkipLink,
    removeSkipLink,
    handleSkipLinkClick,
  }
}

/**
 * High contrast mode detection
 */

/**
 * Hook to detect high contrast mode
 */
export function useHighContrastMode() {
  const [isHighContrast, setIsHighContrast] = useState(false)

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      if (window.matchMedia('(forced-colors: active)').matches) {
        setIsHighContrast(true)
        return
      }

      // Check for prefers-contrast: more
      if (window.matchMedia('(prefers-contrast: more)').matches) {
        setIsHighContrast(true)
        return
      }

      setIsHighContrast(false)
    }

    checkHighContrast()

    const mediaQuery1 = window.matchMedia('(forced-colors: active)')
    const mediaQuery2 = window.matchMedia('(prefers-contrast: more)')

    const handleChange = () => checkHighContrast()

    mediaQuery1.addEventListener('change', handleChange)
    mediaQuery2.addEventListener('change', handleChange)

    return () => {
      mediaQuery1.removeEventListener('change', handleChange)
      mediaQuery2.removeEventListener('change', handleChange)
    }
  }, [])

  return isHighContrast
}

/**
 * Reduced motion detection
 */

/**
 * Hook to detect user's motion preferences
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * Screen reader detection
 */

/**
 * Hook to detect if screen reader is active
 */
export function useScreenReader() {
  const [hasScreenReader, setHasScreenReader] = useState(false)

  useEffect(() => {
    // Check for common screen reader indicators
    const checkScreenReader = () => {
      const hasNvda = navigator.userAgent.includes('NVDA')
      const hasJaws = navigator.userAgent.includes('JAWS')
      const hasVoiceOver = /Mac|iPhone|iPad/.test(navigator.userAgent) &&
        navigator.userAgent.includes('VoiceOver')

      // Check for reduced motion + high contrast as a heuristic
      const hasMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const hasContrastPreference = window.matchMedia('(prefers-contrast: more)').matches

      const isLikelyScreenReader = hasNvda || hasJaws || hasVoiceOver ||
        (hasMotionPreference && hasContrastPreference)

      setHasScreenReader(isLikelyScreenReader)
    }

    checkScreenReader()

    // Check periodically as screen readers can be toggled
    const interval = setInterval(checkScreenReader, 5000)

    return () => clearInterval(interval)
  }, [])

  return hasScreenReader
}

/**
 * Focus visible detection
 */

/**
 * Hook to detect keyboard focus vs mouse focus
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    let hadKeyboardEvent = false

    const handleKeyDown = () => {
      hadKeyboardEvent = true
    }

    const handleMouseDown = () => {
      hadKeyboardEvent = false
    }

    const handleFocusIn = () => {
      setIsFocusVisible(hadKeyboardEvent)
    }

    const handleFocusOut = () => {
      setIsFocusVisible(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
    }
  }, [])

  return isFocusVisible
}

/**
 * Accessible form utilities
 */

/**
 * Hook to manage form field validation with accessibility
 */
export function useAccessibleForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const setValue = (name: keyof T, value: T[keyof T]) => {
    setValues(prev => ({ ...prev, [name]: value }))
    // Clear error when value changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  const setError = (name: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const setFieldTouched = (name: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
  }

  const getFieldProps = (name: keyof T) => ({
    id: String(name),
    value: values[name] || '',
    onChange: (value: T[keyof T]) => setValue(name, value),
    onBlur: () => setFieldTouched(name),
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `${String(name)}-error` : undefined,
  })

  const getFieldErrorProps = (name: keyof T) => ({
    id: `${String(name)}-error`,
    role: 'alert' as const,
    'aria-live': 'polite' as const,
  })

  const isFieldInvalid = (name: keyof T) => {
    return touched[name] && !!errors[name]
  }

  const validateField = (name: keyof T, validator: (value: T[keyof T]) => string | undefined) => {
    const value = values[name]
    const error = validator ? validator(value) : undefined
    setError(name, error || '')
    return !error
  }

  const validateForm = (validators: Partial<Record<keyof T, (value: T[keyof T]) => string | undefined>>) => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.entries(validators).forEach(([key, validator]) => {
      const fieldKey = key as keyof T
      if (validator) {
        const error = validator(values[fieldKey])
        if (error) {
          newErrors[fieldKey] = error
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validators).reduce((acc, key) => ({
      ...acc,
      [key]: true,
    }), {} as Partial<Record<keyof T, boolean>>))

    return isValid
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setError,
    setTouched,
    getFieldProps,
    getFieldErrorProps,
    isFieldInvalid,
    validateField,
    validateForm,
  }
}

/**
 * Accessible drag and drop utilities
 */

/**
 * Hook to make drag and drop accessible
 */
export function useAccessibleDragAndDrop() {
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const announce = (message: string) => {
    // Create or update live region for announcements
    let liveRegion = document.getElementById('drag-drop-live-region')
    if (!liveRegion) {
      liveRegion = document.createElement('div')
      liveRegion.id = 'drag-drop-live-region'
      liveRegion.setAttribute('aria-live', 'polite')
      liveRegion.setAttribute('aria-atomic', 'true')
      liveRegion.className = 'sr-only'
      document.body.appendChild(liveRegion)
    }

    liveRegion.textContent = message
  }

  const handleDragStart = (item: string, label: string) => {
    setIsDragging(true)
    setDraggedItem(item)
    announce(`Started dragging ${label}`)
  }

  const handleDragEnd = (item: string, label: string) => {
    setIsDragging(false)
    setDraggedItem(null)
    announce(`Stopped dragging ${label}`)
  }

  const handleDrop = (targetLabel: string) => {
    announce(`Dropped item on ${targetLabel}`)
  }

  const getDragProps = (item: string, label: string) => ({
    draggable: true,
    'aria-grabbed': isDragging && draggedItem === item,
    onDragStart: () => handleDragStart(item, label),
    onDragEnd: () => handleDragEnd(item, label),
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        // Handle keyboard-based drag and drop
        handleDragStart(item, label)
      }
    },
  })

  const getDropZoneProps = (label: string) => ({
    'aria-dropeffect': 'move',
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault()
      handleDrop(label)
    },
    'aria-label': `Drop zone for ${label}`,
  })

  return {
    isDragging,
    draggedItem,
    getDragProps,
    getDropZoneProps,
    announce,
  }
}