<script setup lang="ts">
import type { CrudTableColumn } from '~/types'
import type { FormInput, FilterInput } from '~/types/form'

definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()

const hasPermission = (_permission: string) => {
  return true
}

const columns = computed<CrudTableColumn[]>(() => [
  {
    accessorKey: 'id',
    header: t('labels.id'),
    custom_id: 'id'
  },
  {
    accessorKey: 'label.ar',
    header: t('labels.ar', { label: t('labels.name') }),
    custom_id: 'name'
  },
  {
    accessorKey: 'label.en',
    header: t('labels.en', { label: t('labels.name') }),
    custom_id: 'name'
  },
  {
    accessorKey: 'permissions',
    header: t('labels.permissions'),
    custom_id: 'chips',
    limit: 3
  },
  {
    accessorKey: 'created_at',
    header: t('labels.created_at'),
    custom_id: 'date'
  }
])

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
    key: 'label[en]',
    label: t('labels.en'),
    type: 'text',
    placeholder: t('labels.en'),
    required: true
  },
  {
    key: 'label[ar]',
    label: t('labels.ar'),
    type: 'text',
    placeholder: t('labels.ar'),
    required: true
  },
  {
    key: 'guard_name',
    label: t('labels.guard_name'),
    type: 'text',
    placeholder: t('labels.guard_name'),
    required: true
  },
  {
    key: 'permissions',
    label: t('labels.permissions'),
    type: 'select',
    placeholder: t('labels.permissions'),
    required: false,
    multiple: true,
    getEndpoint: 'api/helpers/tenant/select-options/permissions'
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
    key: 'search',
    label: t('labels.search'),
    type: 'text',
    placeholder: t('labels.search')
  },
  {
    key: 'permissions',
    label: t('labels.permissions'),
    type: 'select',
    placeholder: t('labels.permissions'),
    clearable: true,
    getEndpoint: 'api/helpers/tenant/select-options/permissions',
    filter_key: true,
    multiple: true
  }
])
</script>

<template>
  <TableBase
    crud-endpoint="/api/admin/roles"
    :expandable="true"
    :selectable="true"
    :draggable="true"
    :columns="columns"
    :form-inputs="formInputs"
    :form-title="t('labels.role')"
    :table-title="t('cruds.roles.title')"
    :filter-inputs="filterInputs"
    crud-route="roles"
    :row-actions="{
      show: false,
      edit: hasPermission('roles.update'),
      delete: hasPermission('roles.delete')
    }"
    :table-actions="{
      add: hasPermission('roles.create'),
      bulkDelete: hasPermission('roles.bulk_delete'),
      export: hasPermission('roles.export'),
      import: hasPermission('roles.import'),
      print: hasPermission('roles.print'),
      share: hasPermission('roles.share'),
      download: hasPermission('roles.download')
    }"
  >
    <template #expanded="{ row }">
      <div class="p-4 bg-elevated/50">
        <h4 class="text-sm font-semibold text-foreground mb-3">
          {{ t('labels.permissions') }} ({{ Array.isArray(row.permissions) ? row.permissions.length : 0 }})
        </h4>
        <div
          v-if="Array.isArray(row.permissions) && row.permissions.length > 0"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="permission in row.permissions"
            :key="permission.id || permission.original_id"
            color="neutral"
            variant="soft"
          >
            {{ permission.label }}
          </UBadge>
        </div>
        <p
          v-else
          class="text-sm text-muted-foreground"
        >
          {{ t('table.cells.no_items') }}
        </p>
      </div>
    </template>
  </TableBase>
</template>
