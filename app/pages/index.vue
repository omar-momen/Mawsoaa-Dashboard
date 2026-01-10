<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <div class="home-page">
    <UContainer class="py-12">
      <div class="flex flex-col items-center justify-center text-center space-y-8">
        <div class="space-y-4">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {{ t('pages.home.title') }}
          </h1>
          <p class="text-lg md:text-xl text-muted-foreground max-w-2xl">
            {{ t('pages.home.description') }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 mt-8">
          <UButton
            :to="localePath('/dashboard')"
            size="lg"
            color="primary"
            class="min-w-48"
          >
            {{ t('pages.home.get_started') }}
          </UButton>
          <UButton
            :to="localePath('/about')"
            size="lg"
            variant="outline"
            color="neutral"
            class="min-w-48"
          >
            {{ t('pages.home.learn_more') }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>
