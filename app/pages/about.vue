<script setup lang="ts">
const { t } = useI18n()

// Simulate async data loading with 2 second delay
await new Promise(resolve => setTimeout(resolve, 2000))
</script>

<template>
  <div class="about-page">
    <UContainer>
      <h1 class="text-3xl font-bold mb-4">
        {{ t('pages.about.title') }}
      </h1>
      <p class="text-muted mb-4">
        {{ t('pages.about.description') }}
      </p>
      <p class="text-muted">
        {{ t('pages.about.content') }}
      </p>
    </UContainer>
  </div>
</template>
