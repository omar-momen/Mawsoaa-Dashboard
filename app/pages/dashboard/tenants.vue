<script setup lang="ts">
import type { CrudTableColumn, CrudTableData } from '~/types'
import type { FormInput } from '~/types/form'

definePageMeta({
  layout: 'dashboard'
})

const loading = ref(false)
const expanded = ref<Record<number, boolean>>({})
const rowSelection = ref<Record<string, boolean>>({})

const hasPermission = (_permission: string) => {
  return true
}

const { t } = useI18n()

const columns: CrudTableColumn[] = [
  {
    accessorKey: 'id',
    header: t('labels.id'),
    custom_id: 'id'
  },
  {
    accessorKey: 'name',
    header: t('labels.ar', { label: t('labels.name') }),
    custom_id: 'name'
  },
  {
    accessorKey: 'phone',
    header: t('labels.phone')
  },
  {
    accessorKey: 'is_active',
    header: t('labels.status'),
    custom_id: 'is_active'
  },
  {
    accessorKey: 'email',
    header: t('labels.email')
  },
  {
    accessorKey: 'domains',
    header: t('labels.domains'),
    custom_id: 'chips'
  },
  {
    accessorKey: 'created_at',
    header: t('labels.created_at'),
    custom_id: 'date'
  }
]

// Form inputs configuration
const formInputs = computed<FormInput[]>(() => [
  {
    key: 'name',
    label: t('labels.name'),
    type: 'text',
    placeholder: t('labels.name'),
    required: true
  },
  {
    key: 'domain',
    label: t('labels.domain'),
    type: 'text',
    placeholder: t('labels.domain'),
    required: true
  },
  {
    key: 'email',
    label: t('labels.email'),
    type: 'email',
    placeholder: t('labels.email'),
    required: true
  },
  {
    key: 'phone',
    label: t('labels.phone'),
    type: 'tel',
    placeholder: t('labels.phone'),
    required: true
  },
  {
    key: 'password',
    label: t('labels.password'),
    type: 'password',
    placeholder: t('labels.password')
  },
  {
    key: 'status',
    label: t('labels.status'),
    type: 'select',
    placeholder: t('labels.status'),
    required: true,
    options: [
      { label: t('labels.active'), id: 'active' },
      { label: t('labels.inactive'), id: 'inactive' }
    ]
  },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    placeholder: 'Select Category',
    required: false,
    getEndpoint: 'https://jsonplaceholder.typicode.com/users',
    valueKey: 'id',
    labelKey: 'name'
  }
])

const handleShow = (row: CrudTableData) => {
  console.log('Show:', row)
}

const handleEdit = (row: CrudTableData) => {
  console.log('Edit:', row)
}

const handleDelete = (row: CrudTableData) => {
  console.log('Delete:', row)
}

const handleBulkDelete = (rows: CrudTableData[]) => {
  console.log('Bulk Delete:', rows)
}

const handleExport = (rows: CrudTableData[]) => {
  console.log('Export:', rows)
}

const handleImport = (_rows: CrudTableData[]) => {
  console.log('Import')
}

const handlePrint = (rows: CrudTableData[]) => {
  console.log('Print:', rows)
}

const handleShare = (rows: CrudTableData[]) => {
  console.log('Share:', rows)
}

const handleDownload = (rows: CrudTableData[]) => {
  console.log('Download:', rows)
}
</script>

<template>
  <div>
    <div class="mb-4">
      <h1 class="text-2xl font-bold">
        {{ t('labels.tenants') || 'Tenants' }}
      </h1>
    </div>

    <TableBase
      v-model:expanded="expanded"
      v-model:row-selection="rowSelection"
      crud-endpoint="/api/super-admin/tenants"
      class="w-full"
      :expandable="true"
      :selectable="true"
      :columns="columns"
      :loading="loading"
      loading-animation="swing"
      :form-inputs="formInputs"
      form-title="Tenant"
      :row-actions="{
        show: hasPermission('tenants.show'),
        edit: hasPermission('tenants.edit'),
        delete: hasPermission('tenants.delete')
      }"
      :table-actions="{
        add: hasPermission('tenants.create'),
        bulkDelete: hasPermission('tenants.bulkDelete'),
        export: hasPermission('tenants.export'),
        import: hasPermission('tenants.import'),
        print: hasPermission('tenants.print'),
        share: hasPermission('tenants.share'),
        download: hasPermission('tenants.download')
      }"
      @show="handleShow"
      @edit="handleEdit"
      @delete="handleDelete"
      @bulk-delete="handleBulkDelete"
      @export="handleExport"
      @import="handleImport"
      @print="handlePrint"
      @share="handleShare"
      @download="handleDownload"
    >
      <template #expanded="{ row }">
        <div class="p-4 bg-elevated/50">
          <pre>{{ row.original }}</pre>
        </div>
      </template>
    </TableBase>
  </div>
</template>
