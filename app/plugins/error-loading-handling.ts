import type { NuxtError } from '#app'
import type { ErrorDetails } from '~/types'

type VueInstance = {
  $options?: { name?: string }
  $type?: { name?: string }
  constructor?: { name?: string }
}

export default defineNuxtPlugin((nuxtApp) => {
  const { setAppLoading, setPageLoading } = useLoading()
  const { setError } = useErrors()

  const getFallbackMessage = () => {
    return nuxtApp.$i18n?.t('errors.unexpected_error') || 'An unexpected error occurred'
  }

  /**
   * -----------------------------
   *  Nuxt App Lifecycle Hooks
   *  -----------------------------
   */

  // Handle App Suspense (initial load)
  nuxtApp.hook('app:suspense:resolve', async () => {
    setAppLoading(false)
  })

  // Handle Page Navigation
  nuxtApp.hook('page:start', () => {
    // Only set page loading if app is not loading
    // This prevents showing page loader during initial app load
    const { appLoading } = useLoading()
    if (!appLoading.value) {
      setPageLoading(true)
    }
  })

  nuxtApp.hook('page:finish', () => {
    setPageLoading(false)
  })

  // Handle Fatal App Errors
  nuxtApp.hook('app:error', (err: NuxtError) => {
    setAppLoading(false)
    setPageLoading(false)

    try {
      const errorData: ErrorDetails = {
        message: err?.message || getFallbackMessage(),
        statusCode: err?.statusCode,
        statusMessage: err?.statusMessage,
        stack: err?.stack,
        data: err?.data
      }

      setError(errorData, 'error_page')
    } catch {
      // Silently fail if error handling itself fails
    }
  })

  /**
   * -----------------------------
   *  Vue Runtime Error Handling
   *  -----------------------------
   */

  nuxtApp.vueApp.config.errorHandler = (
    err: unknown,
    instance: unknown,
    info: string
  ) => {
    try {
      const message
        = typeof err === 'object' && err && 'message' in (err as Record<string, unknown>)
          ? String((err as { message?: unknown }).message)
          : (nuxtApp.$i18n?.t('errors.runtime_error') || 'Runtime error occurred')

      const componentName
        = (instance as VueInstance)?.$options?.name
          || (instance as VueInstance)?.$type?.name
          || (instance as VueInstance)?.constructor?.name
          || (nuxtApp.$i18n?.t('errors.unknown') || 'Unknown')

      const errorData: ErrorDetails = {
        message,
        stack: (err as Error)?.stack,
        data: {
          component: componentName,
          errorInfo: info
        }
      }

      // Send to error store (store handles the toast)
      setError(errorData, 'toast')
    } catch {
      // Silently fail if error handling itself fails
    }
  }

  /**
   * -----------------------------
   *  Global Browser Error Handling
   *  -----------------------------
   */

  if (globalThis.window !== undefined) {
    const handleGlobalError = (event: ErrorEvent) => {
      try {
        const message = event.message || (nuxtApp.$i18n?.t('errors.unhandled_js_error') || 'Unhandled JavaScript error occurred')

        setError(
          {
            message,
            stack: event.error?.stack,
            data: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          },
          'toast'
        )
      } catch {
        // Silently fail if error handling itself fails
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const reason: unknown = event.reason
        const message
          = typeof reason === 'string'
            ? reason
            : (reason as { message?: string })?.message || (nuxtApp.$i18n?.t('errors.unhandled_promise_rejection') || 'Unhandled Promise Rejection')

        setError(
          {
            message,
            data: {
              type: 'promise_rejection',
              reason
            }
          },
          'toast'
        )
      } catch {
        // Silently fail if error handling itself fails
      }
    }

    // Register global handlers
    globalThis.addEventListener('error', handleGlobalError)
    globalThis.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Cleanup on unload
    globalThis.addEventListener('beforeunload', () => {
      globalThis.removeEventListener('error', handleGlobalError)
      globalThis.removeEventListener('unhandledrejection', handleUnhandledRejection)
    })
  }
})
