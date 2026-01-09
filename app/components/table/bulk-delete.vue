<script setup lang="ts">
const { t } = useI18n()
const toast = useToast()

const props = defineProps<{
  rowIds: (string | number)[]
  crudEndpoint: string
}>()

const emit = defineEmits<{
  deleted: []
}>()

const open = defineModel<boolean>('open', { default: false })
const isDeleting = ref(false)

const selectedCount = computed(() => props.rowIds.length)

const handleConfirm = async () => {
  if (selectedCount.value === 0) {
    toast.add({
      title: t('table.bulk_delete.error'),
      description: t('table.bulk_delete.no_selection'),
      color: 'error'
    })
    return
  }

  // Validate all IDs exist
  const validIds = props.rowIds.filter(id => id !== null && id !== undefined)
  if (validIds.length === 0) {
    toast.add({
      title: t('table.bulk_delete.error'),
      description: t('table.bulk_delete.no_ids'),
      color: 'error'
    })
    return
  }

  isDeleting.value = true

  const { error } = await useClientApi(props.crudEndpoint + '/bulk-delete', {
    method: 'POST',
    body: {
      ids: validIds
    }
  })

  if (error.value) {
    isDeleting.value = false
    return
  }

  toast.add({
    title: t('table.bulk_delete.success'),
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
    :title="t('table.bulk_delete.title')"
    :description="t('table.bulk_delete.description', { count: selectedCount })"
    :ui="{ footer: 'justify-end' }"
  >
    <template #footer>
      <UButton
        color="neutral"
        variant="outline"
        :label="t('table.bulk_delete.cancel')"
        @click="handleCancel"
      />
      <UButton
        color="error"
        :label="t('table.bulk_delete.confirm')"
        :loading="isDeleting"
        :disabled="isDeleting"
        @click="handleConfirm"
      />
    </template>
  </UModal>
</template>
