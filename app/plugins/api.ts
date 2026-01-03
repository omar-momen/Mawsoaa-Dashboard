import type { FetchContext } from 'ofetch'
import type { ExtendedResolvedFetchOptions } from '~/types'
import { extractError } from '~/utils'

// Composables in plugins should be imported
import { useLoading } from '~/composables/useLoading'
import { useErrors } from '~/composables/useErrors'
import { useAuthStore } from '~/stores/auth'

/** handle on un-authenticated user */
async function handleUnAuthenticated(response: Response) {
  if (response?.status !== 401) {
    return
  }

  const authStore = useAuthStore()
  authStore.logout()

  const localePath = useLocalePath()
  const router = useRouter()
  const currentPath = router.currentRoute.value.path

  // Redirect to dashboard login if accessing dashboard routes
  if (currentPath.startsWith('/dashboard')) {
    return router.replace(localePath('/dashboard/auth/login'))
  }

  // Otherwise redirect to home
  return router.replace(localePath('/'))
}

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const { incrementPendingRequests, decrementPendingRequests } = useLoading()
  const { setError } = useErrors()

  const baseURL = computed<string>(() => config.public.apiBaseUrl || '')

  const api = $fetch.create({
    baseURL: baseURL.value,
    onRequest(ctx: FetchContext) {
      const options = ctx.options as ExtendedResolvedFetchOptions
      incrementPendingRequests()

      const authStore = useAuthStore()
      const { locale } = nuxtApp.$i18n as { locale: Ref<string> }

      // add headers is a key we pass to indicate that we don't want to add headers
      if (!options?.noHeaders) {
        if (authStore.token) {
          options.headers.set('Authorization', `Bearer ${authStore.token}`)
        }
        options.headers.set('Accept-Language', locale.value)
        if (!options.headers.has('Accept')) {
          options.headers.set('Accept', 'application/json')
        }

        // const appDataStore = useAppStore()
        // if (appDataStore.appData?.key) {
        //   options.headers.set('tenant-key', appDataStore.appData?.key || '')
        // }
      }
    },

    async onRequestError() {
      decrementPendingRequests()
    },

    async onResponse() {
      decrementPendingRequests()
    },

    async onResponseError(ctx: FetchContext) {
      const request = ctx.request
      const response = ctx.response
      const options = ctx.options as ExtendedResolvedFetchOptions

      // Handle unauthenticated globally except for login/auth requests (401)
      const requestUrl = typeof request === 'string' ? request : request?.url
      const isLoginOrAuthFlow = requestUrl?.includes('/auth')
      if (response?.status === 401) {
        if (!isLoginOrAuthFlow) {
          await handleUnAuthenticated(response)
        }
      }

      const errorResult = extractError(response?._data as Record<string, unknown>)
      const errorMessage = Array.isArray(errorResult) ? errorResult[0]?.message : errorResult

      // Only show toast in development
      setError({
        message: errorMessage,
        statusCode: response?.status,
        url: typeof request === 'string' ? request : undefined,
        data: response?._data,
        stack: response?._data?.stack
      }, options.silent ? '' : 'toast')
    }
  })

  return {
    provide: {
      api
    }
  }
})
