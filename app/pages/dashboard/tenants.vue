<script setup lang="ts">
import type { CrudTableColumn } from '~/types'
import type { FormInput, FilterInput } from '~/types/form'
import { emailValidation, egyptPhoneValidation, domainValidation } from '~/utils/form'

definePageMeta({
  layout: 'dashboard'
})

const loading = ref(false)

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
    accessorKey: 'name.ar',
    header: t('labels.ar', { label: t('labels.name') }),
    custom_id: 'name'
  },
  {
    accessorKey: 'name.en',
    header: t('labels.en', { label: t('labels.name') }),
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
    key: 'name[ar]',
    label: t('labels.ar', { label: t('labels.name') }),
    type: 'text',
    placeholder: t('labels.ar', { label: t('labels.name') }),
    required: true
  },
  {
    key: 'name[en]',
    label: t('labels.en', { label: t('labels.name') }),
    type: 'text',
    placeholder: t('labels.en', { label: t('labels.name') }),
    required: true
  },
  {
    key: 'domains',
    label: t('labels.domain'),
    type: 'tags',
    placeholder: t('labels.domain'),
    required: true,
    validations: [
      domainValidation()
    ]
  },
  {
    key: 'email',
    label: t('labels.email'),
    type: 'email',
    placeholder: t('labels.email'),
    required: true,
    validations: [
      emailValidation()
    ]
  },
  {
    key: 'phone',
    label: t('labels.phone'),
    type: 'text',
    placeholder: t('labels.phone'),
    hint: t('form.phone_hint'),
    required: true,
    validations: [
      egyptPhoneValidation()
    ]
  },
  {
    key: 'password',
    label: t('labels.password'),
    type: 'password',
    placeholder: t('labels.password')
  },
  {
    key: 'is_active',
    label: t('labels.status'),
    type: 'switch',
    placeholder: t('labels.status')
  }
])

// Filter inputs configuration
const filterInputs = computed<FilterInput[]>(() => [
  {
    key: 'name',
    label: t('labels.name'),
    type: 'text',
    placeholder: t('labels.name'),
    filter_key: true
  },
  {
    key: 'is_active',
    label: t('labels.status'),
    type: 'select',
    placeholder: t('labels.status'),
    clearable: true,
    options: [
      { label: t('labels.active'), id: 1 },
      { label: t('labels.inactive'), id: 0 }
    ],
    filter_key: true
  },
  {
    key: 'search',
    label: t('labels.search'),
    type: 'text',
    placeholder: t('labels.search')
  }

  // Example of dynamic select:
  // {
  //   key: 'category',
  //   label: 'Category',
  //   type: 'select',
  //   placeholder: 'Select Category',
  //   getEndpoint: '/api/categories',
  //   valueKey: 'id',
  //   labelKey: 'name'
  // }
])
</script>

<template>
  <TableBase
    crud-route="tenants"
    crud-endpoint="/api/super-admin/tenants"
    class="w-full"
    :expandable="true"
    :selectable="true"
    :draggable="true"
    :columns="columns"
    :loading="loading"
    loading-animation="swing"
    :form-inputs="formInputs"
    :form-title="t('labels.tenant')"
    :table-title="t('cruds.tenants.title')"
    :filter-inputs="filterInputs"
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
  >
    <template #expanded="{ row }">
      <div class="p-4 bg-elevated/50">
        <pre>{{ row }}</pre>
      </div>
    </template>
  </TableBase>
</template>
