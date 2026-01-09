<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Component } from 'vue'

import type { CrudTableColumn, CrudTableData, CrudApiResponse, CrudPaginationMeta } from '~/types'

import type { FormInput, FilterInput } from '~/types/form'

import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'

import { createCustomCells } from '~/utils'

defineOptions({
  inheritAttrs: false
})

const { t } = useI18n()

const emit = defineEmits<{
  show: [row: CrudTableData]
  edit: [row: CrudTableData]
  delete: [row: CrudTableData]
  bulkDelete: [rows: CrudTableData[]]
  export: [rows: CrudTableData[]]
  import: [rows: CrudTableData[]]
  print: [rows: CrudTableData[]]
  share: [rows: CrudTableData[]]
  download: [rows: CrudTableData[]]
}>()

const props = withDefaults(defineProps<{
  crudEndpoint: string
  data?: CrudTableData[]
  columns?: CrudTableColumn[]
  formInputs?: FormInput[]
  filterInputs?: FilterInput[]
  formTitle?: string
  tableTitle?: string
  sticky?: boolean
  expandable?: boolean
  selectable?: boolean
  rowActions?: {
    show?: boolean
    edit?: boolean
    delete?: boolean
  }
  tableActions?: {
    bulkDelete?: boolean
    export?: boolean
    import?: boolean
    print?: boolean
    share?: boolean
    download?: boolean
    add?: boolean
  }
}>(), {
  formInputs: () => [],
  formTitle: undefined,
  tableTitle: undefined,
  filterInputs: () => [],
  sticky: true,
  expandable: false,
  selectable: true,
  rowActions: () => ({
    show: true,
    edit: true,
    delete: true
  }),
  tableActions: () => ({
    bulkDelete: false,
    export: false,
    import: false,
    print: true,
    share: false,
    download: false,
    add: true
  })
})

const expanded = ref<Record<string, boolean>>({})

const currentPage = ref(1)

const activeFilters = ref<Record<string, unknown>>({})
const handleFilterUpdate = (filters: Record<string, unknown>) => {
  activeFilters.value = filters
  // Reset to first page when filters change
  currentPage.value = 1
}

const { data: fetchedData, status, refresh: refreshTable } = await useApi<CrudApiResponse>(props.crudEndpoint, {
  key: computed(() => `table-${props.crudEndpoint}-page-${currentPage.value}-${JSON.stringify(activeFilters.value)}`),
  query: computed(() => ({
    page: currentPage.value,
    ...activeFilters.value
  }))
})

const paginationMeta = computed<CrudPaginationMeta | null>(() => {
  return fetchedData.value?.meta || null
})

const tableData = computed(() => {
  if (fetchedData.value?.data?.length) {
    return fetchedData.value?.data
  }
  return props.data || []
})

const isLoading = computed(() => status.value === 'pending')

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')

// Custom cell functions mapped by custom_id
const customCells = createCustomCells(UBadge as Component, t)

// Form state
const formOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentRow = ref<CrudTableData | null>(null)

// Row action handler functions
const handleShow = (row: CrudTableData): void => {
  emit('show', row)
}
const handleEdit = (row: CrudTableData): void => {
  if (props.formInputs?.length) {
    formMode.value = 'edit'
    currentRow.value = row
    formOpen.value = true
  } else {
    emit('edit', row)
  }
}
const handleAdd = (): void => {
  if (props.formInputs && props.formInputs.length > 0) {
    formMode.value = 'add'
    currentRow.value = null
    formOpen.value = true
  }
}

const deleteRow = ref<CrudTableData | null>(null)
const deleteModalOpen = ref(false)
const handleDelete = (row: CrudTableData): void => {
  deleteRow.value = row
  deleteModalOpen.value = true
}
const handleDeleteSuccess = (): void => {
  refreshTable()
  deleteRow.value = null
}

// Bulk delete state
const bulkDeleteModalOpen = ref(false)
const handleBulkDelete = (): void => {
  if (selectedRowIds.value.length === 0) {
    return
  }
  bulkDeleteModalOpen.value = true
}
const handleBulkDeleteSuccess = (): void => {
  refreshTable()
  // Clear selection after successful deletion
  rowSelection.value = {}
}

// Get selected rows based on rowSelection model
const rowSelection = defineModel<Record<string, boolean>>('rowSelection', { default: () => ({}) })
const selectedRows = computed(() => {
  if (!props.selectable || Object.keys(rowSelection.value).length === 0) {
    return []
  }
  return tableData.value.filter((_, index) => rowSelection.value[index])
})

// Get selected row IDs for bulk delete
const selectedRowIds = computed(() => {
  return selectedRows.value
    .map(row => row.id)
    .filter((id): id is string | number => id !== null && id !== undefined)
})

