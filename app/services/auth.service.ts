import type { LoginResponse } from '~/types/auth'

export const login = async (email: string, password: string) => {
  return await useClientApi<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  })
}
