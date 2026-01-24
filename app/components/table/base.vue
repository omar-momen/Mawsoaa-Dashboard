<script setup lang="ts">
import type { CrudTableColumn, CrudTableData, CrudApiResponse, CrudPaginationMeta } from '~/types'

import type { FormInput, FilterInput } from '~/types/form'

import { VueDraggableNext as Draggable } from 'vue-draggable-next'

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
  reorder: [newOrder: { id: string | number, newIndex: number, oldIndex: number }[]]
}>()

const props = withDefaults(defineProps<{
  crudEndpoint: string
  crudRoute: string
  data?: CrudTableData[]
  columns?: CrudTableColumn[]
  formInputs?: FormInput[]
  filterInputs?: FilterInput[]
  formTitle?: string
  tableTitle?: string
  sticky?: boolean
  expandable?: boolean
  selectable?: boolean
  draggable?: boolean
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
  expandable: true,
  selectable: true,
  draggable: false,
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

// =================== Start:: Expansion ===================
const expanded = ref<Record<number, boolean>>({})
const toggleRowExpanded = (rowIndex: number) => {
  expanded.value[rowIndex] = !expanded.value[rowIndex]
}
// =================== End:: Expansion ===================

// =================== Start:: Selection ===================
const toggleRowSelection = (rowIndex: number) => {
  rowSelection.value[rowIndex] = !rowSelection.value[rowIndex]
}
const toggleAllRowsSelection = () => {
  const allSelected = tableData.value.every((_, index) => rowSelection.value[index])
  tableData.value.forEach((_, index) => {
    rowSelection.value[index] = !allSelected
  })
}

const isAllRowsSelected = computed(() => {
  return tableData.value.length > 0 && tableData.value.every((_, index) => rowSelection.value[index])
})
const isSomeRowsSelected = computed(() => {
  return Object.values(rowSelection.value).some(Boolean) && !isAllRowsSelected.value
})

const rowSelection = ref<Record<string, boolean>>({})
const selectedRows = computed(() => {
  if (!props.selectable || Object.keys(rowSelection.value).length === 0) {
    return []
  }
  return tableData.value.filter((_, index) => rowSelection.value[index])
})
const selectedRowIds = computed(() => {
  return selectedRows.value
    .map(row => row.id)
    .filter((id): id is string | number => id !== null && id !== undefined)
})
// =================== End::Selection ===================

const currentPage = ref(1)

const activeFilters = ref<Record<string, unknown>>({})
const handleFilterUpdate = (filters: Record<string, unknown>) => {
  activeFilters.value = filters
  // Reset to first page when filters change
  currentPage.value = 1
}

const { data: fetchedData, status, refresh: refreshTable } = await useApi<CrudApiResponse>(props.crudEndpoint, {
  key: computed(() => {
    const filterPerPage = activeFilters.value.per_page
    const perPageValue = filterPerPage !== undefined && filterPerPage !== null && filterPerPage !== ''
      ? Number(filterPerPage)
      : 10
    return `table-${props.crudEndpoint}-page-${currentPage.value}-per-page-${perPageValue}-${JSON.stringify(activeFilters.value)}`
  }),
  query: computed(() => {
    const { per_page: _, ...otherFilters } = activeFilters.value
    const filterPerPage = activeFilters.value.per_page
    const perPageValue = filterPerPage !== undefined && filterPerPage !== null && filterPerPage !== ''
      ? Number(filterPerPage)
      : undefined
    return {
      page: currentPage.value,
      ...(perPageValue !== undefined && { per_page: perPageValue }),
      ...otherFilters
    }
  })
})

const tableData = computed(() => {
  if (fetchedData.value?.data?.length) {
    return fetchedData.value.data
  }
  return props.data || []
})

const paginationMeta = computed<CrudPaginationMeta | null>(() => {
  return fetchedData.value?.meta || null
})

// Get per_page from filters or use default from pagination meta
const perPage = computed<number>(() => {
  const filterPerPage = activeFilters.value.per_page
  if (filterPerPage !== undefined && filterPerPage !== null && filterPerPage !== '') {
    return Number(filterPerPage)
  }
  return paginationMeta.value?.per_page || 10
})

const isLoading = computed(() => status.value === 'pending')

// Form state
const formOpen = ref(false)
const formMode = ref<'add' | 'edit'>('add')
const currentRow = ref<CrudTableData | null>(null)

// Row action handler functions
const handleShow = (row: CrudTableData): void => {
  if (props.rowActions?.show) {
    const router = useRouter()
    const localePath = useLocalePath()
    router.push(localePath(`/dashboard/${props.crudRoute}/show/${row.id}`))
  } else {
    emit('show', row)
  }
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

const tableColumns = computed<CrudTableColumn[]>(() => {
  return props.columns ? [...props.columns] : []
})

// =================== Start:: Drag and Drop ===================
const localTableData = ref<CrudTableData[]>([...tableData.value])

// Sync local data with tableData (always sync, but only use when draggable is true)
watch(tableData, (newData) => {
  if (newData && newData.length > 0) {
    localTableData.value = [...newData]
  } else {
    localTableData.value = []
  }
}, { immediate: true, deep: true })

const handleDragEnd = async (_event: { oldIndex: number, newIndex: number }) => {
  if (!props.draggable) return

  // Get new order from localTableData after drag
  const newOrder = localTableData.value.map((row, index) => ({
    id: row.id as string | number,
    display_order: index
  }))

  // Get pagination info
  const page = currentPage.value
  const perPage = paginationMeta.value?.per_page || tableData.value.length

  // Prepare payload
  const payload = {
    orders: newOrder,
    page,
    per_page: perPage
  }

  // Emit reorder event (for parent components that want to handle it)
  const oldOrder = tableData.value.map((row, index) => ({
    id: row.id as string | number,
    index
  }))
  emit('reorder', newOrder.map((item, newIndex) => {
    const oldIndex = oldOrder.findIndex(o => o.id === item.id)
    return {
      id: item.id,
      newIndex,
      oldIndex: oldIndex >= 0 ? oldIndex : newIndex
    }
  }))

  // Send to endpoint
  await useClientApi(`${props.crudEndpoint}/reorder`, {
    method: 'POST',
    body: payload
  })
}
// =================== End:: Drag and Drop ===================
</script>

<template>
  <div>
    <TableHeader
      :crud-endpoint="crudEndpoint"
      :table-title="tableTitle"
      :table-actions="tableActions"
      :selectable="selectable"
      :selected-count="selectedRowIds.length"
      :total-count="paginationMeta?.total || tableData.length"
      class="mb-4"
      @bulk-delete="handleBulkDelete"
      @export="emit('export', selectedRows)"
      @import="emit('import', selectedRows)"
      @print="emit('print', selectedRows)"
      @share="emit('share', selectedRows)"
      @download="emit('download', selectedRows)"
      @add="handleAdd"
    />

    <TableFilter
      :filters="filterInputs || []"
      class="mb-4"
      @update:filters="handleFilterUpdate"
    />

    <TableLoading v-if="isLoading" />

    <div
      v-else
      class="overflow-x-auto"
    >
      <table
        ref="table"
        class="w-full border-collapse"
        v-bind="$attrs"
      >
        <thead
          :class="[
            'bg-muted/50',
            sticky && 'sticky top-0 z-10'
          ]"
        >
          <tr>
            <!-- Drag Handle Column -->
            <th
              v-if="draggable"
              class="px-4 py-3 text-center text-sm font-semibold text-foreground border-b border-border/30 w-12"
            />
            <!-- Select Column -->
            <th
              v-if="selectable"
              class="px-4 py-3 text-center text-sm font-semibold text-foreground border-b border-border/30 w-12"
            >
              <div class="flex items-center justify-center">
                <UCheckbox
                  :model-value="isSomeRowsSelected ? 'indeterminate' : isAllRowsSelected"
                  :aria-label="t('table.selection.select_all')"
                  @update:model-value="toggleAllRowsSelection"
                />
              </div>
            </th>

            <!-- ...Columns -->
            <TableColumn
              v-for="column in tableColumns"
              :key="column.accessorKey"
              :column="column"
            />

            <!-- Expand Column -->
            <th
              v-if="expandable"
              class="px-4 py-3 text-center text-sm font-semibold text-foreground border-b border-border/30 w-12"
            />
            <!-- Actions Column -->
            <th
              v-if="rowActions && (rowActions.show || rowActions.edit || rowActions.delete)"
              class="px-4 py-3 text-center text-sm font-semibold text-foreground border-b border-border/30 w-12"
            >
              {{ t('table.actions.title') }}
            </th>
          </tr>
        </thead>

        <Draggable
          v-if="draggable && tableData.length > 0"
          v-model="localTableData"
          tag="tbody"
          item-key="id"
          handle=".drag-handle"
          @end="handleDragEnd"
        >
          <template
            v-for="(row, rowIndex) in localTableData"
            :key="row.id || rowIndex"
          >
            <!-- Main Row -->
            <TableRow
              :row="row"
              :row-index="rowIndex"
              :columns="tableColumns"
              :selectable="selectable"
              :expandable="expandable"
              :draggable="draggable"
              :row-actions="rowActions"
              :crud-route="crudRoute"
              :is-selected="rowSelection[rowIndex] || false"
              :is-expanded="expanded[rowIndex] || false"
              @toggle-selection="toggleRowSelection"
              @toggle-expand="toggleRowExpanded"
              @show="handleShow"
              @edit="handleEdit"
              @delete="handleDelete"
            />

            <!-- Expanded Row -->
            <TableExpandedRow
              v-if="expanded[rowIndex] && $slots.expanded"
              :colspan="tableColumns.length + (draggable ? 1 : 0) + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions && (rowActions.show || rowActions.edit || rowActions.delete) ? 1 : 0)"
              :row="row"
            >
              <template #default="{ row: expandedRow }">
                <slot
                  name="expanded"
                  :row="expandedRow"
                />
              </template>
            </TableExpandedRow>
          </template>
        </Draggable>

        <tbody v-else>
          <TableEmpty
            v-if="tableData.length === 0"
            :colspan="tableColumns.length + (draggable ? 1 : 0) + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions && (rowActions.show || rowActions.edit || rowActions.delete) ? 1 : 0)"
          />

          <template
            v-for="(row, rowIndex) in tableData"
            :key="row.id || rowIndex"
          >
            <!-- Main Row -->
            <TableRow
              :row="row"
              :row-index="rowIndex"
              :columns="tableColumns"
              :selectable="selectable"
              :expandable="expandable"
              :draggable="draggable"
              :row-actions="rowActions"
              :crud-route="crudRoute"
              :is-selected="rowSelection[rowIndex] || false"
              :is-expanded="expanded[rowIndex] || false"
              @toggle-selection="toggleRowSelection"
              @toggle-expand="toggleRowExpanded"
              @show="handleShow"
              @edit="handleEdit"
              @delete="handleDelete"
            />

            <!-- Expanded Row -->
            <TableExpandedRow
              v-if="expanded[rowIndex] && $slots.expanded"
              :colspan="tableColumns.length + (draggable ? 1 : 0) + (selectable ? 1 : 0) + (expandable ? 1 : 0) + (rowActions && (rowActions.show || rowActions.edit || rowActions.delete) ? 1 : 0)"
              :row="row"
            >
              <template #default="{ row: expandedRow }">
                <slot
                  name="expanded"
                  :row="expandedRow"
                />
              </template>
            </TableExpandedRow>
          </template>
        </tbody>
      </table>
    </div>

    <UPagination
      v-if="paginationMeta"
      v-model:page="currentPage"
      class="mt-4 flex justify-center"
      :total="paginationMeta.total"
      :items-per-page="perPage"
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