const tableColumns = computed<TableColumn<CrudTableData>[]>(() => {
  const columns: TableColumn<CrudTableData>[] = (props.columns) as TableColumn<CrudTableData>[]

  // Check if select column already exists
  const hasSelectColumn = props.columns?.some(col => col.id === 'select')
  if (props.selectable && !hasSelectColumn) {
    columns.unshift({
      id: 'select',
      header: ({ table }) => h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'aria-label': t('table.selection.select_all')
      }),
      cell: ({ row }) => h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': t('table.selection.select_row')
      })
    } as TableColumn<CrudTableData>)
  }

  // =================== Handle default columns
  // Apply custom cells to columns that have custom_id but no cell
  columns.forEach((col) => {
    const colAsCrud = col as CrudTableColumn
    // Skip if column already has a cell or no custom_id
    if (colAsCrud.cell || !colAsCrud.custom_id) {
      return
    }

    // Get the custom cell function for this custom_id
    const customCellFn = customCells[colAsCrud.custom_id]
    if (customCellFn) {
      // Apply the custom cell function with column context
      colAsCrud.cell = props => customCellFn({ ...props, column: colAsCrud })
    }
  })

  // Check if expand column already exists
  const hasExpandColumn = props.columns?.some(col => col.id === 'expand')
  if (props.expandable && !hasExpandColumn) {
    columns.push({
      id: 'expand',
      cell: ({ row }) => {
        return h(UButton, {
          'color': 'neutral',
          'variant': 'ghost',
          'icon': 'i-lucide-chevron-down',
          'square': true,
          'aria-label': t('table.accessibility.expand'),
          'ui': {
            leadingIcon: ['transition-transform', row.getIsExpanded() ? 'duration-200 rotate-180' : '']
          },
          'onClick': () => row.toggleExpanded()
        })
      }
    } as TableColumn<CrudTableData>)
  }

  // Check if actions column already exists
  const hasActionsColumn = props.columns?.some(col => col.id === 'actions')
  if (props.rowActions && !hasActionsColumn) {
    const actionsConfig = props.rowActions

    columns.push({
      id: 'actions',
      header: t('table.actions.title'),
      cell: ({ row }) => {
        const items: DropdownMenuItem[] = []

        // Show action
        if (actionsConfig.show) {
          items.push({
            label: t('table.actions.show'),
            icon: 'i-lucide-eye',
            onSelect: () => handleShow(row.original)
          })
        }

        // Edit action
        if (actionsConfig.edit) {
          items.push({
            label: t('table.actions.edit'),
            icon: 'i-lucide-edit',
            onSelect: () => {
              handleEdit(row.original)
            }
          })
        }

        // Delete action
        if (actionsConfig.delete) {
          items.push({
            label: t('table.actions.delete'),
            icon: 'i-lucide-trash',
            color: 'error',
            onSelect: () => handleDelete(row.original)
          })
        }

        // Don't show actions column if no actions are available
        if (items.length === 0) {
          return null
        }

        return h('div', { class: 'text-right' }, h(UDropdownMenu, {
          'content': {
            align: 'end'
          },
          items,
          'aria-label': t('table.accessibility.actions_dropdown')
        }, () => h(UButton, {
          'icon': 'i-lucide-ellipsis-vertical',
          'color': 'neutral',
          'variant': 'ghost',
          'class': 'ml-auto',
          'aria-label': t('table.accessibility.actions_dropdown')
        })))
      }
    } as TableColumn<CrudTableData>)
  }

  return columns
})
</script>

<template>
  <div>
    <div class="mb-4 space-y-4">
      <!-- Title, Filters, and Header Actions Combined -->
      <div class="flex flex-col gap-4">
        <!-- Title and Header Actions Row -->
        <div
          v-if="tableTitle || (tableActions && Object.values(tableActions).some(Boolean))"
          class="flex flex-wrap items-center justify-between gap-2"
        >
          <h2
            v-if="tableTitle"
            class="text-2xl font-semibold text-foreground"
          >
            {{ tableTitle }}
          </h2>
          <div
            v-else
            class="flex-1"
          />

          <TableHeader
            :crud-endpoint="crudEndpoint"
            :table-actions="tableActions"
            :selectable="selectable"
            :selected-count="selectedRowIds.length"
            :total-count="paginationMeta?.total || tableData.length"
            @bulk-delete="handleBulkDelete"
            @export="emit('export', selectedRows)"
            @import="emit('import', selectedRows)"
            @print="emit('print', selectedRows)"
            @share="emit('share', selectedRows)"
            @download="emit('download', selectedRows)"
            @add="handleAdd"
          />
        </div>

        <!-- Filters Row -->
        <TableFilter
          v-if="filterInputs?.length"
          :filters="filterInputs"
          @update:filters="handleFilterUpdate"
        />
      </div>
    </div>

    <UTable
      ref="table"
      v-model:expanded="expanded"
      v-model:row-selection="rowSelection"
      :data="tableData"
      :columns="columns ? tableColumns : undefined"
      :sticky="sticky"
      :loading="isLoading"
      v-bind="$attrs"
    >
      <template
        v-if="$slots.expanded"
        #expanded="{ row }"
      >
        <slot
          name="expanded"
          :row="row"
        />
      </template>
    </UTable>

    <UPagination
      v-if="paginationMeta"
      v-model:page="currentPage"
      class="mt-4 flex justify-center"
      :total="paginationMeta.total"
      :items-per-page="paginationMeta.per_page"
      :sibling-count="2"
      show-edges
    />

    <TableRowDelete
      v-model:open="deleteModalOpen"
      :row="deleteRow"
      :crud-endpoint="crudEndpoint"
      @deleted="handleDeleteSuccess"
    />

    <TableBulkDelete
      v-if="tableActions?.bulkDelete"
      v-model:open="bulkDeleteModalOpen"
      :row-ids="selectedRowIds"
      :crud-endpoint="crudEndpoint"
      @deleted="handleBulkDeleteSuccess"
    />

    <TableForm
      v-if="formOpen"
      v-model:open="formOpen"
      :mode="formMode"
      :title="formTitle || (formMode === 'edit' ? t('table.form.edit') : t('table.form.add'))"
      :endpoint="crudEndpoint"
      :inputs="formInputs"
      :current-row="currentRow"
      @refresh="refreshTable"
    />
  </div>
</template>
