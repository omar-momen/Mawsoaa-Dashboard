export interface TenantDomain {
  id: number
  domain: string
  tenant_id: number
  created_at: string
  updated_at: string
}

export interface Tenant {
  id: number
  display_order: number
  name: string
  email: string
  phone: string
  is_active: number
  created_at: string
  updated_at: string
  tenancy_db_name: string
  domains: TenantDomain[]
}

export interface TenantResponse {
  success: boolean
  data: Tenant[]
  meta: {
    current_page: number
    per_page: number
    total: number
    last_page: number
  }
  message: string
}
