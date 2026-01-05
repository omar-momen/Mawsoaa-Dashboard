export type FormInputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'switch' | 'select' | 'file-image' | 'tags'

export interface FormValidation {
  valid: (value: unknown) => boolean
  message: string
}

export interface FormInputOption {
  label: string
  id: string | number | boolean
}

export interface FormInput {
  key: string
  label: string
  type: FormInputType
  placeholder?: string
  required?: boolean
  multiple?: boolean
  options?: FormInputOption[]
  getEndpoint?: string
  valueKey?: string
  labelKey?: string
  validations?: FormValidation[]
  val?: unknown
}

export interface FormProps {
  mode: 'add' | 'edit'
  title: string
  endpoint: string
  inputs: FormInput[]
  currentRow?: Record<string, unknown> | null
}

export type FilterInputType = 'text' | 'email' | 'tel' | 'password' | 'number' | 'textarea' | 'switch' | 'select' | 'tags'

export interface FilterInput {
  key: string
  label: string
  type: FilterInputType
  placeholder?: string
  multiple?: boolean
  options?: FormInputOption[]
  getEndpoint?: string
  valueKey?: string
  labelKey?: string
  filter_key?: boolean
}
