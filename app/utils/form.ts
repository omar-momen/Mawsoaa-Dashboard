import type { FormValidation } from '~/types/form'

/**
 * Form validation utility functions
 * Provides reusable validation functions for form inputs
 */

/**
 * Email validation function
 * Validates that the value is a valid email address format
 */
export const emailValidation = (message: string): FormValidation => {
  return {
    valid: (value: unknown) => {
      if (typeof value !== 'string' || !value) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message
  }
}

/**
 * Egypt phone validation function
 * Validates that the value is a valid Egyptian phone number
 * Accepts: 01 followed by 9 digits, or 201 (or +201) followed by 9 digits
 */
export const egyptPhoneValidation = (message: string): FormValidation => {
  return {
    valid: (value: unknown) => {
      if (typeof value !== 'string' || !value) return false
      // Remove spaces, dashes, and parentheses
      const cleaned = value.replaceAll(/[\s\-()]/g, '')
      // Egypt phone patterns:
      // 01 followed by 9 digits (01XXXXXXXXX)
      // 201 or +201 followed by 9 digits (201XXXXXXXXX or +201XXXXXXXXX)
      const egyptPattern = /^(01\d{9}|(\+?20)?1\d{9})$/
      return egyptPattern.test(cleaned)
    },
    message
  }
}
