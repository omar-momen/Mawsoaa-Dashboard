import { h } from 'vue'
import type { Component } from 'vue'
import { formatTableDate } from './date'

export type CustomCellProps = {
  row: {
    getValue: (key: string) => unknown
    original: unknown
  }
  column?: {
    accessorKey?: string
  }
}

export type CustomCellFunction = (props: CustomCellProps) => unknown

/**
 * Gets a nested value from an object using dot notation
 * @param obj - The object to access
 * @param path - The dot-notation path (e.g., 'name.en')
 * @returns The value at the path or undefined
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') {
    return undefined
  }

  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current
}

/**
 * Creates custom cell renderers for table columns
 * @param UBadge - Resolved UBadge component from Nuxt UI
 * @param t - Translation function from i18n
 * @returns Record of custom cell functions mapped by custom_id
 */
export function createCustomCells(UBadge: Component | string, t: (key: string) => string): Record<string, CustomCellFunction> {
  return {
    id: ({ row, column }) => {
      const accessorKey = column?.accessorKey || 'id'
      const idValue = row.getValue(accessorKey)
      return h('span', { class: 'text-center font-mono' }, `#${idValue}`)
    },
    name: ({ row, column }) => {
      const accessorKey = column?.accessorKey || 'name'
      // Handle nested accessor keys (e.g., 'name.en', 'name.ar')
      let nameValue: unknown
      if (accessorKey.includes('.')) {
        nameValue = getNestedValue(row.original, accessorKey)
      } else {
        nameValue = row.getValue(accessorKey)
      }
      // Ensure we convert to string safely, handling null/undefined/objects
      let displayValue: string
      if (typeof nameValue === 'string') {
        displayValue = nameValue
      } else if (nameValue == null) {
        displayValue = ''
      } else if (typeof nameValue === 'object') {
        displayValue = ''
      } else {
        // At this point, nameValue is a primitive (number, boolean, etc.)
        // Type assertion is safe here because we've already excluded objects and null
        displayValue = String(nameValue as string | number | boolean | bigint | symbol)
      }
      return h('span', { class: 'font-bold' }, displayValue)
    },
    chips: ({ row, column }) => {
      const accessorKey = column?.accessorKey || 'domains'
      const chipsValue = row.getValue(accessorKey)

      if (!chipsValue || !Array.isArray(chipsValue) || chipsValue.length === 0) {
        return h('span', { class: 'text-muted' }, t('table.cells.no_items'))
      }

      return h('div', { class: 'flex flex-wrap gap-1' },
        chipsValue.map((chip: { label?: string, domain?: string, id?: number, name?: string, [key: string]: unknown }, index: number) => {
          // Prefer label property, fallback to domain, name, id, or index
          const displayLabel = chip.label || chip.domain || chip.name || String(chip.id ?? index)
          return h(UBadge, {
            key: chip.id || index,
            color: 'neutral',
            variant: 'soft'
          }, () => displayLabel)
        })
      )
    },
    date: ({ row, column }) => {
      const accessorKey = column?.accessorKey || 'created_at'
      const dateValue = row.getValue(accessorKey)
      return formatTableDate(dateValue as string | Date | number | null | undefined)
    },
    is_active: ({ row }) => {
      const isActiveValue = row.getValue('is_active')
      let isActive: boolean
      if (typeof isActiveValue === 'boolean') {
        isActive = isActiveValue
      } else if (typeof isActiveValue === 'number') {
        isActive = isActiveValue === 1
      } else {
        isActive = String(isActiveValue).toLowerCase() === 'true' || String(isActiveValue) === '1'
      }

      return h(UBadge, {
        color: isActive ? 'success' : 'error',
        variant: 'soft'
      }, () => isActive ? t('table.cells.active') : t('table.cells.inactive'))
    }
  }
}
