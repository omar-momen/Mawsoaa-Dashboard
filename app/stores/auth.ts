import { defineStore } from 'pinia'
import type { User } from '~/types/user'
import type { LoginPayload } from '~/types'
import { login as loginService, logout as logoutService } from '~/services'

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

  async function logout() {
    const { error } = await logoutService()
    if (error.value) {
      return
    }

    // Clear auth state
    user.value = null
    token.value = null

    // Clear cookies
    tokenCookie.value = null

    const localePath = useLocalePath()
    const router = useRouter()
    await router.replace(localePath('/dashboard/auth/login'))
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
