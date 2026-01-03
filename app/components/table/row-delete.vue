<script setup lang="ts">
import type { CrudTableData } from '~/types'

const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  row: CrudTableData | null
  crudEndpoint: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const open = defineModel<boolean>('open', { default: false })
const isDeleting = ref(false)

const handleConfirm = async () => {
  if (!props.row) {
    return
  }

  const rowId = props.row.id
  if (!rowId) {
    toast.add({
      title: t('table.delete.error'),
      description: t('table.delete.no_id'),
      color: 'error'
    })
    return
  }

  isDeleting.value = true

  const { error } = await useClientApi(`${props.crudEndpoint}/${rowId}`, {
    method: 'DELETE'
  })

  if (error.value) {
    isDeleting.value = false
    return
  }

  toast.add({
    title: t('table.delete.success'),
    color: 'success'
  })

  open.value = false
  emit('deleted')
  isDeleting.value = false
}

const handleCancel = () => {
  open.value = false
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t('table.delete.title')"
    :description="t('table.delete.description')"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('table.delete.cancel')"
        @click="handleCancel"
      />
      <UButton
        color="error"
        :label="t('table.delete.confirm')"
        :loading="isDeleting"
        :disabled="isDeleting"
        @click="handleConfirm"
      />
    </template>
  </UModal>
</template>
