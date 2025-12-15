<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="home-page">
    <UContainer>
      <h1 class="text-tertiary">
        {{ t('pages.home.title') }}
      </h1>
      <UIcon
        name="i-custom-address"
        class="w-auto h-6 shrink-0"
      />
    </UContainer>
  </div>
</template>
