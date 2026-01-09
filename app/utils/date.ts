import { format } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

/**
 * Get the date-fns locale based on the current i18n locale
 * @returns The date-fns locale object
 */
function getDateLocale() {
  try {
    const { locale } = useI18n()
    return locale.value === 'ar' ? ar : enUS
  } catch {
    // Fallback to English if i18n is not available
    return enUS
  }
}

/**
 * Format a date string or Date object based on the current language
 * @param date - The date to format (string, Date, or number)
 * @param formatString - The format string (default: 'PP' for long date)
 * @returns Formatted date string
 *
 * @example
 * ```ts
 * formatDate('2024-01-15') // "Jan 15, 2024" (en) or "١٥ يناير ٢٠٢٤" (ar)
 * formatDate('2024-01-15', 'yyyy-MM-dd') // "2024-01-15"
 * formatDate(new Date(), 'PPp') // Full date with time
 * ```
 */
export function formatDate(date: string | Date | number | null | undefined, formatString = 'PP'): string {
  if (!date) return ''

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) {
      return ''
    }

    const locale = getDateLocale()
    return format(dateObj, formatString, { locale })
  } catch {
    return ''
  }
}

/**
 * Format a date for table display (short format)
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatTableDate(date: string | Date | number | null | undefined): string {
  return formatDate(date, 'PP')
}
