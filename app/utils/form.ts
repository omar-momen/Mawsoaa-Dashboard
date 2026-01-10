import type { FormValidation } from '~/types/form'

import { getTranslationFunction } from '~/utils/i18n'

/**
 * Form validation utility functions
 * Provides reusable validation functions for form inputs
 */

/**
 * Domain validation function
 * Validates that each domain in the domains array has a maximum of 10 characters
 */
export const domainValidation = (): FormValidation => {
  const t = getTranslationFunction()
  return {
    valid: (value: unknown) => {
      // Handle array of domains (tags input type)
      if (Array.isArray(value)) {
        return value.every((domain) => {
          if (typeof domain !== 'string') return false
          return domain.length <= 10
        })
      }
      // Handle single domain string
      if (typeof value === 'string') {
        return value.length <= 10
      }
      return false
    },
    message: t('form.validation.domain_max_length')
  }
}

/**
 * Email validation function
 * Validates that the value is a valid email address format
 */
export const emailValidation = (): FormValidation => {
  const t = getTranslationFunction()
  return {
    valid: (value: unknown) => {
      if (typeof value !== 'string' || !value) return false
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message: t('form.validation.email_invalid')
  }
}

/**
 * Egypt phone validation function
 * Validates that the value is a valid Egyptian phone number
 * Accepts: 01 followed by 9 digits, or 201 (or +201) followed by 9 digits
 */
export const egyptPhoneValidation = (): FormValidation => {
  const t = getTranslationFunction()
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
    message: t('form.validation.phone_invalid')
  }
}
