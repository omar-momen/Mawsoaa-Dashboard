<script setup lang="ts">
import type { CrudTableData } from '~/types'

defineProps<{
  colspan: number
  row: CrudTableData
}>()
</script>

<template>
  <tr
    :class="[
      'border-b border-border/30',
      'bg-muted/20'
    ]"
  >
    <td
      :colspan="colspan"
      class="px-4 py-4"
    >
      <slot :row="row" />
    </td>
  </tr>
</template>

