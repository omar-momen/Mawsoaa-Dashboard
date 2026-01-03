<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="hidden lg:flex lg:flex-1 relative overflow-hidden bg-linear-to-br from-primary-600 via-primary-700 to-secondary-700">
    <div class="absolute inset-0 bg-grid-pattern opacity-10" />

    <!-- Decorative Elements -->
    <div class="absolute top-20 left-20 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl" />
    <div class="absolute bottom-20 right-20 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl" />

    <div class="relative z-10 flex flex-col justify-center px-12 text-white">
      <div class="space-y-6">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <UIcon
              name="i-lucide-graduation-cap"
              class="w-7 h-7 text-white"
            />
          </div>
          <h1 class="text-3xl font-bold">
            {{ t('login.branding.title') }}
          </h1>
        </div>

        <p class="text-lg text-white/90 max-w-md leading-relaxed">
          {{ t('login.branding.description') }}
        </p>

        <!-- Features List -->
        <div class="space-y-4 mt-8">
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 text-white"
              />
            </div>
            <p class="text-white/90">
              {{ t('login.branding.feature1') }}
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 text-white"
              />
            </div>
            <p class="text-white/90">
              {{ t('login.branding.feature2') }}
            </p>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5">
              <UIcon
                name="i-lucide-check"
                class="w-4 h-4 text-white"
              />
            </div>
            <p class="text-white/90">
              {{ t('login.branding.feature3') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}
</style>
