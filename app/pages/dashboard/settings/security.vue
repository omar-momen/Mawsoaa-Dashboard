<script setup lang="ts">
definePageMeta({
  layout: 'dashboard'
})

const { t } = useI18n()
</script>

<template>
  <div>
    <h1>{{ t('sidebar.links.settings.security') }}</h1>
  </div>
</template>
