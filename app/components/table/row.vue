<script setup lang="ts">
import type { CrudTableColumn, CrudTableData } from '~/types'
import type { DropdownMenuItem } from '@nuxt/ui'

const { t } = useI18n()

const props = defineProps<{
  row: CrudTableData
  rowIndex: number
  columns: CrudTableColumn[]
  selectable?: boolean
  expandable?: boolean
  draggable?: boolean
  rowActions?: {
    show?: boolean
    edit?: boolean
    delete?: boolean
  }
  crudRoute?: string
  isSelected?: boolean
  isExpanded?: boolean
}>()

const emit = defineEmits<{
  toggleSelection: [rowIndex: number]
  toggleExpand: [rowIndex: number]
  show: [row: CrudTableData]
  edit: [row: CrudTableData]
  delete: [row: CrudTableData]
}>()

const handleToggleSelection = () => {
  emit('toggleSelection', props.rowIndex)
}

const handleToggleExpand = () => {
  emit('toggleExpand', props.rowIndex)
}

const handleShow = () => {
  emit('show', props.row)
}

const handleEdit = () => {
  emit('edit', props.row)
}

const handleDelete = () => {
  emit('delete', props.row)
}

const dropdownItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[] = []

  if (props.rowActions?.show) {
    items.push({
      label: t('table.actions.show'),
      icon: 'i-lucide-eye',
      onSelect: handleShow
    })
  }

  if (props.rowActions?.edit) {
    items.push({
      label: t('table.actions.edit'),
      icon: 'i-lucide-edit',
      onSelect: handleEdit
    })
  }

  if (props.rowActions?.delete) {
    items.push({
      label: t('table.actions.delete'),
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: handleDelete
    })
  }

  // Return as array of arrays for proper grouping
  return items.length > 0 ? [items] : []
})
</script>

<template>
  <tr
    :class="[
      'border-b border-gray-400/30 transition-colors',
      isSelected && 'bg-primary/5',
      'hover:bg-muted/30'
    ]"
  >
    <!-- Drag Handle Column -->
    <td
      v-if="draggable"
      class="px-4 py-3 text-center text-sm text-foreground w-12"
    >
      <div class="flex items-center justify-center">
        <Icon
          name="i-lucide-grip-vertical"
          class="drag-handle w-4 h-4 text-muted cursor-grab active:cursor-grabbing"
        />
      </div>
    </td>
    <!-- Select Column -->
    <td
      v-if="selectable"
      class="px-4 py-3 text-center text-sm text-foreground w-12"
    >
      <div class="flex items-center justify-center">
        <UCheckbox
          :model-value="isSelected || false"
          :aria-label="t('table.selection.select_row')"
          @update:model-value="handleToggleSelection"
        />
      </div>
    </td>

    <TableCell
      v-for="column in columns"
      :key="column.id || String(column.accessorKey || '')"
      :row="row"
      :column="column"
      :row-actions="rowActions"
      :crud-route="crudRoute"
      @show="handleShow"
    />

    <!-- Expand Column -->
    <td
      v-if="expandable"
      class="px-4 py-3 text-center text-sm text-foreground w-12"
    >
      <div class="flex items-center justify-center">
        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
          :aria-label="t('table.accessibility.expand')"
          @click="handleToggleExpand"
        >
          <Icon
            name="i-lucide-chevron-down"
            :class="[
              'w-4 h-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            ]"
          />
        </button>
      </div>
    </td>

    <!-- Actions Column -->
    <td
      v-if="rowActions && (rowActions.show || rowActions.edit || rowActions.delete)"
      class="px-4 py-3 text-center text-sm text-foreground w-12"
    >
      <div class="flex items-center justify-center">
        <UDropdownMenu
          v-if="dropdownItems.length > 0"
          :items="dropdownItems"
          :content="{ align: 'end' }"
        >
          <UButton
            icon="i-lucide-ellipsis-vertical"
            color="neutral"
            variant="ghost"
            :aria-label="t('table.accessibility.actions_dropdown')"
          />
        </UDropdownMenu>
      </div>
    </td>
  </tr>
</template>
