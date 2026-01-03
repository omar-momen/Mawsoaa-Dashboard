<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Component } from 'vue'
import type { CrudTableColumn, CrudTableData, CrudApiResponse, CrudPaginationMeta } from '~/types'
import type { FormInput } from '~/types/form'
import type { TableColumn, DropdownMenuItem } from '@nuxt/ui'
import { createCustomCells } from '~/utils'

const { t } = useI18n()

defineOptions({
  inheritAttrs: false
})

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
  sticky?: boolean
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
  expandable?: boolean
  selectable?: boolean
  formInputs?: FormInput[]
  formTitle?: string
}>(), {
  sticky: true,
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
  }),
  expandable: false,
  selectable: true,
  formInputs: () => [],
  formTitle: undefined
})

const expanded = defineModel<Record<string, boolean>>('expanded', { default: () => ({}) })

// Pagination state
const currentPage = defineModel<number>('page', { default: 1 })

// Fetch data from crudEndpoint with pagination
const { data: fetchedData, status, refresh: refreshTable } = await useApi<CrudApiResponse>(props.crudEndpoint, {
  key: computed(() => `table-${props.crudEndpoint}-page-${currentPage.value}`),
  query: computed(() => ({
    page: currentPage.value
  }))
})

// Extract pagination metadata
const paginationMeta = computed<CrudPaginationMeta | null>(() => {
  return fetchedData.value?.meta || null
})

// Use fetched data if available, otherwise use prop data
const tableData = computed(() => {
  if (fetchedData.value?.data && Array.isArray(fetchedData.value?.data) && fetchedData.value?.data.length > 0) {
    return fetchedData.value?.data
  }
  return props.data || []
})

// Loading state from fetch
const isLoading = computed(() => status.value === 'pending')

const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')
const UBadge = resolveComponent('UBadge')
const table = useTemplateRef('table')

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
  if (props.formInputs && props.formInputs.length > 0) {
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

// Get selected rows based on rowSelection model
const rowSelection = defineModel<Record<string, boolean>>('rowSelection', { default: () => ({}) })
const selectedRows = computed(() => {
  if (!props.selectable || Object.keys(rowSelection.value).length === 0) {
    return []
  }
  return tableData.value.filter((_, index) => rowSelection.value[index])
})

const tableColumns = computed<TableColumn<CrudTableData>[]>(() => {
  const columns: TableColumn<CrudTableData>[] = (props.columns || []) as TableColumn<CrudTableData>[]

  // Check if select column already exists
  const hasSelectColumn = props.columns?.some(col => col.id === 'select')
  // Add select column if selectable is enabled and no select column exists
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
  // Add expand column if expandable is enabled and no expand column exists
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
  // Add actions column if rowActions are enabled and no actions column exists
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
            onSelect: () => handleEdit(row.original)
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
    <TableHeader
      :crud-endpoint="crudEndpoint"
      :table-actions="tableActions"
      :selectable="selectable"
      :selected-count="Object.keys(rowSelection).length"
      :total-count="paginationMeta?.total || tableData.length"
      @bulk-delete="emit('bulkDelete', selectedRows)"
      @export="emit('export', selectedRows)"
      @import="emit('import', selectedRows)"
      @print="emit('print', selectedRows)"
      @share="emit('share', selectedRows)"
      @download="emit('download', selectedRows)"
      @add="handleAdd"
    />

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

    <div
      v-if="paginationMeta"
      class="mt-4 flex justify-center"
    >
      <UPagination
        v-model:page="currentPage"
        :total="paginationMeta.total"
        :items-per-page="paginationMeta.per_page"
        :sibling-count="2"
        show-edges
      />
    </div>

    <TableRowDelete
      v-model:open="deleteModalOpen"
      :row="deleteRow"
      :crud-endpoint="crudEndpoint"
      @deleted="handleDeleteSuccess"
    />

    <TableForm
      v-if="formInputs && formInputs.length > 0"
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
