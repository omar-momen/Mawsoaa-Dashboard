<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="home-page">
    <UContainer>
      <div class="flex flex-col items-center justify-center text-center space-y-8">
        <div class="space-y-4">
          <h1 class="h1">
            {{ t('pages.home.title') }}
          </h1>
          <p class="para max-w-2xl">
            {{ t('pages.home.description') }}
          </p>
        </div>
        <UButton
          :to="localePath('/about')"
          color="primary"
          variant="outline"
        >
          {{ t('pages.home.get_started') }}
        </UButton>
      </div>
    </UContainer>
  </div>
</template>
