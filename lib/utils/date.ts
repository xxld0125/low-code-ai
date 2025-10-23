/**
 * Date utility functions for the low-code platform
 */

import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format a date string to a readable format
 */
export function formatDate(
  date: string | Date | null | undefined,
  formatStr: string = 'MMM dd, yyyy'
): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return 'No date'
  }

  // Handle string dates
  if (typeof date === 'string') {
    // Handle empty strings
    if (date.trim() === '') {
      return 'No date'
    }

    try {
      const dateObj = parseISO(date)
      // Check if the parsed date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date string provided to formatDate:', date)
        return 'Invalid date'
      }
      return format(dateObj, formatStr)
    } catch (error) {
      console.warn('Error parsing date in formatDate:', date, error)
      return 'Invalid date'
    }
  }

  // Handle Date objects
  if (date instanceof Date) {
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date object provided to formatDate:', date)
      return 'Invalid date'
    }
    return format(date, formatStr)
  }

  // Fallback for any other type
  console.warn('Invalid date type provided to formatDate:', typeof date, date)
  return 'Invalid date'
}

/**
 * Format a date as relative time from now (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date | null | undefined): string {
  // Handle null, undefined, or empty values
  if (!date) {
    return 'Never'
  }

  // Handle string dates
  if (typeof date === 'string') {
    // Handle empty strings
    if (date.trim() === '') {
      return 'Never'
    }

    try {
      const dateObj = parseISO(date)
      // Check if the parsed date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date string provided to formatRelativeTime:', date)
        return 'Invalid date'
      }
      return formatDistanceToNow(dateObj, { addSuffix: true })
    } catch (error) {
      console.warn('Error parsing date in formatRelativeTime:', date, error)
      return 'Invalid date'
    }
  }

  // Handle Date objects
  if (date instanceof Date) {
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid Date object provided to formatRelativeTime:', date)
      return 'Invalid date'
    }
    return formatDistanceToNow(date, { addSuffix: true })
  }

  // Fallback for any other type
  console.warn('Invalid date type provided to formatRelativeTime:', typeof date, date)
  return 'Invalid date'
}

/**
 * Validate if a date string or Date object is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) {
    return false
  }

  if (typeof date === 'string') {
    if (date.trim() === '') {
      return false
    }
    try {
      const dateObj = parseISO(date)
      return !isNaN(dateObj.getTime())
    } catch {
      return false
    }
  }

  if (date instanceof Date) {
    return !isNaN(date.getTime())
  }

  return false
}

/**
 * Safe date parsing that returns null for invalid dates
 */
export function safeParseDate(date: string | Date | null | undefined): Date | null {
  if (!date) {
    return null
  }

  if (typeof date === 'string') {
    if (date.trim() === '') {
      return null
    }
    try {
      const dateObj = parseISO(date)
      return isNaN(dateObj.getTime()) ? null : dateObj
    } catch {
      return null
    }
  }

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date
  }

  return null
}

/**
 * Re-export formatDistanceToNow for backward compatibility
 */
export { formatDistanceToNow } from 'date-fns'
