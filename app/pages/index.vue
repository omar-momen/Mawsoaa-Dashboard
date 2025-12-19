<script setup lang="ts">
const { t } = useI18n()

const value = ref<File | null>(null)
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
      {{ value }}
      <UFileUpload
        v-model="value"
        class="w-96 min-h-48"
      />
    </UContainer>
  </div>
</template>
