import type { LoginResponse } from '~/types/auth'
import type { User } from '~/types/user'

export const login = async (email: string, password: string) => {
  return await useClientApi<LoginResponse>('/api/super-admin/auth/login', {
    method: 'POST',
    body: { email, password }
  })
}

export const logout = async () => {
  return await useClientApi('/api/super-admin/auth/logout', {
    method: 'POST'
  })
}

export const getCurrentUser = async () => {
  return await useClientApi<{ data: User }>('/api/super-admin/auth/me', {
    method: 'GET'
  })
}
