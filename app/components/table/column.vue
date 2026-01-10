<script setup lang="ts">
import type { CrudTableColumn } from '~/types'

const props = defineProps<{
  column: CrudTableColumn
}>()

const displayHeader = computed(() => {
  const header = typeof props.column.header === 'string' ? props.column.header : ''

  // If custom_id is 'id', add hash before header
  if (props.column.custom_id === 'id') {
    return `#${header}`
  }

  return header
})

const headerIcon = computed(() => {
  switch (props.column.custom_id) {
    case 'date':
    case 'created_at':
    case 'updated_at':
      return 'i-lucide-calendar'
    case 'phone':
      return 'i-lucide-phone'
    case 'email':
      return 'i-lucide-mail'
    case 'name':
      return 'i-lucide-user'
    case 'avatar':
      return 'i-lucide-image'

    default:
      return null
  }
})
</script>

<template>
  <th class="px-4 py-3 text-center text-sm font-semibold text-foreground border-b border-border/30">
    <div class="flex items-center justify-center gap-2">
      <Icon
        v-if="headerIcon"
        :name="headerIcon"
        class="w-4 h-4 text-muted"
      />
      <span>{{ displayHeader }}</span>
    </div>
  </th>
</template>
