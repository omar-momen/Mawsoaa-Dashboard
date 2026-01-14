<script setup lang="ts">
import type { CrudTableColumn } from '~/types'
import type { FormInput, FilterInput } from '~/types/form'
import { emailValidation, egyptPhoneValidation } from '~/utils/form'

definePageMeta({
  layout: 'dashboard'
})

const loading = ref(false)
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
    accessorKey: 'avatar',
    header: '',
    custom_id: 'avatar'
  },
  {
    accessorKey: 'name',
    header: t('labels.name'),
    custom_id: 'name'
  },
  {
    accessorKey: 'email',
    header: t('labels.email')
  },
  {
    accessorKey: 'phone',
    header: t('labels.phone')
  },
  {
    accessorKey: 'roles',
    header: t('labels.roles'),
    custom_id: 'chips'
  },
  {
    accessorKey: 'is_active',
    header: t('labels.status'),
    custom_id: 'is_active'
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
    key: 'roles',
    label: t('labels.roles'),
    type: 'select',
    placeholder: t('labels.roles'),
    required: true,
    multiple: true,
    getEndpoint: 'api/helpers/tenant/select-options/roles'
  },
  {
    key: 'password',
    label: t('labels.password'),
    type: 'password',
    placeholder: t('labels.password')
  },
  {
    key: 'avatar',
    label: t('labels.avatar'),
    type: 'file-image',
    placeholder: t('form.upload_image'),
    required: false
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
  },
  {
    key: 'role',
    label: t('labels.roles'),
    type: 'select',
    placeholder: t('labels.roles'),
    clearable: true,
    getEndpoint: 'api/helpers/tenant/select-options/roles',
    filter_key: true
  }
])
</script>

<template>
  <TableBase
    v-model:row-selection="rowSelection"
    crud-endpoint="/api/admin/users"
    class="w-full"
    :expandable="true"
    :selectable="true"
    :draggable="true"
    :columns="columns"
    :loading="loading"
    loading-animation="swing"
    :form-inputs="formInputs"
    :form-title="t('labels.user')"
    :table-title="t('cruds.users.title')"
    :filter-inputs="filterInputs"
    crud-route="users"
    :row-actions="{
      show: hasPermission('users.show'),
      edit: hasPermission('users.edit'),
      delete: hasPermission('users.delete')
    }"
    :table-actions="{
      add: hasPermission('users.create'),
      bulkDelete: hasPermission('users.bulkDelete'),
      export: hasPermission('users.export'),
      import: hasPermission('users.import'),
      print: hasPermission('users.print'),
      share: hasPermission('users.share'),
      download: hasPermission('users.download')
    }"
  >
    <template #expanded="{ row }">
      <div class="p-4 bg-elevated/50">
        <pre>{{ row }}</pre>
      </div>
    </template>
  </TableBase>
</template>
