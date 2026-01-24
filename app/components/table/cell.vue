<script setup lang="ts">
import type { CrudTableColumn, CrudTableData } from '~/types'
import { formatTableDate } from '~/utils/date'

const { t } = useI18n()

const props = defineProps<{
  row: CrudTableData
  column: CrudTableColumn
  rowActions?: {
    show?: boolean
    edit?: boolean
    delete?: boolean
  }
  crudRoute?: string
}>()

const emit = defineEmits<{
  show: [row: CrudTableData]
}>()

// Helper function to get nested value from object using dot notation
const getNestedValue = (obj: unknown, path: string): unknown => {
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

// Helper function to get cell value
const getCellValue = (row: CrudTableData, column: CrudTableColumn) => {
  if (!column.accessorKey) {
    return null
  }
  // Handle nested accessor keys (e.g., 'name.en', 'name.ar')
  if (column.accessorKey.includes('.')) {
    return getNestedValue(row, column.accessorKey)
  }
  return row[column.accessorKey as keyof typeof row]
}

// Check if column is a status column
const isStatusColumn = (column: CrudTableColumn) => {
  return column.custom_id === 'is_active'
}

// Check if column is a chips column
const isChipsColumn = (column: CrudTableColumn) => {
  return column.custom_id === 'chips'
}

// Check if column is a date column
const isDateColumn = (column: CrudTableColumn) => {
  return column.custom_id === 'date' || column.custom_id === 'created_at' || column.custom_id === 'updated_at'
}

// Check if column is an avatar column
const isAvatarColumn = (column: CrudTableColumn) => {
  return column.custom_id === 'avatar'
}

// Check if value is active (true)
const isActiveValue = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value
  }
  if (typeof value === 'number') {
    return value === 1
  }
  return String(value).toLowerCase() === 'true' || String(value) === '1'
}

const cellValue = computed(() => getCellValue(props.row, props.column))
const isStatus = computed(() => isStatusColumn(props.column))
const isChips = computed(() => isChipsColumn(props.column))
const isDate = computed(() => isDateColumn(props.column))
const isAvatar = computed(() => isAvatarColumn(props.column))
const isActive = computed(() => isActiveValue(cellValue.value))

// Format date value
const formattedDate = computed(() => {
  if (isDate.value) {
    return formatTableDate(cellValue.value as string | Date | number | null | undefined)
  }
  return null
})

// Get chips array (with optional limit)
const chipsArray = computed(() => {
  if (!isChips.value || !Array.isArray(cellValue.value)) {
    return []
  }
  const allChips = cellValue.value as Array<{ id?: string | number, original_id?: number, label: string }>
  const limit = props.column.limit
  if (limit !== undefined && limit > 0) {
    return allChips.slice(0, limit)
  }
  return allChips
})

// Get remaining chips count (when limit is applied)
const remainingChipsCount = computed(() => {
  if (!isChips.value || !Array.isArray(cellValue.value)) {
    return 0
  }
  const limit = props.column.limit
  if (limit !== undefined && limit > 0) {
    const allChips = cellValue.value as Array<{ id?: string | number, original_id?: number, label: string }>
    return Math.max(0, allChips.length - limit)
  }
  return 0
})

// Avatar modal state
const avatarModalOpen = ref(false)

const openAvatarModal = () => {
  avatarModalOpen.value = true
}

// Check if column is a name column
const isNameColumn = (column: CrudTableColumn) => {
  return column.custom_id === 'name'
}

const isName = computed(() => isNameColumn(props.column))

// Handle name click to navigate to show page
const handleNameClick = () => {
  if (props.rowActions?.show && props.crudRoute) {
    const router = useRouter()
    const localePath = useLocalePath()
    router.push(localePath(`/dashboard/${props.crudRoute}/show/${props.row.id}`))
  } else {
    emit('show', props.row)
  }
}
</script>

<template>
  <td class="px-4 py-3 text-center text-sm text-foreground">
    <!-- Status Badge -->
    <div
      v-if="isStatus"
      class="flex items-center justify-center"
    >
      <span
        class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
        :class="[
          isActive
            ? 'bg-success/10 text-success'
            : 'bg-error/10 text-error'
        ]"
      >
        {{ isActive ? t('table.cells.active') : t('table.cells.inactive') }}
      </span>
    </div>
    <!-- Chips -->
    <div
      v-else-if="isChips"
      class="flex flex-wrap gap-1 justify-center"
    >
      <template v-if="chipsArray.length > 0">
        <UBadge
          v-for="chip in chipsArray"
          :key="chip.id || chip.original_id"
          color="neutral"
          variant="soft"
        >
          {{ chip.label }}
        </UBadge>
        <UBadge
          v-if="remainingChipsCount > 0"
          color="success"
          variant="soft"
          class="cursor-default"
        >
          +{{ remainingChipsCount }} {{ t('labels.permission') }}
        </UBadge>
      </template>
      <span
        v-else
        class="text-muted text-xs"
      >
        {{ t('table.cells.no_items') }}
      </span>
    </div>
    <!-- Date -->
    <template v-else-if="isDate">
      {{ formattedDate }}
    </template>
    <!-- Avatar -->
    <div
      v-else-if="isAvatar"
      class="flex items-center justify-center"
    >
      <UModal
        v-model:open="avatarModalOpen"
      >
        <button
          type="button"
          class="cursor-pointer hover:opacity-80 transition-opacity"
          @click="openAvatarModal"
        >
          <UAvatar
            v-if="cellValue && typeof cellValue === 'string'"
            :src="cellValue"
            :alt="t('labels.avatar')"
            size="md"
          />
          <UAvatar
            v-else
            icon="i-lucide-user"
            :alt="t('labels.avatar')"
            size="md"
          />
        </button>

        <template #body>
          <div
            v-if="cellValue && typeof cellValue === 'string'"
            class="flex items-center justify-center py-8"
          >
            <NuxtImg
              :src="cellValue"
              :alt="t('labels.avatar')"
              class="max-w-full max-h-[70vh] object-contain rounded-lg"
              loading="lazy"
            />
          </div>
          <div
            v-else
            class="flex items-center justify-center py-8"
          >
            <UAvatar
              icon="i-lucide-user"
              :alt="t('labels.avatar')"
              size="3xl"
            />
          </div>
        </template>
      </UModal>
    </div>
    <!-- Name (Clickable if show is enabled) -->
    <template v-else-if="isName && rowActions?.show">
      <button
        type="button"
        class="hover:text-primary/80 underline transition-colors cursor-pointer"
        @click="handleNameClick"
      >
        {{ cellValue }}
      </button>
    </template>
    <!-- Default Cell Value -->
    <template v-else>
      {{ cellValue }}
    </template>
  </td>
</template>
