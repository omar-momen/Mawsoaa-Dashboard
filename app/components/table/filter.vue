<script setup lang="ts">
import type { FilterInput } from '~/types/form'

const props = defineProps<{
  filters: FilterInput[]
}>()

const emit = defineEmits<{
  'update:filters': [filters: Record<string, unknown>]
}>()

// Delimiter regex for tags input (comma or space)
const tagsDelimiter = /[,\s]+/

// Initialize filter state
const filterState = reactive<Record<string, unknown>>({})

// Helper function to get default value for a filter
const getDefaultValue = (filter: FilterInput): unknown => {
  if (filter.multiple || filter.type === 'tags') {
    return []
  } else if (filter.type === 'switch') {
    return false
  } else if (filter.type === 'number') {
    return null
  } else if (filter.type === 'select') {
    return null
  } else {
    // All text-based inputs (text, email, tel, password, textarea) default to empty string
    return ''
  }
}

// Function to initialize state
const initializeState = () => {
  props.filters.forEach((filter: FilterInput) => {
    filterState[filter.key] = getDefaultValue(filter)
  })
}

// Initialize state on mount
initializeState()

// Watch for filter prop changes
watch(() => props.filters, () => {
  initializeState()
}, { deep: true })

// Debounce function
const debounce = (func: (newState: Record<string, unknown>) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function executedFunction(newState: Record<string, unknown>) {
    const later = () => {
      timeout = null
      func(newState)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

// Function to build and emit filters
const buildAndEmitFilters = (newState: Record<string, unknown>) => {
  // Build filters object with flattened filter keys
  const activeFilters: Record<string, unknown> = {}

  Object.keys(newState).forEach((key) => {
    const value = newState[key]
    const filterConfig = props.filters.find(f => f.key === key)

    // Skip empty values
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      return
    }

    // Extract value for select inputs
    const extractedValue: unknown = (() => {
      if (filterConfig?.type === 'select' && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const obj = value as Record<string, unknown>
        return obj[filterConfig.valueKey || 'id'] ?? obj.value ?? value
      } else if (filterConfig?.type === 'select' && Array.isArray(value) && value.length > 0) {
        return value.map((item: unknown) => {
          if (typeof item === 'object' && item !== null) {
            const obj = item as Record<string, unknown>
            return obj[filterConfig.valueKey || 'id'] ?? obj.value ?? item
          }
          return item
        })
      } else if (filterConfig?.type === 'switch' && typeof value === 'boolean') {
        // Convert boolean to 0/1 for switches
        return value ? 1 : 0
      }
      return value
    })()

    // If filter_key exists and is truthy, use filters[key] format
    if (filterConfig?.filter_key) {
      activeFilters[`filters[${filterConfig.key}]`] = extractedValue
    } else {
      // Otherwise, put at root level (search)
      activeFilters[key] = extractedValue
    }
  })

  emit('update:filters', activeFilters)
}

// Debounced version of buildAndEmitFilters (500ms debounce)
const debouncedEmitFilters = debounce(buildAndEmitFilters, 500)

// Watch for changes and emit with debounce
watch(filterState, (newState) => {
  debouncedEmitFilters(newState)
}, { deep: true })

// Reset filters function
const resetFilters = () => {
  initializeState()
}

defineExpose({
  resetFilters
})
</script>

<template>
  <div
    v-if="filters && filters.length > 0"
    class="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-border bg-elevated p-4"
  >
    <div
      v-for="filter in filters"
      :key="filter.key"
      class="flex-1 min-w-[200px]"
    >
      <label
        :for="`filter-${filter.key}`"
        class="mb-1 block text-sm font-medium text-foreground"
      >
        {{ filter.label }}
      </label>

      <!-- Text Input -->
      <UInput
        v-if="filter.type === 'text'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as string"
        :placeholder="filter.placeholder || filter.label"
        type="text"
        class="w-full"
      >
        <template
          v-if="filterState[filter.key]"
          #trailing
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            square
            @click="filterState[filter.key] = ''"
          />
        </template>
      </UInput>

      <!-- Email Input -->
      <UInput
        v-if="filter.type === 'email'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as string"
        :placeholder="filter.placeholder || filter.label"
        type="email"
        class="w-full"
      >
        <template
          v-if="filterState[filter.key]"
          #trailing
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            square
            @click="filterState[filter.key] = ''"
          />
        </template>
      </UInput>

      <!-- Tel Input -->
      <UInput
        v-if="filter.type === 'tel'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as string"
        :placeholder="filter.placeholder || filter.label"
        type="tel"
        class="w-full"
      >
        <template
          v-if="filterState[filter.key]"
          #trailing
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            square
            @click="filterState[filter.key] = ''"
          />
        </template>
      </UInput>

      <!-- Password Input -->
      <UInput
        v-if="filter.type === 'password'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as string"
        :placeholder="filter.placeholder || filter.label"
        type="password"
        class="w-full"
      >
        <template
          v-if="filterState[filter.key]"
          #trailing
        >
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-x"
            size="xs"
            square
            @click="filterState[filter.key] = ''"
          />
        </template>
      </UInput>

      <!-- Number Input -->
      <div
        v-if="filter.type === 'number'"
        class="relative w-full"
      >
        <UInputNumber
          :id="`filter-${filter.key}`"
          v-model="filterState[filter.key] as number | null"
          :placeholder="filter.placeholder || filter.label"
          class="w-full"
        />
        <UButton
          v-if="filterState[filter.key] !== null"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          square
          class="absolute right-1 top-1/2 -translate-y-1/2"
          @click="filterState[filter.key] = null"
        />
      </div>

      <!-- Textarea -->
      <div
        v-if="filter.type === 'textarea'"
        class="relative w-full"
      >
        <UTextarea
          :id="`filter-${filter.key}`"
          v-model="filterState[filter.key] as string"
          :placeholder="filter.placeholder || filter.label"
          class="w-full"
        />
        <UButton
          v-if="filterState[filter.key]"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          size="xs"
          square
          class="absolute right-1 top-1"
          @click="filterState[filter.key] = ''"
        />
      </div>

      <!-- Switch -->
      <USwitch
        v-if="filter.type === 'switch'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as boolean"
      />

      <!-- Select -->
      <InputSelect
        v-if="filter.type === 'select'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as Record<string, unknown> | Record<string, unknown>[] | null"
        :url="filter.getEndpoint"
        :static-options="filter.options || []"
        :value-key="filter.valueKey || 'id'"
        :label-key="filter.labelKey || 'label'"
        :multiple="filter.multiple"
        :placeholder="filter.placeholder || filter.label"
        :clear="true"
        class="w-full"
      />

      <!-- Tags Input -->
      <UInputTags
        v-if="filter.type === 'tags'"
        :id="`filter-${filter.key}`"
        v-model="filterState[filter.key] as string[]"
        :placeholder="filter.placeholder || filter.label"
        :delimiter="tagsDelimiter"
        :add-on-blur="true"
        :add-on-tab="true"
        class="w-full"
      />
    </div>

    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-x"
      @click="resetFilters"
    >
      {{ $t('table.filters.reset') }}
    </UButton>
  </div>
</template>
