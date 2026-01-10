<script setup lang="ts">
const { t } = useI18n()

defineProps<{
  colspan: number
}>()
</script>

<template>
  <tr>
    <td
      :colspan="colspan"
      class="px-4 py-12 text-center text-muted"
    >
      {{ t('table.no_data') }}
    </td>
  </tr>
</template>

