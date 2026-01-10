<script setup lang="ts">
import type { SelectMenuItem } from '@nuxt/ui'

type SelectItem = string | number | boolean | SelectMenuItem
type SelectItemsArray = Array<SelectItem>
type SelectItemsNested = Array<SelectItemsArray>
type SelectItems = SelectItemsArray | SelectItemsNested

type SelectValue = string | number | boolean | SelectMenuItem | null | undefined
type SelectValueMultiple = SelectValue[]
type SelectValueType = SelectValue | SelectValueMultiple

defineOptions({
  inheritAttrs: false
})

interface Props {
  /**
   * URL to fetch data from. If provided, data will be fetched and used as items.
   * If not provided, staticOptions will be used instead.
   */
  url?: string
  /**
   * Static options to use when url is not provided
   */
  staticOptions?: SelectItems
  /**
   * Whether to show search input
   */
  searchable?: boolean
  /**
   * Key property to use as the value (default: 'id')
   */
  valueKey?: string
  /**
   * Key property to use as the label (default: 'label')
   */
  labelKey?: string
  /**
   * Whether multiple options can be selected
   */
  multiple?: boolean
  /**
   * Display a clear button to reset the model value
   */
  clear?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  url: undefined,
  staticOptions: () => [],
  searchable: true,
  valueKey: 'key',
  labelKey: 'label',
  multiple: false,
  clear: false
})

const { t } = useI18n()

const isMultiple = computed(() => props.multiple)

// Declarative data fetching - lazy client-side only
const apiUrl = computed(() => props.url || '')
const { data: fetchedData, pending: isLoading, refresh: refreshData } = await useApi<{ data: unknown[] }>(
  () => apiUrl.value,
  {
    lazy: true,
    immediate: false
  }
)

// Trigger fetch when URL exists (on mount and when URL changes)
watch(apiUrl, (url) => {
  if (url) {
    refreshData()
  }
}, { immediate: true })

// Immutable item preparation - creates new objects without mutation
const prepareItems = (items: unknown[]): SelectItems => {
  if (!Array.isArray(items) || items.length === 0) {
    return []
  }

  const firstItem = items[0]

  // Convert string arrays to objects
  if (typeof firstItem === 'string') {
    return items.map(item => ({
      label: String(item),
      value: item
    })) as SelectItems
  }

  // Convert object arrays to normalized format
  if (typeof firstItem === 'object' && firstItem !== null) {
    return items.map((item) => {
      const obj = item as Record<string, unknown>
      return {
        ...obj,
        label: String(obj[props.labelKey] || ''),
        value: obj[props.valueKey]
      }
    }) as SelectItems
  }

  return items as SelectItems
}

// Computed items from fetched data or static options
const computedItems = computed<SelectItems>(() => {
  if (props.url && fetchedData.value && Array.isArray(fetchedData.value.data)) {
    return prepareItems(fetchedData.value.data)
  }
  if (Array.isArray(props.staticOptions)) {
    return prepareItems(props.staticOptions)
  }

  return props.staticOptions
})

// External model that returns full objects
type ModelValue = SelectValueType | Record<string, unknown> | Record<string, unknown>[] | null
const externalModel = defineModel<ModelValue>({ default: null })

const emit = defineEmits<{
  change: [value: SelectValueType | Record<string, unknown> | Record<string, unknown>[]]
}>()

// Find object by ID value in computed items
const findObjectByValue = (value: SelectValue): Record<string, unknown> | null => {
  if (value === null || value === undefined) {
    return null
  }

  const items = Array.isArray(computedItems.value) ? computedItems.value : []
  const found = items.find((item: unknown) => {
    if (typeof item === 'object' && item !== null) {
      const obj = item as Record<string, unknown>
      return obj.value === value || obj[props.valueKey] === value
    }
    return false
  })

  return found ? (found as Record<string, unknown>) : null
}

// Find multiple objects from array of values
const findObjectsByValues = (values: SelectValue[]): Record<string, unknown>[] => {
  if (!Array.isArray(values) || values.length === 0) {
    return []
  }
  return values
    .map(value => findObjectByValue(value))
    .filter((obj): obj is Record<string, unknown> => obj !== null)
}

// Extract value from object or return primitive
const extractValue = (item: unknown): SelectValue => {
  if (item === null || item === undefined) {
    return null
  }
  if (typeof item === 'object' && !Array.isArray(item)) {
    const obj = item as Record<string, unknown>
    return (obj[props.valueKey] ?? obj.value ?? item) as SelectValue
  }
  return item as SelectValue
}

// Normalize external value to internal format (IDs/primitives)
const normalizeToInternal = (externalValue: ModelValue): SelectValueType => {
  if (isMultiple.value) {
    if (!Array.isArray(externalValue)) {
      return []
    }
    if (externalValue.length === 0) {
      return []
    }
    const firstItem = externalValue[0]
    if (typeof firstItem === 'object' && firstItem !== null) {
      return externalValue
        .map(item => extractValue(item))
        .filter((val): val is SelectValue => val !== null && val !== undefined)
    }
    return externalValue as SelectValueType
  } else {
    if (externalValue === null || externalValue === undefined) {
      return null
    }
    if (typeof externalValue === 'object' && !Array.isArray(externalValue)) {
      return extractValue(externalValue)
    }
    return externalValue as SelectValueType
  }
}

// Normalize internal value to external format (full objects)
const normalizeToExternal = (internalValue: SelectValueType): ModelValue => {
  if (isMultiple.value) {
    if (!Array.isArray(internalValue) || internalValue.length === 0) {
      return []
    }
    const objects = findObjectsByValues(internalValue)
    return objects.length > 0 ? objects : internalValue
  } else {
    if (internalValue === null || internalValue === undefined) {
      return null
    }
    const obj = findObjectByValue(internalValue)
    return obj || internalValue
  }
}

// Computed v-model proxy that syncs external and internal models
const internalModel = computed({
  get: () => normalizeToInternal(externalModel.value),
  set: (value: SelectValueType) => {
    const normalized = normalizeToExternal(value)
    externalModel.value = normalized
    emit('change', normalized)
  }
})

// Check if there's a value to show clear button
const hasValue = computed(() => {
  if (isMultiple.value) {
    return Array.isArray(internalModel.value) && internalModel.value.length > 0
  }
  return internalModel.value !== null && internalModel.value !== undefined
})

// Clear the value
const handleClear = (event: Event) => {
  event.stopPropagation()
  if (isMultiple.value) {
    internalModel.value = []
  } else {
    internalModel.value = null
  }
}
</script>

<template>
  <USelectMenu
    v-model="internalModel"
    class="w-full"
    :items="computedItems"
    value-key="value"
    label-key="label"
    :multiple="multiple"
    :search-input="searchable ? {
      placeholder: t('table.select.filter_placeholder'),
      icon: 'i-lucide-search'
    } : undefined"
    :loading="isLoading"
    v-bind="$attrs"
  >
    <template
      v-if="clear"
      #trailing="{ ui }"
    >
      <div class="flex items-center gap-1">
        <UButton
          v-if="hasValue"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          square
          :class="ui.trailingIcon()"
          @click="handleClear"
        />
        <UIcon
          name="i-lucide-chevron-down"
          :class="ui.trailingIcon()"
        />
      </div>
    </template>
    <slot />
  </USelectMenu>
</template>
