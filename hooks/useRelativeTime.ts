/**
 * Hook for formatting relative time with error handling
 * Provides safe date formatting with fallback values
 */

import { useMemo } from 'react'
import { formatRelativeTime, isValidDate } from '@/lib/utils/date'

export interface UseRelativeTimeOptions {
  fallback?: string
  showWarning?: boolean
}

export function useRelativeTime(
  date: string | Date | null | undefined,
  options: UseRelativeTimeOptions = {}
) {
  const { fallback = 'Never', showWarning = true } = options

  return useMemo(() => {
    // If date is null, undefined, or empty string
    if (!date) {
      return fallback
    }

    // If date is an empty string
    if (typeof date === 'string' && date.trim() === '') {
      return fallback
    }

    // If date is invalid
    if (!isValidDate(date)) {
      if (showWarning) {
        console.warn('Invalid date provided to useRelativeTime:', date)
      }
      return fallback
    }

    // If date is valid, format it
    try {
      return formatRelativeTime(date)
    } catch (error) {
      if (showWarning) {
        console.warn('Error formatting relative time:', date, error)
      }
      return fallback
    }
  }, [date, fallback, showWarning])
}
