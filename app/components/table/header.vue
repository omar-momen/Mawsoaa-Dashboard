<script setup lang="ts">
const { t } = useI18n()

withDefaults(defineProps<{
  crudEndpoint: string
  tableActions?: {
    bulkDelete?: boolean
    export?: boolean
    import?: boolean
    print?: boolean
    share?: boolean
    download?: boolean
    add?: boolean
  }
  selectable?: boolean
  selectedCount?: number
  totalCount?: number
}>(), {
  selectable: true,
  selectedCount: 0,
  totalCount: 0
})

const emit = defineEmits<{
  bulkDelete: []
  export: []
  import: []
  print: []
  share: []
  download: []
  add: []
}>()

const handleBulkDelete = () => {
  emit('bulkDelete')
}
const handleExport = () => {
  emit('export')
}
const handleImport = () => {
  emit('import')
}
const handlePrint = () => {
  emit('print')
}
const handleShare = () => {
  emit('share')
}
const handleDownload = () => {
  emit('download')
}
const handleAdd = () => {
  emit('add')
}
</script>

<template>
  <div
    v-if="tableActions && Object.values(tableActions).some(Boolean)"
    class="flex flex-wrap items-center gap-2"
  >
    <UButton
      v-if="tableActions.bulkDelete"
      color="error"
      variant="outline"
      icon="i-lucide-trash-2"
      @click="handleBulkDelete"
    >
      {{ t('table.actions.bulk_delete') }}
    </UButton>
    <UButton
      v-if="tableActions.export"
      color="neutral"
      variant="outline"
      icon="i-lucide-download"
      @click="handleExport"
    >
      {{ t('table.actions.export') }}
    </UButton>
    <UButton
      v-if="tableActions.import"
      color="neutral"
      variant="outline"
      icon="i-lucide-upload"
      @click="handleImport"
    >
      {{ t('table.actions.import') }}
    </UButton>
    <UButton
      v-if="tableActions.print"
      color="neutral"
      variant="outline"
      icon="i-lucide-printer"
      @click="handlePrint"
    >
      {{ t('table.actions.print') }}
    </UButton>
    <UButton
      v-if="tableActions.share"
      color="neutral"
      variant="outline"
      icon="i-lucide-share-2"
      @click="handleShare"
    >
      {{ t('table.actions.share') }}
    </UButton>
    <UButton
      v-if="tableActions.download"
      color="neutral"
      variant="outline"
      icon="i-lucide-download"
      @click="handleDownload"
    >
      {{ t('table.actions.download') }}
    </UButton>
    <UButton
      v-if="tableActions.add"
      icon="i-lucide-plus"
      @click="handleAdd"
    >
      {{ t('table.actions.add') }}
    </UButton>
    <!-- Selection Info -->
    <div
      v-if="selectable && selectedCount > 0"
      class="ml-auto text-sm text-muted"
    >
      {{ t('table.selection.selected_count', { count: selectedCount, total: totalCount }) }}
    </div>
  </div>
</template>
