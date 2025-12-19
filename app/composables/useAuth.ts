import type { User } from '~/types/user'
import type { LoginPayload } from '~/types'
import { login as loginService } from '~/services'

export const useAuth = () => {
  const user = useState<User | null>('auth:user', () => null)
  const token = useState<string | null>('auth:token', () => null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (payload: LoginPayload) => {
    const { data } = await loginService(payload.email, payload.password)

    user.value = data?.value?.data.user || null
    token.value = data?.value?.data.token || null
  }

  return {
    user,
    token,
    isAuthenticated,
    login
  }
}
