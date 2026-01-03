export interface CrudTableData {
  [key: string]: unknown
}

export interface CrudTableColumn {
  id?: string
  accessorKey?: string
  header?: string | ((props: { column?: unknown, table?: unknown }) => unknown)
  footer?: string | ((props: { column?: unknown, table?: unknown }) => unknown)
  cell?: (props: { row: { getValue: (key: string) => unknown, original: unknown } }) => unknown
  custom_id?: string
  meta?: CrudTableColumnMeta
  enableSorting?: boolean
  enableHiding?: boolean
  size?: number
}

export interface CrudTableColumnMeta {
  class?: {
    th?: string
    td?: string
  }
  style?: {
    th?: string | Record<string, string>
    td?: string | Record<string, string>
  }
}

export interface CrudPaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface CrudApiResponse<T = CrudTableData> {
  success: boolean
  data: T[]
  meta?: CrudPaginationMeta
  message?: string
}
