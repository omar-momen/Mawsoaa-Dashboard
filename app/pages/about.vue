<script setup lang="ts">
const { t } = useI18n()

// Simulate async data loading with 2 second delay
await new Promise(resolve => setTimeout(resolve, 2000))
</script>

<template>
  <div class="about-page">
    <UContainer>
      <div class="flex flex-col items-center justify-center text-center space-y-8">
        <h1 class="h1">
          {{ t('pages.about.title') }}
        </h1>
        <p class="para max-w-2xl">
          {{ t('pages.about.description') }}
        </p>
      </div>
    </UContainer>
  </div>
</template>
