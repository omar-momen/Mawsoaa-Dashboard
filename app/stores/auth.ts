import { defineStore } from 'pinia'
import type { User } from '~/types/user'
import type { LoginPayload } from '~/types'
import { login as loginService } from '~/services'

export const useAuthStore = defineStore('auth', () => {
  // Persistent token storage using cookies
  const tokenCookie = useCookie<string | null>('auth_token', {
    default: () => null,
    secure: true,
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  const user = ref<User | null>(null)
  const token = ref<string | null>(tokenCookie.value)

  const isAuthenticated = computed(() => !!token.value)

  async function login(payload: LoginPayload) {
    const { data } = await loginService(payload.email, payload.password)

    user.value = data?.value?.data.user || null
    token.value = data?.value?.data.token || null

    // Persist to cookies
    tokenCookie.value = token.value
  }

  function logout() {
    user.value = null
    token.value = null

    // Clear cookies
    tokenCookie.value = null
  }

  return {
    // State
    user,
    token,
    // Getters
    isAuthenticated,
    // Actions
    login,
    logout
  }
})
