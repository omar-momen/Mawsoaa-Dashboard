<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
</script>

<template>
  <div>
    <h1 class="h1">
      {{ t('pages.dashboard.title') }}
    </h1>
  </div>
</template>
