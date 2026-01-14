export interface Role {
  id: number
  label: string
  key: string
}

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  email_verified_at: string | null
  is_super_admin: boolean
  display_order: number
  avatar: string | null
  roles: Role[]
  created_at: string
  updated_at: string
}
