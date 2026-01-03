/**
 * Safely get translation function that works in both setup context and plugins
 *
 * This function attempts to use useI18n() if available (in setup context),
 * falls back to nuxtApp.$i18n (in plugins/server-side), and finally returns
 * a function that returns the key as-is if i18n is not available.
 *
 * @returns A translation function that accepts a key and returns the translated string
 *
 * @example
 * ```ts
 * const t = getTranslationFunction()
 * const message = t('errors.an_error_occurred')
 * ```
 */
export function getTranslationFunction(): (key: string) => string {
  try {
    // Try to use useI18n() if we're in a setup context
    const { t } = useI18n()
    return t
  } catch {
    // Fallback to nuxtApp.$i18n if useI18n() is not available (e.g., in plugins)
    try {
      const nuxtApp = useNuxtApp()
      const i18n = nuxtApp.$i18n as { t?: (key: string) => string }
      return (key: string) => i18n?.t?.(key) || key
    } catch {
      // Final fallback: return key as-is
      return (key: string) => key
    }
  }
}
